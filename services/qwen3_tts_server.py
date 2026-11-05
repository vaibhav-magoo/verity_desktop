import os
import io
import torch
import soundfile as sf
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from qwen_tts import Qwen3TTSModel

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_DIR = os.path.join(BASE_DIR, "models", "Qwen3-TTS-0.6B-Base")
REF_AUDIO_PATH = os.path.join(BASE_DIR, "verity_voice_sample.wav")
REF_TEXT = (
    "Hello! I'm Verity, your personal helper friend. "
    "Ask me anything, I know everything. "
    "This voice is perfect for animated characters and playful narrations."
)

print(f"[Qwen3-TTS] Loading model from: {MODEL_DIR}...")
device = "cuda:0" if torch.cuda.is_available() else "cpu"
dtype = torch.bfloat16 if torch.cuda.is_available() else torch.float32

model = Qwen3TTSModel.from_pretrained(
    MODEL_DIR,
    device_map=device,
    dtype=dtype
)

print(f"[Qwen3-TTS] Pre-computing voice clone prompt using reference audio: {REF_AUDIO_PATH}...")
cached_voice_prompt = model.create_voice_clone_prompt(
    ref_audio=REF_AUDIO_PATH,
    ref_text=REF_TEXT,
    x_vector_only_mode=False
)
print("[Qwen3-TTS] Cloned voice profile ready and cached!")

@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ready",
        "model": "Qwen3-TTS-12Hz-0.6B-Base",
        "device": device,
        "cloned_voice": "Verity"
    })

@app.route("/api/tts", methods=["POST"])
@app.route("/clone_speech", methods=["POST"])
def clone_speech():
    data = request.get_json(force=True) or {}
    text = data.get("text", "").strip()
    language = data.get("language", "English")

    if not text:
        return jsonify({"error": "Missing 'text' in request body"}), 400

    try:
        print(f"[Qwen3-TTS] Synthesizing cloned speech: \"{text}\"")
        wavs, sr = model.generate_voice_clone(
            text=text,
            language=language,
            voice_clone_prompt=cached_voice_prompt
        )

        audio_buffer = io.BytesIO()
        sf.write(audio_buffer, wavs[0], sr, format="WAV")
        audio_buffer.seek(0)

        return send_file(
            audio_buffer,
            mimetype="audio/wav",
            as_attachment=False,
            download_name="verity_cloned.wav"
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    port = int(os.environ.get("VERITY_TTS_PORT", 5001))
    print(f"[Qwen3-TTS] Server running at http://127.0.0.1:{port}")
    app.run(host="127.0.0.1", port=port, debug=False)
