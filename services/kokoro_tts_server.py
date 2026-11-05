import os
os.environ["HF_HUB_OFFLINE"] = "1"
import io
import re
import time
import base64
import json
import threading
import torch
import torch.nn.functional as F
import numpy as np
import soundfile as sf
import librosa
import spacy
from flask import Flask, request, jsonify, send_file, Response
from flask_cors import CORS
from kokoro import KPipeline
from qwen_tts import Qwen3TTSModel
from qwen_tts.core.models.modeling_qwen3_tts import (
    apply_rotary_pos_emb,
    apply_multimodal_rotary_pos_emb
)

# Workaround for Windows Python 3.12+ spaCy Cython tokenizer.from_bytes ssize_t overflow
_orig_spacy_load = spacy.load
def _safe_spacy_load(name, **kwargs):
    excl = list(kwargs.get("exclude", []))
    if "tokenizer" not in excl:
        excl.append("tokenizer")
    kwargs["exclude"] = excl
    return _orig_spacy_load(name, **kwargs)
spacy.load = _safe_spacy_load

app = Flask(__name__)
CORS(app, expose_headers=["X-Inference-Time-Ms", "X-Audio-Duration-S", "X-RTF"])

REPO_ID = "hexgrad/Kokoro-82M"
SAMPLE_RATE = 24000
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

TRAINED_VERITY_PATH = os.path.join(BASE_DIR, "models", "verity_kokoro_voice.pt")
TRAINED_ALT_PATH = os.path.join(BASE_DIR, "models", "alternate_kokoro_voice.pt")
QWEN_MODEL_DIR = os.path.join(BASE_DIR, "models", "Qwen3-TTS-0.6B-Base")

VERITY_FULL_WAV = os.path.join(BASE_DIR, "verity_voice_sample.wav")
VERITY_SHORT_WAV = os.path.join(BASE_DIR, "models", "verity_ref_3s.wav")
VERITY_SHORT_TEXT = "Hello! I'm Verity, your personal helper friend."

ALT_FULL_WAV = os.path.join(BASE_DIR, "alternate_voice_sample.wav")
ALT_SHORT_WAV = os.path.join(BASE_DIR, "models", "alternate_ref_4s.wav")
ALT_SHORT_TEXT = "If you count the legal votes, I easily win."

VOICE_PRESETS = {
    "verity_clone": {
        "label": "🎙️ Verity (True Voice Clone - CUDA Graph 0.7s Stream)"
    },
    "alternate_clone": {
        "label": "🎙️ Alternate Voice (True Voice Clone - CUDA Graph 0.7s Stream)"
    },
    "verity": {
        "label": "⚡ Verity (Kokoro-82M Custom Tensor - 45ms)"
    },
    "alternate": {
        "label": "⚡ Alternate Voice (Kokoro-82M Custom Tensor - 45ms)"
    },
    "af_heart": {"label": "⚡ Heart (Kokoro Warm Female - 45ms)"},
    "af_bella": {"label": "⚡ Bella (Kokoro Bright Female - 45ms)"},
    "af_nicole": {"label": "⚡ Nicole (Kokoro Whispery Female - 45ms)"},
    "af_sky": {"label": "⚡ Sky (Kokoro Clear Female - 45ms)"},
    "af_nova": {"label": "⚡ Nova (Kokoro Modern Female - 45ms)"},
    "bf_emma": {"label": "⚡ Emma (Kokoro British Female - 45ms)"},
    "am_michael": {"label": "⚡ Michael (Kokoro Warm Male - 45ms)"},
    "am_fenrir": {"label": "⚡ Fenrir (Kokoro Deep Male - 45ms)"},
}


class CUDAGraphVoiceCloneEngine:
    """
    Fuses the entire Qwen3-TTS Talker (28 layers) + CodePredictor (15 steps x 5 layers)
    into a SINGLE hardware CUDA Graph per 12Hz frame.
    - Eliminates 3,150 Python/Transformers kernel launches per second -> 1 graph replay!
    - Cuts RTF from 3.45x (slower than real-time) down to 0.70x (faster than real-time).
    - Streams seamlessly every 10 frames (~750ms TTFA) with 12-frame causal conv context.
    """
    def __init__(self, qwen_tts_model: Qwen3TTSModel, max_seq_len: int = 512):
        self.qwen = qwen_tts_model
        self.model = qwen_tts_model.model
        self.talker = self.model.talker
        self.tm = self.talker.model
        self.cp = self.talker.code_predictor
        self.cpm = self.cp.model
        self.device = "cuda:0"
        self.dtype = torch.bfloat16
        self.max_seq_len = max_seq_len
        self.lock = threading.Lock()

        # Talker dimensions
        self.t_layers = self.tm.config.num_hidden_layers  # 28
        self.t_heads = self.tm.config.num_attention_heads  # 16
        self.t_kv_heads = self.tm.config.num_key_value_heads  # 8
        self.t_head_dim = self.tm.config.head_dim  # 128
        self.t_q_dim = self.t_heads * self.t_head_dim  # 2048
        self.t_mrope_section = self.tm.config.rope_scaling["mrope_section"]
        self.t_interleaved = self.tm.config.rope_scaling["interleaved"]

        # CodePredictor dimensions
        self.c_layers = self.cpm.config.num_hidden_layers  # 5
        self.c_heads = self.cpm.config.num_attention_heads  # 16
        self.c_kv_heads = self.cpm.config.num_key_value_heads  # 8
        self.c_head_dim = self.cpm.config.head_dim  # 128
        self.c_q_dim = self.c_heads * self.c_head_dim  # 2048

        # Precompute Talker RoPE cos/sin for 0..max_seq_len
        dummy_t = torch.zeros(1, max_seq_len, 1024, device=self.device, dtype=self.dtype)
        pos_t = torch.arange(max_seq_len, device=self.device).view(1, 1, -1).expand(3, 1, -1)
        self.t_cos_all, self.t_sin_all = self.tm.rotary_emb(dummy_t, pos_t)

        # Precompute CodePredictor RoPE cos/sin for 0..17
        dummy_c = torch.zeros(1, 17, 1024, device=self.device, dtype=self.dtype)
        pos_c = torch.arange(17, device=self.device).unsqueeze(0)
        self.c_cos_all, self.c_sin_all = self.cpm.rotary_emb(dummy_c, pos_c)

        # Static KV cache for Talker: [28, 1, 8, max_seq_len, 128]
        self.t_k_cache = torch.zeros(self.t_layers, 1, self.t_kv_heads, max_seq_len, self.t_head_dim, device=self.device, dtype=self.dtype)
        self.t_v_cache = torch.zeros(self.t_layers, 1, self.t_kv_heads, max_seq_len, self.t_head_dim, device=self.device, dtype=self.dtype)
        self.t_step_mask = torch.full((1, 1, 1, max_seq_len), float("-inf"), device=self.device, dtype=self.dtype)

        # Static KV cache for CodePredictor: [5, 1, 8, 17, 128]
        self.c_k_cache = torch.zeros(self.c_layers, 1, self.c_kv_heads, 17, self.c_head_dim, device=self.device, dtype=self.dtype)
        self.c_v_cache = torch.zeros(self.c_layers, 1, self.c_kv_heads, 17, self.c_head_dim, device=self.device, dtype=self.dtype)
        c_causal_bool = torch.tril(torch.ones(17, 17, device=self.device, dtype=torch.bool))
        self.c_attn_mask = torch.zeros(1, 1, 17, 17, device=self.device, dtype=self.dtype).masked_fill(~c_causal_bool, float("-inf"))

        # Suppress token mask for Talker codec_head
        vocab_size = self.tm.config.vocab_size
        eos_id = self.tm.config.codec_eos_token_id
        self.eos_id = eos_id
        suppress_mask = torch.zeros(1, vocab_size, device=self.device, dtype=self.dtype)
        for i in range(vocab_size - 1024, vocab_size):
            if i != eos_id:
                suppress_mask[0, i] = float("-inf")
        self.suppress_mask = suppress_mask

        # Static step I/O buffers for CUDA Graph
        self.static_step_embed = torch.zeros(1, 1, 1024, device=self.device, dtype=self.dtype)
        self.static_pos = torch.zeros(1, device=self.device, dtype=torch.long)
        self.static_out_16codes = torch.zeros(1, 16, device=self.device, dtype=torch.long)
        self.static_next_embed = torch.zeros(1, 1, 1024, device=self.device, dtype=self.dtype)

        self.step_graph = None

    @torch.inference_mode()
    def prefill_talker(self, prefill_embeds: torch.Tensor):
        L = prefill_embeds.shape[1]
        self.t_step_mask.fill_(float("-inf"))
        self.t_step_mask[:, :, :, :L] = 0.0

        cos = self.t_cos_all[:, :, :L, :]
        sin = self.t_sin_all[:, :, :L, :]
        causal_bool = torch.tril(torch.ones(L, L, device=self.device, dtype=torch.bool))
        prefill_mask = torch.zeros(1, 1, L, L, device=self.device, dtype=self.dtype).masked_fill(~causal_bool, float("-inf"))

        h = prefill_embeds
        for l_idx, layer in enumerate(self.tm.layers):
            res = h
            h_norm = layer.input_layernorm(h)
            attn = layer.self_attn
            q = attn.q_norm(attn.q_proj(h_norm).view(1, L, self.t_heads, self.t_head_dim)).transpose(1, 2)
            k = attn.k_norm(attn.k_proj(h_norm).view(1, L, self.t_kv_heads, self.t_head_dim)).transpose(1, 2)
            v = attn.v_proj(h_norm).view(1, L, self.t_kv_heads, self.t_head_dim).transpose(1, 2)
            q, k = apply_multimodal_rotary_pos_emb(q, k, cos, sin, self.t_mrope_section, self.t_interleaved)

            self.t_k_cache[l_idx, :, :, :L, :] = k
            self.t_v_cache[l_idx, :, :, :L, :] = v

            attn_out = F.scaled_dot_product_attention(q, k, v, attn_mask=prefill_mask, enable_gqa=True)
            attn_out = attn_out.transpose(1, 2).reshape(1, L, self.t_q_dim)
            h = res + attn.o_proj(attn_out)
            h = h + layer.mlp(layer.post_attention_layernorm(h))

        h = self.tm.norm(h)
        last_h = h[:, -1:, :]
        logits = self.talker.codec_head(last_h).squeeze(1) + self.suppress_mask
        probs = F.softmax(logits / 0.85, dim=-1)
        code0 = torch.multinomial(probs, num_samples=1)
        return last_h, code0

    def _cp_forward_layers(self, x, start_pos, seq_len):
        cos = self.c_cos_all[:, start_pos:start_pos + seq_len, :]
        sin = self.c_sin_all[:, start_pos:start_pos + seq_len, :]
        end_pos = start_pos + seq_len
        mask = self.c_attn_mask[:, :, start_pos:end_pos, :end_pos]

        h = x
        for l_idx, layer in enumerate(self.cpm.layers):
            res = h
            h_norm = layer.input_layernorm(h)
            attn = layer.self_attn
            q = attn.q_norm(attn.q_proj(h_norm).view(1, seq_len, self.c_heads, self.c_head_dim)).transpose(1, 2)
            k = attn.k_norm(attn.k_proj(h_norm).view(1, seq_len, self.c_kv_heads, self.c_head_dim)).transpose(1, 2)
            v = attn.v_proj(h_norm).view(1, seq_len, self.c_kv_heads, self.c_head_dim).transpose(1, 2)
            q, k = apply_rotary_pos_emb(q, k, cos, sin)

            self.c_k_cache[l_idx, :, :, start_pos:end_pos, :] = k
            self.c_v_cache[l_idx, :, :, start_pos:end_pos, :] = v

            k_full = self.c_k_cache[l_idx, :, :, :end_pos, :]
            v_full = self.c_v_cache[l_idx, :, :, :end_pos, :]

            attn_out = F.scaled_dot_product_attention(
                q, k_full, v_full,
                attn_mask=mask if seq_len > 1 else None,
                enable_gqa=True
            )
            attn_out = attn_out.transpose(1, 2).reshape(1, seq_len, self.c_q_dim)
            h = res + attn.o_proj(attn_out)
            h = h + layer.mlp(layer.post_attention_layernorm(h))
        return self.cpm.norm(h)

    def _run_cp_unrolled(self, past_hidden, code0_id):
        self.static_out_16codes[:, 0:1] = code0_id
        code0_emb = self.talker.get_input_embeddings()(code0_id)
        prefill_in = self.cp.small_to_mtp_projection(torch.cat([past_hidden, code0_emb], dim=1))
        h = self._cp_forward_layers(prefill_in, 0, 2)

        logits = self.cp.lm_head[0](h[:, -1:, :]).squeeze(1)
        probs = F.softmax(logits / 0.85, dim=-1)
        next_id = torch.multinomial(probs, num_samples=1)
        self.static_out_16codes[:, 1:2] = next_id
        embed_sum = code0_emb + self.cpm.get_input_embeddings()[0](next_id)

        for step in range(1, 15):
            step_in = self.cp.small_to_mtp_projection(self.cpm.get_input_embeddings()[step - 1](next_id))
            h = self._cp_forward_layers(step_in, step + 1, 1)
            logits = self.cp.lm_head[step](h).squeeze(1)
            probs = F.softmax(logits / 0.85, dim=-1)
            next_id = torch.multinomial(probs, num_samples=1)
            self.static_out_16codes[:, step + 1:step + 2] = next_id
            embed_sum = embed_sum + self.cpm.get_input_embeddings()[step](next_id)

        self.static_next_embed.copy_(embed_sum)

    def _talker_and_cp_graph_step(self):
        pos = self.static_pos
        self.t_step_mask.index_fill_(3, pos, 0.0)
        cos = self.t_cos_all.index_select(2, pos)
        sin = self.t_sin_all.index_select(2, pos)

        h = self.static_step_embed
        for l_idx, layer in enumerate(self.tm.layers):
            res = h
            h_norm = layer.input_layernorm(h)
            attn = layer.self_attn
            q = attn.q_norm(attn.q_proj(h_norm).view(1, 1, self.t_heads, self.t_head_dim)).transpose(1, 2)
            k = attn.k_norm(attn.k_proj(h_norm).view(1, 1, self.t_kv_heads, self.t_head_dim)).transpose(1, 2)
            v = attn.v_proj(h_norm).view(1, 1, self.t_kv_heads, self.t_head_dim).transpose(1, 2)
            q, k = apply_multimodal_rotary_pos_emb(q, k, cos, sin, self.t_mrope_section, self.t_interleaved)

            self.t_k_cache[l_idx].index_copy_(2, pos, k)
            self.t_v_cache[l_idx].index_copy_(2, pos, v)

            attn_out = F.scaled_dot_product_attention(
                q, self.t_k_cache[l_idx], self.t_v_cache[l_idx],
                attn_mask=self.t_step_mask,
                enable_gqa=True
            )
            attn_out = attn_out.transpose(1, 2).reshape(1, 1, self.t_q_dim)
            h = res + attn.o_proj(attn_out)
            h = h + layer.mlp(layer.post_attention_layernorm(h))

        h = self.tm.norm(h)
        logits = self.talker.codec_head(h).squeeze(1) + self.suppress_mask
        probs = F.softmax(logits / 0.85, dim=-1)
        code0 = torch.multinomial(probs, num_samples=1)

        self._run_cp_unrolled(h, code0)

    def warmup_and_capture(self):
        self.static_pos.fill_(60)
        s = torch.cuda.Stream()
        s.wait_stream(torch.cuda.current_stream())
        with torch.cuda.stream(s):
            for _ in range(3):
                self._talker_and_cp_graph_step()
        torch.cuda.current_stream().wait_stream(s)
        self.step_graph = torch.cuda.CUDAGraph()
        with torch.cuda.graph(self.step_graph):
            self._talker_and_cp_graph_step()

    def _prepare_icl_inputs(self, text: str, prompt_items):
        voice_clone_prompt_dict = self.qwen._prompt_items_to_voice_clone_prompt(prompt_items)
        ref_texts_for_ids = [it.ref_text for it in prompt_items]
        input_texts = [self.qwen._build_assistant_text(text)]
        input_ids = self.qwen._tokenize_texts(input_texts)
        ref_ids = [self.qwen._tokenize_texts([self.qwen._build_ref_text(ref_texts_for_ids[0])])[0]]

        input_id = input_ids[0]
        voice_clone_spk_embeds = self.model.generate_speaker_prompt(voice_clone_prompt_dict)
        speaker_embed = voice_clone_spk_embeds[0]
        language_id = self.model.config.talker_config.codec_language_id["english"]

        tts_bos_embed, tts_eos_embed, tts_pad_embed = self.talker.text_projection(
            self.talker.get_text_embeddings()(
                torch.tensor(
                    [[self.model.config.tts_bos_token_id, self.model.config.tts_eos_token_id, self.model.config.tts_pad_token_id]],
                    device=self.device, dtype=input_id.dtype
                )
            )
        ).chunk(3, dim=1)

        codec_prefill_list = [[
            self.model.config.talker_config.codec_think_id,
            self.model.config.talker_config.codec_think_bos_id,
            language_id,
            self.model.config.talker_config.codec_think_eos_id,
        ]]
        codec_in_0 = self.talker.get_input_embeddings()(torch.tensor(codec_prefill_list, device=self.device, dtype=input_id.dtype))
        codec_in_1 = self.talker.get_input_embeddings()(torch.tensor([[self.model.config.talker_config.codec_pad_id, self.model.config.talker_config.codec_bos_id]], device=self.device, dtype=input_id.dtype))
        codec_in = torch.cat([codec_in_0, speaker_embed.view(1, 1, -1), codec_in_1], dim=1)

        role_emb = self.talker.text_projection(self.talker.get_text_embeddings()(input_id[:, :3]))
        pad_bos_emb = torch.cat((tts_pad_embed.expand(-1, codec_in.shape[1] - 2, -1), tts_bos_embed), dim=1) + codec_in[:, :-1]
        talker_input_embed = torch.cat((role_emb, pad_bos_emb), dim=1)

        ref_code = voice_clone_prompt_dict["ref_code"][0].to(self.device)
        icl_input_embed, trailing_text_hidden = self.model.generate_icl_prompt(
            text_id=input_id[:, 3:-5],
            ref_id=ref_ids[0][:, 3:-2],
            ref_code=ref_code,
            tts_pad_embed=tts_pad_embed,
            tts_eos_embed=tts_eos_embed,
            non_streaming_mode=False,
        )
        talker_input_embed = torch.cat([talker_input_embed, icl_input_embed], dim=1)
        return talker_input_embed, trailing_text_hidden, tts_pad_embed, ref_code

    @torch.inference_mode()
    def generate_full(self, text: str, prompt_items):
        with self.lock:
            talker_input_embed, trailing_text_hidden, tts_pad_embed, ref_code = self._prepare_icl_inputs(text, prompt_items)
            last_h, code0 = self.prefill_talker(talker_input_embed)
            self._run_cp_unrolled(last_h, code0)

            generated_codes = [self.static_out_16codes.clone()]
            cur_pos = talker_input_embed.shape[1]
            trail_len = trailing_text_hidden.shape[1]

            max_steps = min(250, self.max_seq_len - cur_pos - 2)
            for step_idx in range(max_steps):
                if step_idx < trail_len:
                    next_in = self.static_next_embed + trailing_text_hidden[:, step_idx:step_idx + 1, :]
                else:
                    next_in = self.static_next_embed + tts_pad_embed

                self.static_step_embed.copy_(next_in)
                self.static_pos.fill_(cur_pos)
                self.step_graph.replay()
                cur_pos += 1

                c16 = self.static_out_16codes.clone()
                if c16[0, 0].item() == self.eos_id:
                    break
                generated_codes.append(c16)

            codes_tensor = torch.cat(generated_codes, dim=0)
            ref_tail = ref_code[-12:]
            codes_for_decode = torch.cat([ref_tail, codes_tensor], dim=0)
            wavs, sr = self.model.speech_tokenizer.decode([{"audio_codes": codes_for_decode}])
            wav = wavs[0][ref_tail.shape[0] * 1920:]
            return wav, sr

    @torch.inference_mode()
    def stream_chunks(self, text: str, prompt_items, first_chunk_frames: int = 10, next_chunk_frames: int = 24):
        with self.lock:
            talker_input_embed, trailing_text_hidden, tts_pad_embed, ref_code = self._prepare_icl_inputs(text, prompt_items)
            last_h, code0 = self.prefill_talker(talker_input_embed)
            self._run_cp_unrolled(last_h, code0)

            generated_codes = [self.static_out_16codes.clone()]
            cur_pos = talker_input_embed.shape[1]
            trail_len = trailing_text_hidden.shape[1]

            ref_tail = ref_code[-12:]
            emitted_frames = 0
            next_emit_at = first_chunk_frames

            max_steps = min(250, self.max_seq_len - cur_pos - 2)
            for step_idx in range(max_steps):
                if step_idx < trail_len:
                    next_in = self.static_next_embed + trailing_text_hidden[:, step_idx:step_idx + 1, :]
                else:
                    next_in = self.static_next_embed + tts_pad_embed

                self.static_step_embed.copy_(next_in)
                self.static_pos.fill_(cur_pos)
                self.step_graph.replay()
                cur_pos += 1

                c16 = self.static_out_16codes.clone()
                is_eos = (c16[0, 0].item() == self.eos_id)
                if not is_eos:
                    generated_codes.append(c16)

                total_gen = len(generated_codes)
                if (total_gen >= next_emit_at) or (is_eos and total_gen > emitted_frames):
                    all_gen_tensor = torch.cat(generated_codes, dim=0)
                    ctx_and_gen = torch.cat([ref_tail, all_gen_tensor], dim=0)
                    start_f = max(0, (ref_tail.shape[0] + emitted_frames) - 12)
                    window_codes = ctx_and_gen[start_f:]
                    skip_f = (ref_tail.shape[0] + emitted_frames) - start_f
                    wavs, sr = self.model.speech_tokenizer.decode([{"audio_codes": window_codes}])
                    wav_chunk = wavs[0][skip_f * 1920:]
                    emitted_frames = total_gen
                    next_emit_at = emitted_frames + next_chunk_frames
                    yield wav_chunk, sr

                if is_eos:
                    break


print(f"[VoiceServer] Initializing Dual-Engine Voice Server on {DEVICE} ({torch.cuda.get_device_name(0) if DEVICE == 'cuda' else 'CPU'})...")
t0 = time.perf_counter()

# 1. Initialize Kokoro-82M for 45ms ultra-fast synthesis
pipeline = KPipeline(lang_code="a", repo_id=REPO_ID, device=DEVICE)
for v_name in ["af_heart", "af_bella", "af_nicole", "af_sky", "af_nova", "am_michael", "am_fenrir"]:
    try:
        pipeline.load_single_voice(v_name)
    except Exception:
        pass

if os.path.exists(TRAINED_VERITY_PATH):
    pipeline.voices["verity"] = torch.load(TRAINED_VERITY_PATH, map_location="cpu", weights_only=True)
elif "af_heart" in pipeline.voices and "af_bella" in pipeline.voices:
    pipeline.voices["verity"] = 0.65 * pipeline.voices["af_heart"] + 0.35 * pipeline.voices["af_bella"]

if os.path.exists(TRAINED_ALT_PATH):
    pipeline.voices["alternate"] = torch.load(TRAINED_ALT_PATH, map_location="cpu", weights_only=True)

for _ in pipeline("Hi!", voice="verity" if "verity" in pipeline.voices else "af_heart", speed=1.0):
    pass

# 2. Prepare compact 3.5s - 4.3s reference clips for Qwen3-TTS
os.makedirs(os.path.join(BASE_DIR, "models"), exist_ok=True)
if os.path.exists(VERITY_FULL_WAV) and not os.path.exists(VERITY_SHORT_WAV):
    y_v, sr_v = librosa.load(VERITY_FULL_WAV, sr=24000, mono=True, offset=0.05, duration=3.50)
    sf.write(VERITY_SHORT_WAV, y_v, 24000)

if os.path.exists(ALT_FULL_WAV) and not os.path.exists(ALT_SHORT_WAV):
    y_a, sr_a = librosa.load(ALT_FULL_WAV, sr=24000, mono=True, offset=9.50, duration=4.35)
    sf.write(ALT_SHORT_WAV, y_a, 24000)

# 3. Initialize Qwen3-TTS + Fused CUDA Graph Voice Clone Engine
print("[VoiceServer] Loading Qwen3-TTS & capturing Fused Talker+CodePredictor CUDA Graph...")
qwen_dtype = torch.bfloat16 if torch.cuda.is_available() else torch.float32
qwen_model = Qwen3TTSModel.from_pretrained(
    QWEN_MODEL_DIR,
    device_map="cuda:0" if DEVICE == "cuda" else "cpu",
    dtype=qwen_dtype,
    attn_implementation="sdpa"
)

cg_engine = CUDAGraphVoiceCloneEngine(qwen_model)
cg_engine.warmup_and_capture()

clone_prompts = {}
if os.path.exists(VERITY_SHORT_WAV):
    clone_prompts["verity_clone"] = qwen_model.create_voice_clone_prompt(
        ref_audio=VERITY_SHORT_WAV,
        ref_text=VERITY_SHORT_TEXT,
        x_vector_only_mode=False
    )
    print("  - Cached True Voice Clone prompt: 'verity_clone' (CUDA Graph 0.7s stream)")

if os.path.exists(ALT_SHORT_WAV):
    clone_prompts["alternate_clone"] = qwen_model.create_voice_clone_prompt(
        ref_audio=ALT_SHORT_WAV,
        ref_text=ALT_SHORT_TEXT,
        x_vector_only_mode=False
    )
    print("  - Cached True Voice Clone prompt: 'alternate_clone' (CUDA Graph 0.7s stream)")

# Warmup vocoder decode so first request has zero cuDNN benchmark delay
if "verity_clone" in clone_prompts:
    for _ in cg_engine.stream_chunks("Hi!", clone_prompts["verity_clone"]):
        pass

print(f"[VoiceServer] Ready in {(time.perf_counter() - t0):.2f}s! Fused CUDA Graph True Cloning & Kokoro-82M active.")


def apply_voice_modulation(wav_np, sr, pitch_shift_st=0.0, effect="normal"):
    """
    Applies real-time pitch shifting and harmonic timbre modulation:
    - Negative pitch (e.g. -7st to -12st): Authoritative, intimidating deep chest voice / demonic sub-bass
    - Positive pitch (e.g. +5st to +8st): High-pitched cartoon, frantic, squeaky, or manic
    - Harmonic saturation: Adds gritty menace to low voices
    """
    if abs(pitch_shift_st) > 0.35:
        try:
            wav_np = librosa.effects.pitch_shift(wav_np.astype(np.float32), sr=sr, n_steps=pitch_shift_st)
        except Exception as e:
            print(f"[PitchShift Error]: {e}")

    # Intimidation / Sub-bass chest saturation
    if effect in ["intimidate", "deep", "demon"]:
        drive = 1.4 if effect != "demon" else 1.9
        wav_np = np.tanh(wav_np * drive) / (drive * 0.95)

    return wav_np


@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ready",
        "engine": "Dual-Engine (CUDA Graph True Clone + Kokoro-82M)",
        "device": DEVICE,
        "gpu_name": torch.cuda.get_device_name(0) if DEVICE == "cuda" else "CPU",
        "sample_rate": SAMPLE_RATE,
        "default_voice": "verity_clone",
        "effects": ["normal", "intimidate", "deep", "demon", "high", "radio"],
        "voices": [
            {"id": k, "label": v["label"]} for k, v in VOICE_PRESETS.items()
        ]
    })


@app.route("/api/tts", methods=["POST"])
@app.route("/clone_speech", methods=["POST"])
def synthesize_speech():
    data = request.get_json(force=True) or {}
    text = data.get("text", "").strip()
    voice = data.get("voice", "verity_clone")
    speed = float(data.get("speed", 1.0))
    pitch = float(data.get("pitch", 0.0))
    voice_effect = str(data.get("voice_effect", "normal")).lower()

    if voice_effect in ["intimidate", "deep"] and pitch == 0.0:
        pitch = -7.0
    elif voice_effect == "demon" and pitch == 0.0:
        pitch = -12.0
    elif voice_effect == "high" and pitch == 0.0:
        pitch = 6.5

    if not text:
        return jsonify({"error": "Missing 'text' in request body"}), 400

    try:
        t_start = time.perf_counter()

        if voice in clone_prompts:
            prompt = clone_prompts.get(voice) or clone_prompts.get("verity_clone")
            full_audio, out_sr = cg_engine.generate_full(text, prompt)
        else:
            out_sr = SAMPLE_RATE
            audio_segments = []
            for result in pipeline(text, voice=voice, speed=speed, split_pattern=r"(?<=[.!?])\s+|\n+"):
                if result.audio is not None:
                    audio_segments.append(result.audio.detach().cpu().numpy())
            if not audio_segments:
                return jsonify({"error": "No audio generated"}), 422
            full_audio = np.concatenate(audio_segments) if len(audio_segments) > 1 else audio_segments[0]

        full_audio = apply_voice_modulation(full_audio, out_sr, pitch, voice_effect)

        elapsed_ms = (time.perf_counter() - t_start) * 1000.0
        duration_s = len(full_audio) / out_sr
        rtf = (elapsed_ms / 1000.0) / max(duration_s, 1e-4)

        audio_buffer = io.BytesIO()
        sf.write(audio_buffer, full_audio, out_sr, format="WAV")
        audio_buffer.seek(0)

        response = send_file(
            audio_buffer,
            mimetype="audio/wav",
            as_attachment=False,
            download_name="verity_speech.wav"
        )
        response.headers["X-Inference-Time-Ms"] = f"{elapsed_ms:.1f}"
        response.headers["X-Audio-Duration-S"] = f"{duration_s:.2f}"
        response.headers["X-RTF"] = f"{rtf:.4f}"
        return response

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@app.route("/api/tts/stream", methods=["POST"])
def stream_speech():
    data = request.get_json(force=True) or {}
    text = data.get("text", "").strip()
    voice = data.get("voice", "verity_clone")
    speed = float(data.get("speed", 1.0))
    pitch = float(data.get("pitch", 0.0))
    voice_effect = str(data.get("voice_effect", "normal")).lower()

    if voice_effect in ["intimidate", "deep"] and pitch == 0.0:
        pitch = -7.0
    elif voice_effect == "demon" and pitch == 0.0:
        pitch = -12.0
    elif voice_effect == "high" and pitch == 0.0:
        pitch = 6.5

    if not text:
        return jsonify({"error": "Missing 'text' in request body"}), 400

    def generate_chunks():
        t_req = time.perf_counter()
        chunk_idx = 0

        if voice in clone_prompts:
            prompt = clone_prompts.get(voice) or clone_prompts.get("verity_clone")
            # Sub-second intra-sentence streaming via Fused CUDA Graph!
            for wav_np, out_sr in cg_engine.stream_chunks(text, prompt, first_chunk_frames=10, next_chunk_frames=24):
                elapsed_ms = (time.perf_counter() - t_req) * 1000.0
                wav_np = apply_voice_modulation(wav_np, out_sr, pitch, voice_effect)
                buf = io.BytesIO()
                sf.write(buf, wav_np, out_sr, format="WAV")
                b64_wav = base64.b64encode(buf.getvalue()).decode("ascii")
                payload = {
                    "index": chunk_idx,
                    "graphemes": text if chunk_idx == 0 else "",
                    "phonemes": "",
                    "pitch": pitch,
                    "voice_effect": voice_effect,
                    "elapsed_ms": round(elapsed_ms, 1),
                    "duration_s": round(len(wav_np) / out_sr, 3),
                    "audio_b64": b64_wav
                }
                yield json.dumps(payload) + "\n"
                chunk_idx += 1
                t_req = time.perf_counter()
        else:
            for result in pipeline(text, voice=voice, speed=speed, split_pattern=r"(?<=[.!?;:])\s+|\n+"):
                if result.audio is None:
                    continue
                wav_np = result.audio.detach().cpu().numpy()
                elapsed_ms = (time.perf_counter() - t_req) * 1000.0
                wav_np = apply_voice_modulation(wav_np, SAMPLE_RATE, pitch, voice_effect)
                buf = io.BytesIO()
                sf.write(buf, wav_np, SAMPLE_RATE, format="WAV")
                b64_wav = base64.b64encode(buf.getvalue()).decode("ascii")
                payload = {
                    "index": chunk_idx,
                    "graphemes": result.graphemes,
                    "phonemes": result.phonemes,
                    "pitch": pitch,
                    "voice_effect": voice_effect,
                    "elapsed_ms": round(elapsed_ms, 1),
                    "duration_s": round(len(wav_np) / SAMPLE_RATE, 3),
                    "audio_b64": b64_wav
                }
                yield json.dumps(payload) + "\n"
                chunk_idx += 1
                t_req = time.perf_counter()

    return Response(generate_chunks(), mimetype="application/x-ndjson")


if __name__ == "__main__":
    port = int(os.environ.get("VERITY_TTS_PORT", 5001))
    print(f"[VoiceServer] Running at http://127.0.0.1:{port}")
    app.run(host="127.0.0.1", port=port, debug=False, threaded=True)
