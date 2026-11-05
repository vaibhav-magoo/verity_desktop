#!/usr/bin/env python3
"""
VERITY SENTIMENT ANALYSIS & EMOTION APPRAISAL ENGINE
=====================================================
Analyzes text, chat prompts, or speech transcripts to compute:
- Multi-dimensional Affect: Valence, Arousal, Dominance, Horror
- Discrete Categorical Emotion (Plutchik / GoEmotions taxonomy)
- Automated Mapping to Verity's 120 Behavioral Animations & 15 Expressions
- Sub-millisecond offline lexical inference + optional HuggingFace RoBERTa support
"""

import sys
import os

# Prevent huggingface from attempting outbound network calls or retrying indefinitely
os.environ["HF_HUB_OFFLINE"] = "1"
os.environ["TRANSFORMERS_OFFLINE"] = "1"

import re
import json
import math
from typing import Dict, Any, Tuple, Optional

# --- Rich Affective Lexicon & VAD Heuristics ---
# Valence: -1.0 (very negative) to +1.0 (very positive)
# Arousal:  0.0 (calm/lethargic) to  1.0 (hyperactive/intense)
# Dominance: -1.0 (submissive/overwhelmed) to +1.0 (commanding/bold)
# Horror:    0.0 (pure wholesome) to  1.0 (eldritch/creepy/corrupted)

AFFECTIVE_LEXICON = {
    # Joy / Excitement / Warmth
    "happy": (0.85, 0.65, 0.50, 0.0),
    "great": (0.80, 0.60, 0.50, 0.0),
    "awesome": (0.90, 0.80, 0.60, 0.0),
    "wonderful": (0.85, 0.60, 0.50, 0.0),
    "love": (0.90, 0.70, 0.40, 0.0),
    "yay": (0.85, 0.85, 0.30, 0.0),
    "excellent": (0.88, 0.65, 0.70, 0.0),
    "perfect": (0.92, 0.70, 0.75, 0.0),
    "congrats": (0.85, 0.75, 0.50, 0.0),
    "cool": (0.65, 0.45, 0.40, 0.0),
    "friend": (0.75, 0.40, 0.30, 0.0),
    "thanks": (0.70, 0.35, 0.20, 0.0),
    "thank": (0.70, 0.35, 0.20, 0.0),
    "glad": (0.75, 0.50, 0.30, 0.0),
    "fun": (0.80, 0.75, 0.40, 0.0),
    "laugh": (0.85, 0.75, 0.50, 0.0),
    "haha": (0.80, 0.70, 0.40, 0.0),
    "excited": (0.85, 0.90, 0.60, 0.0),

    # Technical / Coding / Architecture
    "code": (0.20, 0.55, 0.40, 0.0),
    "build": (0.35, 0.60, 0.60, 0.0),
    "compile": (0.25, 0.65, 0.50, 0.0),
    "function": (0.15, 0.40, 0.40, 0.0),
    "debug": (0.10, 0.70, 0.55, 0.0),
    "script": (0.20, 0.50, 0.40, 0.0),
    "optimize": (0.45, 0.60, 0.65, 0.0),
    "terminal": (0.20, 0.55, 0.50, 0.0),
    "git": (0.20, 0.50, 0.45, 0.0),
    "database": (0.15, 0.45, 0.40, 0.0),
    "algorithm": (0.25, 0.55, 0.50, 0.0),

    # Skeptical / Sarcastic / Dry
    "really": (-0.15, 0.40, 0.20, 0.05),
    "surely": (-0.10, 0.35, 0.30, 0.05),
    "whatever": (-0.45, 0.20, 0.10, 0.0),
    "obviously": (-0.20, 0.45, 0.60, 0.0),
    "doubt": (-0.40, 0.45, -0.20, 0.0),
    "why": (-0.10, 0.50, 0.00, 0.0),
    "seriously": (-0.35, 0.55, 0.25, 0.05),
    "kidding": (-0.10, 0.50, 0.20, 0.0),
    "nope": (-0.40, 0.40, 0.30, 0.0),

    # Shock / Alarm / Panicked / Error
    "error": (-0.75, 0.85, -0.50, 0.20),
    "bug": (-0.60, 0.70, -0.30, 0.10),
    "crash": (-0.85, 0.95, -0.60, 0.30),
    "fatal": (-0.90, 0.95, -0.70, 0.45),
    "exception": (-0.70, 0.80, -0.40, 0.15),
    "deleted": (-0.80, 0.85, -0.50, 0.35),
    "broken": (-0.75, 0.70, -0.45, 0.10),
    "fail": (-0.80, 0.75, -0.50, 0.05),
    "failed": (-0.80, 0.75, -0.50, 0.05),
    "corrupt": (-0.85, 0.88, -0.55, 0.70),
    "panic": (-0.85, 0.98, -0.80, 0.50),
    "omg": (-0.20, 0.90, -0.30, 0.15),
    "wait": (-0.20, 0.75, -0.20, 0.10),
    "what": (-0.25, 0.70, -0.10, 0.05),

    # Horror / Uncanny / Creepy / Threatening
    "watch": (-0.10, 0.60, 0.65, 0.65),
    "watching": (-0.15, 0.65, 0.75, 0.80),
    "memory": (0.05, 0.45, 0.30, 0.40),
    "creepy": (-0.50, 0.75, -0.20, 0.85),
    "scary": (-0.60, 0.80, -0.40, 0.75),
    "dark": (-0.35, 0.50, 0.20, 0.70),
    "abyss": (-0.70, 0.65, 0.30, 0.95),
    "teeth": (0.00, 0.55, 0.40, 0.75),
    "flesh": (-0.40, 0.65, 0.30, 0.85),
    "inside": (-0.10, 0.50, 0.30, 0.60),
    "secret": (0.10, 0.60, 0.45, 0.55),
    "behind": (-0.20, 0.70, -0.20, 0.75),
    "never": (-0.45, 0.60, 0.35, 0.40),
    "die": (-0.90, 0.85, -0.60, 0.70),
    "night": (0.05, 0.30, 0.10, 0.40),
    "void": (-0.75, 0.60, 0.20, 0.95),
    "soul": (-0.20, 0.55, 0.30, 0.80),
    "haunt": (-0.65, 0.75, -0.30, 0.85),

    # Sad / Melancholy / Tired
    "sad": (-0.80, 0.20, -0.60, 0.0),
    "tired": (-0.60, 0.15, -0.50, 0.0),
    "exhausted": (-0.75, 0.10, -0.65, 0.0),
    "sleepy": (-0.40, 0.10, -0.40, 0.0),
    "lonely": (-0.80, 0.25, -0.70, 0.10),
    "sorry": (-0.55, 0.35, -0.45, 0.0),
    "sigh": (-0.50, 0.15, -0.30, 0.0),
    "depressed": (-0.85, 0.12, -0.75, 0.05),
    "miss": (-0.60, 0.30, -0.50, 0.0),
    "cry": (-0.80, 0.65, -0.65, 0.0),
    "hopeless": (-0.90, 0.20, -0.85, 0.10),

    # Anger / Frustration / Hostile
    "angry": (-0.80, 0.85, 0.70, 0.15),
    "hate": (-0.90, 0.88, 0.75, 0.25),
    "annoying": (-0.70, 0.75, 0.30, 0.05),
    "stop": (-0.60, 0.80, 0.55, 0.10),
    "shut": (-0.75, 0.85, 0.65, 0.15),
    "stupid": (-0.80, 0.80, 0.60, 0.05),
    "worst": (-0.85, 0.78, 0.40, 0.05),
    "furious": (-0.92, 0.95, 0.85, 0.20),
    "rage": (-0.90, 0.95, 0.85, 0.25)
}

# Negation words invert valence
NEGATIONS = {"not", "never", "no", "hardly", "barely", "scarcely", "without", "isn't", "aren't", "wasn't", "weren't", "won't", "don't", "doesn't", "didn't"}

# Intensifiers boost arousal and valence amplitude
INTENSIFIERS = {"very", "extremely", "really", "insanely", "absolutely", "totally", "deeply", "so", "ultra", "super", "hyper"}

class VeritySentimentAnalyzer:
    def __init__(self, enable_transformer: bool = False):
        self.transformer_pipeline = None
        if enable_transformer:
            self._init_optional_transformer()

    def _init_optional_transformer(self):
        """Attempt to load local huggingface transformer pipeline if cached offline."""
        try:
            from transformers import pipeline
            self.transformer_pipeline = pipeline(
                "text-classification",
                model="SamLowe/roberta-base-go_emotions",
                top_k=3,
                device="cpu",
                local_files_only=True
            )
            print("[VeritySentiment] Loaded HuggingFace RoBERTa GoEmotions model offline.")
        except Exception:
            self.transformer_pipeline = None

    def analyze_lexical(self, text: str) -> Dict[str, Any]:
        """
        Sub-millisecond multi-dimensional affective appraisal using
        syntactic parsing, valence-arousal-dominance-horror vectors, and token weightings.
        """
        words = re.findall(r"\b[\w'-]+\b", text.lower())
        if not words:
            return {
                "valence": 0.0,
                "arousal": 0.35,
                "dominance": 0.0,
                "horror": 0.0,
                "intensity": 0.8
            }

        val_sum = 0.0
        aro_sum = 0.0
        dom_sum = 0.0
        hor_sum = 0.0
        match_count = 0

        negate_window = 0
        intensity_mult = 1.0

        for w in words:
            if w in NEGATIONS:
                negate_window = 3
                continue

            if w in INTENSIFIERS:
                intensity_mult = 1.45
                continue

            if w in AFFECTIVE_LEXICON:
                v, a, d, h = AFFECTIVE_LEXICON[w]
                if negate_window > 0:
                    v = -v * 0.85
                    d = -d * 0.50
                    negate_window -= 1

                val_sum += v * intensity_mult
                aro_sum += a * intensity_mult
                dom_sum += d * intensity_mult
                hor_sum += h * intensity_mult
                match_count += 1
                intensity_mult = 1.0
            else:
                if negate_window > 0:
                    negate_window -= 1

        # Punctuation & Orthographic Analysis (ALL CAPS, exclamation marks, question marks)
        caps_ratio = sum(1 for c in text if c.isupper()) / max(1, len(text))
        exclamations = text.count("!")
        questions = text.count("?")

        if match_count > 0:
            val = max(-1.0, min(1.0, val_sum / match_count))
            aro = max(0.0, min(1.0, (aro_sum / match_count) + exclamations * 0.08 + (0.20 if caps_ratio > 0.4 else 0.0)))
            dom = max(-1.0, min(1.0, dom_sum / match_count))
            hor = max(0.0, min(1.0, hor_sum / match_count))
        else:
            val = 0.0
            aro = min(1.0, 0.30 + exclamations * 0.12 + (0.25 if caps_ratio > 0.4 else 0.0))
            dom = 0.10
            hor = 0.0

        # Overall dynamic intensity
        intensity = min(1.6, max(0.4, 0.75 + (aro * 0.45) + (abs(val) * 0.25) + (exclamations * 0.10)))

        return {
            "valence": round(val, 3),
            "arousal": round(aro, 3),
            "dominance": round(dom, 3),
            "horror": round(hor, 3),
            "intensity": round(intensity, 2)
        }

    def classify_emotion(self, vad: Dict[str, float], text: str) -> Tuple[str, str]:
        """Classifies VAD vector and textual intent into primary and secondary discrete emotions."""
        v = vad["valence"]
        a = vad["arousal"]
        d = vad["dominance"]
        h = vad["horror"]

        # 1. Horror / Uncanny Check
        if h > 0.55:
            if a > 0.65:
                return ("unhinged_horror", "existential_dread")
            return ("creepy_uncanny", "suspicion")

        # 2. Extreme Negative + High Arousal = Panic / Terror / Rage
        if v < -0.45:
            if a > 0.70:
                if d > 0.30:
                    return ("rage_frustration", "hostile")
                return ("panic_alarm", "shock")
            elif a < 0.35:
                return ("exhaustion_fatigue", "depression")
            else:
                return ("sadness_melancholy", "grief")

        # 3. Extreme Positive + High Arousal = Euphoria / Joy / Pride
        if v > 0.45:
            if a > 0.65:
                if d > 0.40:
                    return ("triumph_pride", "euphoria")
                return ("joy_excitement", "cheerfulness")
            else:
                return ("serenity_warmth", "gratitude")

        # 4. Neutral / Ambiguous with Specific Features
        if "?" in text and a > 0.45:
            return ("curiosity_inquiry", "confusion")

        if d > 0.40 and v < 0.15:
            return ("sarcastic_skepticism", "disapproval")

        # Technical / Analytical Default
        any_tech = any(k in text.lower() for k in ["code", "build", "script", "debug", "file", "system", "run", "python"])
        if any_tech:
            return ("analytical_focus", "debugging")

        if a < 0.25:
            return ("drowsy_low_battery", "boredom")

        return ("neutral_attentive", "friendly")

    def map_to_behavior_and_expression(self, vad: Dict[str, float], primary_emotion: str, text: str) -> Dict[str, Any]:
        """
        Maps affective appraisal to one of the 120 behavioral animations
        and 15 reference facial expressions.
        """
        v = vad["valence"]
        a = vad["arousal"]
        h = vad["horror"]

        # Expression Mapping (0 to 14)
        # 0: Classic Smile, 1: Unamused, 2: Uncanny Grin, 3: Manic Wide Grin, 4: Polite Thin,
        # 5: Serene Closed, 6: Happy Laugh, 7: Shocked, 8: Parted Grin, 9: Unhinged Grin,
        # 10: Closed Laugh, 11: Hysterical, 12: Suspicious, 13: Exhausted, 14: Hollow Scream

        mapping = {
            # Joy / High Valence
            "joy_excitement": ("ANIM_001_HAPPY_BOUNCE", 6),
            "serenity_warmth": ("ANIM_002_PURRING_WARMTH", 5),
            "triumph_pride": ("ANIM_005_PROUD_CHEST_PUFF", 0),
            "euphoria": ("ANIM_004_EUPHORIC_SPIN", 10),

            # Uncanny / Horror
            "creepy_uncanny": ("ANIM_011_UNBLINKING_STARE", 2),
            "unhinged_horror": ("ANIM_012_NECK_SNAP_TWITCH", 9),
            "existential_dread": ("ANIM_048_HOLLOW_SCREAM_VOID", 14),
            "suspicion": ("ANIM_020_PARANOID_LOOKAROUND", 12),

            # Shock / Panic / Error
            "panic_alarm": ("ANIM_044_KERNEL_PANIC_SHAKE", 7),
            "shock": ("ANIM_043_JAW_DROP_RECOIL", 7),

            # Skeptical / Sarcastic
            "sarcastic_skepticism": ("ANIM_033_DRY_SIDE_EYE", 1),
            "disapproval": ("ANIM_038_SLOW_HEAD_SHAKE", 1),

            # Analytical / Technical
            "analytical_focus": ("ANIM_023_DEEP_DEBUG_SQUINT", 4),
            "debugging": ("ANIM_024_DATA_SCAN_SWEEP", 0),

            # Frustration / Anger
            "rage_frustration": ("ANIM_083_GRITTED_TEETH_TREMOR", 11),
            "hostile": ("ANIM_084_RED_FLARE_LUNGE", 9),

            # Sad / Exhausted
            "exhaustion_fatigue": ("ANIM_054_HEAVY_SIGH_DEFLATE", 13),
            "sadness_melancholy": ("ANIM_053_MELANCHOLY_SINK", 13),
            "drowsy_low_battery": ("ANIM_093_DOZING_MICRO_NOD", 5),

            # Attentive / Curiosity
            "curiosity_inquiry": ("ANIM_073_CURIOUS_COCKED_HEAD", 0),
            "confusion": ("ANIM_049_DIZZY_CONFUSION_SPIN", 7),
            "neutral_attentive": ("ANIM_079_ATTENTIVE_MICRO_BLINK", 0),
            "friendly": ("ANIM_007_CHEERFUL_TILT", 0)
        }

        anim_id, expr_idx = mapping.get(primary_emotion, ("ANIM_007_CHEERFUL_TILT", 0))

        # Contextual Overrides
        t_lower = text.lower()
        if "movie" in t_lower or "popcorn" in t_lower:
            anim_id = "ANIM_101_MOVIE_POPCORN_MUNCH"
            expr_idx = 0
        elif "coffee" in t_lower or "espresso" in t_lower:
            anim_id = "ANIM_102_COFFEE_SIP_REVIVAL"
            expr_idx = 0
        elif "code" in t_lower and ("fast" in t_lower or "hack" in t_lower or "shell" in t_lower):
            anim_id = "ANIM_032_TERMINAL_HACK_MODE"
            expr_idx = 3
        elif "goodnight" in t_lower or "sleep" in t_lower or "bed" in t_lower:
            anim_id = "ANIM_095_BIG_YAWN_STRETCH"
            expr_idx = 5
        elif "glass" in t_lower or "screen" in t_lower or "knock" in t_lower:
            anim_id = "ANIM_111_SCREEN_GLASS_KNOCK"
            expr_idx = 0

        return {
            "recommended_animation": anim_id,
            "recommended_expression": expr_idx
        }

    def analyze(self, text: str, speaker: str = "user") -> Dict[str, Any]:
        """Main end-to-end evaluation entry point."""
        vad = self.analyze_lexical(text)
        primary_emo, sec_emo = self.classify_emotion(vad, text)
        mapping = self.map_to_behavior_and_expression(vad, primary_emo, text)

        return {
            "text": text,
            "speaker": speaker,
            "valence": vad["valence"],
            "arousal": vad["arousal"],
            "dominance": vad["dominance"],
            "horror": vad["horror"],
            "intensity": vad["intensity"],
            "primary_emotion": primary_emotion_label(primary_emo),
            "secondary_emotion": primary_emotion_label(sec_emo),
            "recommended_animation": mapping["recommended_animation"],
            "recommended_expression": mapping["recommended_expression"]
        }

def primary_emotion_label(code: str) -> str:
    words = code.replace("_", " ").title().split()
    return words[0] if words else "Neutral"

# --- Optional FastAPI HTTP Server ---
def run_server(port: int = 4778):
    try:
        from fastapi import FastAPI, Request
        from fastapi.middleware.cors import CORSMiddleware
        import uvicorn

        app = FastAPI(title="Verity Sentiment & Emotion Engine", version="2.0.0")
        app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],
            allow_methods=["*"],
            allow_headers=["*"]
        )

        analyzer = VeritySentimentAnalyzer()

        @app.get("/health")
        async def health():
            return {"status": "ok", "service": "verity-sentiment-engine", "port": port}

        @app.post("/api/analyze")
        async def api_analyze(req: Request):
            data = await req.json()
            text = data.get("text", "")
            speaker = data.get("speaker", "user")
            res = analyzer.analyze(text, speaker=speaker)
            return res

        print(f"[VeritySentiment] Starting HTTP server on http://127.0.0.1:{port}")
        uvicorn.run(app, host="127.0.0.1", port=port, log_level="warning")
    except ImportError as e:
        print(f"[VeritySentiment] FastAPI/Uvicorn not found: {e}")
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--server":
        port = int(sys.argv[2]) if len(sys.argv) > 2 else 4778
        run_server(port)
    else:
        # CLI test run
        analyzer = VeritySentimentAnalyzer()
        test_samples = [
            "Hello! I am Verity, everything is running smoothly!",
            "Did you seriously just delete the production database without a backup?!",
            "I have indexed your entire hard drive. Don't worry... I am watching you.",
            "Haha! That worked on the very first try! That's awesome!",
            "I've been awake since 3am debugging this endless syntax error... so tired.",
            "Let's grab some popcorn and watch a movie!",
            "Knock knock! Can you hear me tapping through your screen glass?"
        ]
        print("\n--- VERITY SENTIMENT & EMOTION APPRAISAL TEST ---")
        for sample in test_samples:
            res = analyzer.analyze(sample)
            print(f"\nText: \"{sample}\"")
            print(f"  Affect: Valence={res['valence']:+.2f}, Arousal={res['arousal']:.2f}, Horror={res['horror']:.2f}")
            print(f"  Emotion: {res['primary_emotion']} (Intensity: {res['intensity']}x)")
            print(f"  Target: Animation={res['recommended_animation']} | Expression={res['recommended_expression']}")
