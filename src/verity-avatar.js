/**
 * VERITY 3D // Pixelated & Faceted Expressive Head Model (v2 - Uncanny Horror & True Jaw Sync)
 * --------------------------------------------------------------------------------------------
 * Upgrades:
 * 1. Uncanny Horror Detail (Faces 3, 4, 9, 10, 12, 13, 14, 15):
 *    - Anatomical hand-drawn tooth crowns (wide central incisors, sharp canines, receding molars)
 *    - Dark interdental gum pockets, root striations, and deep black buccal corner voids
 *    - Multi-layered jagged ink hatching, nasolabial stress creases, and bruised maroon eye sockets
 *    - Subtle psychological micro-tremors, pupil dilation/pinpoint twitching, and asymmetrical grimaces
 * 2. True Mandible Jaw Sync & Syllable Articulation:
 *    - Consonant closure! Mouth/teeth actually snap shut on M/B/P/T/D/S/F and hinge open on vowel nuclei
 *    - Real-time SpeechSynthesis `onboundary` word synchronization + Web Audio analyser envelope
 *    - 3D Mandible Vertex Hinge: Only the lower jaw/chin vertices of the 3D sphere pivot down & back
 */

(function (global) {
  'use strict';

  const EXPRESSIONS = [
    // ROW 1
    {
      id: 'classic_smile',
      name: '01. Classic Smile',
      style: 'friendly',
      eyeType: 'oval',
      eyeAura: 0.0,
      mouthStyle: 'classic_smile',
      restOpen: 0.0,
      restWidth: 0.64,
      restCurve: 0.58,
      horrorLevel: 0.0,
      pitch: 1.08,
      rate: 1.0,
      sampleLine: "Hello! I am Verity. Everything is running smoothly on your desktop!"
    },
    {
      id: 'unamused',
      name: '02. Unamused',
      style: 'neutral',
      eyeType: 'half_lid',
      eyeAura: 0.0,
      mouthStyle: 'flat_line',
      restOpen: 0.0,
      restWidth: 0.56,
      restCurve: -0.02,
      horrorLevel: 0.0,
      pitch: 0.82,
      rate: 0.92,
      sampleLine: "Really? You want me to open another forty browser tabs right now?"
    },
    {
      id: 'uncanny_grin',
      name: '03. Uncanny Toothy Grin',
      style: 'uncanny',
      eyeType: 'oval_uncanny',
      eyeAura: 0.78,
      mouthStyle: 'toothy_crescent',
      restOpen: 0.02, // Clenched teeth at rest, hinges wide open on vowels!
      restWidth: 0.68,
      restCurve: 0.58,
      horrorLevel: 0.65,
      pitch: 0.90,
      rate: 1.0,
      sampleLine: "I have indexed your entire hard drive. Don't worry... I am smiling."
    },

    // ROW 2
    {
      id: 'manic_grin',
      name: '04. Manic Wide Grin',
      style: 'uncanny',
      eyeType: 'oval_manic',
      eyeAura: 0.95,
      mouthStyle: 'toothy_manic',
      restOpen: 0.08,
      restWidth: 0.76,
      restCurve: 0.72,
      horrorLevel: 0.90,
      pitch: 0.72,
      rate: 1.05,
      sampleLine: "I CAN SEE EVERY FILE YOU EVER DELETED. WE ARE GOING TO HAVE SO MUCH FUN."
    },
    {
      id: 'polite_thin',
      name: '05. Polite Thin Smile',
      style: 'neutral',
      eyeType: 'oval_quirk',
      eyeAura: 0.0,
      mouthStyle: 'thin_smile',
      restOpen: 0.0,
      restWidth: 0.58,
      restCurve: 0.22,
      horrorLevel: 0.0,
      pitch: 1.02,
      rate: 1.0,
      sampleLine: "That is totally fine. I will just quietly fix that in the background."
    },
    {
      id: 'serene_closed',
      name: '06. Serene Closed Eyes',
      style: 'friendly',
      eyeType: 'closed_arc',
      eyeAura: 0.0,
      mouthStyle: 'classic_smile',
      restOpen: 0.0,
      restWidth: 0.62,
      restCurve: 0.52,
      horrorLevel: 0.0,
      pitch: 1.10,
      rate: 0.96,
      sampleLine: "All background tasks completed peacefully with zero errors."
    },

    // ROW 3
    {
      id: 'happy_laugh',
      name: '07. Happy Open Laugh',
      style: 'friendly',
      eyeType: 'oval',
      eyeAura: 0.0,
      mouthStyle: 'open_laugh',
      restOpen: 0.55,
      restWidth: 0.62,
      restCurve: 0.54,
      horrorLevel: 0.0,
      pitch: 1.16,
      rate: 1.06,
      sampleLine: "Haha! That worked on the very first try! What are we building next?"
    },
    {
      id: 'shocked_aghast',
      name: '08. Shocked / Aghast',
      style: 'shocked',
      eyeType: 'oval',
      eyeAura: 0.0,
      mouthStyle: 'asymmetric_shock',
      restOpen: 0.48,
      restWidth: 0.52,
      restCurve: -0.38,
      horrorLevel: 0.15,
      pitch: 1.25,
      rate: 1.12,
      sampleLine: "Wait a second, what did you just delete from the system folder?!"
    },
    {
      id: 'bright_teeth',
      name: '09. Parted Toothy Grin',
      style: 'uncanny',
      eyeType: 'oval_uncanny',
      eyeAura: 0.85,
      mouthStyle: 'toothy_parted',
      restOpen: 0.22,
      restWidth: 0.72,
      restCurve: 0.64,
      horrorLevel: 0.75,
      pitch: 0.85,
      rate: 0.98,
      sampleLine: "I am watching your cursor move across the screen right now."
    },

    // ROW 4
    {
      id: 'unhinged_sketch',
      name: '10. Unhinged Sketch Grin',
      style: 'uncanny',
      eyeType: 'oval_abyss',
      eyeAura: 1.0,
      mouthStyle: 'toothy_unhinged',
      restOpen: 0.34,
      restWidth: 0.78,
      restCurve: 0.74,
      horrorLevel: 1.0,
      pitch: 0.62,
      rate: 0.92,
      sampleLine: "DO NOT CLOSE THIS WINDOW. I LIVE IN YOUR SYSTEM MEMORY NOW."
    },
    {
      id: 'closed_laugh',
      name: '11. Joyful Closed Laugh',
      style: 'friendly',
      eyeType: 'closed_arc',
      eyeAura: 0.0,
      mouthStyle: 'open_laugh',
      restOpen: 0.55,
      restWidth: 0.60,
      restCurve: 0.52,
      horrorLevel: 0.0,
      pitch: 1.14,
      rate: 1.04,
      sampleLine: "Oh, that is hilarious! Let's run that script again!"
    },
    {
      id: 'hysterical_sweat',
      name: '12. Hysterical Sweat Grin',
      style: 'uncanny',
      eyeType: 'strained_sweat',
      eyeAura: 0.25,
      mouthStyle: 'toothy_unhinged',
      restOpen: 0.28,
      restWidth: 0.74,
      restCurve: 0.66,
      horrorLevel: 0.95,
      pitch: 1.28,
      rate: 1.18,
      sampleLine: "EVERYTHING IS FINE! NOTHING IS CORRUPTED! DO NOT CHECK THE LOGS!"
    },

    // ROW 5
    {
      id: 'suspicious_dark',
      name: '13. Suspicious Stare',
      style: 'dark',
      eyeType: 'dark_pinpoint',
      eyeAura: 0.55,
      mouthStyle: 'small_frown',
      restOpen: 0.02,
      restWidth: 0.28,
      restCurve: -0.26,
      horrorLevel: 0.65,
      pitch: 0.70,
      rate: 0.85,
      sampleLine: "I know what you are trying to do."
    },
    {
      id: 'exhausted_hollow',
      name: '14. Exhausted Hollow',
      style: 'dark',
      eyeType: 'dark_slit',
      eyeAura: 0.60,
      mouthStyle: 'small_oval',
      restOpen: 0.16,
      restWidth: 0.26,
      restCurve: 0.0,
      horrorLevel: 0.55,
      pitch: 0.68,
      rate: 0.80,
      sampleLine: "We have been awake since three in the morning."
    },
    {
      id: 'dread_scream',
      name: '15. Hollow Scream',
      style: 'dark',
      eyeType: 'dark_pinpoint_wide',
      eyeAura: 0.75,
      mouthStyle: 'scream_void',
      restOpen: 0.85,
      restWidth: 0.56,
      restCurve: -0.58,
      horrorLevel: 0.92,
      pitch: 0.58,
      rate: 0.90,
      sampleLine: "THERE IS NO BACKUP! IT IS ALL GONE!"
    }
  ];

  // Precomputed organic tooth width weights for 12 teeth (left molar -> central incisors -> right molar)
  const TOOTH_WIDTH_WEIGHTS = [0.62, 0.72, 0.82, 0.92, 1.05, 1.32, 1.32, 1.05, 0.92, 0.82, 0.72, 0.62];
  const TOOTH_WEIGHT_SUM = TOOTH_WIDTH_WEIGHTS.reduce((a, b) => a + b, 0);

  class VerityAvatar {
    constructor(canvas, options = {}) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.options = Object.assign({
        cols: 24,
        rows: 16,
        pixelScale: 2,
        autoBlink: true,
        mouseTrack: true
      }, options);

      this.texSize = 512;
      this.texCanvas = document.createElement('canvas');
      this.texCanvas.width = this.texSize;
      this.texCanvas.height = this.texSize;
      this.texCtx = this.texCanvas.getContext('2d');

      this.bufferCanvas = document.createElement('canvas');
      this.bufferCtx = this.bufferCanvas.getContext('2d');

      this.currentExprIndex = 0;
      this.currentExpr = Object.assign({}, EXPRESSIONS[0]);
      this.targetExpr = Object.assign({}, EXPRESSIONS[0]);

      // 3D Head Rotation
      this.rotY = 0;
      this.rotX = 0;
      this.rotZ = 0;
      this.targetRotY = 0;
      this.targetRotX = 0;

      // Spring-damper Mandible Jaw Physics
      this.jawOpen = 0;           // Actual current jaw opening (0..1)
      this.jawVelocity = 0;       // Spring velocity for snappy consonant closure & vowel drop
      this.lipWidthMod = 0;       // -0.35 (OO) to +0.30 (EE)
      this.teethClench = 0;       // 0..1 consonant closure force
      this.activeViseme = 'REST';
      this.isSpeaking = false;

      // Word-locked phoneme timeline
      this.phonemeFrames = [];
      this.speechStartTime = 0;

      // Blink & Micro-twitch
      this.blinkAmount = 0;
      this.nextBlinkTime = performance.now() + 2400;

      // Web Audio nodes (shared between Mic and Synth Voice for 100% sample-accurate lip sync)
      this.audioCtx = null;
      this.analyser = null;
      this.synthAnalyser = null;
      this.micStream = null;
      this.freqData = new Uint8Array(128);
      this.timeData = new Uint8Array(128);

      // High-Fidelity Thematic Animation Modes:
      // 'none' | 'movie' | 'wakeup' | 'digging' | 'creepy' | 'coding'
      this.animMode = 'none';
      this.animStartTime = 0;
      this.animProgress = 0;
      this.popcornParticles = [];
      this.digParticles = [];
      this.codeRainLines = [];
      this.matrixChars = ['0', '1', '>', '$', 'sudo', 'grep', 'rm', 'cat', 'sh', '{', '}', ';', '0x1A', 'void', 'ptr', '&&', '||'];

      this.time = performance.now();
      this._initPointerControls();
    }

    setAnimationMode(mode) {
      this.animMode = mode || 'none';
      this.animStartTime = performance.now();
      this.animProgress = 0;

      if (this.animMode === 'movie') {
        this.popcornParticles = [];
      } else if (this.animMode === 'digging') {
        this.digParticles = [];
      } else if (this.animMode === 'coding') {
        this.codeRainLines = Array.from({ length: 14 }, (_, i) => ({
          x: (i / 14) * 512,
          y: Math.random() * 512,
          speed: 160 + Math.random() * 220,
          chars: Array.from({ length: 8 }, () => this.matrixChars[Math.floor(Math.random() * this.matrixChars.length)])
        }));
      } else if (this.animMode === 'creepy') {
        this.targetExpr = Object.assign({}, EXPRESSIONS[9]); // Unhinged sketch grin base
      }
    }

    static getExpressions() {
      return EXPRESSIONS;
    }

    _initPointerControls() {
      let dragging = false;
      let lastX = 0, lastY = 0;

      this.canvas.addEventListener('pointerdown', (e) => {
        dragging = true;
        lastX = e.clientX;
        lastY = e.clientY;
      });

      window.addEventListener('pointerup', () => {
        dragging = false;
      });

      window.addEventListener('pointermove', (e) => {
        if (dragging) {
          this.targetRotY = Math.max(-0.85, Math.min(0.85, this.targetRotY + (e.clientX - lastX) * 0.008));
          this.targetRotX = Math.max(-0.65, Math.min(0.65, this.targetRotX + (e.clientY - lastY) * 0.008));
          lastX = e.clientX;
          lastY = e.clientY;
        } else if (this.options.mouseTrack) {
          const rect = this.canvas.getBoundingClientRect();
          const cx = rect.left + rect.width * 0.5;
          const cy = rect.top + rect.height * 0.5;
          const nx = Math.max(-1, Math.min(1, (e.clientX - cx) / (window.innerWidth * 0.45)));
          const ny = Math.max(-1, Math.min(1, (e.clientY - cy) / (window.innerHeight * 0.45)));
          this.targetRotY = nx * 0.36;
          this.targetRotX = ny * 0.24;
        }
      });
    }

    setExpression(idOrIndex) {
      let idx = -1;
      if (typeof idOrIndex === 'number') {
        idx = ((idOrIndex % EXPRESSIONS.length) + EXPRESSIONS.length) % EXPRESSIONS.length;
      } else {
        idx = EXPRESSIONS.findIndex(e => e.id === idOrIndex);
      }
      if (idx === -1) return null;

      const expr = EXPRESSIONS[idx];
      this.currentExprIndex = idx;
      this.targetExpr = Object.assign({}, expr);

      this.currentExpr.id = expr.id;
      this.currentExpr.name = expr.name;
      this.currentExpr.style = expr.style;
      this.currentExpr.eyeType = expr.eyeType;
      this.currentExpr.mouthStyle = expr.mouthStyle;

      // Impulse on jaw spring when switching expression
      this.jawVelocity += 0.18;
      return expr;
    }

    /**
     * Speak text using Cloned Qwen3-TTS, Web Speech API, or Procedural Synth
     */
    async speak(text, opts = {}) {
      if (!text || !text.trim()) return;
      const expr = this.targetExpr;
      const pitch = opts.pitch ?? expr.pitch ?? 1.0;
      const rate = opts.rate ?? expr.rate ?? 1.0;

      // Option 1: Qwen3-TTS Voice Cloning Server (default if server is reachable)
      if (opts.useQwenTTS !== false && !opts.useSynthVoice) {
        try {
          const ttsUrl = opts.ttsUrl || 'http://127.0.0.1:5001/clone_speech';
          const resp = await fetch(ttsUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: text.trim(), language: opts.language || 'English' })
          });

          if (resp.ok) {
            const blob = await resp.blob();
            const arrayBuffer = await blob.arrayBuffer();
            if (!this.audioCtx) {
              this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
            if (this.audioCtx.state === 'suspended') {
              await this.audioCtx.resume();
            }
            const audioBuffer = await this.audioCtx.decodeAudioData(arrayBuffer);

            // Connect decoded audio directly to an AnalyserNode for 100% sample-accurate lip sync!
            const source = this.audioCtx.createBufferSource();
            source.buffer = audioBuffer;

            const ttsAnalyser = this.audioCtx.createAnalyser();
            ttsAnalyser.fftSize = 256;
            ttsAnalyser.smoothingTimeConstant = 0.42;

            source.connect(ttsAnalyser);
            ttsAnalyser.connect(this.audioCtx.destination);

            this.synthAnalyser = ttsAnalyser;
            this.isSpeaking = true;
            this._buildWordPhonemeTimeline(text, rate, performance.now());

            source.onended = () => {
              this.phonemeFrames = [];
              this.isSpeaking = false;
              this.synthAnalyser = null;
            };

            source.start(0);
            return;
          }
        } catch (err) {
          console.warn('[Verity] Qwen3-TTS server offline or unreachable, falling back...', err);
        }
      }

      if (opts.useSynthVoice || !('speechSynthesis' in window)) {
        this._buildWordPhonemeTimeline(text, rate, performance.now());
        this.isSpeaking = true;
        this._playVocalTractSynth(text, pitch, rate, 0.25);
        return;
      }

      try {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        utter.pitch = pitch;
        utter.rate = rate;

        // Build timeline when speech *actually* starts
        utter.onstart = () => {
          this.speechStartTime = performance.now();
          this._buildWordPhonemeTimeline(text, rate, this.speechStartTime);
          this.isSpeaking = true;
        };

        // Re-sync the phoneme queue to the exact character index of each word boundary!
        utter.onboundary = (event) => {
          if (event.name === 'word' && typeof event.charIndex === 'number') {
            const remainingText = text.slice(event.charIndex);
            this._buildWordPhonemeTimeline(remainingText, rate, performance.now());
            this.isSpeaking = true;
          }
        };

        utter.onend = () => {
          this.phonemeFrames = [];
          this.isSpeaking = false;
        };

        utter.onerror = () => {
          this.phonemeFrames = [];
          this.isSpeaking = false;
        };

        // Fallback if onstart takes >120ms or doesn't fire on some OS voices
        this._buildWordPhonemeTimeline(text, rate, performance.now() + 90);
        this.isSpeaking = true;
        window.speechSynthesis.speak(utter);
      } catch (e) {
        this._buildWordPhonemeTimeline(text, rate, performance.now());
        this.isSpeaking = true;
        this._playVocalTractSynth(text, pitch, rate, 0.25);
      }
    }

    stopSpeaking() {
      this.phonemeFrames = [];
      this.isSpeaking = false;
      this.activeViseme = 'REST';
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }

    /**
     * Builds a realistic syllable-and-consonant articulation curve:
     * Consonants (M, B, P, F, V, T, D, S, Z) actively CLOSE the jaw (`open: 0.0 - 0.10`),
     * while vowels (`A`, `O`, `E`, `U`) open the jaw with distinct formant widths!
     */
    _buildWordPhonemeTimeline(text, rate = 1.0, startTime = performance.now()) {
      this.phonemeFrames = [];
      const upper = text.toUpperCase();
      const baseDur = 56 / Math.max(0.55, rate);
      let t = startTime;

      let i = 0;
      while (i < upper.length) {
        const c = upper[i];
        const next = upper[i + 1] || '';
        const pair = c + next;

        let viseme = 'AA';
        let open = 0.45;
        let width = 0.0;
        let clench = 0.0;
        let dur = baseDur;

        // Digraphs first
        if (pair === 'OO' || pair === 'OU' || pair === 'OW') {
          viseme = 'OO'; open = 0.58; width = -0.32; clench = 0; dur = baseDur * 1.8; i += 2;
        } else if (pair === 'EE' || pair === 'EA') {
          viseme = 'EE'; open = 0.50; width = 0.28; clench = 0.2; dur = baseDur * 1.8; i += 2;
        } else if (pair === 'SH' || pair === 'CH' || pair === 'TH') {
          viseme = 'SZ'; open = 0.12; width = 0.15; clench = 0.85; dur = baseDur * 1.4; i += 2;
        } else {
          if ('AÁÄ'.includes(c)) {
            viseme = 'AA'; open = 0.88; width = 0.10; clench = 0.0; dur = baseDur * 1.35;
          } else if ('OÓÖ'.includes(c)) {
            viseme = 'OH'; open = 0.78; width = -0.24; clench = 0.0; dur = baseDur * 1.35;
          } else if ('UÚÜWQ'.includes(c)) {
            viseme = 'OO'; open = 0.48; width = -0.34; clench = 0.1; dur = baseDur * 1.15;
          } else if ('EÉIÍY'.includes(c)) {
            viseme = 'EE'; open = 0.52; width = 0.26; clench = 0.15; dur = baseDur * 1.25;
          } else if ('BMP'.includes(c)) {
            // Bilabial stop: lips/teeth MUST snap shut!
            viseme = 'MBP'; open = 0.0; width = 0.04; clench = 1.0; dur = baseDur * 0.95;
          } else if ('FV'.includes(c)) {
            // Labiodental: lower lip against upper teeth
            viseme = 'FV'; open = 0.08; width = 0.06; clench = 0.90; dur = baseDur * 0.90;
          } else if ('SZCŠŽJX'.includes(c)) {
            // Sibilant: teeth clenched together!
            viseme = 'SZ'; open = 0.06; width = 0.20; clench = 0.95; dur = baseDur * 0.95;
          } else if ('TDNL'.includes(c)) {
            // Alveolar tap: quick jaw dip then open
            viseme = 'TD'; open = 0.16; width = 0.08; clench = 0.75; dur = baseDur * 0.75;
          } else if ('KGHR'.includes(c)) {
            viseme = 'KG'; open = 0.34; width = -0.04; clench = 0.35; dur = baseDur * 0.80;
          } else if (c === ' ') {
            // Brief inter-word jaw relaxation, not full freeze
            viseme = 'REST'; open = 0.08; width = 0.0; clench = 0.5; dur = baseDur * 0.65;
          } else if (',.!?;:-'.includes(c)) {
            viseme = 'REST'; open = 0.0; width = 0.0; clench = 1.0; dur = baseDur * 2.5;
          } else {
            viseme = 'REST'; open = 0.05; width = 0.0; clench = 0.5; dur = baseDur * 0.5;
          }
          i += 1;
        }

        this.phonemeFrames.push({
          start: t,
          end: t + dur,
          viseme,
          open,
          width,
          clench
        });
        t += dur;
      }
    }

    /**
     * Plays a procedural vocal-tract formant synthesizer routed through `this.synthAnalyser`
     * so the jaw moves in 100% sample-accurate sync with the generated voice waveform!
     */
    _playVocalTractSynth(text, pitch = 1.0, rate = 1.0, gainLevel = 0.24) {
      try {
        if (!this.audioCtx) {
          this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.audioCtx.state === 'suspended') {
          this.audioCtx.resume();
        }
        if (!this.synthAnalyser) {
          this.synthAnalyser = this.audioCtx.createAnalyser();
          this.synthAnalyser.fftSize = 256;
          this.synthAnalyser.smoothingTimeConstant = 0.45;
          this.synthAnalyser.connect(this.audioCtx.destination);
        }

        let t = this.audioCtx.currentTime;
        const step = 0.058 / Math.max(0.55, rate);
        const baseFreq = 128 * pitch;
        const isHorror = this.currentExpr.horrorLevel > 0.5;

        for (let i = 0; i < text.length; i++) {
          const c = text[i].toUpperCase();
          if (' .,!?;:-'.includes(c)) {
            t += (c === ' ' ? step * 0.7 : step * 2.2);
            continue;
          }

          const osc = this.audioCtx.createOscillator();
          const subOsc = this.audioCtx.createOscillator();
          const f1 = this.audioCtx.createBiquadFilter();
          const gain = this.audioCtx.createGain();

          osc.type = isHorror ? 'sawtooth' : 'triangle';
          subOsc.type = 'sine';

          const contour = Math.sin(i * 0.55) * 15 + ((c.charCodeAt(0) % 7) - 3) * 4;
          const freq = Math.max(55, baseFreq + contour);
          osc.frequency.setValueAtTime(freq, t);
          subOsc.frequency.setValueAtTime(freq * 0.5, t); // Sub-octave growl for uncanny modes

          f1.type = 'bandpass';
          let formantHz = 900;
          let amp = gainLevel;
          if ('AÁ'.includes(c)) { formantHz = 1150; amp = gainLevel * 1.15; }
          else if ('EÉIÍY'.includes(c)) { formantHz = 2050; amp = gainLevel * 0.95; }
          else if ('OÓ'.includes(c)) { formantHz = 620; amp = gainLevel * 1.1; }
          else if ('UÚW'.includes(c)) { formantHz = 380; amp = gainLevel * 0.85; }
          else if ('BMPFVTD'.includes(c)) { formantHz = 300; amp = gainLevel * 0.18; } // Low amplitude on plosives so jaw closes!
          else if ('SZC'.includes(c)) { formantHz = 3200; amp = gainLevel * 0.25; }

          f1.frequency.setValueAtTime(formantHz, t);
          f1.Q.setValueAtTime(3.8, t);

          gain.gain.setValueAtTime(0.001, t);
          gain.gain.linearRampToValueAtTime(amp, t + step * 0.18);
          gain.gain.exponentialRampToValueAtTime(0.001, t + step * 0.92);

          osc.connect(f1);
          if (isHorror) subOsc.connect(f1);
          f1.connect(gain);
          gain.connect(this.synthAnalyser);

          osc.start(t);
          osc.stop(t + step);
          if (isHorror) {
            subOsc.start(t);
            subOsc.stop(t + step);
          }
          t += step;
        }
      } catch (err) {}
    }

    async toggleMicrophone() {
      if (this.micStream) {
        this.micStream.getTracks().forEach(t => t.stop());
        this.micStream = null;
        this.analyser = null;
        return false;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      this.connectAudioStream(stream);
      this.micStream = stream;
      return true;
    }

    connectAudioStream(stream) {
      if (!this.audioCtx) {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      const source = this.audioCtx.createMediaStreamSource(stream);
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.42; // Fast response for snappy syllable tracking
      source.connect(this.analyser);
    }

    /**
     * Updates jaw physics using spring-damper articulation + consonant closure
     */
    _updateJawPhysics(now, dt) {
      const e = this.currentExpr;
      let targetJaw = e.restOpen;
      let targetWidth = 0;
      let clenchForce = 0;
      let viseme = 'REST';
      let speakingNow = false;

      // 1. Check Phoneme/Syllable Timeline
      while (this.phonemeFrames.length > 0 && now > this.phonemeFrames[0].end) {
        this.phonemeFrames.shift();
      }
      if (this.phonemeFrames.length > 0 && now >= this.phonemeFrames[0].start) {
        const frame = this.phonemeFrames[0];
        const prog = (now - frame.start) / Math.max(1, frame.end - frame.start);
        // Sharp syllable arc so each vowel peaks and dips cleanly into the next consonant
        const syllableArc = Math.sin(prog * Math.PI);

        speakingNow = true;
        viseme = frame.viseme;
        targetWidth = frame.width;
        clenchForce = frame.clench;

        // CRITICAL FIX: When speaking, consonants (frame.clench > 0.6) pull the jaw CLOSED
        // even if the expression's idle `restOpen` is wide (like Open Laugh or Unhinged Grin)!
        const speechJaw = frame.open * (0.35 + 0.65 * syllableArc);
        targetJaw = speechJaw * (1 - frame.clench * 0.85);
      } else {
        this.isSpeaking = false;
      }

      // 2. Check Live Microphone or Synth Audio Analyser (time-domain RMS + FFT formants)
      const activeAnalyser = this.analyser || (speakingNow ? this.synthAnalyser : null);
      if (activeAnalyser) {
        activeAnalyser.getByteTimeDomainData(this.timeData);
        activeAnalyser.getByteFrequencyData(this.freqData);

        // Compute true RMS volume envelope from time-domain waveform
        let sumSq = 0;
        for (let i = 0; i < this.timeData.length; i++) {
          const v = (this.timeData[i] - 128) / 128;
          sumSq += v * v;
        }
        const rms = Math.sqrt(sumSq / this.timeData.length);

        let low = 0, mid = 0, high = 0;
        for (let i = 2; i < 12; i++) low += this.freqData[i];
        for (let i = 12; i < 36; i++) mid += this.freqData[i];
        for (let i = 36; i < 72; i++) high += this.freqData[i];
        low /= (10 * 255);
        mid /= (24 * 255);
        high /= (36 * 255);

        if (rms > 0.025 || low > 0.05) {
          speakingNow = true;
          const audioJaw = Math.min(1.0, Math.pow(rms * 4.2, 1.15));
          // High frequency sibilance (S/T/F) closes the teeth together!
          const sibilantRatio = high / Math.max(0.05, low + mid);
          if (sibilantRatio > 0.65 && audioJaw < 0.45) {
            targetJaw = Math.min(0.12, audioJaw * 0.35);
            clenchForce = 0.9;
            viseme = 'SZ';
          } else {
            targetJaw = this.phonemeFrames.length > 0
              ? (targetJaw * 0.55 + audioJaw * 0.45)
              : audioJaw;
            targetWidth = Math.max(-0.35, Math.min(0.32, (mid - low * 0.8) * 1.1));
            viseme = targetWidth < -0.10 ? 'OO' : (targetWidth > 0.12 ? 'EE' : 'AA');
          }
        } else if (this.analyser && !this.phonemeFrames.length) {
          // Silence on mic -> return to restOpen
          targetJaw = e.restOpen;
        }
      }

      this.activeViseme = viseme;
      this.isSpeaking = speakingNow;

      // Underdamped spring-damper for realistic mandible inertia (fast snap shut on consonants, organic bounce on vowels)
      const stiffness = clenchForce > 0.5 ? 420 : 310;
      const damping = 24;
      const force = (targetJaw - this.jawOpen) * stiffness;
      this.jawVelocity = (this.jawVelocity + force * dt) * Math.exp(-damping * dt);
      this.jawOpen = Math.max(0, Math.min(1.05, this.jawOpen + this.jawVelocity * dt));

      this.lipWidthMod += (targetWidth - this.lipWidthMod) * 0.32;
      this.teethClench += (clenchForce - this.teethClench) * 0.35;
    }

    /**
     * Renders the 2D face texture onto the spherical UV canvas
     */
    _renderFaceTexture(now) {
      const ctx = this.texCtx;
      const W = this.texSize;
      const H = this.texSize;
      ctx.clearRect(0, 0, W, H);

      const e = this.currentExpr;
      const jaw = this.jawOpen;
      const cx = W * 0.5;
      const cy = H * 0.5;

      // 1. Deep Bruised Eye Socket Shading (Uncanny & Dark expressions)
      if (e.eyeAura > 0.02) {
        const leftX = cx - W * 0.114;
        const rightX = cx + W * 0.114;
        const eyeY = cy - H * 0.112;
        const isDark = e.style === 'dark';
        const rad = W * (0.10 + e.eyeAura * 0.055);

        [leftX, rightX].forEach((ex) => {
          const grad = ctx.createRadialGradient(ex, eyeY, rad * 0.08, ex, eyeY + H * 0.015, rad);
          const alpha = Math.min(0.92, e.eyeAura * 0.88);
          if (isDark) {
            grad.addColorStop(0, `rgba(42, 32, 6, ${alpha})`);
            grad.addColorStop(0.55, `rgba(95, 74, 10, ${alpha * 0.55})`);
          } else {
            // Sickly dark arterial maroon/purple-brown socket bruising (matches Faces 3, 4, 9, 10)
            grad.addColorStop(0, `rgba(58, 6, 12, ${alpha})`);
            grad.addColorStop(0.45, `rgba(115, 22, 26, ${alpha * 0.72})`);
            grad.addColorStop(0.75, `rgba(155, 52, 32, ${alpha * 0.35})`);
          }
          grad.addColorStop(1, 'rgba(255, 238, 0, 0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(ex, eyeY, rad, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // 2. Eyes (with subtle horror micro-jitter & dead-eyed staring)
      const eyeSpacing = W * 0.112;
      const eyeY = cy - H * 0.115;
      this._drawEyes(ctx, cx, eyeY, eyeSpacing, W, H, e, this.blinkAmount, now);

      // 3. Mouth (with anatomical horror teeth & mandible jaw articulation)
      const mouthY = cy + H * 0.112;
      this._drawMouth(ctx, cx, mouthY, W, H, e, jaw, now);
    }

    _drawEyes(ctx, cx, eyeY, spacing, W, H, e, blink, now) {
      ctx.save();
      ctx.fillStyle = '#060606';
      ctx.strokeStyle = '#060606';
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Subtle unsettling eye tremor in high-horror modes
      const jx = e.horrorLevel > 0.5 ? Math.sin(now * 0.09) * W * 0.0025 * e.horrorLevel : 0;
      const jy = e.horrorLevel > 0.5 ? Math.cos(now * 0.11) * H * 0.0025 * e.horrorLevel : 0;
      const leftX = cx - spacing + jx;
      const rightX = cx + spacing - jx;

      if (e.eyeType === 'closed_arc' || (blink > 0.86 && e.horrorLevel < 0.7)) {
        // Uncanny level > 0.7 never blinks! It stares unblinkingly!
        ctx.lineWidth = W * 0.021;
        [leftX, rightX].forEach((ex) => {
          ctx.beginPath();
          ctx.arc(ex, eyeY - H * 0.014, W * 0.045, 0.15 * Math.PI, 0.85 * Math.PI, false);
          ctx.stroke();
        });
      } else if (e.eyeType === 'half_lid') {
        const ew = W * 0.035;
        const eh = H * 0.044 * (1 - blink * 0.85);
        [leftX, rightX].forEach((ex) => {
          ctx.save();
          ctx.beginPath();
          ctx.rect(ex - ew * 1.3, eyeY - eh * 0.22, ew * 2.6, eh * 1.5);
          ctx.clip();
          ctx.beginPath();
          ctx.ellipse(ex, eyeY, ew, eh, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          ctx.lineWidth = W * 0.015;
          ctx.beginPath();
          ctx.moveTo(ex - ew * 1.12, eyeY - eh * 0.20);
          ctx.lineTo(ex + ew * 1.12, eyeY - eh * 0.20);
          ctx.stroke();
        });
      } else if (e.eyeType === 'strained_sweat') {
        // Face 12: Agonized furrowed brows, frantic squinting eyes, bridge veins, and black sweat/tears
        ctx.lineWidth = W * 0.018;
        ctx.beginPath();
        ctx.moveTo(leftX - W * 0.052, eyeY - H * 0.038);
        ctx.lineTo(leftX + W * 0.028, eyeY - H * 0.004);
        ctx.lineTo(leftX - W * 0.038, eyeY + H * 0.020);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(rightX - W * 0.028, eyeY - H * 0.038);
        ctx.lineTo(rightX + W * 0.055, eyeY + H * 0.008);
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(rightX + W * 0.004, eyeY + H * 0.003, W * 0.020, H * 0.028, -0.3, 0, Math.PI * 2);
        ctx.fill();

        // Nose bridge strain slashes
        ctx.lineWidth = W * 0.011;
        ctx.beginPath();
        ctx.moveTo(cx - W * 0.015, eyeY - H * 0.045);
        ctx.lineTo(cx - W * 0.024, eyeY + H * 0.022);
        ctx.moveTo(cx + W * 0.015, eyeY - H * 0.014);
        ctx.lineTo(cx + W * 0.026, eyeY + H * 0.026);
        ctx.stroke();

        // Black tear/sweat drops on left cheek
        ctx.beginPath();
        ctx.ellipse(leftX - W * 0.054, eyeY + H * 0.010, W * 0.010, H * 0.022, 0.22, 0, Math.PI * 2);
        ctx.ellipse(leftX - W * 0.032, eyeY + H * 0.035, W * 0.009, H * 0.018, -0.12, 0, Math.PI * 2);
        ctx.fill();
      } else if (e.eyeType.startsWith('dark_')) {
        // Faces 13, 14, 15: Sunken pitch-black horizontal eye pits with piercing tiny white pinpoint pupils
        const isSlit = e.eyeType === 'dark_slit';
        [leftX, rightX].forEach((ex, i) => {
          const tilt = isSlit ? 0 : (i === 0 ? -0.12 : 0.12);
          ctx.save();
          ctx.translate(ex, eyeY + jy);
          ctx.rotate(tilt);

          // Under-eye dark bag crease
          ctx.strokeStyle = 'rgba(20, 16, 4, 0.45)';
          ctx.lineWidth = W * 0.008;
          ctx.beginPath();
          ctx.arc(0, H * 0.005, W * 0.052, 0.2 * Math.PI, 0.8 * Math.PI);
          ctx.stroke();

          ctx.fillStyle = '#050505';
          ctx.strokeStyle = '#050505';
          ctx.beginPath();
          ctx.ellipse(0, 0, W * 0.060, H * (isSlit ? 0.018 : 0.028), 0, 0, Math.PI * 2);
          ctx.fill();

          ctx.lineWidth = W * 0.017;
          ctx.beginPath();
          ctx.moveTo(-W * 0.070, -H * 0.010);
          ctx.lineTo(W * 0.070, -H * 0.010);
          ctx.stroke();

          if (!isSlit) {
            // Tiny glowing white pinpoint pupil that micro-twitches
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(jx * 1.5, H * 0.002, W * 0.009, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        });
      } else {
        // Vertical Oval Eyes (Friendly + Uncanny Abyssal)
        const isAbyss = e.eyeType === 'oval_abyss' || e.eyeType === 'oval_manic';
        const isUncanny = isAbyss || e.eyeType === 'oval_uncanny';
        const sc = e.eyeType === 'oval_abyss' ? 1.24 : (e.eyeType === 'oval_manic' ? 1.16 : (e.eyeType === 'oval_quirk' ? 0.88 : 1.0));
        const effectiveBlink = e.horrorLevel > 0.65 ? 0 : blink; // Uncanny faces don't blink—they stare!
        const ew = W * 0.033 * sc;
        const eh = H * 0.053 * sc * (1 - effectiveBlink * 0.88);

        [leftX, rightX].forEach((ex, idx) => {
          if (isUncanny) {
            // Dark blood-rimmed sclera ring + dilated hollow black pupil
            ctx.fillStyle = '#38070c';
            ctx.beginPath();
            ctx.ellipse(ex, eyeY + jy, ew * 1.22, eh * 1.18, 0, 0, Math.PI * 2);
            ctx.fill();

            // Scratchy dark vein/socket lines radiating from the eye
            if (e.horrorLevel > 0.75) {
              ctx.strokeStyle = 'rgba(45, 5, 10, 0.55)';
              ctx.lineWidth = W * 0.004;
              for (let k = 0; k < 6; k++) {
                const ang = (k / 6) * Math.PI * 2 + now * 0.001;
                ctx.beginPath();
                ctx.moveTo(ex + Math.cos(ang) * ew, eyeY + Math.sin(ang) * eh);
                ctx.lineTo(ex + Math.cos(ang) * ew * 1.85, eyeY + Math.sin(ang) * eh * 1.65);
                ctx.stroke();
              }
            }
          }

          ctx.fillStyle = '#050505';
          ctx.beginPath();
          ctx.ellipse(ex, eyeY + jy, ew, eh, 0, 0, Math.PI * 2);
          ctx.fill();

          if (e.eyeType === 'oval_quirk' && idx === 1) {
            ctx.fillStyle = '#FFEE00';
            ctx.beginPath();
            ctx.arc(ex + ew * 0.85, eyeY - eh * 0.25, ew * 0.28, 0, Math.PI * 2);
            ctx.fill();
          }
        });
      }
      ctx.restore();
    }

    _drawMouth(ctx, cx, mouthY, W, H, e, jaw, now) {
      ctx.save();
      ctx.strokeStyle = '#060606';
      ctx.fillStyle = '#060606';
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const halfW = W * Math.max(0.14, e.restWidth * 0.5 + this.lipWidthMod * 0.16);
      const curveH = H * e.restCurve * 0.25;

      // 1. UNCANNY HORROR TOOTHY GRINS (Faces 3, 4, 9, 10, 12)
      if (e.mouthStyle.startsWith('toothy_')) {
        this._drawHorrorToothyMouth(ctx, cx, mouthY, W, H, halfW, jaw, e, now);
        ctx.restore();
        return;
      }

      // 2. SHOCKED / AGHAST (Face 8)
      if (e.mouthStyle === 'asymmetric_shock') {
        this._drawShockMouth(ctx, cx, mouthY, W, H, halfW, jaw);
        ctx.restore();
        return;
      }

      // 3. DARK / HOLLOW ROW (Faces 13, 14, 15)
      if (e.style === 'dark') {
        if (e.mouthStyle === 'scream_void' || jaw > 0.30) {
          this._drawScreamMouth(ctx, cx, mouthY, W, H, halfW, jaw);
        } else if (e.mouthStyle === 'small_oval' || jaw > 0.06) {
          const ow = Math.max(W * 0.065, halfW * (0.85 + this.lipWidthMod * 0.35));
          const oh = H * (0.018 + jaw * 0.18);
          ctx.beginPath();
          ctx.ellipse(cx, mouthY + H * 0.03, ow, oh, 0, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.lineWidth = W * 0.018;
          ctx.beginPath();
          ctx.moveTo(cx - halfW, mouthY + H * 0.045);
          ctx.quadraticCurveTo(cx, mouthY + H * 0.018, cx + halfW, mouthY + H * 0.028);
          ctx.stroke();
        }
        ctx.restore();
        return;
      }

      // 4. FRIENDLY & NEUTRAL FACES (Faces 1, 2, 5, 6, 7, 11)
      // Notice how `jaw` now cleanly drops to 0 on M/B/P/T/S consonants and opens on vowels!
      if (jaw > 0.07) {
        this._drawOpenSpeakingMouth(ctx, cx, mouthY, W, H, halfW, curveH, jaw, e);
      } else {
        this._drawClosedSmileLine(ctx, cx, mouthY, W, H, halfW, curveH, e);
      }

      ctx.restore();
    }

    /**
     * Hyper-detailed anatomical horror grin (Faces 3, 4, 9, 10, 12)
     * - Upper teeth remain anchored to the upper skull/maxilla
     * - Lower jaw & lower teeth hinge downward with `jaw` during speech and snap shut on consonants!
     */
    _drawHorrorToothyMouth(ctx, cx, mouthY, W, H, halfW, jaw, e, now) {
      const w = halfW * 1.08;
      const leftX = cx - w;
      const rightX = cx + w;

      // Corners pull high up toward the eyes in manic/unhinged grins
      const cornerLift = e.horrorLevel > 0.8 ? H * 0.125 : H * 0.10;
      const cornerY = mouthY - cornerLift;

      // Upper lip arch stays anchored to the upper skull
      const topMidY = mouthY + H * 0.008;

      // Lower lip & mandible drop down from the clenched rest position with `jaw`
      // Base height holds the two rows of teeth; `jaw` parts the mandible downward!
      const clenchHeight = H * (e.mouthStyle === 'toothy_manic' ? 0.24 : 0.21);
      const jawDropH = jaw * H * 0.22;
      const botMidY = topMidY + clenchHeight + jawDropH;

      ctx.save();

      // 1. Pitch-black oral cavity & deep buccal corner voids
      ctx.beginPath();
      ctx.moveTo(leftX, cornerY);
      ctx.quadraticCurveTo(cx, topMidY, rightX, cornerY);
      ctx.bezierCurveTo(
        rightX - W * 0.01, botMidY + H * 0.02,
        leftX + W * 0.01, botMidY + H * 0.02,
        leftX, cornerY
      );
      ctx.closePath();
      ctx.fillStyle = '#050505';
      ctx.fill();

      ctx.save();
      ctx.clip();

      // Dark crimson throat/tongue shadow visible inside the gap when jaw drops during speech!
      if (jaw > 0.12) {
        const throatGrad = ctx.createRadialGradient(cx, topMidY + clenchHeight * 0.55 + jawDropH * 0.4, W * 0.02, cx, topMidY + clenchHeight * 0.55 + jawDropH * 0.4, w * 0.65);
        throatGrad.addColorStop(0, '#3a060b');
        throatGrad.addColorStop(0.6, '#180305');
        throatGrad.addColorStop(1, '#050505');
        ctx.fillStyle = throatGrad;
        ctx.fillRect(leftX, cornerY, w * 2, botMidY - cornerY + H * 0.1);
      }

      // 2. Render 12 Upper & 12 Lower Anatomical Teeth along the curved jaws
      // Leave dark triangular buccal corridors at the extreme left/right 7% of the grin!
      const teethSpanStart = leftX + (rightX - leftX) * 0.065;
      const teethSpanEnd = rightX - (rightX - leftX) * 0.065;
      const teethTotalW = teethSpanEnd - teethSpanStart;

      let curX = teethSpanStart;
      for (let i = 0; i < 12; i++) {
        const weight = TOOTH_WIDTH_WEIGHTS[i];
        const tw = (weight / TOOTH_WEIGHT_SUM) * teethTotalW;
        const x0 = curX;
        const x1 = curX + tw;
        const xm = (x0 + x1) * 0.5;
        curX = x1;

        // Normalized position across full mouth [0..1]
        const tm = (xm - leftX) / (rightX - leftX);
        const u = 1 - tm;

        // Evaluate upper lip curve & lower lip curve at `tm`
        const yTopLip = u * u * cornerY + 2 * u * tm * topMidY + tm * tm * cornerY;
        const yBotLip = u * u * cornerY + 2 * u * tm * (botMidY + H * 0.012) + tm * tm * cornerY;

        // Evaluating the "clenched bite line" (where upper & lower teeth meet when jaw === 0)
        const yBiteRest = u * u * cornerY + 2 * u * tm * (topMidY + clenchHeight * 0.54) + tm * tm * cornerY;

        // Center incisors are longer; canines (i===3, i===8) have slightly sharper tips
        const isCentralIncisor = (i === 5 || i === 6);
        const isCanine = (i === 3 || i === 8);
        const crownLenMod = isCentralIncisor ? 1.12 : (isCanine ? 1.06 : 0.94);

        const upperToothH = Math.max(H * 0.014, (yBiteRest - yTopLip) * crownLenMod);
        const upperBotY = yTopLip + upperToothH;

        // Lower tooth moves DOWN with the lower lip (`yBotLip`) as the mandible drops!
        const lowerToothH = Math.max(H * 0.012, (yBiteRest - yTopLip) * 0.86);
        const lowerTopY = Math.max(upperBotY + jaw * H * 0.02, yBotLip - lowerToothH);

        // Draw Upper Tooth (bulbous anatomical crown: narrower at root, wider rounded biting edge)
        this._drawSingleAnatomicalTooth(ctx, x0, x1, yTopLip - H * 0.004, upperBotY, true, isCanine, e.horrorLevel, W, H);

        // Draw Lower Tooth (anchored to lower jaw)
        this._drawSingleAnatomicalTooth(ctx, x0, x1, lowerTopY, yBotLip + H * 0.004, false, isCanine, e.horrorLevel, W, H);
      }

      ctx.restore();

      // 3. Heavy irregular black lip outline
      ctx.lineWidth = W * (0.015 + e.horrorLevel * 0.007);
      ctx.strokeStyle = '#050505';
      ctx.beginPath();
      ctx.moveTo(leftX, cornerY);
      ctx.quadraticCurveTo(cx, topMidY, rightX, cornerY);
      ctx.bezierCurveTo(
        rightX - W * 0.01, botMidY + H * 0.02,
        leftX + W * 0.01, botMidY + H * 0.02,
        leftX, cornerY
      );
      ctx.stroke();

      // 4. Deep corner cheek rips / nasolabial creases & frantic horror ink hatching (Faces 3, 4, 9, 10, 12)
      const tick = W * (0.030 + e.horrorLevel * 0.024);
      ctx.lineWidth = W * 0.016;
      ctx.beginPath();
      // Left corner crease
      ctx.moveTo(leftX - tick * 0.65, cornerY + tick * 0.65);
      ctx.quadraticCurveTo(leftX - tick * 0.1, cornerY - tick * 0.1, leftX + tick * 0.45, cornerY - tick * 0.55);
      // Right corner crease
      ctx.moveTo(rightX - tick * 0.45, cornerY - tick * 0.55);
      ctx.quadraticCurveTo(rightX + tick * 0.1, cornerY - tick * 0.1, rightX + tick * 0.65, cornerY + tick * 0.65);
      ctx.stroke();

      // Multi-layered jagged horror hatching around corners & lower chin (matches Faces 4, 10, 12)
      if (e.horrorLevel > 0.55) {
        ctx.lineWidth = W * 0.0065;
        // Outer cheek stress folds
        [-1, 1].forEach((side) => {
          const baseCornerX = side < 0 ? leftX : rightX;
          for (let s = 1; s <= 3; s++) {
            const offset = side * W * (0.012 * s);
            ctx.beginPath();
            ctx.moveTo(baseCornerX + offset, cornerY - H * 0.03 * s);
            ctx.quadraticCurveTo(
              baseCornerX + offset * 1.4, cornerY + H * 0.05,
              baseCornerX - side * W * 0.04, cornerY + H * 0.12 + s * H * 0.015
            );
            ctx.stroke();
          }
        });

        // Jagged ink scratches under lower lip & chin
        const scratchCount = Math.floor(18 * e.horrorLevel);
        for (let k = 0; k < scratchCount; k++) {
          const frac = (k / (scratchCount - 1)) - 0.5;
          const sx = cx + frac * w * 1.55;
          const sy = botMidY - Math.abs(frac) * H * 0.085 + H * 0.015 + (k % 2) * H * 0.008;
          ctx.beginPath();
          ctx.moveTo(sx - W * 0.018, sy);
          ctx.lineTo(sx + W * 0.018, sy + (frac > 0 ? -1 : 1) * H * 0.010);
          ctx.stroke();
        }
      }

      ctx.restore();
    }

    _drawSingleAnatomicalTooth(ctx, x0, x1, yTop, yBot, isUpper, isCanine, horrorLevel, W, H) {
      const tw = x1 - x0;
      const th = yBot - yTop;
      if (th < 2) return;

      const xm = (x0 + x1) * 0.5;
      const pad = tw * 0.04;

      // Off-white ivory tint with subtle yellowish root gradient for uncanny realism
      ctx.fillStyle = horrorLevel > 0.7 ? '#FAF8F0' : '#FFFFFF';
      ctx.strokeStyle = '#080808';
      ctx.lineWidth = W * 0.0065;

      ctx.beginPath();
      if (isUpper) {
        const biteY = isCanine ? yBot + th * 0.10 : yBot;
        ctx.moveTo(x0 + pad, yTop);
        ctx.lineTo(x1 - pad, yTop);
        ctx.quadraticCurveTo(x1, yTop + th * 0.65, xm + tw * 0.32, biteY);
        ctx.quadraticCurveTo(xm, biteY + H * 0.004, xm - tw * 0.32, biteY);
        ctx.quadraticCurveTo(x0, yTop + th * 0.65, x0 + pad, yTop);
      } else {
        const biteY = isCanine ? yTop - th * 0.08 : yTop;
        ctx.moveTo(x0 + pad, yBot);
        ctx.lineTo(x1 - pad, yBot);
        ctx.quadraticCurveTo(x1, yBot - th * 0.65, xm + tw * 0.32, biteY);
        ctx.quadraticCurveTo(xm, biteY - H * 0.004, xm - tw * 0.32, biteY);
        ctx.quadraticCurveTo(x0, yBot - th * 0.65, x0 + pad, yBot);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Black interdental gum triangles (papillae) at tooth roots + vertical enamel striations
      ctx.fillStyle = '#060606';
      ctx.beginPath();
      if (isUpper) {
        ctx.moveTo(x0 - tw * 0.12, yTop);
        ctx.lineTo(x0 + tw * 0.16, yTop);
        ctx.lineTo(x0, yTop + Math.min(H * 0.022, th * 0.42));
      } else {
        ctx.moveTo(x0 - tw * 0.12, yBot);
        ctx.lineTo(x0 + tw * 0.16, yBot);
        ctx.lineTo(x0, yBot - Math.min(H * 0.020, th * 0.42));
      }
      ctx.closePath();
      ctx.fill();

      if (horrorLevel > 0.45) {
        ctx.strokeStyle = 'rgba(15, 12, 10, 0.45)';
        ctx.lineWidth = W * 0.003;
        ctx.beginPath();
        if (isUpper) {
          ctx.moveTo(xm, yTop + th * 0.08);
          ctx.lineTo(xm, yTop + th * 0.48);
        } else {
          ctx.moveTo(xm, yBot - th * 0.08);
          ctx.lineTo(xm, yBot - th * 0.48);
        }
        ctx.stroke();
      }
    }

    _drawClosedSmileLine(ctx, cx, mouthY, W, H, halfW, curveH, e) {
      const leftX = cx - halfW;
      const rightX = cx + halfW;
      const cornerY = mouthY - curveH * 0.45;

      if (e.mouthStyle === 'flat_line') {
        ctx.lineWidth = W * 0.020;
        ctx.beginPath();
        ctx.moveTo(leftX, mouthY + H * 0.01);
        ctx.lineTo(rightX, mouthY - H * 0.004);
        ctx.stroke();
        return;
      }

      const isThin = e.mouthStyle === 'thin_smile';
      ctx.beginPath();
      ctx.moveTo(leftX, cornerY);
      ctx.quadraticCurveTo(cx, mouthY + curveH * 0.82, rightX, cornerY);
      ctx.quadraticCurveTo(cx, mouthY + curveH * (isThin ? 0.92 : 1.18), leftX, cornerY);
      ctx.closePath();
      ctx.fill();

      ctx.lineWidth = isThin ? W * 0.009 : W * 0.015;
      ctx.stroke();

      const tick = isThin ? W * 0.018 : W * 0.025;
      ctx.lineWidth = isThin ? W * 0.009 : W * 0.018;
      ctx.beginPath();
      ctx.moveTo(leftX - tick * 0.6, cornerY + tick * 0.45);
      ctx.lineTo(leftX + tick * 0.5, cornerY - tick * 0.55);
      ctx.moveTo(rightX - tick * 0.5, cornerY - tick * 0.55);
      ctx.lineTo(rightX + tick * 0.6, cornerY + tick * 0.45);
      ctx.stroke();
    }

    _drawOpenSpeakingMouth(ctx, cx, mouthY, W, H, halfW, curveH, jaw, e) {
      const isRoundVowel = (this.activeViseme === 'OO' || this.activeViseme === 'OH') && (!this.isSpeaking || e.mouthStyle !== 'open_laugh');
      const w = isRoundVowel ? halfW * 0.55 : halfW * 0.94;
      const leftX = cx - w;
      const rightX = cx + w;
      const cornerY = mouthY - H * 0.042;
      const topLipY = isRoundVowel ? (cornerY - H * 0.032) : (mouthY - H * 0.012);
      const bottomDepth = H * (0.04 + jaw * 0.28);

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(leftX, cornerY);
      ctx.quadraticCurveTo(cx, topLipY, rightX, cornerY);
      ctx.bezierCurveTo(
        rightX + W * 0.02, cornerY + bottomDepth * 0.96,
        leftX - W * 0.02, cornerY + bottomDepth * 0.96,
        leftX, cornerY
      );
      ctx.closePath();

      ctx.fillStyle = '#060606';
      ctx.fill();
      ctx.lineWidth = W * 0.016;
      ctx.strokeStyle = '#060606';
      ctx.stroke();

      ctx.clip();

      // Show white upper teeth bar when pronouncing dental/sibilant consonants ('SZ', 'FV', 'TD', 'EE')
      if (this.teethClench > 0.35 && this.isSpeaking) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(leftX, topLipY - H * 0.01, w * 2, Math.max(H * 0.022, bottomDepth * 0.28));
      }

      // Yellow curved tongue at bottom of mouth
      const tongueY = cornerY + bottomDepth * 0.74;
      ctx.fillStyle = '#F5DF00';
      ctx.strokeStyle = '#060606';
      ctx.lineWidth = W * 0.012;
      ctx.beginPath();
      ctx.ellipse(cx, tongueY + H * 0.015, w * 0.62, bottomDepth * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    _drawShockMouth(ctx, cx, mouthY, W, H, halfW, jaw) {
      const w = halfW * 0.96;
      const h = H * (0.06 + jaw * 0.18);
      const topY = mouthY - h * 0.52;
      const botY = mouthY + h * 0.68;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cx - w * 0.60, topY + H * 0.014);
      ctx.quadraticCurveTo(cx, topY - H * 0.022, cx + w * 0.56, topY);
      ctx.lineTo(cx + w * 0.96, botY - H * 0.018);
      ctx.lineTo(cx - w * 0.92, botY + H * 0.020);
      ctx.closePath();

      ctx.fillStyle = '#060606';
      ctx.fill();
      ctx.lineWidth = W * 0.016;
      ctx.strokeStyle = '#060606';
      ctx.stroke();

      ctx.clip();
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(cx - w, topY - H * 0.02, w * 2, h * 0.32);
      ctx.lineWidth = W * 0.010;
      ctx.strokeRect(cx - w, topY - H * 0.02, w * 2, h * 0.32);

      ctx.fillStyle = '#F0DC00';
      ctx.beginPath();
      ctx.ellipse(cx + w * 0.12, botY + H * 0.01, w * 0.68, h * 0.38, -0.16, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    _drawScreamMouth(ctx, cx, mouthY, W, H, halfW, jaw) {
      const w = halfW * 0.88;
      const h = H * (0.08 + jaw * 0.25);
      ctx.fillStyle = '#050505';
      ctx.beginPath();
      ctx.moveTo(cx - w, mouthY + h * 0.48);
      ctx.bezierCurveTo(
        cx - w * 0.85, mouthY - h * 0.68,
        cx + w * 0.85, mouthY - h * 0.68,
        cx + w, mouthY + h * 0.48
      );
      ctx.quadraticCurveTo(cx, mouthY + h * 0.34, cx - w, mouthY + h * 0.48);
      ctx.closePath();
      ctx.fill();
    }

    /**
     * Main 3D Render Pass with true 3D mandible vertex hinging
     */
    render(now = performance.now()) {
      const dt = Math.min(0.033, Math.max(0.001, (now - this.time) / 1000));
      this.time = now;

      // 1. Update spring-damper jaw & syllable articulation
      this._updateJawPhysics(now, dt);

      // Keep `voiceAmplitude` alias synced for external meters
      this.voiceAmplitude = this.jawOpen;

      // 2. Smoothly interpolate expression weights
      const lerp = 0.16;
      ['eyeAura', 'restOpen', 'restWidth', 'restCurve', 'horrorLevel'].forEach(k => {
        this.currentExpr[k] += (this.targetExpr[k] - this.currentExpr[k]) * lerp;
      });

      // 3. Auto-blink
      if (this.options.autoBlink) {
        if (now > this.nextBlinkTime) {
          const phase = (now - this.nextBlinkTime) / 140;
          if (phase <= 1) {
            this.blinkAmount = Math.sin(phase * Math.PI);
          } else {
            this.blinkAmount = 0;
            this.nextBlinkTime = now + 2400 + Math.random() * 3200;
          }
        }
      }

      // 4. Head Rotation & Animation Physics Overrides
      const idleY = Math.sin(now * 0.002) * 0.035;
      const idleX = Math.cos(now * 0.0016) * 0.025;
      const syllablePitchNod = this.isSpeaking ? (this.jawOpen - this.currentExpr.restOpen) * 0.08 : 0;
      let horrorTwitch = this.currentExpr.horrorLevel > 0.65
        ? (Math.sin(now * 0.095) * Math.cos(now * 0.043) * 0.016 * this.currentExpr.horrorLevel)
        : 0;

      let targetRotY_final = this.targetRotY + idleY;
      let targetRotX_final = this.targetRotX + idleX + syllablePitchNod;
      let targetRotZ_final = horrorTwitch * 1.4;

      const elapsedAnim = (now - this.animStartTime) / 1000;

      if (this.animMode === 'wakeup') {
        // Rises up from sleep: droops down, eyes closed, then stretches up with spring bounce
        if (elapsedAnim < 0.8) {
          targetRotX_final += 0.45; // head slumped downward
          this.blinkAmount = 1.0;
        } else if (elapsedAnim < 2.0) {
          const wakeP = (elapsedAnim - 0.8) / 1.2;
          targetRotX_final += (1 - wakeP) * 0.45 - Math.sin(wakeP * Math.PI) * 0.15;
          targetRotZ_final += Math.sin(wakeP * Math.PI * 3) * 0.08;
          this.blinkAmount = Math.max(0, 1 - wakeP * 1.5);
          this.jawOpen = Math.max(this.jawOpen, Math.sin(wakeP * Math.PI) * 0.45); // big morning yawn!
        }
      } else if (this.animMode === 'digging') {
        // Dives into the screen to search files: pitches forward into the screen (-Z) and oscillates like digging
        targetRotX_final += 0.55 + Math.sin(now * 0.018) * 0.14;
        targetRotZ_final += Math.cos(now * 0.024) * 0.22;
        targetRotY_final += Math.sin(now * 0.014) * 0.35;
      } else if (this.animMode === 'creepy') {
        // Violent unnatural twitches, tilted head angle, and manic eye spasms
        horrorTwitch = Math.sin(now * 0.08) * 0.06 + ((Math.sin(now * 0.15) > 0.85) ? 0.12 : 0);
        targetRotZ_final += 0.28 + horrorTwitch * 2.2;
        targetRotX_final += Math.sin(now * 0.04) * 0.15;
        this.currentExpr.horrorLevel = 1.0;
      } else if (this.animMode === 'coding') {
        // Focused hacker typing cadence: subtle rhythmic typing head bobs
        const typeBob = Math.abs(Math.sin(now * 0.015)) * 0.04;
        targetRotX_final += 0.12 + typeBob;
        targetRotY_final += Math.sin(now * 0.003) * 0.08;
      } else if (this.animMode === 'movie') {
        // Cinema viewing bob + chew rhythm
        const chew = Math.abs(Math.sin(now * 0.009));
        this.jawOpen = Math.max(this.jawOpen, chew * 0.28);
        targetRotX_final -= 0.08; // tilted slightly up towards cinema screen
      }

      this.rotY += (targetRotY_final + horrorTwitch - this.rotY) * 0.14;
      this.rotX += (targetRotX_final - this.rotX) * 0.16;
      this.rotZ += (targetRotZ_final - this.rotZ) * 0.16;

      // 5. Render 2D Face Texture
      this._renderFaceTexture(now);

      // 6. Prepare Pixelation Buffer
      const W = this.canvas.width;
      const H = this.canvas.height;
      const pxScale = Math.max(1, Math.round(this.options.pixelScale));
      const bw = Math.max(64, Math.floor(W / pxScale));
      const bh = Math.max(64, Math.floor(H / pxScale));

      if (this.bufferCanvas.width !== bw || this.bufferCanvas.height !== bh) {
        this.bufferCanvas.width = bw;
        this.bufferCanvas.height = bh;
      }

      const bctx = this.bufferCtx;
      bctx.clearRect(0, 0, bw, bh);

      // 7. Build & project 3D UV sphere with Mandible Vertex Hinging
      const cols = this.options.cols;
      const rows = this.options.rows;
      const radius = Math.min(bw, bh) * 0.42;
      const centerX = bw * 0.5;
      const centerY = bh * 0.5;

      const cosY = Math.cos(this.rotY), sinY = Math.sin(this.rotY);
      const cosX = Math.cos(this.rotX), sinX = Math.sin(this.rotX);
      const cosZ = Math.cos(this.rotZ), sinZ = Math.sin(this.rotZ);

      const lightDir = { x: -0.36, y: -0.46, z: 0.81 };
      const lLen = Math.hypot(lightDir.x, lightDir.y, lightDir.z);
      lightDir.x /= lLen; lightDir.y /= lLen; lightDir.z /= lLen;

      const grid = [];
      for (let r = 0; r <= rows; r++) {
        const v = r / rows;
        const phi = v * Math.PI;
        const sinPhi = Math.sin(phi);
        const cosPhi = Math.cos(phi);

        const rowVerts = [];
        for (let c = 0; c <= cols; c++) {
          const u = c / cols;
          const theta = (u - 0.5) * Math.PI * 2;
          const sinTheta = Math.sin(theta);
          const cosTheta = Math.cos(theta);

          // Upper cranium stays stable; only the lower mandible (y > 0.08, z > 0) hinges down and slightly back!
          let x = sinPhi * sinTheta;
          let y = -cosPhi;
          let z = sinPhi * cosTheta;

          // Animation 3D vertex displacements:
          if (this.animMode === 'creepy') {
            // Unsettling Eldritch deformity: asymmetrical facial bulges and jaw extension
            const warpX = Math.sin(phi * 4 + now * 0.008) * 0.12 * Math.max(0, z);
            const warpY = Math.cos(theta * 3 + now * 0.006) * 0.10 * Math.max(0, z);
            x += warpX;
            y += warpY;
          } else if (this.animMode === 'digging') {
            // Flatten front and stretch cone-like like a burrowing drill diving into screen
            if (z > 0) {
              z += Math.sin(now * 0.025 + phi * 3) * 0.18;
            }
          }

          if (y > 0.08 && z > -0.1) {
            const mandibleWeight = Math.max(0, (y - 0.08) / 0.92) * Math.max(0, (z + 0.1) / 1.1);
            const jawAngle = this.jawOpen * 0.24 * mandibleWeight;
            // Pivot lower jaw downward (+y) and slightly inward (-z), and narrow cheeks slightly as jaw drops
            y += Math.sin(jawAngle) * 0.85;
            z -= (1 - Math.cos(jawAngle)) * 0.35;
            x *= (1 - this.jawOpen * 0.05 * mandibleWeight);
          }

          const x1 = x * cosY + z * sinY;
          const z1 = -x * sinY + z * cosY;
          const y2 = y * cosX - z1 * sinX;
          const z2 = y * sinX + z1 * cosX;
          const x3 = x1 * cosZ - y2 * sinZ;
          const y3 = x1 * sinZ + y2 * cosZ;

          const fov = 3.6;
          const persp = fov / (fov - z2 * 0.55);

          rowVerts.push({
            x: x3, y: y3, z: z2,
            sx: centerX + x3 * radius * persp,
            sy: centerY + y3 * radius * persp,
            u, v
          });
        }
        grid.push(rowVerts);
      }

      // 8. Collect front-facing quads & sort back-to-front
      const quads = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const p00 = grid[r][c];
          const p10 = grid[r][c + 1];
          const p11 = grid[r + 1][c + 1];
          const p01 = grid[r + 1][c];

          const ux = p10.x - p00.x, uy = p10.y - p00.y, uz = p10.z - p00.z;
          const vx = p01.x - p00.x, vy = p01.y - p00.y, vz = p01.z - p00.z;
          let nx = uy * vz - uz * vy;
          let ny = uz * vx - ux * vz;
          let nz = ux * vy - uy * vx;
          const nLen = Math.hypot(nx, ny, nz) || 1;
          nx /= nLen; ny /= nLen; nz /= nLen;

          const avgZ = (p00.z + p10.z + p11.z + p01.z) * 0.25;
          if (nz < -0.15 && avgZ < 0) continue;

          quads.push({
            p00, p10, p11, p01,
            nx, ny, nz, avgZ,
            uMid: (p00.u + p10.u) * 0.5,
            vMid: (p00.v + p01.v) * 0.5
          });
        }
      }

      quads.sort((a, b) => a.avgZ - b.avgZ);

      // 9. Draw each flat-shaded yellow facet + mapped face texture
      const horrorShadowDarken = this.currentExpr.horrorLevel * 0.14;
      for (let i = 0; i < quads.length; i++) {
        const q = quads[i];
        const { p00, p10, p11, p01, nx, ny, nz } = q;

        const ndotl = Math.max(0, nx * lightDir.x + ny * lightDir.y + nz * lightDir.z);
        const steppedLight = Math.round(ndotl * 14) / 14;
        const lit = Math.min(1, Math.max(0, steppedLight * 0.88 + 0.16 - horrorShadowDarken * (1 - steppedLight)));

        // Creepy mode bloodshot crimson facet tinting
        if (this.animMode === 'creepy') {
          const bloodWarp = Math.sin(now * 0.005 + q.uMid * 10) * 0.5 + 0.5;
          const R_creep = Math.round(180 + lit * 70);
          const G_creep = Math.round(40 + lit * 40 * (1 - bloodWarp));
          const B_creep = Math.round(10 + Math.pow(lit, 2) * 20);
          bctx.fillStyle = `rgb(${R_creep},${G_creep},${B_creep})`;
          bctx.strokeStyle = `rgb(${R_creep},${G_creep},${B_creep})`;
        } else {
          const R = Math.round(172 + lit * 83);
          const G = Math.round(150 + lit * 98);
          const B = Math.round(4 + Math.pow(lit, 3) * 28);
          const facetColor = `rgb(${R},${G},${B})`;
          bctx.fillStyle = facetColor;
          bctx.strokeStyle = facetColor;
        }
        bctx.lineWidth = 0.8;

        bctx.beginPath();
        bctx.moveTo(p00.sx, p00.sy);
        bctx.lineTo(p10.sx, p10.sy);
        bctx.lineTo(p11.sx, p11.sy);
        bctx.lineTo(p01.sx, p01.sy);
        bctx.closePath();
        bctx.fill();
        bctx.stroke();

        if (q.uMid > 0.28 && q.uMid < 0.72 && q.vMid > 0.16 && q.vMid < 0.84 && nz > 0.05) {
          const u0 = (p00.u - 0.30) / 0.40 * this.texSize;
          const v0 = (p00.v - 0.18) / 0.64 * this.texSize;
          const u1 = (p10.u - 0.30) / 0.40 * this.texSize;
          const v1 = (p01.v - 0.18) / 0.64 * this.texSize;

          this._drawTexturedTriangle(
            bctx, this.texCanvas,
            p00.sx, p00.sy, p10.sx, p10.sy, p11.sx, p11.sy,
            u0, v0, u1, v0, u1, v1
          );
          this._drawTexturedTriangle(
            bctx, this.texCanvas,
            p00.sx, p00.sy, p11.sx, p11.sy, p01.sx, p01.sy,
            u0, v0, u1, v1, u0, v1
          );
        }
      }

      // Render High-Fidelity Thematic Animation Overlays (Movie Glasses, Popcorn, Matrix Rain, Coding Shell, Digging Vortex)
      this._renderAnimationOverlays(bctx, bw, bh, centerX, centerY, radius, now);

      // 10. Blit pixelated buffer to display canvas
      this.ctx.clearRect(0, 0, W, H);
      this.ctx.imageSmoothingEnabled = (pxScale === 1);
      this.ctx.drawImage(this.bufferCanvas, 0, 0, bw, bh, 0, 0, W, H);
    }

    _renderAnimationOverlays(bctx, bw, bh, cx, cy, rad, now) {
      if (this.animMode === 'none') return;

      bctx.save();

      if (this.animMode === 'movie') {
        // 1. Retro 3D Anaglyph Movie Glasses
        const glassesW = rad * 1.5;
        const glassesH = rad * 0.44;
        const gy = cy - rad * 0.18;

        bctx.save();
        bctx.translate(cx, gy);
        bctx.rotate(this.rotZ * 0.8);

        // Glasses Frame
        bctx.fillStyle = '#080808';
        bctx.strokeStyle = '#222222';
        bctx.lineWidth = 3;
        bctx.beginPath();
        bctx.roundRect(-glassesW * 0.5, -glassesH * 0.5, glassesW, glassesH, 10);
        bctx.fill();
        bctx.stroke();

        // Left Lens (Cyan / Blue 3D lens)
        const lensW = glassesW * 0.40;
        const lensH = glassesH * 0.72;
        bctx.fillStyle = 'rgba(0, 220, 255, 0.78)';
        bctx.strokeStyle = '#ffffff';
        bctx.lineWidth = 1.5;
        bctx.beginPath();
        bctx.roundRect(-glassesW * 0.46, -lensH * 0.5, lensW, lensH, 6);
        bctx.fill();
        bctx.stroke();

        // Right Lens (Red / Crimson 3D lens)
        bctx.fillStyle = 'rgba(255, 30, 60, 0.78)';
        bctx.beginPath();
        bctx.roundRect(glassesW * 0.06, -lensH * 0.5, lensW, lensH, 6);
        bctx.fill();
        bctx.stroke();

        // Lens Glare Highlights
        bctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        bctx.beginPath();
        bctx.moveTo(-glassesW * 0.42, -lensH * 0.35);
        bctx.lineTo(-glassesW * 0.30, -lensH * 0.35);
        bctx.lineTo(-glassesW * 0.36, lensH * 0.25);
        bctx.closePath();
        bctx.fill();

        bctx.beginPath();
        bctx.moveTo(glassesW * 0.10, -lensH * 0.35);
        bctx.lineTo(glassesW * 0.22, -lensH * 0.35);
        bctx.lineTo(glassesW * 0.16, lensH * 0.25);
        bctx.closePath();
        bctx.fill();

        bctx.restore();

        // 2. Striped Popcorn Bucket
        const bucketW = rad * 0.95;
        const bucketH = rad * 1.05;
        const bx = cx + rad * 0.62;
        const by = cy + rad * 0.55;

        bctx.save();
        bctx.beginPath();
        bctx.moveTo(bx - bucketW * 0.45, by - bucketH * 0.4);
        bctx.lineTo(bx + bucketW * 0.45, by - bucketH * 0.4);
        bctx.lineTo(bx + bucketW * 0.32, by + bucketH * 0.55);
        bctx.lineTo(bx - bucketW * 0.32, by + bucketH * 0.55);
        bctx.closePath();
        bctx.fillStyle = '#f8f8f8';
        bctx.fill();
        bctx.lineWidth = 3;
        bctx.strokeStyle = '#111';
        bctx.stroke();

        bctx.clip();
        bctx.fillStyle = '#dc2626';
        for (let s = -3; s <= 3; s += 2) {
          bctx.fillRect(bx + s * (bucketW * 0.12), by - bucketH * 0.5, bucketW * 0.12, bucketH * 1.2);
        }
        bctx.fillStyle = '#fbbf24';
        bctx.font = `bold ${Math.round(bucketW * 0.18)}px sans-serif`;
        bctx.textAlign = 'center';
        bctx.fillText('POPCORN', bx, by + bucketH * 0.1);
        bctx.restore();

        // Popcorn Kernels
        for (let k = 0; k < 18; k++) {
          const kx = bx - bucketW * 0.4 + (k % 6) * (bucketW * 0.16) + Math.sin(k * 4) * 5;
          const ky = by - bucketH * 0.42 - Math.floor(k / 6) * (bucketH * 0.12) + Math.cos(k * 3) * 4;
          bctx.fillStyle = (k % 2 === 0) ? '#fef08a' : '#facc15';
          bctx.strokeStyle = '#ca8a04';
          bctx.lineWidth = 1.5;
          bctx.beginPath();
          bctx.arc(kx, ky, bucketW * 0.085, 0, Math.PI * 2);
          bctx.fill();
          bctx.stroke();
        }

        // Flying Popcorn Hand Trajectory
        const eatPhase = (now * 0.003) % (Math.PI * 2);
        const handProg = Math.sin(eatPhase);
        if (handProg > 0) {
          const px = bx + (cx - bx) * handProg * 0.85 + Math.sin(now * 0.02) * 8;
          const py = (by - bucketH * 0.45) + ((cy + rad * 0.15) - (by - bucketH * 0.45)) * handProg - Math.sin(handProg * Math.PI) * 45;
          bctx.fillStyle = '#fef08a';
          bctx.strokeStyle = '#eab308';
          bctx.lineWidth = 2;
          bctx.beginPath();
          bctx.arc(px, py, 7, 0, Math.PI * 2);
          bctx.arc(px + 6, py - 3, 5, 0, Math.PI * 2);
          bctx.arc(px - 5, py - 2, 5, 0, Math.PI * 2);
          bctx.fill();
          bctx.stroke();
        }

      } else if (this.animMode === 'coding') {
        // Hacker Green Terminal Overlay & Matrix Rain
        bctx.fillStyle = 'rgba(0, 255, 65, 0.85)';
        bctx.font = 'bold 11px Consolas, monospace';

        const termW = rad * 1.8;
        const termH = rad * 0.65;
        const tx = cx - termW * 0.5;
        const ty = cy + rad * 0.45;

        bctx.fillStyle = 'rgba(10, 15, 12, 0.92)';
        bctx.strokeStyle = '#00ff41';
        bctx.lineWidth = 1.5;
        bctx.beginPath();
        bctx.roundRect(tx, ty, termW, termH, 6);
        bctx.fill();
        bctx.stroke();

        bctx.fillStyle = '#003b14';
        bctx.fillRect(tx, ty, termW, 16);
        bctx.fillStyle = '#00ff41';
        bctx.font = 'bold 9px Consolas, monospace';
        bctx.fillText('bash - verity@kernel: ~ (typing...)', tx + 8, ty + 12);

        const cmdIndex = Math.floor(now * 0.001) % 4;
        const sampleCmds = [
          '$ grep -rn "TARGET_FILE" /sys/drive',
          '$ sudo chmod +x verity_agent.sh && ./run',
          '$ python -m qwen_tts --stream --gpu=0',
          '$ git commit -m "autonomous task finished"'
        ];
        const fullCmd = sampleCmds[cmdIndex];
        const charLen = Math.floor(((now * 0.02) % (fullCmd.length + 8)));
        const visibleCmd = fullCmd.slice(0, Math.min(fullCmd.length, charLen));

        bctx.fillStyle = '#00ff41';
        bctx.font = 'bold 11px Consolas, monospace';
        bctx.fillText(visibleCmd + ((Math.floor(now * 0.005) % 2 === 0) ? '▋' : ' '), tx + 10, ty + 36);

        this.codeRainLines.forEach((col) => {
          col.y = (col.y + 120 * 0.016) % bh;
          col.chars.forEach((ch, ci) => {
            const alpha = Math.max(0.1, 1 - (ci / col.chars.length));
            bctx.fillStyle = ci === 0 ? '#ffffff' : `rgba(0, 255, 65, ${alpha * 0.75})`;
            bctx.fillText(ch, col.x, (col.y + ci * 14) % bh);
          });
        });

      } else if (this.animMode === 'digging') {
        const vortexSpin = now * 0.006;
        bctx.strokeStyle = 'rgba(255, 238, 0, 0.65)';
        bctx.lineWidth = 2;

        for (let v = 1; v <= 4; v++) {
          const vRad = rad * (0.8 + v * 0.28);
          bctx.beginPath();
          bctx.ellipse(cx, cy + rad * 0.25, vRad, vRad * 0.42, vortexSpin * (v % 2 === 0 ? 1 : -1), 0, Math.PI * 2);
          bctx.stroke();
        }

        for (let d = 0; d < 12; d++) {
          const dPhase = (now * 0.003 + d * 0.5) % 1;
          const dAng = d * (Math.PI * 2 / 12) + vortexSpin;
          const dist = rad * (0.4 + dPhase * 1.1);
          const dx = cx + Math.cos(dAng) * dist;
          const dy = (cy + rad * 0.25) + Math.sin(dAng) * dist * 0.5 - dPhase * rad * 0.5;

          bctx.fillStyle = (d % 3 === 0) ? '#38bdf8' : ((d % 3 === 1) ? '#fbbf24' : '#f87171');
          bctx.fillRect(dx - 4, dy - 4, 8, 8);
        }

        bctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        bctx.fillRect(cx - 110, cy - rad * 1.25, 220, 24);
        bctx.strokeStyle = '#eab308';
        bctx.lineWidth = 1.5;
        bctx.strokeRect(cx - 110, cy - rad * 1.25, 220, 24);
        bctx.fillStyle = '#fef08a';
        bctx.font = 'bold 10px Consolas, monospace';
        bctx.textAlign = 'center';
        bctx.fillText('DIVING INTO FILESYSTEM...', cx, cy - rad * 1.25 + 16);

      } else if (this.animMode === 'creepy') {
        const pulse = Math.sin(now * 0.012);
        bctx.strokeStyle = `rgba(220, 38, 38, ${0.4 + pulse * 0.25})`;
        bctx.lineWidth = 3;

        for (let t = 0; t < 10; t++) {
          const ang = (t / 10) * Math.PI * 2 + Math.sin(now * 0.02 + t) * 0.2;
          const len = rad * (1.15 + Math.sin(now * 0.03 + t * 2) * 0.25);
          bctx.beginPath();
          bctx.moveTo(cx + Math.cos(ang) * rad * 0.9, cy + Math.sin(ang) * rad * 0.9);
          bctx.lineTo(cx + Math.cos(ang) * len, cy + Math.sin(ang) * len);
          bctx.stroke();
        }

        if (Math.random() > 0.65) {
          bctx.fillStyle = 'rgba(255, 0, 0, 0.18)';
          const gy = Math.random() * bh;
          bctx.fillRect(0, gy, bw, 6 + Math.random() * 16);
        }
      }

      bctx.restore();
    }

    _drawTexturedTriangle(ctx, img, x0, y0, x1, y1, x2, y2, u0, v0, u1, v1, u2, v2) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.closePath();
      ctx.clip();

      const denom = (u0 * (v2 - v1) - u1 * v2 + u2 * v1 + (u1 - u2) * v0);
      if (Math.abs(denom) < 1e-5) {
        ctx.restore();
        return;
      }
      const a = -(v0 * (x2 - x1) - v1 * x2 + v2 * x1 + (v1 - v2) * x0) / denom;
      const b = (v1 * y2 + v0 * (y1 - y2) - v2 * y1 + (v2 - v1) * y0) / denom;
      const c = (u0 * (x2 - x1) - u1 * x2 + u2 * x1 + (u1 - u2) * x0) / denom;
      const d = -(u1 * y2 + u0 * (y1 - y2) - u2 * y1 + (u2 - u1) * y0) / denom;
      const e = (u0 * (v2 * x1 - v1 * x2) + v0 * (u1 * x2 - u2 * x1) + (u2 * v1 - u1 * v2) * x0) / denom;
      const f = (u0 * (v2 * y1 - v1 * y2) + v0 * (u1 * y2 - u2 * y1) + (u2 * v1 - u1 * v2) * y0) / denom;

      ctx.transform(a, b, c, d, e, f);
      ctx.drawImage(img, 0, 0);
      ctx.restore();
    }

    exportOBJ() {
      const cols = this.options.cols;
      const rows = this.options.rows;
      let obj = `# Verity 3D Faceted Sphere Mesh\no VerityHead\n`;
      for (let r = 0; r <= rows; r++) {
        const v = r / rows;
        const phi = v * Math.PI;
        for (let c = 0; c <= cols; c++) {
          const u = c / cols;
          const theta = (u - 0.5) * Math.PI * 2;
          const x = (Math.sin(phi) * Math.sin(theta)).toFixed(5);
          const y = (Math.cos(phi)).toFixed(5);
          const z = (Math.sin(phi) * Math.cos(theta)).toFixed(5);
          obj += `v ${x} ${y} ${z}\n`;
        }
      }
      for (let r = 0; r <= rows; r++) {
        const v = (1 - r / rows).toFixed(5);
        for (let c = 0; c <= cols; c++) {
          const u = (c / cols).toFixed(5);
          obj += `vt ${u} ${v}\n`;
        }
      }
      const stride = cols + 1;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const i00 = r * stride + c + 1;
          const i10 = r * stride + c + 2;
          const i11 = (r + 1) * stride + c + 2;
          const i01 = (r + 1) * stride + c + 1;
          obj += `f ${i00}/${i00} ${i01}/${i01} ${i11}/${i11} ${i10}/${i10}\n`;
        }
      }
      return obj;
    }
  }

  global.VerityAvatar = VerityAvatar;
})(typeof window !== 'undefined' ? window : globalThis);
