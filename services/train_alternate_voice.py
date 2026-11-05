import os
os.environ["HF_HUB_OFFLINE"] = "1"
import time
import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np
import soundfile as sf
import librosa
import spacy
from safetensors.torch import load_file
from kokoro import KPipeline
from qwen_tts.core.models.configuration_qwen3_tts import Qwen3TTSSpeakerEncoderConfig
from qwen_tts.core.models.modeling_qwen3_tts import Qwen3TTSSpeakerEncoder, mel_spectrogram

# Workaround for Windows Python 3.12+ spaCy Cython tokenizer.from_bytes ssize_t overflow
_orig_spacy_load = spacy.load
def _safe_spacy_load(name, **kwargs):
    excl = list(kwargs.get("exclude", []))
    if "tokenizer" not in excl:
        excl.append("tokenizer")
    kwargs["exclude"] = excl
    return _orig_spacy_load(name, **kwargs)
spacy.load = _safe_spacy_load

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOADED_OGG_PATH = r"C:\Users\vaibh\.gemini\antigravity\brain\8596aacb-3a24-4e8d-a7c4-64f0f10ffa55\.user_uploaded\uploaded_media_1792945348813.ogg"
CLEAN_SAMPLE_PATH = os.path.join(BASE_DIR, "alternate_voice_sample.wav")
QWEN_MODEL_PATH = os.path.join(BASE_DIR, "models", "Qwen3-TTS-0.6B-Base", "model.safetensors")
OUTPUT_VOICE_PATH = os.path.join(BASE_DIR, "models", "alternate_kokoro_voice.pt")
TEST_WAV_PATH = os.path.join(BASE_DIR, "test_alternate_trained.wav")

# Exact transcript matching 00:07.0 -> 00:28.0 of the uploaded audio
REF_SENTENCES = [
    "Good evening, I'd like to provide the American people with an update on our efforts to protect the integrity of our very important twenty twenty election.",
    "If you count the legal votes, I easily win.",
    "If you count the illegal votes, they can try to steal the election from us."
]
FULL_REF_TEXT = " ".join(REF_SENTENCES)

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
SAMPLE_RATE = 24000


def load_speaker_encoder(device: str) -> Qwen3TTSSpeakerEncoder:
    print(f"[Train-Alt] Loading ECAPA-TDNN Speaker Encoder from {QWEN_MODEL_PATH}...")
    cfg = Qwen3TTSSpeakerEncoderConfig(enc_dim=1024, sample_rate=24000)
    spk_encoder = Qwen3TTSSpeakerEncoder(cfg).to(device).eval()
    state_dict = load_file(QWEN_MODEL_PATH, device="cpu")
    spk_state = {
        k[len("speaker_encoder."):]: v
        for k, v in state_dict.items()
        if k.startswith("speaker_encoder.")
    }
    spk_encoder.load_state_dict(spk_state, strict=True)
    for p in spk_encoder.parameters():
        p.requires_grad_(False)
    return spk_encoder


def compute_mel_and_embedding(wav_1d: torch.Tensor, spk_encoder: Qwen3TTSSpeakerEncoder):
    peak = wav_1d.abs().max().clamp(min=1e-4)
    wav_norm = (wav_1d / peak) * 0.92
    mels = mel_spectrogram(
        wav_norm.unsqueeze(0),
        n_fft=1024,
        num_mels=128,
        sampling_rate=24000,
        hop_size=256,
        win_size=1024,
        fmin=0,
        fmax=12000
    )  # [1, 128, T]
    spk_emb = spk_encoder(mels.transpose(1, 2))[0]  # [1024]
    spk_emb = F.normalize(spk_emb, dim=-1)
    return mels.squeeze(0), spk_emb


def differentiable_kokoro_forward(kmodel, input_ids: torch.LongTensor, ref_s: torch.Tensor, speed: float = 1.0):
    input_lengths = torch.full(
        (input_ids.shape[0],),
        input_ids.shape[-1],
        device=input_ids.device,
        dtype=torch.long
    )
    text_mask = torch.arange(input_lengths.max(), device=input_ids.device).unsqueeze(0).expand(input_lengths.shape[0], -1)
    text_mask = torch.gt(text_mask + 1, input_lengths.unsqueeze(1)).to(kmodel.device)

    bert_dur = kmodel.bert(input_ids, attention_mask=(~text_mask).int())
    d_en = kmodel.bert_encoder(bert_dur).transpose(-1, -2)
    s = ref_s[:, 128:]
    d = kmodel.predictor.text_encoder(d_en, s, input_lengths, text_mask)
    x, _ = kmodel.predictor.lstm(d)
    duration_logits = kmodel.predictor.duration_proj(x)
    duration = torch.sigmoid(duration_logits).sum(axis=-1) / speed
    pred_dur = torch.round(duration).clamp(min=1).long().squeeze()

    indices = torch.repeat_interleave(torch.arange(input_ids.shape[1], device=kmodel.device), pred_dur)
    pred_aln_trg = torch.zeros((input_ids.shape[1], indices.shape[0]), device=kmodel.device)
    pred_aln_trg[indices, torch.arange(indices.shape[0])] = 1
    pred_aln_trg = pred_aln_trg.unsqueeze(0).to(kmodel.device)

    en = d.transpose(-1, -2) @ pred_aln_trg
    F0_pred, N_pred = kmodel.predictor.F0Ntrain(en, s)
    t_en = kmodel.text_encoder(input_ids, input_lengths, text_mask)
    asr = t_en @ pred_aln_trg
    audio = kmodel.decoder(asr, F0_pred, N_pred, ref_s[:, :128]).squeeze()
    return audio, duration.sum()


def main():
    t0 = time.perf_counter()
    print(f"[Train-Alt] Starting Alternate Voice Training on {DEVICE}...")

    # 1. Load clean speech segment (00:07.0 -> 00:28.0) + multi-segment speaker profile (00:07.0 -> 01:25.0)
    print(f"[Train-Alt] Extracting clean speech from {UPLOADED_OGG_PATH}...")
    wav_aligned, _ = librosa.load(UPLOADED_OGG_PATH, sr=SAMPLE_RATE, mono=True, offset=7.0, duration=21.0)
    sf.write(CLEAN_SAMPLE_PATH, wav_aligned, SAMPLE_RATE)
    print(f"[Train-Alt] Saved clean 21s reference clip -> {CLEAN_SAMPLE_PATH}")

    # Load a longer 75-second window (00:07 -> 01:22) to compute an ultra-stable multi-sentence speaker embedding
    wav_long, _ = librosa.load(UPLOADED_OGG_PATH, sr=SAMPLE_RATE, mono=True, offset=7.0, duration=75.0)

    # Remove non-speech pauses from wav_aligned for accurate prosody frame target
    intervals = librosa.effects.split(wav_aligned, top_db=26)
    voiced_wav_np = np.concatenate([wav_aligned[s:e] for s, e in intervals])
    ref_duration_s = len(voiced_wav_np) / SAMPLE_RATE
    target_total_frames = len(voiced_wav_np) / 600.0
    print(f"[Train-Alt] Active speech duration (pauses removed): {ref_duration_s:.2f}s ({target_total_frames:.1f} frames)")

    # 2. Extract target ECAPA-TDNN speaker embedding & mel formant distribution
    spk_encoder = load_speaker_encoder(DEVICE)
    with torch.no_grad():
        # Average speaker embedding across 15s windows of the 75s recording for rock-solid speaker representation
        chunk_len = 15 * SAMPLE_RATE
        embs = []
        mels_list = []
        for start in range(0, len(wav_long) - chunk_len + 1, chunk_len):
            chunk_t = torch.from_numpy(wav_long[start:start + chunk_len]).float().to(DEVICE)
            m, e = compute_mel_and_embedding(chunk_t, spk_encoder)
            embs.append(e)
            mels_list.append(m)
        target_spk_emb = F.normalize(torch.stack(embs, dim=0).mean(dim=0), dim=-1)
        all_mels = torch.cat(mels_list, dim=1)
        frame_energy = all_mels.mean(dim=0)
        voiced_mask = frame_energy > torch.quantile(frame_energy, 0.30)
        voiced_mel = all_mels[:, voiced_mask]
        target_mel_mean = voiced_mel.mean(dim=1)
        target_mel_std = voiced_mel.std(dim=1)
        target_mel_q20 = torch.quantile(voiced_mel, 0.20, dim=1)
        target_mel_q80 = torch.quantile(voiced_mel, 0.80, dim=1)

    # 3. Initialize Kokoro-82M pipeline and load candidate voices (male + expressive voices)
    pipeline = KPipeline(lang_code="a", repo_id="hexgrad/Kokoro-82M", device=DEVICE)
    kmodel = pipeline.model
    for p in kmodel.parameters():
        p.requires_grad_(False)

    base_voice_names = [
        "am_michael", "am_fenrir", "am_adam", "am_eric",
        "am_onyx", "am_liam", "am_echo", "am_puck",
        "bm_george", "bm_lewis"
    ]
    voice_packs = []
    loaded_names = []
    for vname in base_voice_names:
        try:
            pack = pipeline.load_single_voice(vname).to(DEVICE).float()
            voice_packs.append(pack)
            loaded_names.append(vname)
        except Exception as e:
            print(f"[Train-Alt] Skipping {vname}: {e}")

    stacked_packs = torch.stack(voice_packs, dim=0)  # [V, 510, 1, 256]

    sent_token_batches = []
    for sent in REF_SENTENCES:
        _, tokens = pipeline.g2p(sent)
        for gs, ps, tks in pipeline.en_tokenize(tokens):
            ids = [kmodel.vocab.get(p) for p in ps if kmodel.vocab.get(p) is not None]
            input_ids = torch.LongTensor([[0, *ids, 0]]).to(DEVICE)
            sent_token_batches.append((ps, len(ps), input_ids))

    # 4. Score each candidate base voice against the uploaded audio
    print("[Train-Alt] Evaluating baseline Kokoro voices against uploaded audio:")
    best_init_scores = []
    with torch.no_grad():
        for idx, vname in enumerate(loaded_names):
            pack = voice_packs[idx]
            wavs = []
            for ps, plen, input_ids in sent_token_batches:
                audio, _ = kmodel.forward_with_tokens(input_ids, pack[plen - 1], speed=1.0)
                wavs.append(audio.squeeze())
            full_wav = torch.cat(wavs, dim=0)
            _, emb = compute_mel_and_embedding(full_wav, spk_encoder)
            sim = F.cosine_similarity(emb.unsqueeze(0), target_spk_emb.unsqueeze(0)).item()
            best_init_scores.append(sim)
            print(f"  - {vname:10s}: Speaker Cosine Similarity = {sim:.4f}")

    std_pack = stacked_packs.std(dim=0).clamp(min=1e-3)

    init_logits = torch.tensor(best_init_scores, device=DEVICE, dtype=torch.float32) * 6.0
    w_acoustic_logits = nn.Parameter(init_logits.clone())
    w_prosody_logits = nn.Parameter(init_logits.clone())

    delta_acoustic = nn.Parameter(torch.zeros(1, 1, 128, device=DEVICE))
    delta_prosody = nn.Parameter(torch.zeros(1, 1, 128, device=DEVICE))
    scale_acoustic = nn.Parameter(torch.ones(1, 1, 128, device=DEVICE))
    scale_prosody = nn.Parameter(torch.ones(1, 1, 128, device=DEVICE))

    optimizer = torch.optim.AdamW(
        [
            {"params": [w_acoustic_logits, w_prosody_logits], "lr": 0.08},
            {"params": [delta_acoustic, delta_prosody], "lr": 0.014},
            {"params": [scale_acoustic, scale_prosody], "lr": 0.008},
        ],
        weight_decay=1e-4
    )
    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=80, eta_min=0.001)

    def build_alt_pack():
        wa = F.softmax(w_acoustic_logits, dim=0).view(-1, 1, 1, 1)
        wp = F.softmax(w_prosody_logits, dim=0).view(-1, 1, 1, 1)
        base_a = (wa * stacked_packs[:, :, :, :128]).sum(dim=0)
        base_p = (wp * stacked_packs[:, :, :, 128:]).sum(dim=0)
        da = torch.tanh(delta_acoustic) * (std_pack[:, :, :128] * 1.8)
        dp = torch.tanh(delta_prosody) * (std_pack[:, :, 128:] * 0.4)
        sa = scale_acoustic.clamp(0.82, 1.18)
        sp = scale_prosody.clamp(0.94, 1.06)
        out_a = base_a * sa + da
        out_p = base_p * sp + dp
        return torch.cat([out_a, out_p], dim=-1)

    print("[Train-Alt] Optimizing custom Alternate voice tensor (80 epochs, end-to-end STFT + ECAPA-TDNN)...")
    best_loss = float("inf")
    best_sim = -1.0
    best_pack = None

    with torch.backends.cudnn.flags(enabled=False):
        for step in range(1, 81):
            optimizer.zero_grad()
            cur_pack = build_alt_pack()

            gen_wavs = []
            total_pred_frames = 0.0
            for ps, plen, input_ids in sent_token_batches:
                ref_s = cur_pack[plen - 1]
                audio, dur_frames = differentiable_kokoro_forward(kmodel, input_ids, ref_s, speed=1.0)
                gen_wavs.append(audio)
                total_pred_frames = total_pred_frames + dur_frames

            full_gen_wav = torch.cat(gen_wavs, dim=0)
            gen_mel, gen_spk_emb = compute_mel_and_embedding(full_gen_wav, spk_encoder)

            # 1. Deep Speaker Identity Loss
            cos_sim = F.cosine_similarity(gen_spk_emb.unsqueeze(0), target_spk_emb.unsqueeze(0)).squeeze()
            loss_spk = (1.0 - cos_sim) * 4.5

            # 2. Formant & Spectral Envelope Distribution Loss
            g_energy = gen_mel.mean(dim=0)
            g_mask = g_energy > torch.quantile(g_energy, 0.25)
            g_voiced = gen_mel[:, g_mask]
            g_mean = g_voiced.mean(dim=1)
            g_std = g_voiced.std(dim=1)
            g_q20 = torch.quantile(g_voiced, 0.20, dim=1)
            g_q80 = torch.quantile(g_voiced, 0.80, dim=1)

            loss_mel = (
                F.l1_loss(g_mean, target_mel_mean) * 0.45
                + F.l1_loss(g_std, target_mel_std) * 0.25
                + F.l1_loss(g_q20, target_mel_q20) * 0.15
                + F.l1_loss(g_q80, target_mel_q80) * 0.15
            )

            # 3. Cadence / Duration Loss
            loss_dur = ((total_pred_frames - target_total_frames) / target_total_frames).pow(2) * 0.5

            # 4. Smoothness Regularization
            loss_reg = (delta_acoustic.pow(2).mean() + delta_prosody.pow(2).mean()) * 0.04

            total_loss = loss_spk + loss_mel + loss_dur + loss_reg
            total_loss.backward()
            torch.nn.utils.clip_grad_norm_(
                [w_acoustic_logits, w_prosody_logits, delta_acoustic, delta_prosody, scale_acoustic, scale_prosody],
                1.0
            )
            optimizer.step()
            scheduler.step()

            sim_val = cos_sim.item()
            loss_val = total_loss.item()
            if loss_val < best_loss:
                best_loss = loss_val
                best_sim = sim_val
                best_pack = cur_pack.detach().cpu().clone()

            if step == 1 or step % 10 == 0 or step == 80:
                print(
                    f"  [Epoch {step:02d}/80] Loss={loss_val:.4f} | "
                    f"Speaker Sim={sim_val:.4f} | Mel={loss_mel.item():.4f} | "
                    f"Dur={total_pred_frames.item()/40.0:.2f}s (target {ref_duration_s:.2f}s)"
                )

    os.makedirs(os.path.dirname(OUTPUT_VOICE_PATH), exist_ok=True)
    torch.save(best_pack, OUTPUT_VOICE_PATH)
    print(f"\n[Train-Alt] Saved trained Alternate voice tensor -> {OUTPUT_VOICE_PATH}")
    print(f"[Train-Alt] Best Speaker Identity Similarity: {best_sim:.4f} (improved from {max(best_init_scores):.4f})")

    pipeline.voices["alternate_trained"] = best_pack.to(DEVICE)
    test_segments = []
    for res in pipeline(FULL_REF_TEXT, voice="alternate_trained", speed=1.0):
        if res.audio is not None:
            test_segments.append(res.audio.detach().cpu().numpy())
    test_wav = np.concatenate(test_segments)
    sf.write(TEST_WAV_PATH, test_wav, SAMPLE_RATE)
    print(f"[Train-Alt] Wrote verification audio -> {TEST_WAV_PATH} in {(time.perf_counter() - t0):.1f}s")


if __name__ == "__main__":
    main()
