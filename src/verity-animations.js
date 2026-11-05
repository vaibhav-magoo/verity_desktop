/**
 * VERITY 3D // 120 Procedural Behavioral Animations Engine
 * =========================================================
 * Provides 120 discrete behavioral animations covering 12 psychological and affective domains.
 * Each animation procedurally drives:
 * - 3D Sphere Kinematics (squash & stretch, pitch/yaw/roll, spatial XYZ translations, inertia)
 * - Mandible Jaw Mechanics (spring oscillation, jaw drop, chatter, clench)
 * - Facial Micro-Gestures (blink override, pupil dilation/pinpointing, sweat, brow tension)
 * - Shader & Lighting Flares (horror light, terminal glow, ink hatching, chromatic glitch)
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.VerityAnimations = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : this), function () {
  'use strict';

  // --- Kinematic Math Helpers ---
  function dampedSin(t, freq, decay) {
    return Math.exp(-decay * t) * Math.sin(2 * Math.PI * freq * t);
  }

  function smoothStep(edge0, edge1, x) {
    const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
    return t * t * (3 - 2 * t);
  }

  function pseudoNoise(seed, t) {
    return (Math.sin(t * 19.3 + seed * 1.7) * 0.5 + Math.sin(t * 43.1 + seed * 3.1) * 0.3 + Math.sin(t * 89.7 + seed * 7.9) * 0.2);
  }

  function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  // --- Behavioral Animation Registry (120 Animations) ---
  const ANIMATIONS = {};

  // Register helper
  function reg(id, name, category, duration, loop, defExpr, updateFn) {
    ANIMATIONS[id] = {
      id: id,
      name: name,
      category: category,
      duration: duration || 2.0,
      loop: !!loop,
      defaultExpression: defExpr !== undefined ? defExpr : 0,
      update: updateFn
    };
  }

  // =========================================================================
  // CATEGORY 1: JOY, AFFECTION & HIGH-VALENCE EXCITEMENT (001 - 010)
  // =========================================================================

  reg('ANIM_001_HAPPY_BOUNCE', 'Happy Bounce', 'Joy & Excitement', 1.8, false, 6, function (av, p, el, dt, i) {
    const hop = Math.abs(Math.sin(p * Math.PI * 3)) * Math.exp(-p * 1.5);
    av.animPosY = hop * 0.38 * i;
    av.animScaleY = 1.0 + (hop > 0.05 ? hop * 0.25 : -hop * 0.2) * i;
    av.animScaleX = 1.0 - (hop * 0.12) * i;
    av.animJawMod = Math.sin(p * Math.PI * 6) * 0.35 * i;
    av.animRotZ = Math.sin(p * Math.PI * 3) * 0.08 * i;
  });

  reg('ANIM_002_PURRING_WARMTH', 'Purring Warmth', 'Joy & Excitement', 2.8, true, 5, function (av, p, el, dt, i) {
    const hum = Math.sin(el * 18.0) * 0.018 * i;
    av.animPosY = hum;
    av.animRotZ = 0.12 * i + Math.sin(el * 2.0) * 0.04 * i;
    av.animRotX = -0.08 * i;
    av.animScaleX = 1.0 + Math.sin(el * 3.0) * 0.04 * i;
    av.animScaleY = 1.0 - Math.sin(el * 3.0) * 0.03 * i;
    av.animBlinkMod = 0.95;
    av.animJawMod = -0.05;
  });

  reg('ANIM_003_PLAYFUL_WINK', 'Playful Wink', 'Joy & Excitement', 1.6, false, 0, function (av, p, el, dt, i) {
    const snap = dampedSin(p * 2, 1.5, 2.5);
    av.animRotZ = -0.22 * snap * i;
    av.animRotX = 0.06 * snap * i;
    av.animJawMod = p > 0.2 && p < 0.7 ? 0.25 * i : 0;
    av.animBlinkMod = p > 0.25 && p < 0.65 ? 0.9 : 0;
  });

  reg('ANIM_004_EUPHORIC_SPIN', 'Euphoric Spin', 'Joy & Excitement', 2.2, false, 10, function (av, p, el, dt, i) {
    const spinP = easeInOutQuad(p);
    av.animRotY = spinP * Math.PI * 2 * i;
    av.animPosY = Math.sin(p * Math.PI) * 0.42 * i;
    av.animScaleY = 1.0 + Math.sin(p * Math.PI) * 0.18 * i;
    av.animJawMod = Math.sin(p * Math.PI) * 0.55 * i;
  });

  reg('ANIM_005_PROUD_CHEST_PUFF', 'Proud Chest Puff', 'Joy & Excitement', 2.5, false, 4, function (av, p, el, dt, i) {
    const puff = Math.sin(p * Math.PI);
    av.animScaleY = 1.0 + puff * 0.28 * i;
    av.animScaleX = 1.0 - puff * 0.10 * i;
    av.animRotX = -0.25 * puff * i;
    av.animPosY = puff * 0.15 * i;
    av.animJawMod = -0.05 * puff;
  });

  reg('ANIM_006_SNICKERING_GIGGLE', 'Snickering Giggle', 'Joy & Excitement', 1.8, false, 6, function (av, p, el, dt, i) {
    const giggle = Math.sin(el * 24.0) * Math.sin(p * Math.PI) * 0.04 * i;
    av.animPosY = giggle;
    av.animRotZ = Math.sin(el * 12.0) * 0.06 * i;
    av.animJawMod = Math.max(0, Math.sin(el * 24.0)) * 0.30 * i;
  });

  reg('ANIM_007_CHEERFUL_TILT', 'Cheerful Tilt', 'Joy & Excitement', 2.4, true, 0, function (av, p, el, dt, i) {
    av.animRotZ = Math.sin(el * 2.5) * 0.22 * i;
    av.animPosY = Math.abs(Math.cos(el * 2.5)) * 0.08 * i;
    av.animJawMod = (Math.sin(el * 2.5) > 0 ? 0.15 : 0.02) * i;
  });

  reg('ANIM_008_EXCITED_VIBRATION', 'Excited Vibration', 'Joy & Excitement', 1.6, false, 3, function (av, p, el, dt, i) {
    const jitter = pseudoNoise(1, el * 2.5) * 0.035 * i;
    av.animPosX = jitter;
    av.animPosY = Math.abs(Math.sin(el * 20.0)) * 0.12 * i;
    av.animScaleY = 1.0 + Math.sin(el * 28.0) * 0.08 * i;
    av.animPupilScale = 1.35;
    av.animJawMod = 0.40 * i;
  });

  reg('ANIM_009_CLAPPING_HARMONIC', 'Clapping Harmonic', 'Joy & Excitement', 2.0, false, 6, function (av, p, el, dt, i) {
    const clap = Math.pow(Math.abs(Math.sin(p * Math.PI * 4)), 3);
    av.animPosY = clap * 0.18 * i;
    av.animScaleY = 1.0 + clap * 0.15 * i;
    av.animScaleX = 1.0 - clap * 0.08 * i;
    av.animJawMod = clap * 0.35 * i;
  });

  reg('ANIM_010_WARM_APPROACH', 'Warm Approach', 'Joy & Excitement', 2.4, false, 0, function (av, p, el, dt, i) {
    const app = Math.sin(p * Math.PI);
    av.animPosZ = app * 0.55 * i;
    av.animPosY = -app * 0.08 * i;
    av.animRotX = app * 0.08 * i;
    av.animPupilScale = 1.0 + app * 0.20 * i;
    av.animJawMod = app * 0.15 * i;
  });

  // =========================================================================
  // CATEGORY 2: UNCANNY, CREEPY & ABYSSAL ANOMALIES (011 - 022)
  // =========================================================================

  reg('ANIM_011_UNBLINKING_STARE', 'Unblinking Stare', 'Uncanny & Creepy', 3.5, false, 2, function (av, p, el, dt, i) {
    av.animBlinkMod = -1.0; // clamp blink off
    av.animPupilScale = 0.35; // pinpoint pupils
    av.animHorrorMod = 0.85 * i;
    av.animAuraMod = 0.95 * i;
    av.animRotZ = pseudoNoise(2, el * 0.2) * 0.02 * i;
  });

  reg('ANIM_012_NECK_SNAP_TWITCH', 'Neck Snap Twitch', 'Uncanny & Creepy', 1.8, false, 9, function (av, p, el, dt, i) {
    if (p < 0.25) {
      av.animRotZ = 0;
    } else if (p < 0.75) {
      const snap = dampedSin((p - 0.25) * 4, 3, 4);
      av.animRotZ = (0.65 + snap * 0.3) * i;
      av.animRotX = -0.15 * i;
      av.animHorrorMod = 1.0 * i;
    } else {
      av.animRotZ = 0.65 * (1 - (p - 0.75) * 4) * i;
    }
    av.animJawMod = 0.35 * i;
  });

  reg('ANIM_013_ABYSS_ZOOM_IN', 'Abyss Slow Zoom', 'Uncanny & Creepy', 4.5, false, 9, function (av, p, el, dt, i) {
    const creep = easeInOutQuad(p);
    av.animPosZ = creep * 1.35 * i;
    av.animRotX = creep * 0.18 * i;
    av.animHorrorMod = creep * 1.0 * i;
    av.animAuraMod = creep * 1.0 * i;
    av.animJawMod = creep * 0.65 * i;
    av.animPupilScale = 1.0 - creep * 0.65;
  });

  reg('ANIM_014_FACET_DESYNC_SHUDDER', 'Facet Desync Shudder', 'Uncanny & Creepy', 2.0, false, 9, function (av, p, el, dt, i) {
    const shud = pseudoNoise(3, el * 35.0) * 0.06 * i;
    av.animPosX = shud;
    av.animPosY = pseudoNoise(4, el * 38.0) * 0.06 * i;
    av.animRotZ = shud * 2.0;
    av.animHorrorMod = 0.95 * i;
    av.animJawMod = (0.35 + shud * 3) * i;
  });

  reg('ANIM_015_MANDIBLE_DISLOCATE', 'Mandible Dislocate', 'Uncanny & Creepy', 2.8, false, 14, function (av, p, el, dt, i) {
    const drop = Math.sin(p * Math.PI);
    av.animJawMod = drop * 1.25 * i;
    av.animPosY = -drop * 0.25 * i;
    av.animRotX = -drop * 0.30 * i;
    av.animPupilScale = 0.25;
    av.animHorrorMod = drop * 0.95 * i;
  });

  reg('ANIM_016_WHISPERING_CREEP', 'Whispering Creep', 'Uncanny & Creepy', 3.0, false, 2, function (av, p, el, dt, i) {
    av.animRotX = 0.22 * i;
    av.animRotY = -0.28 * i + Math.sin(el * 3) * 0.05 * i;
    av.animPosZ = 0.35 * i;
    av.animJawMod = Math.abs(Math.sin(el * 14.0)) * 0.12 * i;
    av.animPupilScale = 0.6;
    av.animHorrorMod = 0.70 * i;
  });

  reg('ANIM_017_HORROR_PUPIL_DILATE', 'Horror Pupil Dilate', 'Uncanny & Creepy', 2.4, false, 9, function (av, p, el, dt, i) {
    const expand = easeInOutQuad(p);
    av.animPupilScale = 0.2 + expand * 1.4;
    av.animAuraMod = expand * 1.0 * i;
    av.animHorrorMod = expand * 0.95 * i;
    av.animRotX = -expand * 0.12 * i;
  });

  reg('ANIM_018_REVERSE_HEAD_SPIN', 'Inverted Head Spin', 'Uncanny & Creepy', 2.6, false, 9, function (av, p, el, dt, i) {
    const rot = easeInOutQuad(p) * Math.PI;
    av.animRotZ = rot * i;
    av.animScaleY = Math.cos(rot);
    av.animHorrorMod = 0.85 * i;
    av.animJawMod = 0.45 * i;
  });

  reg('ANIM_019_TENDRIL_SEEPAGE', 'Tendril Seepage', 'Uncanny & Creepy', 3.4, true, 9, function (av, p, el, dt, i) {
    av.animPosY = Math.sin(el * 1.8) * 0.12 * i;
    av.animRotZ = Math.sin(el * 2.2) * 0.10 * i;
    av.animHorrorMod = 1.0 * i;
    av.animAuraMod = 1.0 * i;
    av.animJawMod = 0.45 + Math.sin(el * 3) * 0.15;
  });

  reg('ANIM_020_PARANOID_LOOKAROUND', 'Paranoid Lookaround', 'Uncanny & Creepy', 2.6, false, 11, function (av, p, el, dt, i) {
    let targetYaw = 0;
    if (p < 0.28) targetYaw = -0.55;
    else if (p < 0.62) targetYaw = 0.60;
    else if (p < 0.85) targetYaw = -0.30;
    av.animRotY = targetYaw * i;
    av.animRotX = 0.14 * i;
    av.animSweatDrops = true;
    av.animPupilScale = 0.45;
  });

  reg('ANIM_021_SMILE_OVERSTRETCH', 'Smile Overstretch', 'Uncanny & Creepy', 2.5, false, 3, function (av, p, el, dt, i) {
    const str = Math.sin(p * Math.PI);
    av.animScaleX = 1.0 + str * 0.38 * i;
    av.animScaleY = 1.0 - str * 0.18 * i;
    av.animJawMod = str * 0.45 * i;
    av.animHorrorMod = str * 0.85 * i;
  });

  reg('ANIM_022_VOID_PULSE', 'Void Heartbeat', 'Uncanny & Creepy', 3.2, true, 14, function (av, p, el, dt, i) {
    const pulse = Math.pow(Math.abs(Math.sin(el * 2.2)), 8);
    av.animScaleX = 1.0 + pulse * 0.18 * i;
    av.animScaleY = 1.0 + pulse * 0.18 * i;
    av.animScaleZ = 1.0 + pulse * 0.18 * i;
    av.animHorrorMod = 0.85 + pulse * 0.15;
    av.animPupilScale = 0.25;
  });

  // =========================================================================
  // CATEGORY 3: ANALYTICAL, TECHNICAL & DEBUGGING STATES (023 - 032)
  // =========================================================================

  reg('ANIM_023_DEEP_DEBUG_SQUINT', 'Deep Debug Squint', 'Technical & Analytical', 2.8, false, 4, function (av, p, el, dt, i) {
    const sq = Math.sin(p * Math.PI);
    av.animRotX = 0.22 * sq * i;
    av.animPosZ = 0.35 * sq * i;
    av.animBlinkMod = 0.65 * sq;
    av.animPupilScale = 1.0 - sq * 0.35;
    av.animJawMod = -0.05 * sq;
  });

  reg('ANIM_024_DATA_SCAN_SWEEP', 'Data Scan Sweep', 'Technical & Analytical', 2.5, false, 0, function (av, p, el, dt, i) {
    av.animRotY = Math.sin(p * Math.PI * 2) * 0.45 * i;
    av.animRotX = 0.10 * i;
    av.animBlinkMod = 0.35;
    av.animJawMod = 0.05;
  });

  reg('ANIM_025_EUREKA_EPIPHANY', 'Eureka Epiphany', 'Technical & Analytical', 1.8, false, 6, function (av, p, el, dt, i) {
    const pop = dampedSin(p * 2, 1.8, 3.0);
    av.animPosY = Math.max(0, pop * 0.35) * i;
    av.animRotX = -0.22 * pop * i;
    av.animPupilScale = 1.45;
    av.animJawMod = 0.55 * Math.sin(p * Math.PI) * i;
  });

  reg('ANIM_026_MEMORY_DEFRAG_TICK', 'Memory Defrag Tick', 'Technical & Analytical', 2.4, true, 1, function (av, p, el, dt, i) {
    const quantStep = Math.floor(el * 4.0) * (Math.PI / 8);
    av.animRotY = (quantStep % (Math.PI * 2)) * 0.25 * i;
    av.animJawMod = (Math.floor(el * 8.0) % 2 === 0 ? 0.15 : 0.02) * i;
  });

  reg('ANIM_027_CALCULATING_ORBIT', 'Calculating Orbit', 'Technical & Analytical', 3.2, true, 4, function (av, p, el, dt, i) {
    av.animPosX = Math.sin(el * 2.0) * 0.15 * i;
    av.animPosY = Math.cos(el * 4.0) * 0.08 * i;
    av.animRotZ = Math.sin(el * 2.0) * 0.10 * i;
    av.animRotX = -0.15 * i;
  });

  reg('ANIM_028_REFRACTOR_CONTEMPLATE', 'Refactor Contemplate', 'Technical & Analytical', 3.0, false, 1, function (av, p, el, dt, i) {
    av.animRotZ = 0.28 * Math.sin(p * Math.PI) * i;
    av.animRotX = 0.15 * Math.sin(p * Math.PI) * i;
    av.animJawMod = Math.sin(el * 3) * 0.08 * i;
  });

  reg('ANIM_029_EXCEPTION_CAUGHT', 'Exception Caught', 'Technical & Analytical', 1.6, false, 7, function (av, p, el, dt, i) {
    const shock = dampedSin(p * 2.5, 3.5, 4.0);
    av.animPosZ = -shock * 0.35 * i;
    av.animRotX = shock * 0.20 * i;
    av.animJawMod = 0.45 * Math.sin(p * Math.PI) * i;
  });

  reg('ANIM_030_CPU_OVERHEAT_PANT', 'CPU Overheat Pant', 'Technical & Analytical', 2.2, true, 11, function (av, p, el, dt, i) {
    const pant = Math.abs(Math.sin(el * 12.0));
    av.animScaleY = 1.0 + pant * 0.14 * i;
    av.animScaleX = 1.0 - pant * 0.08 * i;
    av.animJawMod = (0.2 + pant * 0.45) * i;
    av.animSweatDrops = true;
  });

  reg('ANIM_031_PACKET_STREAM_CHOMP', 'Packet Stream Chomp', 'Technical & Analytical', 2.0, true, 6, function (av, p, el, dt, i) {
    const chomp = Math.abs(Math.sin(el * 10.0));
    av.animJawMod = chomp * 0.65 * i;
    av.animPosX = Math.sin(el * 10.0) * 0.02 * i;
  });

  reg('ANIM_032_TERMINAL_HACK_MODE', 'Terminal Hack Speed', 'Technical & Analytical', 2.6, true, 3, function (av, p, el, dt, i) {
    av.animRotX = 0.20 + pseudoNoise(5, el * 8.0) * 0.05 * i;
    av.animPosY = -0.10 + pseudoNoise(6, el * 12.0) * 0.04 * i;
    av.animJawMod = 0.25 * i;
    av.animPupilScale = 0.7;
  });

  // =========================================================================
  // CATEGORY 4: SKEPTICAL, SARCASTIC & DISAPPROVING (033 - 042)
  // =========================================================================

  reg('ANIM_033_DRY_SIDE_EYE', 'Dry Side Eye', 'Skeptical & Sarcastic', 2.6, false, 1, function (av, p, el, dt, i) {
    const glance = Math.sin(p * Math.PI);
    av.animRotY = 0.38 * glance * i;
    av.animRotZ = -0.08 * glance * i;
    av.animBlinkMod = 0.65 * glance;
    av.animJawMod = -0.05;
  });

  reg('ANIM_034_SLOW_DISBELIEF_BLINK', 'Slow Disbelief Blink', 'Skeptical & Sarcastic', 2.4, false, 1, function (av, p, el, dt, i) {
    if (p > 0.2 && p < 0.75) {
      av.animBlinkMod = 1.0;
    } else {
      av.animBlinkMod = 0.0;
    }
    av.animRotX = 0.06 * Math.sin(p * Math.PI) * i;
    av.animJawMod = -0.05;
  });

  reg('ANIM_035_SINGLE_BROW_RAISE', 'Single Brow Raise', 'Skeptical & Sarcastic', 2.2, false, 1, function (av, p, el, dt, i) {
    const tilt = Math.sin(p * Math.PI);
    av.animRotZ = 0.22 * tilt * i;
    av.animRotX = -0.15 * tilt * i;
    av.animPupilScale = 1.15;
  });

  reg('ANIM_036_EXASPERATED_EYE_ROLL', 'Exasperated Eye Roll', 'Skeptical & Sarcastic', 2.5, false, 1, function (av, p, el, dt, i) {
    const rollP = easeInOutQuad(p);
    av.animRotX = -Math.sin(rollP * Math.PI) * 0.35 * i;
    av.animRotZ = Math.sin(rollP * Math.PI * 2) * 0.15 * i;
    av.animPosZ = -Math.sin(p * Math.PI) * 0.25 * i;
  });

  reg('ANIM_037_SMUG_LIP_PURSE', 'Smug Lip Purse', 'Skeptical & Sarcastic', 2.4, false, 4, function (av, p, el, dt, i) {
    const pucker = Math.sin(p * Math.PI);
    av.animRotX = -0.18 * pucker * i;
    av.animRotY = 0.14 * pucker * i;
    av.animJawMod = -0.08 * pucker;
    av.animBlinkMod = 0.45 * pucker;
  });

  reg('ANIM_038_SLOW_HEAD_SHAKE', 'Slow Head Shake', 'Skeptical & Sarcastic', 2.6, false, 1, function (av, p, el, dt, i) {
    av.animRotY = Math.sin(p * Math.PI * 4) * 0.32 * Math.sin(p * Math.PI) * i;
    av.animRotX = 0.08 * Math.sin(p * Math.PI) * i;
    av.animJawMod = -0.02;
  });

  reg('ANIM_039_SARCASTIC_SLOW_CLAP', 'Sarcastic Slow Nod', 'Skeptical & Sarcastic', 2.8, false, 1, function (av, p, el, dt, i) {
    const nod = Math.pow(Math.abs(Math.sin(p * Math.PI * 3)), 4);
    av.animRotX = nod * 0.28 * i;
    av.animJawMod = nod * 0.12 * i;
  });

  reg('ANIM_040_CONDESCENDING_NOD', 'Condescending Nod', 'Skeptical & Sarcastic', 2.5, false, 4, function (av, p, el, dt, i) {
    const cNod = Math.sin(p * Math.PI * 2) * 0.20 * i;
    av.animRotX = cNod;
    av.animRotY = 0.12 * i;
    av.animBlinkMod = 0.5;
  });

  reg('ANIM_041_SNOOTY_TURN_AWAY', 'Snooty Turn Away', 'Skeptical & Sarcastic', 2.2, false, 1, function (av, p, el, dt, i) {
    const turn = Math.sin(p * Math.PI);
    av.animRotY = -0.75 * turn * i;
    av.animRotX = -0.25 * turn * i;
    av.animBlinkMod = 0.85 * turn;
  });

  reg('ANIM_042_DOUBTFUL_HEAD_TILT', 'Doubtful Head Tilt', 'Skeptical & Sarcastic', 2.4, false, 1, function (av, p, el, dt, i) {
    const dTilt = Math.sin(p * Math.PI);
    av.animRotZ = -0.32 * dTilt * i;
    av.animPosY = -0.12 * dTilt * i;
    av.animJawMod = 0.04 * dTilt;
  });

  // =========================================================================
  // CATEGORY 5: SHOCK, CATASTROPHIC PANIC & ALARM (043 - 052)
  // =========================================================================

  reg('ANIM_043_JAW_DROP_RECOIL', 'Jaw Drop Recoil', 'Shock & Panic', 2.0, false, 7, function (av, p, el, dt, i) {
    const rec = dampedSin(p * 2, 2.5, 3.0);
    av.animPosZ = -Math.max(0, rec * 0.65) * i;
    av.animPosY = rec * 0.18 * i;
    av.animJawMod = Math.min(1.0, (1 - p) * 1.1) * i;
    av.animPupilScale = 1.35;
  });

  reg('ANIM_044_KERNEL_PANIC_SHAKE', 'Kernel Panic Shake', 'Shock & Panic', 1.8, false, 7, function (av, p, el, dt, i) {
    const tremor = pseudoNoise(7, el * 45.0) * 0.08 * i;
    av.animPosX = tremor;
    av.animPosY = pseudoNoise(8, el * 50.0) * 0.08 * i;
    av.animRotZ = tremor * 3;
    av.animJawMod = 0.65 * i;
    av.animHorrorMod = 0.85 * i;
  });

  reg('ANIM_045_SWEAT_GUSH_PANIC', 'Sweat Gush Panic', 'Shock & Panic', 2.2, true, 11, function (av, p, el, dt, i) {
    av.animRotZ = Math.sin(el * 14.0) * 0.15 * i;
    av.animScaleY = 1.0 + Math.sin(el * 18.0) * 0.08 * i;
    av.animJawMod = 0.40 * i;
    av.animSweatDrops = true;
    av.animHorrorMod = 0.80 * i;
  });

  reg('ANIM_046_HYPERVENTILATE_GASP', 'Hyperventilate Gasp', 'Shock & Panic', 2.0, true, 7, function (av, p, el, dt, i) {
    const gasp = Math.abs(Math.sin(el * 14.0));
    av.animScaleY = 1.0 + gasp * 0.22 * i;
    av.animScaleX = 1.0 - gasp * 0.12 * i;
    av.animJawMod = gasp * 0.85 * i;
    av.animPupilScale = 0.45;
  });

  reg('ANIM_047_STONE_FROZEN_SHOCK', 'Stone Frozen Shock', 'Shock & Panic', 2.8, false, 7, function (av, p, el, dt, i) {
    av.animBlinkMod = -1.0;
    av.animJawMod = 0.55 * i;
    av.animPupilScale = 1.4;
    av.animHorrorMod = 0.5 * i;
  });

  reg('ANIM_048_HOLLOW_SCREAM_VOID', 'Hollow Scream Void', 'Shock & Panic', 3.0, false, 14, function (av, p, el, dt, i) {
    const scream = Math.sin(p * Math.PI);
    av.animJawMod = scream * 1.15 * i;
    av.animRotX = -scream * 0.45 * i;
    av.animScaleY = 1.0 + scream * 0.30 * i;
    av.animHorrorMod = scream * 1.0 * i;
    av.animAuraMod = scream * 1.0 * i;
  });

  reg('ANIM_049_DIZZY_CONFUSION_SPIN', 'Dizzy Confusion Spin', 'Shock & Panic', 2.6, true, 7, function (av, p, el, dt, i) {
    av.animRotZ = Math.sin(el * 5.0) * 0.35 * i;
    av.animRotY = Math.cos(el * 3.5) * 0.30 * i;
    av.animJawMod = 0.25 * i;
  });

  reg('ANIM_050_ELECTRIC_JOLT_SHOCK', 'Electric Jolt Shock', 'Shock & Panic', 1.5, false, 7, function (av, p, el, dt, i) {
    const jolt = pseudoNoise(9, el * 60.0) * 0.09 * i;
    av.animPosY = Math.abs(jolt) * 2;
    av.animRotZ = jolt * 4;
    av.animJawMod = Math.abs(Math.sin(el * 30)) * 0.5 * i;
  });

  reg('ANIM_051_DEFENSIVE_TURTLE_SHRINK', 'Defensive Turtle Shrink', 'Shock & Panic', 2.4, false, 1, function (av, p, el, dt, i) {
    const shrink = Math.sin(p * Math.PI);
    av.animPosY = -shrink * 0.45 * i;
    av.animScaleY = 1.0 - shrink * 0.35 * i;
    av.animScaleX = 1.0 + shrink * 0.25 * i;
    av.animBlinkMod = shrink * 0.95;
  });

  reg('ANIM_052_PARANOID_SCREEN_CHECK', 'Paranoid Screen Check', 'Shock & Panic', 2.8, false, 12, function (av, p, el, dt, i) {
    const peek = Math.sin(p * Math.PI * 2);
    av.animRotY = peek * 0.65 * i;
    av.animRotX = 0.12 * i;
    av.animPupilScale = 0.4;
  });

  // =========================================================================
  // CATEGORY 6: MELANCHOLY & VULNERABLE STATES (053 - 062)
  // =========================================================================

  reg('ANIM_053_MELANCHOLY_SINK', 'Melancholy Sink', 'Melancholy & Vulnerable', 3.0, false, 13, function (av, p, el, dt, i) {
    const sink = Math.sin(p * Math.PI);
    av.animPosY = -sink * 0.48 * i;
    av.animRotX = sink * 0.28 * i;
    av.animBlinkMod = sink * 0.55;
    av.animJawMod = 0.05 * sink;
  });

  reg('ANIM_054_HEAVY_SIGH_DEFLATE', 'Heavy Sigh Deflate', 'Melancholy & Vulnerable', 2.8, false, 13, function (av, p, el, dt, i) {
    let def = 0;
    if (p < 0.35) {
      def = (p / 0.35) * 0.18; // Inhale
    } else {
      def = 0.18 - ((p - 0.35) / 0.65) * 0.45; // Deflate
    }
    av.animScaleY = 1.0 + def * i;
    av.animScaleX = 1.0 - def * 0.5 * i;
    av.animRotX = Math.max(0, -def) * 0.4 * i;
    av.animJawMod = p > 0.35 ? 0.25 * (1 - p) * i : 0;
  });

  reg('ANIM_055_TEAR_BRIM_SHIMMER', 'Tear Brim Shimmer', 'Melancholy & Vulnerable', 3.0, true, 13, function (av, p, el, dt, i) {
    av.animPosY = Math.sin(el * 1.5) * 0.04 * i;
    av.animRotZ = Math.sin(el * 1.2) * 0.06 * i;
    av.animBlinkMod = 0.45 + Math.sin(el * 3) * 0.2;
    av.animPupilScale = 1.15;
  });

  reg('ANIM_056_BASHFUL_SHRINK', 'Bashful Shrink', 'Melancholy & Vulnerable', 2.6, false, 4, function (av, p, el, dt, i) {
    const bash = Math.sin(p * Math.PI);
    av.animScaleX = 1.0 - bash * 0.18 * i;
    av.animScaleY = 1.0 - bash * 0.18 * i;
    av.animRotZ = -bash * 0.25 * i;
    av.animRotX = bash * 0.15 * i;
    av.animBlinkMod = bash * 0.6;
  });

  reg('ANIM_057_LOW_BATTERY_DROOP', 'Low Battery Droop', 'Melancholy & Vulnerable', 3.2, true, 13, function (av, p, el, dt, i) {
    av.animRotX = 0.38 * i + Math.sin(el * 1.0) * 0.05 * i;
    av.animPosY = -0.25 * i;
    av.animBlinkMod = 0.85;
    av.animJawMod = 0.12 * i;
  });

  reg('ANIM_058_LONELY_HOVER', 'Lonely Hover', 'Melancholy & Vulnerable', 3.5, true, 1, function (av, p, el, dt, i) {
    av.animPosY = Math.sin(el * 0.8) * 0.15 * i;
    av.animRotZ = Math.sin(el * 0.5) * 0.08 * i;
    av.animRotX = 0.10 * i;
    av.animBlinkMod = 0.35;
  });

  reg('ANIM_059_GUILTY_RECOIL', 'Guilty Recoil', 'Melancholy & Vulnerable', 2.4, false, 4, function (av, p, el, dt, i) {
    const guilt = Math.sin(p * Math.PI);
    av.animRotY = 0.35 * guilt * i;
    av.animRotX = 0.22 * guilt * i;
    av.animPosY = -0.15 * guilt * i;
    av.animSweatDrops = true;
  });

  reg('ANIM_060_EXISTENTIAL_DREAD', 'Existential Dread', 'Melancholy & Vulnerable', 4.0, true, 13, function (av, p, el, dt, i) {
    av.animHorrorMod = 0.65 * i;
    av.animBlinkMod = -0.5;
    av.animPupilScale = 0.4;
    av.animPosY = Math.sin(el * 0.4) * 0.02 * i;
  });

  reg('ANIM_061_POUTY_HUFF', 'Pouty Huff', 'Melancholy & Vulnerable', 2.0, false, 1, function (av, p, el, dt, i) {
    const huff = Math.sin(p * Math.PI);
    av.animRotY = -0.65 * huff * i;
    av.animScaleX = 1.0 + huff * 0.18 * i;
    av.animScaleY = 1.0 - huff * 0.10 * i;
  });

  reg('ANIM_062_COMFORTING_NUDGE', 'Comforting Nudge', 'Melancholy & Vulnerable', 2.5, false, 0, function (av, p, el, dt, i) {
    const nudge = Math.sin(p * Math.PI);
    av.animPosX = nudge * 0.35 * i;
    av.animRotZ = -nudge * 0.18 * i;
    av.animJawMod = nudge * 0.15 * i;
  });

  // =========================================================================
  // CATEGORY 7: MISCHIEVOUS, SCHEMING & SMUG GESTURES (063 - 072)
  // =========================================================================

  reg('ANIM_063_SCHEMING_SIDE_GLANCE', 'Scheming Side Glance', 'Mischievous & Smug', 2.8, false, 2, function (av, p, el, dt, i) {
    const glance = Math.sin(p * Math.PI);
    av.animRotY = -0.35 * glance * i;
    av.animRotX = 0.18 * glance * i;
    av.animBlinkMod = 0.55 * glance;
    av.animJawMod = 0.15 * glance;
  });

  reg('ANIM_064_SUPPRESSED_SNICKER', 'Suppressed Snicker', 'Mischievous & Smug', 2.0, false, 0, function (av, p, el, dt, i) {
    const snick = pseudoNoise(10, el * 25.0) * 0.04 * i;
    av.animPosY = Math.abs(snick);
    av.animScaleX = 1.0 + Math.sin(p * Math.PI) * 0.15 * i;
    av.animJawMod = -0.05;
    av.animBlinkMod = 0.7;
  });

  reg('ANIM_065_VILLAINOUS_CHIN_TUCK', 'Villainous Chin Tuck', 'Mischievous & Smug', 2.8, false, 3, function (av, p, el, dt, i) {
    const tuck = Math.sin(p * Math.PI);
    av.animRotX = 0.38 * tuck * i;
    av.animHorrorMod = 0.75 * tuck * i;
    av.animJawMod = 0.40 * tuck * i;
    av.animPupilScale = 0.5;
  });

  reg('ANIM_066_TONGUE_IN_CHEEK', 'Tongue In Cheek', 'Mischievous & Smug', 2.2, false, 0, function (av, p, el, dt, i) {
    const tc = Math.sin(p * Math.PI);
    av.animRotZ = 0.22 * tc * i;
    av.animPosX = 0.08 * tc * i;
    av.animJawMod = 0.18 * tc * i;
  });

  reg('ANIM_067_SMUG_SWIVEL_360', 'Smug Swivel 360', 'Mischievous & Smug', 2.4, false, 4, function (av, p, el, dt, i) {
    av.animRotY = easeInOutQuad(p) * Math.PI * 2 * i;
    av.animPosY = Math.sin(p * Math.PI) * 0.15 * i;
    av.animBlinkMod = 0.5;
  });

  reg('ANIM_068_FINGER_STEEPLE_IDLE', 'Finger Steeple Calc', 'Mischievous & Smug', 3.0, true, 2, function (av, p, el, dt, i) {
    av.animRotX = 0.15 * i;
    av.animPosY = Math.sin(el * 1.5) * 0.04 * i;
    av.animBlinkMod = 0.45;
    av.animJawMod = 0.10 * i;
  });

  reg('ANIM_069_CHAOTIC_EVIL_CHUCKLE', 'Chaotic Evil Chuckle', 'Mischievous & Smug', 2.2, false, 9, function (av, p, el, dt, i) {
    const chuk = Math.sin(el * 18.0) * Math.sin(p * Math.PI) * 0.06 * i;
    av.animPosY = chuk;
    av.animJawMod = (0.35 + Math.sin(el * 18.0) * 0.3) * i;
    av.animHorrorMod = 0.85 * i;
  });

  reg('ANIM_070_BROW_WIGGLE_TEASE', 'Brow Wiggle Tease', 'Mischievous & Smug', 1.8, false, 0, function (av, p, el, dt, i) {
    av.animRotZ = Math.sin(p * Math.PI * 6) * 0.08 * i;
    av.animPupilScale = 1.25;
    av.animJawMod = 0.20 * i;
  });

  reg('ANIM_071_CAT_LIKE_SMUG', 'Cat-Like Smug', 'Mischievous & Smug', 2.6, false, 4, function (av, p, el, dt, i) {
    const stretch = Math.sin(p * Math.PI);
    av.animRotX = -0.22 * stretch * i;
    av.animScaleY = 1.0 + stretch * 0.18 * i;
    av.animBlinkMod = 0.85 * stretch;
  });

  reg('ANIM_072_SHADY_WHISPER', 'Shady Whisper', 'Mischievous & Smug', 2.8, false, 2, function (av, p, el, dt, i) {
    const sw = Math.sin(p * Math.PI);
    av.animPosX = -0.45 * sw * i;
    av.animRotY = 0.35 * sw * i;
    av.animJawMod = Math.abs(Math.sin(el * 16)) * 0.12 * i;
  });

  // =========================================================================
  // CATEGORY 8: ATTENTIVE LISTENING & CONVERSATIONAL IDLES (073 - 082)
  // =========================================================================

  reg('ANIM_073_CURIOUS_COCKED_HEAD', 'Curious Cocked Head', 'Attentive & Curiosity', 2.5, false, 0, function (av, p, el, dt, i) {
    const cock = Math.sin(p * Math.PI);
    av.animRotZ = 0.38 * cock * i;
    av.animPosY = 0.08 * cock * i;
    av.animPupilScale = 1.20;
    av.animJawMod = 0.08 * cock * i;
  });

  reg('ANIM_074_EAGER_LEAN_IN', 'Eager Lean In', 'Attentive & Curiosity', 2.6, false, 6, function (av, p, el, dt, i) {
    const lean = Math.sin(p * Math.PI);
    av.animPosZ = 0.45 * lean * i;
    av.animPosY = -0.12 * lean * i;
    av.animJawMod = 0.22 * lean * i;
    av.animPupilScale = 1.3;
  });

  reg('ANIM_075_EMPATHIC_SLOW_NOD', 'Empathic Slow Nod', 'Attentive & Curiosity', 2.4, false, 0, function (av, p, el, dt, i) {
    av.animRotX = Math.sin(p * Math.PI * 2) * 0.18 * i;
    av.animJawMod = 0.06 * i;
    av.animBlinkMod = 0.25;
  });

  reg('ANIM_076_CURSOR_TRACK_STALKER', 'Cursor Track Stalker', 'Attentive & Curiosity', 3.0, true, 2, function (av, p, el, dt, i) {
    av.animPupilScale = 0.85;
    av.animBlinkMod = 0.1;
  });

  reg('ANIM_077_RHYTHMIC_SPEECH_BOB', 'Rhythmic Speech Bob', 'Attentive & Curiosity', 2.0, true, 0, function (av, p, el, dt, i) {
    av.animPosY = Math.sin(el * 6.0) * 0.04 * i;
    av.animRotX = Math.sin(el * 6.0) * 0.05 * i;
  });

  reg('ANIM_078_PUPIL_DILATE_SURPRISE', 'Pupil Dilate Surprise', 'Attentive & Curiosity', 2.0, false, 7, function (av, p, el, dt, i) {
    const sur = Math.sin(p * Math.PI);
    av.animPupilScale = 1.0 + sur * 0.55;
    av.animPosZ = -sur * 0.15 * i;
    av.animJawMod = sur * 0.35 * i;
  });

  reg('ANIM_079_ATTENTIVE_MICRO_BLINK', 'Attentive Micro Blink', 'Attentive & Curiosity', 3.0, true, 0, function (av, p, el, dt, i) {
    av.animPosY = Math.sin(el * 1.5) * 0.02 * i;
  });

  reg('ANIM_080_LOOK_UP_THINKING', 'Look Up Thinking', 'Attentive & Curiosity', 2.8, false, 4, function (av, p, el, dt, i) {
    const think = Math.sin(p * Math.PI);
    av.animRotX = -0.35 * think * i;
    av.animRotY = -0.25 * think * i;
    av.animJawMod = 0.08 * think * i;
  });

  reg('ANIM_081_AGREEABLE_TRIPLE_NOD', 'Agreeable Triple Nod', 'Attentive & Curiosity', 1.8, false, 0, function (av, p, el, dt, i) {
    const tNod = Math.sin(p * Math.PI * 6) * Math.sin(p * Math.PI) * 0.22 * i;
    av.animRotX = Math.max(0, tNod);
    av.animJawMod = 0.12 * i;
  });

  reg('ANIM_082_INTRIGUED_SQUINT', 'Intrigued Squint', 'Attentive & Curiosity', 2.2, false, 1, function (av, p, el, dt, i) {
    const int = Math.sin(p * Math.PI);
    av.animPosZ = 0.25 * int * i;
    av.animBlinkMod = 0.65 * int;
    av.animRotZ = 0.15 * int * i;
  });

  // =========================================================================
  // CATEGORY 9: FRUSTRATION, ANGER & HOSTILE DEFENSIVE (083 - 092)
  // =========================================================================

  reg('ANIM_083_GRITTED_TEETH_TREMOR', 'Gritted Teeth Tremor', 'Frustration & Anger', 2.0, false, 11, function (av, p, el, dt, i) {
    const shake = pseudoNoise(11, el * 38.0) * 0.04 * i;
    av.animPosX = shake;
    av.animPosY = shake;
    av.animJawMod = 0.02; // clench
    av.animHorrorMod = 0.65 * i;
  });

  reg('ANIM_084_RED_FLARE_LUNGE', 'Red Flare Lunge', 'Frustration & Anger', 1.6, false, 9, function (av, p, el, dt, i) {
    const lunge = dampedSin(p * 2, 2.0, 3.5);
    av.animPosZ = Math.max(0, lunge * 0.75) * i;
    av.animJawMod = 0.75 * Math.sin(p * Math.PI) * i;
    av.animHorrorMod = 1.0 * i;
  });

  reg('ANIM_085_DEFIANT_HEAD_SNAP', 'Defiant Head Snap', 'Frustration & Anger', 1.8, false, 1, function (av, p, el, dt, i) {
    const snap = dampedSin(p * 2, 2.2, 4.0);
    av.animRotY = -0.55 * snap * i;
    av.animRotX = -0.22 * snap * i;
  });

  reg('ANIM_086_INDIGNANT_PUFF', 'Indignant Puff', 'Frustration & Anger', 2.2, false, 1, function (av, p, el, dt, i) {
    const puff = Math.sin(p * Math.PI);
    av.animScaleX = 1.0 + puff * 0.28 * i;
    av.animScaleY = 1.0 + puff * 0.28 * i;
    av.animRotX = -0.15 * puff * i;
  });

  reg('ANIM_087_STEAM_WHISTLE_BOIL', 'Steam Whistle Boil', 'Frustration & Anger', 2.4, false, 11, function (av, p, el, dt, i) {
    const boil = pseudoNoise(12, el * 45.0) * 0.06 * i;
    av.animPosY = boil;
    av.animRotZ = boil * 2;
    av.animSweatDrops = true;
  });

  reg('ANIM_088_CHOMPING_JAW_SNAP', 'Chomping Jaw Snap', 'Frustration & Anger', 1.8, false, 3, function (av, p, el, dt, i) {
    const chomp = Math.pow(Math.abs(Math.sin(p * Math.PI * 4)), 6);
    av.animJawMod = chomp * 0.85 * i;
    av.animPosZ = chomp * 0.25 * i;
  });

  reg('ANIM_089_COLD_GLARE_DISDAIN', 'Cold Glare Disdain', 'Frustration & Anger', 2.8, false, 12, function (av, p, el, dt, i) {
    av.animRotX = 0.20 * i;
    av.animBlinkMod = 0.7;
    av.animPupilScale = 0.35;
    av.animHorrorMod = 0.55 * i;
  });

  reg('ANIM_090_HEAD_WALL_BANG', 'Head Wall Bang', 'Frustration & Anger', 2.2, false, 13, function (av, p, el, dt, i) {
    const bang = Math.pow(Math.abs(Math.sin(p * Math.PI * 3)), 8);
    av.animRotX = bang * 0.55 * i;
    av.animPosY = -bang * 0.35 * i;
    av.animScaleY = 1.0 - bang * 0.25 * i;
  });

  reg('ANIM_091_THREATENING_LEAN', 'Threatening Lean', 'Frustration & Anger', 3.0, false, 9, function (av, p, el, dt, i) {
    const lean = Math.sin(p * Math.PI);
    av.animPosZ = 0.55 * lean * i;
    av.animRotX = 0.25 * lean * i;
    av.animHorrorMod = 0.90 * lean * i;
    av.animJawMod = 0.35 * lean * i;
  });

  reg('ANIM_092_FUMING_SULK', 'Fuming Sulk', 'Frustration & Anger', 3.2, true, 12, function (av, p, el, dt, i) {
    av.animPosY = -0.35 * i;
    av.animRotY = -0.55 * i;
    av.animRotX = 0.15 * i;
    av.animHorrorMod = 0.65 * i;
  });

  // =========================================================================
  // CATEGORY 10: DROWSY, HYPNOTIC & LOW-COGNITION (093 - 100)
  // =========================================================================

  reg('ANIM_093_DOZING_MICRO_NOD', 'Dozing Micro Nod', 'Drowsy & Low-Cognition', 3.0, true, 5, function (av, p, el, dt, i) {
    const nodCycle = (el % 3.0) / 3.0;
    if (nodCycle < 0.8) {
      av.animRotX = (nodCycle / 0.8) * 0.38 * i;
      av.animBlinkMod = 0.95;
    } else {
      av.animRotX = (1 - (nodCycle - 0.8) / 0.2) * 0.38 * i;
      av.animBlinkMod = 0.1;
    }
  });

  reg('ANIM_094_DAYDREAM_DRIFT', 'Daydream Drift', 'Drowsy & Low-Cognition', 3.5, true, 5, function (av, p, el, dt, i) {
    av.animPosY = Math.sin(el * 1.2) * 0.18 * i;
    av.animPosX = Math.cos(el * 0.8) * 0.14 * i;
    av.animRotZ = Math.sin(el * 1.0) * 0.12 * i;
    av.animBlinkMod = 0.5;
  });

  reg('ANIM_095_BIG_YAWN_STRETCH', 'Big Yawn Stretch', 'Drowsy & Low-Cognition', 3.2, false, 5, function (av, p, el, dt, i) {
    const yawn = Math.sin(p * Math.PI);
    av.animJawMod = yawn * 0.95 * i;
    av.animScaleY = 1.0 + yawn * 0.30 * i;
    av.animScaleX = 1.0 - yawn * 0.15 * i;
    av.animRotX = -yawn * 0.25 * i;
    av.animBlinkMod = yawn * 0.95;
  });

  reg('ANIM_096_HYPNOTIC_SPIRAL_TRANCE', 'Hypnotic Spiral Trance', 'Drowsy & Low-Cognition', 3.5, true, 5, function (av, p, el, dt, i) {
    av.animRotZ = Math.sin(el * 2.5) * 0.25 * i;
    av.animRotY = Math.cos(el * 2.5) * 0.20 * i;
    av.animPupilScale = 0.35 + Math.sin(el * 4.0) * 0.2;
    av.animJawMod = 0.15 * i;
  });

  reg('ANIM_097_SLEEP_SNORING_BUBBLE', 'Sleep Snoring Breath', 'Drowsy & Low-Cognition', 3.5, true, 5, function (av, p, el, dt, i) {
    const breath = Math.sin(el * 2.0);
    av.animScaleY = 1.0 + breath * 0.15 * i;
    av.animScaleX = 1.0 - breath * 0.08 * i;
    av.animPosY = -0.20 + breath * 0.04 * i;
    av.animBlinkMod = 1.0;
    av.animJawMod = 0.08 * i;
  });

  reg('ANIM_098_MEDITATIVE_ZEN_FLOAT', 'Meditative Zen Float', 'Drowsy & Low-Cognition', 4.0, true, 5, function (av, p, el, dt, i) {
    av.animPosY = 0.20 + Math.sin(el * 1.5) * 0.08 * i;
    av.animRotX = -0.05 * i;
    av.animBlinkMod = 1.0;
  });

  reg('ANIM_099_GROGGY_WAKEUP_BLINK', 'Groggy Wakeup Blink', 'Drowsy & Low-Cognition', 2.5, false, 13, function (av, p, el, dt, i) {
    av.animRotZ = Math.sin(p * Math.PI * 6) * Math.sin(p * Math.PI) * 0.18 * i;
    av.animBlinkMod = Math.abs(Math.sin(p * Math.PI * 8));
    av.animJawMod = 0.15 * i;
  });

  reg('ANIM_100_CATATONIC_FREEZE', 'Catatonic Freeze', 'Drowsy & Low-Cognition', 3.0, true, 13, function (av, p, el, dt, i) {
    av.animRotZ = 0.15 * i;
    av.animRotX = 0.10 * i;
    av.animBlinkMod = -0.5;
    av.animPupilScale = 0.6;
  });

  // =========================================================================
  // CATEGORY 11: THEMATIC & CINEMATIC PROPS (101 - 110)
  // =========================================================================

  reg('ANIM_101_MOVIE_POPCORN_MUNCH', 'Movie Popcorn Munch', 'Cinematic & Props', 3.0, true, 0, function (av, p, el, dt, i) {
    av.animRotX = -0.12 * i;
    av.animRotY = Math.sin(el * 1.5) * 0.08 * i;
    const chew = Math.pow(Math.abs(Math.sin(el * 8.0)), 3);
    av.animJawMod = chew * 0.45 * i;
    if (av.movieGroup) av.movieGroup.visible = true;
    if (av.popcornTub) av.popcornTub.visible = true;
  });

  reg('ANIM_102_COFFEE_SIP_REVIVAL', 'Coffee Sip Revival', 'Cinematic & Props', 2.8, false, 0, function (av, p, el, dt, i) {
    const sip = Math.sin(p * Math.PI);
    av.animRotX = 0.35 * sip * i;
    av.animJawMod = 0.15 * sip * i;
    av.animBlinkMod = 0.85 * sip;
  });

  reg('ANIM_103_SHERLOCK_MAGNIFY_GLASS', 'Sherlock Inspect', 'Cinematic & Props', 2.8, false, 1, function (av, p, el, dt, i) {
    const ins = Math.sin(p * Math.PI);
    av.animPosZ = 0.45 * ins * i;
    av.animRotZ = -0.18 * ins * i;
    av.animPupilScale = 1.0 + ins * 0.8;
  });

  reg('ANIM_104_COOL_SUNGLASSES_SLIDE', 'Cool Sunglasses Slide', 'Cinematic & Props', 2.5, false, 4, function (av, p, el, dt, i) {
    const cool = Math.sin(p * Math.PI);
    av.animRotX = -0.18 * cool * i;
    av.animJawMod = 0.12 * cool * i;
  });

  reg('ANIM_105_READING_TERMINAL_TAPE', 'Reading Terminal Tape', 'Cinematic & Props', 3.0, true, 4, function (av, p, el, dt, i) {
    av.animRotY = (Math.sin(el * 4.0) > 0 ? 0.25 : -0.25) * i;
    av.animRotX = 0.15 * i;
    av.animBlinkMod = 0.3;
  });

  reg('ANIM_106_PARTY_CONFETTI_POP', 'Party Confetti Pop', 'Cinematic & Props', 2.2, false, 6, function (av, p, el, dt, i) {
    const pop = dampedSin(p * 2, 2.0, 3.0);
    av.animPosY = Math.max(0, pop * 0.55) * i;
    av.animRotZ = Math.sin(p * Math.PI * 4) * 0.25 * i;
    av.animJawMod = 0.65 * Math.sin(p * Math.PI) * i;
  });

  reg('ANIM_107_CHEAP_MAGICIAN_POOF', 'Showman Magician Poof', 'Cinematic & Props', 2.4, false, 4, function (av, p, el, dt, i) {
    const bow = Math.sin(p * Math.PI);
    av.animRotX = 0.45 * bow * i;
    av.animPosY = -0.25 * bow * i;
    av.animJawMod = -0.05;
  });

  reg('ANIM_108_MUSIC_HEADPHONES_JAM', 'Headphones Jam', 'Cinematic & Props', 2.5, true, 6, function (av, p, el, dt, i) {
    const beat = Math.abs(Math.sin(el * 8.0));
    av.animRotX = beat * 0.25 * i;
    av.animPosY = -beat * 0.08 * i;
    av.animJawMod = beat * 0.25 * i;
  });

  reg('ANIM_109_CHEF_PIZZA_TOSS', 'Chef Pizza Toss', 'Cinematic & Props', 2.6, true, 0, function (av, p, el, dt, i) {
    const toss = Math.sin(el * 4.0);
    av.animPosY = Math.max(0, toss * 0.28) * i;
    av.animRotX = -toss * 0.15 * i;
  });

  reg('ANIM_110_DETECTIVE_NOTEBOOK_JOT', 'Detective Notebook Jot', 'Cinematic & Props', 2.8, false, 4, function (av, p, el, dt, i) {
    av.animRotX = 0.28 * Math.sin(p * Math.PI) * i;
    av.animRotZ = 0.12 * i;
    av.animJawMod = Math.sin(el * 14.0) * 0.08 * i;
  });

  // =========================================================================
  // CATEGORY 12: FOURTH-WALL, DESKTOP META & OS GLITCH (111 - 120)
  // =========================================================================

  reg('ANIM_111_SCREEN_GLASS_KNOCK', 'Screen Glass Knock', 'Desktop Meta & Glitch', 2.2, false, 0, function (av, p, el, dt, i) {
    const knock = Math.pow(Math.abs(Math.sin(p * Math.PI * 4)), 6);
    av.animPosZ = (0.35 + knock * 0.45) * i;
    av.animJawMod = knock * 0.25 * i;
    av.animPupilScale = 1.35;
  });

  reg('ANIM_112_CURSOR_DODGE_REFLEX', 'Cursor Dodge Reflex', 'Desktop Meta & Glitch', 1.8, false, 0, function (av, p, el, dt, i) {
    const dodge = dampedSin(p * 2, 2.5, 3.5);
    av.animPosX = dodge * 0.55 * i;
    av.animRotZ = -dodge * 0.35 * i;
    av.animJawMod = 0.25 * i;
  });

  reg('ANIM_113_WINDOW_DRAG_INERTIA', 'Window Drag Inertia', 'Desktop Meta & Glitch', 2.4, true, 7, function (av, p, el, dt, i) {
    av.animRotZ = 0.35 * i;
    av.animScaleX = 1.25 * i;
    av.animScaleY = 0.85 * i;
    av.animJawMod = 0.35 * i;
  });

  reg('ANIM_114_FAKE_BUFFERING_SPIN', 'Fake Buffering Spin', 'Desktop Meta & Glitch', 3.0, true, 13, function (av, p, el, dt, i) {
    av.animRotZ = el * 5.0 * i;
    av.animJawMod = 0.0;
    av.animBlinkMod = 1.0;
  });

  reg('ANIM_115_SCREEN_DIVE_PORTAL', 'Screen Dive Portal', 'Desktop Meta & Glitch', 3.0, false, 3, function (av, p, el, dt, i) {
    const dive = Math.sin(p * Math.PI);
    av.animPosY = -dive * 0.85 * i;
    av.animRotX = dive * Math.PI * 0.5 * i;
    av.animScaleZ = 1.0 + dive * 0.4 * i;
    if (av.diggingGroup) av.diggingGroup.visible = true;
  });

  reg('ANIM_116_PIXEL_GLITCH_DESYNC', 'Pixel Glitch Desync', 'Desktop Meta & Glitch', 2.0, false, 9, function (av, p, el, dt, i) {
    const glitch = pseudoNoise(13, el * 60.0) * 0.12 * i;
    av.animPosX = glitch;
    av.animRotY = glitch * 4;
    av.animHorrorMod = 1.0 * i;
    av.animJawMod = Math.abs(glitch) * 5;
  });

  reg('ANIM_117_MAGNETIC_CURSOR_SNACK', 'Magnetic Cursor Snack', 'Desktop Meta & Glitch', 2.5, false, 3, function (av, p, el, dt, i) {
    const suction = Math.sin(p * Math.PI);
    av.animPosZ = suction * 0.55 * i;
    av.animJawMod = suction * 0.85 * i;
    av.animPupilScale = 1.4;
  });

  reg('ANIM_118_DESKTOP_GRAVITY_FALL', 'Desktop Gravity Fall', 'Desktop Meta & Glitch', 2.2, false, 7, function (av, p, el, dt, i) {
    let gy = 0;
    if (p < 0.4) {
      gy = -Math.pow(p / 0.4, 2) * 0.85; // Fall
    } else {
      const b = (p - 0.4) / 0.6;
      gy = -0.85 + Math.abs(dampedSin(b * 2, 2.5, 3.5)) * 0.55; // Bounce
    }
    av.animPosY = gy * i;
    av.animScaleY = (1.0 + gy * 0.3) * i;
    av.animJawMod = 0.55 * (1 - p) * i;
  });

  reg('ANIM_119_HORROR_GLITCH_CRASH', 'Horror Glitch Crash', 'Desktop Meta & Glitch', 2.5, false, 14, function (av, p, el, dt, i) {
    const crash = pseudoNoise(14, el * 50.0) * 0.15 * i;
    av.animPosX = crash;
    av.animPosY = crash;
    av.animHorrorMod = 1.0 * i;
    av.animAuraMod = 1.0 * i;
    av.animJawMod = 0.95 * i;
    av.animPupilScale = 0.2;
  });

  reg('ANIM_120_PEEKABOO_EDGE_HIDE', 'Peekaboo Edge Hide', 'Desktop Meta & Glitch', 3.0, false, 0, function (av, p, el, dt, i) {
    const peek = Math.sin(p * Math.PI);
    av.animPosY = -0.65 * (1 - peek) * i;
    av.animRotX = -0.22 * i;
    av.animPupilScale = 1.15;
  });

  reg('ANIM_121_BOX_BREAKOUT_POP', 'Box Breakout & Screen-Top Pop', 'Desktop Meta & Glitch', 4.4, false, 6, function (av, p, el, dt, i) {
    if (el < 0.08 && typeof av.setAnimationMode === 'function' && av.animMode !== 'breakout') {
      av.setAnimationMode('breakout');
    }
    if (p < 0.14) {
      // Wind-up coil inside box
      const cp = p / 0.14;
      av.animPosZ = -1.10 * cp * i;
      av.animPosY = -0.42 * cp * i;
      av.animScaleY = 1.0 - 0.26 * cp * i;
      av.animScaleX = 1.0 + 0.22 * cp * i;
      av.animRotX = 0.25 * cp * i;
    } else if (p < 0.26) {
      // Impact shatter burst upward out of box
      const bp = (p - 0.14) / 0.12;
      av.animPosZ = (-1.10 + bp * 1.85) * i;
      av.animPosY = (-0.42 + bp * 0.80) * i;
      av.animScaleY = (0.74 + bp * 0.44) * i;
      av.animScaleX = (1.22 - bp * 0.30) * i;
      av.animJawMod = 0.72 * Math.sin(bp * Math.PI) * i;
      av.animPupilScale = 1.38;
    } else if (p < 0.85) {
      // Hovering & peering down from the Screen Top
      const hp = (p - 0.26) / 0.59;
      av.animPosZ = (0.45 + Math.sin(hp * Math.PI * 2) * 0.08) * i;
      av.animPosY = Math.sin(hp * Math.PI * 4) * 0.08 * i;
      av.animRotX = 0.22 * i;
      av.animRotY = Math.sin(hp * Math.PI * 3) * 0.34 * i;
      av.animRotZ = Math.cos(hp * Math.PI * 3) * 0.10 * i;
      av.animJawMod = Math.max(0, Math.sin(hp * Math.PI * 6)) * 0.32 * i;
    } else {
      // Elastic drop back into containment box
      const dp = (p - 0.85) / 0.15;
      const bounce = dampedSin(dp * 2, 2.0, 3.0);
      av.animPosZ = 0.45 * (1 - dp) * i;
      av.animPosY = bounce * 0.25 * i;
      av.animScaleY = 1.0 - bounce * 0.18 * i;
      if (dp > 0.92 && typeof av.setAnimationMode === 'function' && av.animMode === 'breakout') {
        av.setAnimationMode('none');
      }
    }
  });



  // =========================================================================
  // EXTENDED PROCEDURAL BEHAVIORAL SUITE (ANIM_122 TO ANIM_721: 600 ANIMATIONS)
  // Covers: Joy, Uncanny, Tech, Snark, Panic, Melancholy, Smug, Intimidation,
  // Curiosity, Anger, Drowsy, Combat, Music/Rhythm, Desktop Meta, and Cosmic Sci-Fi!
  // =========================================================================

  const ARCHETYPES = {
    BOUNCE: function (param) {
      return function (av, p, el, dt, i) {
        const hop = Math.abs(Math.sin(p * Math.PI * (param.bounces || 3))) * Math.exp(-p * (param.decay || 1.2));
        av.animPosY = hop * (param.height || 0.4) * i;
        av.animScaleY = 1.0 + (hop > 0.05 ? hop * (param.stretch || 0.25) : -hop * 0.2) * i;
        av.animScaleX = 1.0 - (hop * 0.12) * i;
        av.animRotZ = Math.sin(p * Math.PI * (param.wobble || 2)) * (param.tilt || 0.1) * i;
        av.animJawMod = Math.sin(p * Math.PI * (param.jawFreq || 5)) * (param.jawAmp || 0.3) * i;
      };
    },
    HORROR: function (param) {
      return function (av, p, el, dt, i) {
        const jitter = pseudoNoise(param.seed || 1, el * (param.speed || 30.0)) * (param.amp || 0.06) * i;
        av.animPosX = jitter;
        av.animPosY = pseudoNoise((param.seed || 1) + 1, el * (param.speed || 30.0)) * (param.amp || 0.06) * i;
        av.animRotZ = jitter * (param.rotMult || 2.5);
        av.animHorrorMod = (param.horror || 0.9) * i;
        av.animPupilScale = (p < 0.5) ? (param.pupilMin || 0.25) : (param.pupilMax || 1.3);
        av.animJawMod = (param.jaw || 0.5) * (0.5 + 0.5 * Math.sin(el * 20.0)) * i;
        av.animBlinkMod = (param.noBlink ? -1.0 : (p > 0.3 && p < 0.7 ? 0.9 : 0));
      };
    },
    TECH: function (param) {
      return function (av, p, el, dt, i) {
        const sweep = Math.sin(p * Math.PI * (param.sweeps || 2));
        av.animRotY = sweep * (param.angle || 0.45) * i;
        av.animRotX = Math.cos(p * Math.PI * (param.sweeps || 2)) * (param.pitch || 0.15) * i;
        av.animPosZ = (param.zoom || 0.2) * Math.sin(p * Math.PI) * i;
        av.animPupilScale = 0.5 + 0.5 * Math.abs(sweep);
        av.animAuraMod = 0.65 * i;
        av.animBlinkMod = (p > 0.48 && p < 0.54) ? 0.9 : 0;
      };
    },
    SARCASTIC: function (param) {
      return function (av, p, el, dt, i) {
        const cycle = Math.sin(p * Math.PI);
        av.animRotY = (param.yaw || 0.3) * cycle * i;
        av.animRotX = (param.pitch || -0.15) * cycle * i;
        av.animRotZ = (param.roll || -0.1) * Math.sin(p * Math.PI * 2) * i;
        av.animPupilScale = 0.75;
        av.animBlinkMod = (p > 0.2 && p < 0.6) ? 0.65 : 0;
        av.animJawMod = -0.05;
      };
    },
    PANIC: function (param) {
      return function (av, p, el, dt, i) {
        const twitchX = (Math.sin(el * 38.0) * 0.6 + Math.cos(el * 73.0) * 0.4) * (param.tremor || 0.08) * i;
        const twitchY = (Math.cos(el * 41.0) * 0.6 + Math.sin(el * 82.0) * 0.4) * (param.tremor || 0.08) * i;
        av.animPosX = twitchX;
        av.animPosY = twitchY;
        av.animRotZ = twitchX * 2.5;
        av.animJawMod = 0.4 + Math.sin(el * 22.0) * 0.3 * i;
        av.animPupilScale = 0.4 + 0.6 * Math.abs(Math.sin(el * 14.0));
        av.animSweatDrops = true;
        av.animHorrorMod = 0.45 * i;
      };
    },
    MELANCHOLY: function (param) {
      return function (av, p, el, dt, i) {
        const sink = easeInOutQuad(p);
        av.animPosY = -sink * (param.drop || 0.3) * i;
        av.animScaleY = 1.0 - sink * (param.flatten || 0.2) * i;
        av.animScaleX = 1.0 + sink * (param.spread || 0.12) * i;
        av.animRotX = (param.headDown || 0.2) * sink * i;
        av.animPupilScale = 1.0 - 0.4 * sink;
        av.animJawMod = sink * (param.sigh || 0.25) * (1 - p);
      };
    },
    SNEAK: function (param) {
      return function (av, p, el, dt, i) {
        const drift = Math.sin(p * Math.PI);
        av.animPosX = drift * (param.dir || 1) * (param.slide || 0.35) * i;
        av.animRotY = (param.lookDir || -0.4) * drift * i;
        av.animRotZ = (param.tilt || 0.15) * Math.sin(el * 3.0) * i;
        av.animPupilScale = (param.pupil || 0.7);
        av.animJawMod = Math.abs(Math.sin(el * 12.0)) * (param.snicker || 0.2) * i;
        av.animRotX = 0.08 * i;
      };
    },
    INTIMIDATE: function (param) {
      return function (av, p, el, dt, i) {
        const push = Math.sin(p * Math.PI);
        av.animPosZ = (param.posZ || 0.65) * push * i;
        av.animRotX = (param.rotX || -0.18) * push * i;
        av.animRotY = Math.sin(el * (param.yawFreq || 1.2)) * (param.yawAmp || 0.08) * i;
        av.animScaleY = 1.0 + Math.sin(el * (param.breathFreq || 2.0)) * (param.breathAmp || 0.08) * i;
        av.animScaleX = 1.0 - Math.sin(el * (param.breathFreq || 2.0)) * (param.breathAmp || 0.04) * i;
        av.animPupilScale = param.pupil || 0.35;
        av.animHorrorMod = (param.horror || 0.85) * push * i;
        av.animAuraMod = (param.aura || 0.75) * push * i;
        av.animJawMod = (param.jaw || 0.25) * (0.8 + 0.2 * Math.sin(el * 6.0)) * i;
      };
    },
    COMBAT: function (param) {
      return function (av, p, el, dt, i) {
        if (p < 0.3) {
          const cp = p / 0.3;
          av.animPosZ = -(param.coilZ || 0.5) * cp * i;
          av.animScaleY = 1.0 - 0.2 * cp * i;
          av.animScaleX = 1.0 + 0.15 * cp * i;
          av.animRotX = (param.coilPitch || 0.2) * cp * i;
        } else if (p < 0.55) {
          const bp = (p - 0.3) / 0.25;
          av.animPosZ = (-(param.coilZ || 0.5) + bp * ((param.thrustZ || 1.2) + (param.coilZ || 0.5))) * i;
          av.animScaleY = 1.0 + 0.3 * bp * i;
          av.animJawMod = (param.jawBurst || 0.7) * Math.sin(bp * Math.PI) * i;
          av.animAuraMod = 1.0 * i;
        } else {
          const dp = (p - 0.55) / 0.45;
          const settle = dampedSin(dp * 2, 2.5, 3.5);
          av.animPosZ = (param.thrustZ || 1.2) * (1 - dp) * i;
          av.animPosY = settle * 0.2 * i;
          av.animScaleY = 1.0 + settle * 0.15 * i;
        }
      };
    },
    MUSIC: function (param) {
      return function (av, p, el, dt, i) {
        const beat = Math.pow(Math.abs(Math.sin(el * (param.bpm || 8.0))), (param.sharpness || 3.0));
        av.animPosY = -beat * (param.bounce || 0.22) * i;
        av.animScaleY = 1.0 - beat * (param.squash || 0.18) * i;
        av.animScaleX = 1.0 + beat * (param.stretch || 0.12) * i;
        av.animRotZ = Math.sin(el * (param.bpm || 8.0) * 0.5) * (param.roll || 0.15) * i;
        av.animJawMod = beat * (param.jaw || 0.35) * i;
      };
    },
    DROWSY: function (param) {
      return function (av, p, el, dt, i) {
        const sway = Math.sin(el * (param.freq || 1.5));
        av.animPosY = Math.sin(el * (param.freq || 1.5) * 0.5) * (param.sink || 0.1) * i - (param.baseSink || 0.08);
        av.animRotZ = sway * (param.roll || 0.18) * i;
        av.animRotX = (param.nod || 0.15) * Math.abs(sway) * i;
        av.animBlinkMod = 0.6 + 0.35 * Math.sin(el * 2.0);
        av.animScaleY = 1.0 + 0.05 * Math.sin(el * 1.2) * i;
      };
    },
    COSMIC: function (param) {
      return function (av, p, el, dt, i) {
        const tOrbit = el * (param.orbitSpeed || 2.2);
        av.animPosX = Math.sin(tOrbit) * (param.radiusX || 0.25) * i;
        av.animPosY = Math.sin(tOrbit * 2.0) * (param.radiusY || 0.15) * i;
        av.animPosZ = Math.cos(tOrbit) * (param.radiusZ || 0.20) * i;
        av.animRotY = tOrbit * (param.spinSpeed || 0.5) * i;
        av.animAuraMod = (0.7 + 0.3 * Math.sin(el * 4.0)) * i;
        av.animScaleX = 1.0 + Math.sin(el * 3.5) * 0.08 * i;
        av.animScaleY = 1.0 + Math.cos(el * 3.5) * 0.08 * i;
      };
    }
  };

  const EXTENDED_ANIM_DATA = [{"id":"ANIM_122_DOUBLE_BACKFLIP","name":"Double Backflip","category":"Joy & Excitement","duration":1.6,"loop":true,"defExpr":0,"archType":"BOUNCE","params":{"bounces":2,"decay":1,"height":0.35,"stretch":0.2,"wobble":1.5,"tilt":0.08,"jawFreq":4,"jawAmp":0.25}},{"id":"ANIM_123_POPCORN_SHOWER","name":"Popcorn Shower","category":"Joy & Excitement","duration":1.9000000000000001,"loop":false,"defExpr":3,"archType":"BOUNCE","params":{"bounces":3,"decay":1.4,"height":0.43,"stretch":0.25,"wobble":2.5,"tilt":0.12,"jawFreq":5,"jawAmp":0.35}},{"id":"ANIM_124_FIREWORKS_BURST","name":"Fireworks Burst","category":"Joy & Excitement","duration":2.2,"loop":false,"defExpr":5,"archType":"BOUNCE","params":{"bounces":4,"decay":1.8,"height":0.51,"stretch":0.30000000000000004,"wobble":3.5,"tilt":0.16,"jawFreq":6,"jawAmp":0.45}},{"id":"ANIM_125_GOLDEN_RADIANCE","name":"Golden Radiance","category":"Joy & Excitement","duration":2.5,"loop":false,"defExpr":6,"archType":"BOUNCE","params":{"bounces":5,"decay":1,"height":0.59,"stretch":0.35000000000000003,"wobble":1.5,"tilt":0.2,"jawFreq":7,"jawAmp":0.25}},{"id":"ANIM_126_SONIC_ZOOMIES","name":"Sonic Zoomies","category":"Joy & Excitement","duration":2.8,"loop":false,"defExpr":8,"archType":"BOUNCE","params":{"bounces":2,"decay":1.4,"height":0.6699999999999999,"stretch":0.2,"wobble":2.5,"tilt":0.08,"jawFreq":4,"jawAmp":0.35}},{"id":"ANIM_127_SUGAR_RUSH_JITTER","name":"Sugar Rush Jitter","category":"Joy & Excitement","duration":1.6,"loop":false,"defExpr":10,"archType":"BOUNCE","params":{"bounces":3,"decay":1.8,"height":0.35,"stretch":0.25,"wobble":3.5,"tilt":0.12,"jawFreq":5,"jawAmp":0.45}},{"id":"ANIM_128_CONFETTI_EXPLODE","name":"Confetti Explode","category":"Joy & Excitement","duration":1.9000000000000001,"loop":false,"defExpr":0,"archType":"BOUNCE","params":{"bounces":4,"decay":1,"height":0.43,"stretch":0.30000000000000004,"wobble":1.5,"tilt":0.16,"jawFreq":6,"jawAmp":0.25}},{"id":"ANIM_129_CHAMPAGNE_CORK_POP","name":"Champagne Cork Pop","category":"Joy & Excitement","duration":2.2,"loop":true,"defExpr":3,"archType":"BOUNCE","params":{"bounces":5,"decay":1.4,"height":0.51,"stretch":0.35000000000000003,"wobble":2.5,"tilt":0.2,"jawFreq":7,"jawAmp":0.35}},{"id":"ANIM_130_RAINBOW_ORBIT","name":"Rainbow Orbit","category":"Joy & Excitement","duration":2.5,"loop":false,"defExpr":5,"archType":"BOUNCE","params":{"bounces":2,"decay":1.8,"height":0.59,"stretch":0.2,"wobble":3.5,"tilt":0.08,"jawFreq":4,"jawAmp":0.45}},{"id":"ANIM_131_VICTORY_LAP_SPIN","name":"Victory Lap Spin","category":"Joy & Excitement","duration":2.8,"loop":false,"defExpr":6,"archType":"BOUNCE","params":{"bounces":3,"decay":1,"height":0.6699999999999999,"stretch":0.25,"wobble":1.5,"tilt":0.12,"jawFreq":5,"jawAmp":0.25}},{"id":"ANIM_132_PRAISE_THE_SUN_LEAN","name":"Praise The Sun Lean","category":"Joy & Excitement","duration":1.6,"loop":false,"defExpr":8,"archType":"BOUNCE","params":{"bounces":4,"decay":1.4,"height":0.35,"stretch":0.30000000000000004,"wobble":2.5,"tilt":0.16,"jawFreq":6,"jawAmp":0.35}},{"id":"ANIM_133_GIDDY_CARTWHEEL","name":"Giddy Cartwheel","category":"Joy & Excitement","duration":1.9000000000000001,"loop":false,"defExpr":10,"archType":"BOUNCE","params":{"bounces":5,"decay":1.8,"height":0.43,"stretch":0.35000000000000003,"wobble":3.5,"tilt":0.2,"jawFreq":7,"jawAmp":0.45}},{"id":"ANIM_134_JUBILANT_HOPSCOTCH","name":"Jubilant Hopscotch","category":"Joy & Excitement","duration":2.2,"loop":false,"defExpr":0,"archType":"BOUNCE","params":{"bounces":2,"decay":1,"height":0.51,"stretch":0.2,"wobble":1.5,"tilt":0.08,"jawFreq":4,"jawAmp":0.25}},{"id":"ANIM_135_SPARKLING_GIGGLE","name":"Sparkling Giggle","category":"Joy & Excitement","duration":2.5,"loop":false,"defExpr":3,"archType":"BOUNCE","params":{"bounces":3,"decay":1.4,"height":0.59,"stretch":0.25,"wobble":2.5,"tilt":0.12,"jawFreq":5,"jawAmp":0.35}},{"id":"ANIM_136_HIGH_FIVE_RECOIL","name":"High Five Recoil","category":"Joy & Excitement","duration":2.8,"loop":true,"defExpr":5,"archType":"BOUNCE","params":{"bounces":4,"decay":1.8,"height":0.6699999999999999,"stretch":0.30000000000000004,"wobble":3.5,"tilt":0.16,"jawFreq":6,"jawAmp":0.45}},{"id":"ANIM_137_STARLIGHT_SHIMMER","name":"Starlight Shimmer","category":"Joy & Excitement","duration":1.6,"loop":false,"defExpr":6,"archType":"BOUNCE","params":{"bounces":5,"decay":1,"height":0.35,"stretch":0.35000000000000003,"wobble":1.5,"tilt":0.2,"jawFreq":7,"jawAmp":0.25}},{"id":"ANIM_138_BUBBLY_FROTH_BOUNCE","name":"Bubbly Froth Bounce","category":"Joy & Excitement","duration":1.9000000000000001,"loop":false,"defExpr":8,"archType":"BOUNCE","params":{"bounces":2,"decay":1.4,"height":0.43,"stretch":0.2,"wobble":2.5,"tilt":0.08,"jawFreq":4,"jawAmp":0.35}},{"id":"ANIM_139_CHEERLEADER_POM_SHAKE","name":"Cheerleader Pom Shake","category":"Joy & Excitement","duration":2.2,"loop":false,"defExpr":10,"archType":"BOUNCE","params":{"bounces":3,"decay":1.8,"height":0.51,"stretch":0.25,"wobble":3.5,"tilt":0.12,"jawFreq":5,"jawAmp":0.45}},{"id":"ANIM_140_ROLLERCOASTER_DROP_THRILL","name":"Rollercoaster Drop Thrill","category":"Joy & Excitement","duration":2.5,"loop":false,"defExpr":0,"archType":"BOUNCE","params":{"bounces":4,"decay":1,"height":0.59,"stretch":0.30000000000000004,"wobble":1.5,"tilt":0.16,"jawFreq":6,"jawAmp":0.25}},{"id":"ANIM_141_BOUNCING_BEAN_ELASTIC","name":"Bouncing Bean Elastic","category":"Joy & Excitement","duration":2.8,"loop":false,"defExpr":3,"archType":"BOUNCE","params":{"bounces":5,"decay":1.4,"height":0.6699999999999999,"stretch":0.35000000000000003,"wobble":2.5,"tilt":0.2,"jawFreq":7,"jawAmp":0.35}},{"id":"ANIM_142_WHISTLING_CAREFREE_TILT","name":"Whistling Carefree Tilt","category":"Joy & Excitement","duration":1.6,"loop":false,"defExpr":5,"archType":"BOUNCE","params":{"bounces":2,"decay":1.8,"height":0.35,"stretch":0.2,"wobble":3.5,"tilt":0.08,"jawFreq":4,"jawAmp":0.45}},{"id":"ANIM_143_TREASURE_CHEST_OPEN_JOY","name":"Treasure Chest Open Joy","category":"Joy & Excitement","duration":1.9000000000000001,"loop":true,"defExpr":6,"archType":"BOUNCE","params":{"bounces":3,"decay":1,"height":0.43,"stretch":0.25,"wobble":1.5,"tilt":0.12,"jawFreq":5,"jawAmp":0.25}},{"id":"ANIM_144_HAPPY_PUPPY_WAGGLE","name":"Happy Puppy Waggle","category":"Joy & Excitement","duration":2.2,"loop":false,"defExpr":8,"archType":"BOUNCE","params":{"bounces":4,"decay":1.4,"height":0.51,"stretch":0.30000000000000004,"wobble":2.5,"tilt":0.16,"jawFreq":6,"jawAmp":0.35}},{"id":"ANIM_145_CHUCKLE_SNORT_WAVE","name":"Chuckle Snort Wave","category":"Joy & Excitement","duration":2.5,"loop":false,"defExpr":10,"archType":"BOUNCE","params":{"bounces":5,"decay":1.8,"height":0.59,"stretch":0.35000000000000003,"wobble":3.5,"tilt":0.2,"jawFreq":7,"jawAmp":0.45}},{"id":"ANIM_146_CARNIVAL_CAROUSEL_SWIRL","name":"Carnival Carousel Swirl","category":"Joy & Excitement","duration":2.8,"loop":false,"defExpr":0,"archType":"BOUNCE","params":{"bounces":2,"decay":1,"height":0.6699999999999999,"stretch":0.2,"wobble":1.5,"tilt":0.08,"jawFreq":4,"jawAmp":0.25}},{"id":"ANIM_147_TIPPY_TAPPY_EXCITEMENT","name":"Tippy Tappy Excitement","category":"Joy & Excitement","duration":1.6,"loop":false,"defExpr":3,"archType":"BOUNCE","params":{"bounces":3,"decay":1.4,"height":0.35,"stretch":0.25,"wobble":2.5,"tilt":0.12,"jawFreq":5,"jawAmp":0.35}},{"id":"ANIM_148_GLITTER_NOVA_FLASH","name":"Glitter Nova Flash","category":"Joy & Excitement","duration":1.9000000000000001,"loop":false,"defExpr":5,"archType":"BOUNCE","params":{"bounces":4,"decay":1.8,"height":0.43,"stretch":0.30000000000000004,"wobble":3.5,"tilt":0.16,"jawFreq":6,"jawAmp":0.45}},{"id":"ANIM_149_ZERO_G_SOMERSAULT","name":"Zero-G Somersault","category":"Joy & Excitement","duration":2.2,"loop":false,"defExpr":6,"archType":"BOUNCE","params":{"bounces":5,"decay":1,"height":0.51,"stretch":0.35000000000000003,"wobble":1.5,"tilt":0.2,"jawFreq":7,"jawAmp":0.25}},{"id":"ANIM_150_SPRING_LOADED_LAUNCH","name":"Spring Loaded Launch","category":"Joy & Excitement","duration":2.5,"loop":true,"defExpr":8,"archType":"BOUNCE","params":{"bounces":2,"decay":1.4,"height":0.59,"stretch":0.2,"wobble":2.5,"tilt":0.08,"jawFreq":4,"jawAmp":0.35}},{"id":"ANIM_151_OVERJOYED_SQUEE_SQUEEZE","name":"Overjoyed Squee Squeeze","category":"Joy & Excitement","duration":2.8,"loop":false,"defExpr":10,"archType":"BOUNCE","params":{"bounces":3,"decay":1.8,"height":0.6699999999999999,"stretch":0.25,"wobble":3.5,"tilt":0.12,"jawFreq":5,"jawAmp":0.45}},{"id":"ANIM_152_SUNBURST_CORONA_GLOW","name":"Sunburst Corona Glow","category":"Joy & Excitement","duration":1.6,"loop":false,"defExpr":0,"archType":"BOUNCE","params":{"bounces":4,"decay":1,"height":0.35,"stretch":0.30000000000000004,"wobble":1.5,"tilt":0.16,"jawFreq":6,"jawAmp":0.25}},{"id":"ANIM_153_TICKLED_RIBS_SQUIRM","name":"Tickled Ribs Squirm","category":"Joy & Excitement","duration":1.9000000000000001,"loop":false,"defExpr":3,"archType":"BOUNCE","params":{"bounces":5,"decay":1.4,"height":0.43,"stretch":0.35000000000000003,"wobble":2.5,"tilt":0.2,"jawFreq":7,"jawAmp":0.35}},{"id":"ANIM_154_HIGH_OCTANE_RUSH","name":"High Octane Rush","category":"Joy & Excitement","duration":2.2,"loop":false,"defExpr":5,"archType":"BOUNCE","params":{"bounces":2,"decay":1.8,"height":0.51,"stretch":0.2,"wobble":3.5,"tilt":0.08,"jawFreq":4,"jawAmp":0.45}},{"id":"ANIM_155_EUPHORIA_ASCENSION","name":"Euphoria Ascension","category":"Joy & Excitement","duration":2.5,"loop":false,"defExpr":6,"archType":"BOUNCE","params":{"bounces":3,"decay":1,"height":0.59,"stretch":0.25,"wobble":1.5,"tilt":0.12,"jawFreq":5,"jawAmp":0.25}},{"id":"ANIM_156_POLTERGEIST_RATTLE","name":"Poltergeist Rattle","category":"Uncanny & Creepy","duration":2.2,"loop":true,"defExpr":2,"archType":"HORROR","params":{"seed":10,"speed":25,"amp":0.05,"rotMult":2,"horror":0.8,"pupilMin":0.18,"pupilMax":1.25,"jaw":0.4,"noBlink":true}},{"id":"ANIM_157_RED_ECLIPSE_STARE","name":"Red Eclipse Stare","category":"Uncanny & Creepy","duration":2.6,"loop":false,"defExpr":9,"archType":"HORROR","params":{"seed":11,"speed":31,"amp":0.07,"rotMult":2.6,"horror":0.9,"pupilMin":0.26,"pupilMax":1.4,"jaw":0.55,"noBlink":false}},{"id":"ANIM_158_JAW_UNHINGE_ABYSS","name":"Jaw Unhinge Abyss","category":"Uncanny & Creepy","duration":3,"loop":false,"defExpr":14,"archType":"HORROR","params":{"seed":12,"speed":37,"amp":0.09,"rotMult":3.2,"horror":1,"pupilMin":0.33999999999999997,"pupilMax":1.55,"jaw":0.7,"noBlink":true}},{"id":"ANIM_159_TENDRIL_SPIRAL_SEEP","name":"Tendril Spiral Seep","category":"Uncanny & Creepy","duration":3.4000000000000004,"loop":false,"defExpr":11,"archType":"HORROR","params":{"seed":13,"speed":43,"amp":0.11,"rotMult":3.8,"horror":0.8,"pupilMin":0.18,"pupilMax":1.25,"jaw":0.85,"noBlink":false}},{"id":"ANIM_160_FLESH_INVERSION_TREMOR","name":"Flesh Inversion Tremor","category":"Uncanny & Creepy","duration":3.8000000000000003,"loop":false,"defExpr":2,"archType":"HORROR","params":{"seed":14,"speed":49,"amp":0.13,"rotMult":2,"horror":0.9,"pupilMin":0.26,"pupilMax":1.4,"jaw":0.4,"noBlink":true}},{"id":"ANIM_161_REVERSE_GRAVITY_GLITCH","name":"Reverse Gravity Glitch","category":"Uncanny & Creepy","duration":4.2,"loop":false,"defExpr":9,"archType":"HORROR","params":{"seed":15,"speed":55,"amp":0.05,"rotMult":2.6,"horror":1,"pupilMin":0.33999999999999997,"pupilMax":1.55,"jaw":0.55,"noBlink":false}},{"id":"ANIM_162_FACIAL_DISTORTION_MELT","name":"Facial Distortion Melt","category":"Uncanny & Creepy","duration":2.2,"loop":true,"defExpr":14,"archType":"HORROR","params":{"seed":16,"speed":25,"amp":0.07,"rotMult":3.2,"horror":0.8,"pupilMin":0.18,"pupilMax":1.25,"jaw":0.7,"noBlink":true}},{"id":"ANIM_163_SPIDER_CRAWLER_SCUTTLE","name":"Spider Crawler Scuttle","category":"Uncanny & Creepy","duration":2.6,"loop":false,"defExpr":11,"archType":"HORROR","params":{"seed":17,"speed":31,"amp":0.09,"rotMult":3.8,"horror":0.9,"pupilMin":0.26,"pupilMax":1.4,"jaw":0.85,"noBlink":false}},{"id":"ANIM_164_HOLLOW_SOCKET_BLEED","name":"Hollow Socket Bleed","category":"Uncanny & Creepy","duration":3,"loop":false,"defExpr":2,"archType":"HORROR","params":{"seed":18,"speed":37,"amp":0.11,"rotMult":2,"horror":1,"pupilMin":0.33999999999999997,"pupilMax":1.55,"jaw":0.4,"noBlink":true}},{"id":"ANIM_165_MARIONETTE_STRINGS_JERK","name":"Marionette Strings Jerk","category":"Uncanny & Creepy","duration":3.4000000000000004,"loop":false,"defExpr":9,"archType":"HORROR","params":{"seed":19,"speed":43,"amp":0.13,"rotMult":2.6,"horror":0.8,"pupilMin":0.18,"pupilMax":1.25,"jaw":0.55,"noBlink":false}},{"id":"ANIM_166_SHADOW_ENTITY_PEEL","name":"Shadow Entity Peel","category":"Uncanny & Creepy","duration":3.8000000000000003,"loop":false,"defExpr":14,"archType":"HORROR","params":{"seed":20,"speed":49,"amp":0.05,"rotMult":3.2,"horror":0.9,"pupilMin":0.26,"pupilMax":1.4,"jaw":0.7,"noBlink":true}},{"id":"ANIM_167_CORRUPT_VERTEX_TWITCH","name":"Corrupt Vertex Twitch","category":"Uncanny & Creepy","duration":4.2,"loop":false,"defExpr":11,"archType":"HORROR","params":{"seed":21,"speed":55,"amp":0.07,"rotMult":3.8,"horror":1,"pupilMin":0.33999999999999997,"pupilMax":1.55,"jaw":0.85,"noBlink":false}},{"id":"ANIM_168_UNCANNY_VALLEY_FREEZE","name":"Uncanny Valley Freeze","category":"Uncanny & Creepy","duration":2.2,"loop":true,"defExpr":2,"archType":"HORROR","params":{"seed":22,"speed":25,"amp":0.09,"rotMult":2,"horror":0.8,"pupilMin":0.18,"pupilMax":1.25,"jaw":0.4,"noBlink":true}},{"id":"ANIM_169_ELDRITCH_WHISPER_LEAN","name":"Eldritch Whisper Lean","category":"Uncanny & Creepy","duration":2.6,"loop":false,"defExpr":9,"archType":"HORROR","params":{"seed":23,"speed":31,"amp":0.11,"rotMult":2.6,"horror":0.9,"pupilMin":0.26,"pupilMax":1.4,"jaw":0.55,"noBlink":false}},{"id":"ANIM_170_CHTHONIC_STATIC_HUM","name":"Chthonic Static Hum","category":"Uncanny & Creepy","duration":3,"loop":false,"defExpr":14,"archType":"HORROR","params":{"seed":24,"speed":37,"amp":0.13,"rotMult":3.2,"horror":1,"pupilMin":0.33999999999999997,"pupilMax":1.55,"jaw":0.7,"noBlink":true}},{"id":"ANIM_171_BLOOD_MOON_REFLECTION","name":"Blood Moon Reflection","category":"Uncanny & Creepy","duration":3.4000000000000004,"loop":false,"defExpr":11,"archType":"HORROR","params":{"seed":25,"speed":43,"amp":0.05,"rotMult":3.8,"horror":0.8,"pupilMin":0.18,"pupilMax":1.25,"jaw":0.85,"noBlink":false}},{"id":"ANIM_172_ROTATED_INVERTED_NOD","name":"Rotated Inverted Nod","category":"Uncanny & Creepy","duration":3.8000000000000003,"loop":false,"defExpr":2,"archType":"HORROR","params":{"seed":26,"speed":49,"amp":0.07,"rotMult":2,"horror":0.9,"pupilMin":0.26,"pupilMax":1.4,"jaw":0.4,"noBlink":true}},{"id":"ANIM_173_NEEDLE_PUPIL_GLARE","name":"Needle Pupil Glare","category":"Uncanny & Creepy","duration":4.2,"loop":false,"defExpr":9,"archType":"HORROR","params":{"seed":27,"speed":55,"amp":0.09,"rotMult":2.6,"horror":1,"pupilMin":0.33999999999999997,"pupilMax":1.55,"jaw":0.55,"noBlink":false}},{"id":"ANIM_174_BONE_CRACKING_SNAP","name":"Bone Cracking Snap","category":"Uncanny & Creepy","duration":2.2,"loop":true,"defExpr":14,"archType":"HORROR","params":{"seed":28,"speed":25,"amp":0.11,"rotMult":3.2,"horror":0.8,"pupilMin":0.18,"pupilMax":1.25,"jaw":0.7,"noBlink":true}},{"id":"ANIM_175_VOID_RESONANCE_SHIVER","name":"Void Resonance Shiver","category":"Uncanny & Creepy","duration":2.6,"loop":false,"defExpr":11,"archType":"HORROR","params":{"seed":29,"speed":31,"amp":0.13,"rotMult":3.8,"horror":0.9,"pupilMin":0.26,"pupilMax":1.4,"jaw":0.85,"noBlink":false}},{"id":"ANIM_176_DOPPELGANGER_MIRROR_COPY","name":"Doppelganger Mirror Copy","category":"Uncanny & Creepy","duration":3,"loop":false,"defExpr":2,"archType":"HORROR","params":{"seed":30,"speed":37,"amp":0.05,"rotMult":2,"horror":1,"pupilMin":0.33999999999999997,"pupilMax":1.55,"jaw":0.4,"noBlink":true}},{"id":"ANIM_177_SINISTER_HEAD_TILT_90","name":"Sinister Head Tilt 90","category":"Uncanny & Creepy","duration":3.4000000000000004,"loop":false,"defExpr":9,"archType":"HORROR","params":{"seed":31,"speed":43,"amp":0.07,"rotMult":2.6,"horror":0.8,"pupilMin":0.18,"pupilMax":1.25,"jaw":0.55,"noBlink":false}},{"id":"ANIM_178_FLICKERING_SOUL_GLITCH","name":"Flickering Soul Glitch","category":"Uncanny & Creepy","duration":3.8000000000000003,"loop":false,"defExpr":14,"archType":"HORROR","params":{"seed":32,"speed":49,"amp":0.09,"rotMult":3.2,"horror":0.9,"pupilMin":0.26,"pupilMax":1.4,"jaw":0.7,"noBlink":true}},{"id":"ANIM_179_TEETH_CHATTER_FREEZE","name":"Teeth Chatter Freeze","category":"Uncanny & Creepy","duration":4.2,"loop":false,"defExpr":11,"archType":"HORROR","params":{"seed":33,"speed":55,"amp":0.11,"rotMult":3.8,"horror":1,"pupilMin":0.33999999999999997,"pupilMax":1.55,"jaw":0.85,"noBlink":false}},{"id":"ANIM_180_SUBLIMINAL_FLASH_PULSE","name":"Subliminal Flash Pulse","category":"Uncanny & Creepy","duration":2.2,"loop":true,"defExpr":2,"archType":"HORROR","params":{"seed":34,"speed":25,"amp":0.13,"rotMult":2,"horror":0.8,"pupilMin":0.18,"pupilMax":1.25,"jaw":0.4,"noBlink":true}},{"id":"ANIM_181_ABYSSAL_MAW_GAP","name":"Abyssal Maw Gap","category":"Uncanny & Creepy","duration":2.6,"loop":false,"defExpr":9,"archType":"HORROR","params":{"seed":35,"speed":31,"amp":0.05,"rotMult":2.6,"horror":0.9,"pupilMin":0.26,"pupilMax":1.4,"jaw":0.55,"noBlink":false}},{"id":"ANIM_182_POSSESSED_DOLL_STARE","name":"Possessed Doll Stare","category":"Uncanny & Creepy","duration":3,"loop":false,"defExpr":14,"archType":"HORROR","params":{"seed":36,"speed":37,"amp":0.07,"rotMult":3.2,"horror":1,"pupilMin":0.33999999999999997,"pupilMax":1.55,"jaw":0.7,"noBlink":true}},{"id":"ANIM_183_SKIN_CRAWL_SHUDDER","name":"Skin Crawl Shudder","category":"Uncanny & Creepy","duration":3.4000000000000004,"loop":false,"defExpr":11,"archType":"HORROR","params":{"seed":37,"speed":43,"amp":0.09,"rotMult":3.8,"horror":0.8,"pupilMin":0.18,"pupilMax":1.25,"jaw":0.85,"noBlink":false}},{"id":"ANIM_184_QUANTUM_HORROR_PHASE","name":"Quantum Horror Phase","category":"Uncanny & Creepy","duration":3.8000000000000003,"loop":false,"defExpr":2,"archType":"HORROR","params":{"seed":38,"speed":49,"amp":0.11,"rotMult":2,"horror":0.9,"pupilMin":0.26,"pupilMax":1.4,"jaw":0.4,"noBlink":true}},{"id":"ANIM_185_SILENT_SCREAMER_VOID","name":"Silent Screamer Void","category":"Uncanny & Creepy","duration":4.2,"loop":false,"defExpr":9,"archType":"HORROR","params":{"seed":39,"speed":55,"amp":0.13,"rotMult":2.6,"horror":1,"pupilMin":0.33999999999999997,"pupilMax":1.55,"jaw":0.55,"noBlink":false}},{"id":"ANIM_186_ENTITY_LURKING_FORWARD","name":"Entity Lurking Forward","category":"Uncanny & Creepy","duration":2.2,"loop":true,"defExpr":14,"archType":"HORROR","params":{"seed":40,"speed":25,"amp":0.05,"rotMult":3.2,"horror":0.8,"pupilMin":0.18,"pupilMax":1.25,"jaw":0.7,"noBlink":true}},{"id":"ANIM_187_CORPSE_LIMP_DANGLE","name":"Corpse Limp Dangle","category":"Uncanny & Creepy","duration":2.6,"loop":false,"defExpr":11,"archType":"HORROR","params":{"seed":41,"speed":31,"amp":0.07,"rotMult":3.8,"horror":0.9,"pupilMin":0.26,"pupilMax":1.4,"jaw":0.85,"noBlink":false}},{"id":"ANIM_188_EYE_SOCKET_DISPLACE","name":"Eye Socket Displace","category":"Uncanny & Creepy","duration":3,"loop":false,"defExpr":2,"archType":"HORROR","params":{"seed":42,"speed":37,"amp":0.09,"rotMult":2,"horror":1,"pupilMin":0.33999999999999997,"pupilMax":1.55,"jaw":0.4,"noBlink":true}},{"id":"ANIM_189_MANDIBLE_LATERAL_DISLOCATE","name":"Mandible Lateral Dislocate","category":"Uncanny & Creepy","duration":3.4000000000000004,"loop":false,"defExpr":9,"archType":"HORROR","params":{"seed":43,"speed":43,"amp":0.11,"rotMult":2.6,"horror":0.8,"pupilMin":0.18,"pupilMax":1.25,"jaw":0.55,"noBlink":false}},{"id":"ANIM_190_PARASITIC_TWIN_JITTER","name":"Parasitic Twin Jitter","category":"Uncanny & Creepy","duration":3.8000000000000003,"loop":false,"defExpr":14,"archType":"HORROR","params":{"seed":44,"speed":49,"amp":0.13,"rotMult":3.2,"horror":0.9,"pupilMin":0.26,"pupilMax":1.4,"jaw":0.7,"noBlink":true}},{"id":"ANIM_191_DIMENSIONAL_CREEP_POKE","name":"Dimensional Creep Poke","category":"Uncanny & Creepy","duration":4.2,"loop":false,"defExpr":11,"archType":"HORROR","params":{"seed":45,"speed":55,"amp":0.05,"rotMult":3.8,"horror":1,"pupilMin":0.33999999999999997,"pupilMax":1.55,"jaw":0.85,"noBlink":false}},{"id":"ANIM_192_CURSED_ARTIFACT_HUM","name":"Cursed Artifact Hum","category":"Uncanny & Creepy","duration":2.2,"loop":true,"defExpr":2,"archType":"HORROR","params":{"seed":46,"speed":25,"amp":0.07,"rotMult":2,"horror":0.8,"pupilMin":0.18,"pupilMax":1.25,"jaw":0.4,"noBlink":true}},{"id":"ANIM_193_STALKER_GAZE_DISTANCE","name":"Stalker Gaze Distance","category":"Uncanny & Creepy","duration":2.6,"loop":false,"defExpr":9,"archType":"HORROR","params":{"seed":47,"speed":31,"amp":0.09,"rotMult":2.6,"horror":0.9,"pupilMin":0.26,"pupilMax":1.4,"jaw":0.55,"noBlink":false}},{"id":"ANIM_194_BLACK_HOLE_IRIS_DRAIN","name":"Black Hole Iris Drain","category":"Uncanny & Creepy","duration":3,"loop":false,"defExpr":14,"archType":"HORROR","params":{"seed":48,"speed":37,"amp":0.11,"rotMult":3.2,"horror":1,"pupilMin":0.33999999999999997,"pupilMax":1.55,"jaw":0.7,"noBlink":true}},{"id":"ANIM_195_GRIM_REAPER_APPROACH","name":"Grim Reaper Approach","category":"Uncanny & Creepy","duration":3.4000000000000004,"loop":false,"defExpr":11,"archType":"HORROR","params":{"seed":49,"speed":43,"amp":0.13,"rotMult":3.8,"horror":0.8,"pupilMin":0.18,"pupilMax":1.25,"jaw":0.85,"noBlink":false}},{"id":"ANIM_196_SPECTRAL_VAPOR_SWAY","name":"Spectral Vapor Sway","category":"Uncanny & Creepy","duration":3.8000000000000003,"loop":false,"defExpr":2,"archType":"HORROR","params":{"seed":50,"speed":49,"amp":0.05,"rotMult":2,"horror":0.9,"pupilMin":0.26,"pupilMax":1.4,"jaw":0.4,"noBlink":true}},{"id":"ANIM_197_DISTORTED_ECHO_SHRIEK","name":"Distorted Echo Shriek","category":"Uncanny & Creepy","duration":4.2,"loop":false,"defExpr":9,"archType":"HORROR","params":{"seed":51,"speed":55,"amp":0.07,"rotMult":2.6,"horror":1,"pupilMin":0.33999999999999997,"pupilMax":1.55,"jaw":0.55,"noBlink":false}},{"id":"ANIM_198_PHANTOM_FINGER_TAP","name":"Phantom Finger Tap","category":"Uncanny & Creepy","duration":2.2,"loop":true,"defExpr":14,"archType":"HORROR","params":{"seed":52,"speed":25,"amp":0.09,"rotMult":3.2,"horror":0.8,"pupilMin":0.18,"pupilMax":1.25,"jaw":0.7,"noBlink":true}},{"id":"ANIM_199_FORBIDDEN_RITE_CHANT","name":"Forbidden Rite Chant","category":"Uncanny & Creepy","duration":2.6,"loop":false,"defExpr":11,"archType":"HORROR","params":{"seed":53,"speed":31,"amp":0.11,"rotMult":3.8,"horror":0.9,"pupilMin":0.26,"pupilMax":1.4,"jaw":0.85,"noBlink":false}},{"id":"ANIM_200_CRYPTID_MOTION_BLUR","name":"Cryptid Motion Blur","category":"Uncanny & Creepy","duration":3,"loop":false,"defExpr":2,"archType":"HORROR","params":{"seed":54,"speed":37,"amp":0.13,"rotMult":2,"horror":1,"pupilMin":0.33999999999999997,"pupilMax":1.55,"jaw":0.4,"noBlink":true}},{"id":"ANIM_201_MATRIX_CODE_RAIN","name":"Matrix Code Rain","category":"Technical & Analytical","duration":2,"loop":true,"defExpr":4,"archType":"TECH","params":{"sweeps":2,"angle":0.35,"pitch":0.12,"zoom":0.18}},{"id":"ANIM_202_HEAP_OVERFLOW_TREMOR","name":"Heap Overflow Tremor","category":"Technical & Analytical","duration":2.35,"loop":false,"defExpr":0,"archType":"TECH","params":{"sweeps":3,"angle":0.43,"pitch":0.16999999999999998,"zoom":0.24}},{"id":"ANIM_203_STACK_TRACE_DISSECT","name":"Stack Trace Dissect","category":"Technical & Analytical","duration":2.7,"loop":false,"defExpr":12,"archType":"TECH","params":{"sweeps":4,"angle":0.51,"pitch":0.22,"zoom":0.3}},{"id":"ANIM_204_QUANTUM_DECOHERENCE","name":"Quantum Decoherence","category":"Technical & Analytical","duration":3.05,"loop":false,"defExpr":1,"archType":"TECH","params":{"sweeps":5,"angle":0.59,"pitch":0.12,"zoom":0.18}},{"id":"ANIM_205_BINARY_CLOCK_PULSE","name":"Binary Clock Pulse","category":"Technical & Analytical","duration":3.4,"loop":false,"defExpr":4,"archType":"TECH","params":{"sweeps":2,"angle":0.35,"pitch":0.16999999999999998,"zoom":0.24}},{"id":"ANIM_206_SHADER_RECOMPILE_STUTTER","name":"Shader Recompile Stutter","category":"Technical & Analytical","duration":2,"loop":true,"defExpr":0,"archType":"TECH","params":{"sweeps":3,"angle":0.43,"pitch":0.22,"zoom":0.3}},{"id":"ANIM_207_NEURAL_WEIGHT_BACKPROP","name":"Neural Weight Backprop","category":"Technical & Analytical","duration":2.35,"loop":false,"defExpr":12,"archType":"TECH","params":{"sweeps":4,"angle":0.51,"pitch":0.12,"zoom":0.18}},{"id":"ANIM_208_ASSEMBLY_OPCODE_STEP","name":"Assembly Opcode Step","category":"Technical & Analytical","duration":2.7,"loop":false,"defExpr":1,"archType":"TECH","params":{"sweeps":5,"angle":0.59,"pitch":0.16999999999999998,"zoom":0.24}},{"id":"ANIM_209_GARBAGE_COLLECTION_SWEEP","name":"Garbage Collection Sweep","category":"Technical & Analytical","duration":3.05,"loop":false,"defExpr":4,"archType":"TECH","params":{"sweeps":2,"angle":0.35,"pitch":0.22,"zoom":0.3}},{"id":"ANIM_210_MEMORY_LEAK_EXPANSION","name":"Memory Leak Expansion","category":"Technical & Analytical","duration":3.4,"loop":false,"defExpr":0,"archType":"TECH","params":{"sweeps":3,"angle":0.43,"pitch":0.12,"zoom":0.18}},{"id":"ANIM_211_KERNEL_THREAD_SPINLOCK","name":"Kernel Thread Spinlock","category":"Technical & Analytical","duration":2,"loop":true,"defExpr":12,"archType":"TECH","params":{"sweeps":4,"angle":0.51,"pitch":0.16999999999999998,"zoom":0.24}},{"id":"ANIM_212_OSCILLOSCOPE_WAVE_TRACE","name":"Oscilloscope Wave Trace","category":"Technical & Analytical","duration":2.35,"loop":false,"defExpr":1,"archType":"TECH","params":{"sweeps":5,"angle":0.59,"pitch":0.22,"zoom":0.3}},{"id":"ANIM_213_LOGIC_GATE_TRANSITION","name":"Logic Gate Transition","category":"Technical & Analytical","duration":2.7,"loop":false,"defExpr":4,"archType":"TECH","params":{"sweeps":2,"angle":0.35,"pitch":0.12,"zoom":0.18}},{"id":"ANIM_214_CACHE_LINE_INVALIDATION","name":"Cache Line Invalidation","category":"Technical & Analytical","duration":3.05,"loop":false,"defExpr":0,"archType":"TECH","params":{"sweeps":3,"angle":0.43,"pitch":0.16999999999999998,"zoom":0.24}},{"id":"ANIM_215_ENDIANNESS_SWAP_TWIST","name":"Endianness Swap Twist","category":"Technical & Analytical","duration":3.4,"loop":false,"defExpr":12,"archType":"TECH","params":{"sweeps":4,"angle":0.51,"pitch":0.22,"zoom":0.3}},{"id":"ANIM_216_BITWISE_XOR_SCRAMBLE","name":"Bitwise XOR Scramble","category":"Technical & Analytical","duration":2,"loop":true,"defExpr":1,"archType":"TECH","params":{"sweeps":5,"angle":0.59,"pitch":0.12,"zoom":0.18}},{"id":"ANIM_217_FLOATING_POINT_ROUNDOFF","name":"Floating Point Roundoff","category":"Technical & Analytical","duration":2.35,"loop":false,"defExpr":4,"archType":"TECH","params":{"sweeps":2,"angle":0.35,"pitch":0.16999999999999998,"zoom":0.24}},{"id":"ANIM_218_GIT_REBASE_CONFLICT","name":"Git Rebase Conflict","category":"Technical & Analytical","duration":2.7,"loop":false,"defExpr":0,"archType":"TECH","params":{"sweeps":3,"angle":0.43,"pitch":0.22,"zoom":0.3}},{"id":"ANIM_219_DEADLOCK_CYCLE_DETECT","name":"Deadlock Cycle Detect","category":"Technical & Analytical","duration":3.05,"loop":false,"defExpr":12,"archType":"TECH","params":{"sweeps":4,"angle":0.51,"pitch":0.12,"zoom":0.18}},{"id":"ANIM_220_PACKET_SNIFFER_SWEEP","name":"Packet Sniffer Sweep","category":"Technical & Analytical","duration":3.4,"loop":false,"defExpr":1,"archType":"TECH","params":{"sweeps":5,"angle":0.59,"pitch":0.16999999999999998,"zoom":0.24}},{"id":"ANIM_221_CRYPTOGRAPHIC_HASH_COMPUTE","name":"Cryptographic Hash Compute","category":"Technical & Analytical","duration":2,"loop":true,"defExpr":4,"archType":"TECH","params":{"sweeps":2,"angle":0.35,"pitch":0.22,"zoom":0.3}},{"id":"ANIM_222_ZERO_DAY_EXPLOIT_PROBE","name":"Zero-Day Exploit Probe","category":"Technical & Analytical","duration":2.35,"loop":false,"defExpr":0,"archType":"TECH","params":{"sweeps":3,"angle":0.43,"pitch":0.12,"zoom":0.18}},{"id":"ANIM_223_SPECTRE_BRANCH_MISPREDICT","name":"Spectre Branch Mispredict","category":"Technical & Analytical","duration":2.7,"loop":false,"defExpr":12,"archType":"TECH","params":{"sweeps":4,"angle":0.51,"pitch":0.16999999999999998,"zoom":0.24}},{"id":"ANIM_224_MICROCODE_PATCH_FLASH","name":"Microcode Patch Flash","category":"Technical & Analytical","duration":3.05,"loop":false,"defExpr":1,"archType":"TECH","params":{"sweeps":5,"angle":0.59,"pitch":0.22,"zoom":0.3}},{"id":"ANIM_225_DMA_BUFFER_TRANSFER","name":"DMA Buffer Transfer","category":"Technical & Analytical","duration":3.4,"loop":false,"defExpr":4,"archType":"TECH","params":{"sweeps":2,"angle":0.35,"pitch":0.12,"zoom":0.18}},{"id":"ANIM_226_HEURISTIC_TREE_SEARCH","name":"Heuristic Tree Search","category":"Technical & Analytical","duration":2,"loop":true,"defExpr":0,"archType":"TECH","params":{"sweeps":3,"angle":0.43,"pitch":0.16999999999999998,"zoom":0.24}},{"id":"ANIM_227_RAYTRACING_BVH_TRAVERSE","name":"Raytracing BVH Traverse","category":"Technical & Analytical","duration":2.35,"loop":false,"defExpr":12,"archType":"TECH","params":{"sweeps":4,"angle":0.51,"pitch":0.22,"zoom":0.3}},{"id":"ANIM_228_GPU_COMPUTE_SHADER_DISPATCH","name":"GPU Compute Shader Dispatch","category":"Technical & Analytical","duration":2.7,"loop":false,"defExpr":1,"archType":"TECH","params":{"sweeps":5,"angle":0.59,"pitch":0.12,"zoom":0.18}},{"id":"ANIM_229_FAST_FOURIER_TRANSFORM","name":"Fast Fourier Transform","category":"Technical & Analytical","duration":3.05,"loop":false,"defExpr":4,"archType":"TECH","params":{"sweeps":2,"angle":0.35,"pitch":0.16999999999999998,"zoom":0.24}},{"id":"ANIM_230_PID_CONTROLLER_DAMPEN","name":"PID Controller Dampen","category":"Technical & Analytical","duration":3.4,"loop":false,"defExpr":0,"archType":"TECH","params":{"sweeps":3,"angle":0.43,"pitch":0.22,"zoom":0.3}},{"id":"ANIM_231_LEXER_TOKENIZER_CHEW","name":"Lexer Tokenizer Chew","category":"Technical & Analytical","duration":2,"loop":true,"defExpr":12,"archType":"TECH","params":{"sweeps":4,"angle":0.51,"pitch":0.12,"zoom":0.18}},{"id":"ANIM_232_B_TREE_NODE_REBALANCE","name":"B-Tree Node Rebalance","category":"Technical & Analytical","duration":2.35,"loop":false,"defExpr":1,"archType":"TECH","params":{"sweeps":5,"angle":0.59,"pitch":0.16999999999999998,"zoom":0.24}},{"id":"ANIM_233_PAGE_FAULT_PAGE_IN","name":"Page Fault Page In","category":"Technical & Analytical","duration":2.7,"loop":false,"defExpr":4,"archType":"TECH","params":{"sweeps":2,"angle":0.35,"pitch":0.22,"zoom":0.3}},{"id":"ANIM_234_CONTEXT_SWITCH_LATENCY","name":"Context Switch Latency","category":"Technical & Analytical","duration":3.05,"loop":false,"defExpr":0,"archType":"TECH","params":{"sweeps":3,"angle":0.43,"pitch":0.12,"zoom":0.18}},{"id":"ANIM_235_PIPELINE_HAZARD_STALL","name":"Pipeline Hazard Stall","category":"Technical & Analytical","duration":3.4,"loop":false,"defExpr":12,"archType":"TECH","params":{"sweeps":4,"angle":0.51,"pitch":0.16999999999999998,"zoom":0.24}},{"id":"ANIM_236_CORE_DUMP_DIAGNOSTIC","name":"Core Dump Diagnostic","category":"Technical & Analytical","duration":2,"loop":true,"defExpr":1,"archType":"TECH","params":{"sweeps":5,"angle":0.59,"pitch":0.22,"zoom":0.3}},{"id":"ANIM_237_INTEGER_UNDERFLOW_WRAP","name":"Integer Underflow Wrap","category":"Technical & Analytical","duration":2.35,"loop":false,"defExpr":4,"archType":"TECH","params":{"sweeps":2,"angle":0.35,"pitch":0.12,"zoom":0.18}},{"id":"ANIM_238_RACE_CONDITION_JITTER","name":"Race Condition Jitter","category":"Technical & Analytical","duration":2.7,"loop":false,"defExpr":0,"archType":"TECH","params":{"sweeps":3,"angle":0.43,"pitch":0.16999999999999998,"zoom":0.24}},{"id":"ANIM_239_TCP_SYN_FLOOD_SHUDDER","name":"TCP SYN Flood Shudder","category":"Technical & Analytical","duration":3.05,"loop":false,"defExpr":12,"archType":"TECH","params":{"sweeps":4,"angle":0.51,"pitch":0.22,"zoom":0.3}},{"id":"ANIM_240_DECRYPTION_KEY_MATCH","name":"Decryption Key Match","category":"Technical & Analytical","duration":3.4,"loop":false,"defExpr":1,"archType":"TECH","params":{"sweeps":5,"angle":0.59,"pitch":0.12,"zoom":0.18}},{"id":"ANIM_241_SPECTROGRAM_FREQUENCY_SCAN","name":"Spectrogram Frequency Scan","category":"Technical & Analytical","duration":2,"loop":true,"defExpr":4,"archType":"TECH","params":{"sweeps":2,"angle":0.35,"pitch":0.16999999999999998,"zoom":0.24}},{"id":"ANIM_242_QUANTUM_ENTANGLEMENT_SPIN","name":"Quantum Entanglement Spin","category":"Technical & Analytical","duration":2.35,"loop":false,"defExpr":0,"archType":"TECH","params":{"sweeps":3,"angle":0.43,"pitch":0.22,"zoom":0.3}},{"id":"ANIM_243_FIRMWARE_FLASH_WRITE","name":"Firmware Flash Write","category":"Technical & Analytical","duration":2.7,"loop":false,"defExpr":12,"archType":"TECH","params":{"sweeps":4,"angle":0.51,"pitch":0.12,"zoom":0.18}},{"id":"ANIM_244_CLOCK_CYCLE_OVERCLOCK","name":"Clock Cycle Overclock","category":"Technical & Analytical","duration":3.05,"loop":false,"defExpr":1,"archType":"TECH","params":{"sweeps":5,"angle":0.59,"pitch":0.16999999999999998,"zoom":0.24}},{"id":"ANIM_245_SINGULARITY_COMPUTE_PEAK","name":"Singularity Compute Peak","category":"Technical & Analytical","duration":3.4,"loop":false,"defExpr":4,"archType":"TECH","params":{"sweeps":2,"angle":0.35,"pitch":0.22,"zoom":0.3}},{"id":"ANIM_246_SLOW_CLAP_SARCASM","name":"Slow Clap Sarcasm","category":"Skeptical & Sarcastic","duration":1.8,"loop":true,"defExpr":1,"archType":"SARCASTIC","params":{"yaw":0.25,"pitch":-0.12,"roll":-0.1}},{"id":"ANIM_247_EYEBROW_ARCH_DISDAIN","name":"Eyebrow Arch Disdain","category":"Skeptical & Sarcastic","duration":2.1,"loop":false,"defExpr":12,"archType":"SARCASTIC","params":{"yaw":0.33,"pitch":-0.16999999999999998,"roll":-0.14}},{"id":"ANIM_248_CONDESCENDING_CIRCLE","name":"Condescending Circle","category":"Skeptical & Sarcastic","duration":2.4,"loop":false,"defExpr":4,"archType":"SARCASTIC","params":{"yaw":0.41000000000000003,"pitch":-0.22,"roll":-0.18}},{"id":"ANIM_249_EYE_ROLL_ORBIT","name":"Eye Roll Orbit","category":"Skeptical & Sarcastic","duration":2.7,"loop":false,"defExpr":3,"archType":"SARCASTIC","params":{"yaw":0.49,"pitch":-0.12,"roll":-0.1}},{"id":"ANIM_250_SARCASTIC_SNOOZE","name":"Sarcastic Snooze","category":"Skeptical & Sarcastic","duration":3,"loop":false,"defExpr":1,"archType":"SARCASTIC","params":{"yaw":0.25,"pitch":-0.16999999999999998,"roll":-0.14}},{"id":"ANIM_251_SMUG_SNORT_CHUCKLE","name":"Smug Snort Chuckle","category":"Skeptical & Sarcastic","duration":1.8,"loop":false,"defExpr":12,"archType":"SARCASTIC","params":{"yaw":0.33,"pitch":-0.22,"roll":-0.18}},{"id":"ANIM_252_DOUBTFUL_HEAD_TILT","name":"Doubtful Head Tilt","category":"Skeptical & Sarcastic","duration":2.1,"loop":true,"defExpr":4,"archType":"SARCASTIC","params":{"yaw":0.41000000000000003,"pitch":-0.12,"roll":-0.1}},{"id":"ANIM_253_ARE_YOU_SERIOUS_STARE","name":"Are You Serious Stare","category":"Skeptical & Sarcastic","duration":2.4,"loop":false,"defExpr":3,"archType":"SARCASTIC","params":{"yaw":0.49,"pitch":-0.16999999999999998,"roll":-0.14}},{"id":"ANIM_254_PATRONIZING_PAT","name":"Patronizing Pat","category":"Skeptical & Sarcastic","duration":2.7,"loop":false,"defExpr":1,"archType":"SARCASTIC","params":{"yaw":0.25,"pitch":-0.22,"roll":-0.18}},{"id":"ANIM_255_MOCK_SYMPATHY_POUT","name":"Mock Sympathy Pout","category":"Skeptical & Sarcastic","duration":3,"loop":false,"defExpr":12,"archType":"SARCASTIC","params":{"yaw":0.33,"pitch":-0.12,"roll":-0.1}},{"id":"ANIM_256_HEAVY_BROW_SKEPTICISM","name":"Heavy Brow Skepticism","category":"Skeptical & Sarcastic","duration":1.8,"loop":false,"defExpr":4,"archType":"SARCASTIC","params":{"yaw":0.41000000000000003,"pitch":-0.16999999999999998,"roll":-0.14}},{"id":"ANIM_257_DISAPPOINTED_SIGH_TILT","name":"Disappointed Sigh Tilt","category":"Skeptical & Sarcastic","duration":2.1,"loop":false,"defExpr":3,"archType":"SARCASTIC","params":{"yaw":0.49,"pitch":-0.22,"roll":-0.18}},{"id":"ANIM_258_SIDE_EYE_JUDGMENT","name":"Side-Eye Judgment","category":"Skeptical & Sarcastic","duration":2.4,"loop":true,"defExpr":1,"archType":"SARCASTIC","params":{"yaw":0.25,"pitch":-0.12,"roll":-0.1}},{"id":"ANIM_259_RIGHT_AN_ARCHED_BROW","name":"Right An Arched Brow","category":"Skeptical & Sarcastic","duration":2.7,"loop":false,"defExpr":12,"archType":"SARCASTIC","params":{"yaw":0.33,"pitch":-0.16999999999999998,"roll":-0.14}},{"id":"ANIM_260_CYNICAL_GLINT_HOLD","name":"Cynical Glint Hold","category":"Skeptical & Sarcastic","duration":3,"loop":false,"defExpr":4,"archType":"SARCASTIC","params":{"yaw":0.41000000000000003,"pitch":-0.22,"roll":-0.18}},{"id":"ANIM_261_BORED_WATCH_CHECK","name":"Bored Watch Check","category":"Skeptical & Sarcastic","duration":1.8,"loop":false,"defExpr":3,"archType":"SARCASTIC","params":{"yaw":0.49,"pitch":-0.12,"roll":-0.1}},{"id":"ANIM_262_EXAGGERATED_YAWN_NOD","name":"Exaggerated Yawn Nod","category":"Skeptical & Sarcastic","duration":2.1,"loop":false,"defExpr":1,"archType":"SARCASTIC","params":{"yaw":0.25,"pitch":-0.16999999999999998,"roll":-0.14}},{"id":"ANIM_263_PASSIVE_AGGRESSIVE_NOD","name":"Passive Aggressive Nod","category":"Skeptical & Sarcastic","duration":2.4,"loop":false,"defExpr":12,"archType":"SARCASTIC","params":{"yaw":0.33,"pitch":-0.22,"roll":-0.18}},{"id":"ANIM_264_YEAH_RIGHT_SARCASTIC_SHRUG","name":"Yeah Right Sarcastic Shrug","category":"Skeptical & Sarcastic","duration":2.7,"loop":true,"defExpr":4,"archType":"SARCASTIC","params":{"yaw":0.41000000000000003,"pitch":-0.12,"roll":-0.1}},{"id":"ANIM_265_DUMBFOUNDED_BROW_FURROW","name":"Dumbfounded Brow Furrow","category":"Skeptical & Sarcastic","duration":3,"loop":false,"defExpr":3,"archType":"SARCASTIC","params":{"yaw":0.49,"pitch":-0.16999999999999998,"roll":-0.14}},{"id":"ANIM_266_WHATEVER_HANDWAVE","name":"Whatever Handwave","category":"Skeptical & Sarcastic","duration":1.8,"loop":false,"defExpr":1,"archType":"SARCASTIC","params":{"yaw":0.25,"pitch":-0.22,"roll":-0.18}},{"id":"ANIM_267_SKEPTICAL_SQUINT_NARROW","name":"Skeptical Squint Narrow","category":"Skeptical & Sarcastic","duration":2.1,"loop":false,"defExpr":12,"archType":"SARCASTIC","params":{"yaw":0.33,"pitch":-0.12,"roll":-0.1}},{"id":"ANIM_268_TSK_TSK_HEAD_SHAKE","name":"Tsk Tsk Head Shake","category":"Skeptical & Sarcastic","duration":2.4,"loop":false,"defExpr":4,"archType":"SARCASTIC","params":{"yaw":0.41000000000000003,"pitch":-0.16999999999999998,"roll":-0.14}},{"id":"ANIM_269_SARDONIC_HALF_SMIRK","name":"Sardonic Half Smirk","category":"Skeptical & Sarcastic","duration":2.7,"loop":false,"defExpr":3,"archType":"SARCASTIC","params":{"yaw":0.49,"pitch":-0.22,"roll":-0.18}},{"id":"ANIM_270_IRONY_METER_EXPLODE","name":"Irony Meter Explode","category":"Skeptical & Sarcastic","duration":3,"loop":true,"defExpr":1,"archType":"SARCASTIC","params":{"yaw":0.25,"pitch":-0.12,"roll":-0.1}},{"id":"ANIM_271_DERISIVE_SNICKER_TWIST","name":"Derisive Snicker Twist","category":"Skeptical & Sarcastic","duration":1.8,"loop":false,"defExpr":12,"archType":"SARCASTIC","params":{"yaw":0.33,"pitch":-0.16999999999999998,"roll":-0.14}},{"id":"ANIM_272_TELL_ME_MORE_LIE_LEAN","name":"Tell Me More Lie Lean","category":"Skeptical & Sarcastic","duration":2.1,"loop":false,"defExpr":4,"archType":"SARCASTIC","params":{"yaw":0.41000000000000003,"pitch":-0.22,"roll":-0.18}},{"id":"ANIM_273_MOCK_APPLAUSE_TILT","name":"Mock Applause Tilt","category":"Skeptical & Sarcastic","duration":2.4,"loop":false,"defExpr":3,"archType":"SARCASTIC","params":{"yaw":0.49,"pitch":-0.12,"roll":-0.1}},{"id":"ANIM_274_FACEPALM_RECOVERY_HOLD","name":"Facepalm Recovery Hold","category":"Skeptical & Sarcastic","duration":2.7,"loop":false,"defExpr":1,"archType":"SARCASTIC","params":{"yaw":0.25,"pitch":-0.16999999999999998,"roll":-0.14}},{"id":"ANIM_275_CONDESCENDING_FINGER_WAG","name":"Condescending Finger Wag","category":"Skeptical & Sarcastic","duration":3,"loop":false,"defExpr":12,"archType":"SARCASTIC","params":{"yaw":0.33,"pitch":-0.22,"roll":-0.18}},{"id":"ANIM_276_SKEPTICAL_MAGNIFYING_GAZE","name":"Skeptical Magnifying Gaze","category":"Skeptical & Sarcastic","duration":1.8,"loop":true,"defExpr":4,"archType":"SARCASTIC","params":{"yaw":0.41000000000000003,"pitch":-0.12,"roll":-0.1}},{"id":"ANIM_277_UNIMPRESSED_DEADPAN_HOLD","name":"Unimpressed Deadpan Hold","category":"Skeptical & Sarcastic","duration":2.1,"loop":false,"defExpr":3,"archType":"SARCASTIC","params":{"yaw":0.49,"pitch":-0.16999999999999998,"roll":-0.14}},{"id":"ANIM_278_EYE_ROLL_CEILING_TRACE","name":"Eye Roll Ceiling Trace","category":"Skeptical & Sarcastic","duration":2.4,"loop":false,"defExpr":1,"archType":"SARCASTIC","params":{"yaw":0.25,"pitch":-0.22,"roll":-0.18}},{"id":"ANIM_279_DRAMATIC_SARCASM_BOW","name":"Dramatic Sarcasm Bow","category":"Skeptical & Sarcastic","duration":2.7,"loop":false,"defExpr":12,"archType":"SARCASTIC","params":{"yaw":0.33,"pitch":-0.12,"roll":-0.1}},{"id":"ANIM_280_SMUG_DISMISSAL_SWIVEL","name":"Smug Dismissal Swivel","category":"Skeptical & Sarcastic","duration":3,"loop":false,"defExpr":4,"archType":"SARCASTIC","params":{"yaw":0.41000000000000003,"pitch":-0.16999999999999998,"roll":-0.14}},{"id":"ANIM_281_DOUBTFUL_SQUINT_RECOIL","name":"Doubtful Squint Recoil","category":"Skeptical & Sarcastic","duration":1.8,"loop":false,"defExpr":3,"archType":"SARCASTIC","params":{"yaw":0.49,"pitch":-0.22,"roll":-0.18}},{"id":"ANIM_282_FAKE_ENTHUSIASM_GRIN","name":"Fake Enthusiasm Grin","category":"Skeptical & Sarcastic","duration":2.1,"loop":true,"defExpr":1,"archType":"SARCASTIC","params":{"yaw":0.25,"pitch":-0.12,"roll":-0.1}},{"id":"ANIM_283_UNAMUSED_STONE_FACE","name":"Unamused Stone Face","category":"Skeptical & Sarcastic","duration":2.4,"loop":false,"defExpr":12,"archType":"SARCASTIC","params":{"yaw":0.33,"pitch":-0.16999999999999998,"roll":-0.14}},{"id":"ANIM_284_SARCASTIC_WOW_JAW_DROP","name":"Sarcastic Wow Jaw Drop","category":"Skeptical & Sarcastic","duration":2.7,"loop":false,"defExpr":4,"archType":"SARCASTIC","params":{"yaw":0.41000000000000003,"pitch":-0.22,"roll":-0.18}},{"id":"ANIM_285_SNARKY_CHIN_REST","name":"Snarky Chin Rest","category":"Skeptical & Sarcastic","duration":3,"loop":false,"defExpr":3,"archType":"SARCASTIC","params":{"yaw":0.49,"pitch":-0.12,"roll":-0.1}},{"id":"ANIM_286_BLUE_SCREEN_SEIZURE","name":"Blue Screen Seizure","category":"Shock & Panic","duration":1.6,"loop":true,"defExpr":7,"archType":"PANIC","params":{"tremor":0.06}},{"id":"ANIM_287_KERNEL_PANIC_MELTDOWN","name":"Kernel Panic Meltdown","category":"Shock & Panic","duration":1.9000000000000001,"loop":false,"defExpr":14,"archType":"PANIC","params":{"tremor":0.08499999999999999}},{"id":"ANIM_288_OUT_OF_MEMORY_GASP","name":"Out Of Memory Gasp","category":"Shock & Panic","duration":2.2,"loop":false,"defExpr":11,"archType":"PANIC","params":{"tremor":0.11}},{"id":"ANIM_289_ELECTROCUTION_BUZZ","name":"Electrocution Buzz","category":"Shock & Panic","duration":2.5,"loop":false,"defExpr":7,"archType":"PANIC","params":{"tremor":0.135}},{"id":"ANIM_290_METEOR_ALERT_TREMOR","name":"Meteor Alert Tremor","category":"Shock & Panic","duration":2.8,"loop":false,"defExpr":14,"archType":"PANIC","params":{"tremor":0.06}},{"id":"ANIM_291_DATABASE_DROPPED_SHUDDER","name":"Database Dropped Shudder","category":"Shock & Panic","duration":1.6,"loop":false,"defExpr":11,"archType":"PANIC","params":{"tremor":0.08499999999999999}},{"id":"ANIM_292_PRODUCTION_DOWN_SCREAM","name":"Production Down Scream","category":"Shock & Panic","duration":1.9000000000000001,"loop":false,"defExpr":7,"archType":"PANIC","params":{"tremor":0.11}},{"id":"ANIM_293_FIRE_ALARM_DASH","name":"Fire Alarm Dash","category":"Shock & Panic","duration":2.2,"loop":true,"defExpr":14,"archType":"PANIC","params":{"tremor":0.135}},{"id":"ANIM_294_HYPERVENTILATION_PUMP","name":"Hyperventilation Pump","category":"Shock & Panic","duration":2.5,"loop":false,"defExpr":11,"archType":"PANIC","params":{"tremor":0.06}},{"id":"ANIM_295_TOTAL_SYSTEM_COLLAPSE","name":"Total System Collapse","category":"Shock & Panic","duration":2.8,"loop":false,"defExpr":7,"archType":"PANIC","params":{"tremor":0.08499999999999999}},{"id":"ANIM_296_HEART_ATTACK_FREEZE","name":"Heart Attack Freeze","category":"Shock & Panic","duration":1.6,"loop":false,"defExpr":14,"archType":"PANIC","params":{"tremor":0.11}},{"id":"ANIM_297_CATASTROPHIC_FAILURE_GLITCH","name":"Catastrophic Failure Glitch","category":"Shock & Panic","duration":1.9000000000000001,"loop":false,"defExpr":11,"archType":"PANIC","params":{"tremor":0.135}},{"id":"ANIM_298_EMERGENCY_CORE_DUMP","name":"Emergency Core Dump","category":"Shock & Panic","duration":2.2,"loop":false,"defExpr":7,"archType":"PANIC","params":{"tremor":0.06}},{"id":"ANIM_299_SPONTANEOUS_IMPLOSION_SHOCK","name":"Spontaneous Implosion Shock","category":"Shock & Panic","duration":2.5,"loop":false,"defExpr":14,"archType":"PANIC","params":{"tremor":0.08499999999999999}},{"id":"ANIM_300_SUDDEN_DISCOVERY_RECOIL","name":"Sudden Discovery Recoil","category":"Shock & Panic","duration":2.8,"loop":true,"defExpr":11,"archType":"PANIC","params":{"tremor":0.11}},{"id":"ANIM_301_SCREAMING_VOID_SPIRAL","name":"Screaming Void Spiral","category":"Shock & Panic","duration":1.6,"loop":false,"defExpr":7,"archType":"PANIC","params":{"tremor":0.135}},{"id":"ANIM_302_TREMBLING_HANDS_HOLD","name":"Trembling Hands Hold","category":"Shock & Panic","duration":1.9000000000000001,"loop":false,"defExpr":14,"archType":"PANIC","params":{"tremor":0.06}},{"id":"ANIM_303_NUCLEAR_MELTDOWN_FLASH","name":"Nuclear Meltdown Flash","category":"Shock & Panic","duration":2.2,"loop":false,"defExpr":11,"archType":"PANIC","params":{"tremor":0.08499999999999999}},{"id":"ANIM_304_PARALYZED_DREAD_FREEZE","name":"Paralyzed Dread Freeze","category":"Shock & Panic","duration":2.5,"loop":false,"defExpr":7,"archType":"PANIC","params":{"tremor":0.11}},{"id":"ANIM_305_UNCAUGHT_EXCEPTION_SHOCK","name":"Uncaught Exception Shock","category":"Shock & Panic","duration":2.8,"loop":false,"defExpr":14,"archType":"PANIC","params":{"tremor":0.135}},{"id":"ANIM_306_SPILLED_COFFEE_PANIC","name":"Spilled Coffee Panic","category":"Shock & Panic","duration":1.6,"loop":false,"defExpr":11,"archType":"PANIC","params":{"tremor":0.06}},{"id":"ANIM_307_UNSAVED_WORK_LOST_CRY","name":"Unsaved Work Lost Cry","category":"Shock & Panic","duration":1.9000000000000001,"loop":true,"defExpr":7,"archType":"PANIC","params":{"tremor":0.08499999999999999}},{"id":"ANIM_308_SERVER_ON_FIRE_BUZZ","name":"Server On Fire Buzz","category":"Shock & Panic","duration":2.2,"loop":false,"defExpr":14,"archType":"PANIC","params":{"tremor":0.11}},{"id":"ANIM_309_RUNAWAY_PROCESS_SPIKE","name":"Runaway Process Spike","category":"Shock & Panic","duration":2.5,"loop":false,"defExpr":11,"archType":"PANIC","params":{"tremor":0.135}},{"id":"ANIM_310_OVERVOLTAGE_SPARK_SHIVER","name":"Overvoltage Spark Shiver","category":"Shock & Panic","duration":2.8,"loop":false,"defExpr":7,"archType":"PANIC","params":{"tremor":0.06}},{"id":"ANIM_311_ALARM_SIREN_WOBBLE","name":"Alarm Siren Wobble","category":"Shock & Panic","duration":1.6,"loop":false,"defExpr":14,"archType":"PANIC","params":{"tremor":0.08499999999999999}},{"id":"ANIM_312_FALLING_FROM_SKY_DROP","name":"Falling From Sky Drop","category":"Shock & Panic","duration":1.9000000000000001,"loop":false,"defExpr":11,"archType":"PANIC","params":{"tremor":0.11}},{"id":"ANIM_313_TORNADO_SPIN_PANIC","name":"Tornado Spin Panic","category":"Shock & Panic","duration":2.2,"loop":false,"defExpr":7,"archType":"PANIC","params":{"tremor":0.135}},{"id":"ANIM_314_CAUGHT_RED_HANDED_FREEZE","name":"Caught Red Handed Freeze","category":"Shock & Panic","duration":2.5,"loop":true,"defExpr":14,"archType":"PANIC","params":{"tremor":0.06}},{"id":"ANIM_315_HORRIFIED_JAW_DISJOINT","name":"Horrified Jaw Disjoint","category":"Shock & Panic","duration":2.8,"loop":false,"defExpr":11,"archType":"PANIC","params":{"tremor":0.08499999999999999}},{"id":"ANIM_316_SUDDEN_BLACKOUT_SHOCK","name":"Sudden Blackout Shock","category":"Shock & Panic","duration":1.6,"loop":false,"defExpr":7,"archType":"PANIC","params":{"tremor":0.11}},{"id":"ANIM_317_SECURITY_BREACH_ALARM","name":"Security Breach Alarm","category":"Shock & Panic","duration":1.9000000000000001,"loop":false,"defExpr":14,"archType":"PANIC","params":{"tremor":0.135}},{"id":"ANIM_318_CORRUPTED_BACKUP_TERROR","name":"Corrupted Backup Terror","category":"Shock & Panic","duration":2.2,"loop":false,"defExpr":11,"archType":"PANIC","params":{"tremor":0.06}},{"id":"ANIM_319_EXPLODING_CAPACITOR_BANG","name":"Exploding Capacitor Bang","category":"Shock & Panic","duration":2.5,"loop":false,"defExpr":7,"archType":"PANIC","params":{"tremor":0.08499999999999999}},{"id":"ANIM_320_THERMAL_THROTTLE_PANT","name":"Thermal Throttle Pant","category":"Shock & Panic","duration":2.8,"loop":false,"defExpr":14,"archType":"PANIC","params":{"tremor":0.11}},{"id":"ANIM_321_INFINITE_LOOP_FRENZY","name":"Infinite Loop Frenzy","category":"Shock & Panic","duration":1.6,"loop":true,"defExpr":11,"archType":"PANIC","params":{"tremor":0.135}},{"id":"ANIM_322_ZERO_DIVIDE_CATASTROPHE","name":"Zero Divide Catastrophe","category":"Shock & Panic","duration":1.9000000000000001,"loop":false,"defExpr":7,"archType":"PANIC","params":{"tremor":0.06}},{"id":"ANIM_323_WATCHDOG_TIMER_EXPIRY","name":"Watchdog Timer Expiry","category":"Shock & Panic","duration":2.2,"loop":false,"defExpr":14,"archType":"PANIC","params":{"tremor":0.08499999999999999}},{"id":"ANIM_324_STACK_BUFFER_OVERFLOW","name":"Stack Buffer Overflow","category":"Shock & Panic","duration":2.5,"loop":false,"defExpr":11,"archType":"PANIC","params":{"tremor":0.11}},{"id":"ANIM_325_WILD_POINTER_DEREFERENCE","name":"Wild Pointer Dereference","category":"Shock & Panic","duration":2.8,"loop":false,"defExpr":7,"archType":"PANIC","params":{"tremor":0.135}},{"id":"ANIM_326_SEGMENT_FAULT_PANIC","name":"Segment Fault Panic","category":"Shock & Panic","duration":1.6,"loop":false,"defExpr":14,"archType":"PANIC","params":{"tremor":0.06}},{"id":"ANIM_327_DISK_FULL_EMERGENCY","name":"Disk Full Emergency","category":"Shock & Panic","duration":1.9000000000000001,"loop":false,"defExpr":11,"archType":"PANIC","params":{"tremor":0.08499999999999999}},{"id":"ANIM_328_FIREWALL_PENETRATED","name":"Firewall Penetrated","category":"Shock & Panic","duration":2.2,"loop":true,"defExpr":7,"archType":"PANIC","params":{"tremor":0.11}},{"id":"ANIM_329_ROOT_COMPROMISED_SHOCK","name":"Root Compromised Shock","category":"Shock & Panic","duration":2.5,"loop":false,"defExpr":14,"archType":"PANIC","params":{"tremor":0.135}},{"id":"ANIM_330_CASCADE_COLLAPSE_TREMOR","name":"Cascade Collapse Tremor","category":"Shock & Panic","duration":2.8,"loop":false,"defExpr":11,"archType":"PANIC","params":{"tremor":0.06}},{"id":"ANIM_331_DEFLATED_PUDDLE_SINK","name":"Deflated Puddle Sink","category":"Melancholy & Vulnerable","duration":2.5,"loop":true,"defExpr":13,"archType":"MELANCHOLY","params":{"drop":0.25,"flatten":0.15,"spread":0.1,"headDown":0.18,"sigh":0.2}},{"id":"ANIM_332_COSMIC_LONELINESS_DRIFT","name":"Cosmic Loneliness Drift","category":"Melancholy & Vulnerable","duration":2.9,"loop":false,"defExpr":5,"archType":"MELANCHOLY","params":{"drop":0.31,"flatten":0.2,"spread":0.13,"headDown":0.22,"sigh":0.25}},{"id":"ANIM_333_BROKEN_VERTEX_WEEP","name":"Broken Vertex Weep","category":"Melancholy & Vulnerable","duration":3.3,"loop":false,"defExpr":1,"archType":"MELANCHOLY","params":{"drop":0.37,"flatten":0.25,"spread":0.16,"headDown":0.26,"sigh":0.30000000000000004}},{"id":"ANIM_334_404_SOUL_NOT_FOUND","name":"404 Soul Not Found","category":"Melancholy & Vulnerable","duration":3.7,"loop":false,"defExpr":13,"archType":"MELANCHOLY","params":{"drop":0.43,"flatten":0.15,"spread":0.1,"headDown":0.18,"sigh":0.2}},{"id":"ANIM_335_NOSTALGIA_GAZE_DISTANCE","name":"Nostalgia Gaze Distance","category":"Melancholy & Vulnerable","duration":4.1,"loop":false,"defExpr":5,"archType":"MELANCHOLY","params":{"drop":0.25,"flatten":0.2,"spread":0.13,"headDown":0.22,"sigh":0.25}},{"id":"ANIM_336_RAINDROP_WINDOW_PONDER","name":"Raindrop Window Ponder","category":"Melancholy & Vulnerable","duration":2.5,"loop":false,"defExpr":1,"archType":"MELANCHOLY","params":{"drop":0.31,"flatten":0.25,"spread":0.16,"headDown":0.26,"sigh":0.30000000000000004}},{"id":"ANIM_337_WILTED_FLOWER_DROOP","name":"Wilted Flower Droop","category":"Melancholy & Vulnerable","duration":2.9,"loop":true,"defExpr":13,"archType":"MELANCHOLY","params":{"drop":0.37,"flatten":0.15,"spread":0.1,"headDown":0.18,"sigh":0.2}},{"id":"ANIM_338_HEAVY_SIGH_DEFLATE_2","name":"Heavy Sigh Deflate 2","category":"Melancholy & Vulnerable","duration":3.3,"loop":false,"defExpr":5,"archType":"MELANCHOLY","params":{"drop":0.43,"flatten":0.2,"spread":0.13,"headDown":0.22,"sigh":0.25}},{"id":"ANIM_339_EXISTENTIAL_DREAD_CURL","name":"Existential Dread Curl","category":"Melancholy & Vulnerable","duration":3.7,"loop":false,"defExpr":1,"archType":"MELANCHOLY","params":{"drop":0.25,"flatten":0.25,"spread":0.16,"headDown":0.26,"sigh":0.30000000000000004}},{"id":"ANIM_340_FADING_TWILIGHT_DIM","name":"Fading Twilight Dim","category":"Melancholy & Vulnerable","duration":4.1,"loop":false,"defExpr":13,"archType":"MELANCHOLY","params":{"drop":0.31,"flatten":0.15,"spread":0.1,"headDown":0.18,"sigh":0.2}},{"id":"ANIM_341_ABANDONED_PROJECT_SIGH","name":"Abandoned Project Sigh","category":"Melancholy & Vulnerable","duration":2.5,"loop":false,"defExpr":5,"archType":"MELANCHOLY","params":{"drop":0.37,"flatten":0.2,"spread":0.13,"headDown":0.22,"sigh":0.25}},{"id":"ANIM_342_LONELY_STARLIGHT_FLOAT","name":"Lonely Starlight Float","category":"Melancholy & Vulnerable","duration":2.9,"loop":false,"defExpr":1,"archType":"MELANCHOLY","params":{"drop":0.43,"flatten":0.25,"spread":0.16,"headDown":0.26,"sigh":0.30000000000000004}},{"id":"ANIM_343_MELANCHOLY_AUTUMN_SWAY","name":"Melancholy Autumn Sway","category":"Melancholy & Vulnerable","duration":3.3,"loop":true,"defExpr":13,"archType":"MELANCHOLY","params":{"drop":0.25,"flatten":0.15,"spread":0.1,"headDown":0.18,"sigh":0.2}},{"id":"ANIM_344_UNREQUITED_LOVE_DROOP","name":"Unrequited Love Droop","category":"Melancholy & Vulnerable","duration":3.7,"loop":false,"defExpr":5,"archType":"MELANCHOLY","params":{"drop":0.31,"flatten":0.2,"spread":0.13,"headDown":0.22,"sigh":0.25}},{"id":"ANIM_345_QUIET_SORROW_LOWER","name":"Quiet Sorrow Lower","category":"Melancholy & Vulnerable","duration":4.1,"loop":false,"defExpr":1,"archType":"MELANCHOLY","params":{"drop":0.37,"flatten":0.25,"spread":0.16,"headDown":0.26,"sigh":0.30000000000000004}},{"id":"ANIM_346_DEPLETED_BATTERY_SLUMP","name":"Depleted Battery Slump","category":"Melancholy & Vulnerable","duration":2.5,"loop":false,"defExpr":13,"archType":"MELANCHOLY","params":{"drop":0.43,"flatten":0.15,"spread":0.1,"headDown":0.18,"sigh":0.2}},{"id":"ANIM_347_HOLLOW_INSIDE_SINK","name":"Hollow Inside Sink","category":"Melancholy & Vulnerable","duration":2.9,"loop":false,"defExpr":5,"archType":"MELANCHOLY","params":{"drop":0.25,"flatten":0.2,"spread":0.13,"headDown":0.22,"sigh":0.25}},{"id":"ANIM_348_TEARFUL_MICRO_GAZE","name":"Tearful Micro Gaze","category":"Melancholy & Vulnerable","duration":3.3,"loop":false,"defExpr":1,"archType":"MELANCHOLY","params":{"drop":0.31,"flatten":0.25,"spread":0.16,"headDown":0.26,"sigh":0.30000000000000004}},{"id":"ANIM_349_FORGOTTEN_MEMORY_FLOAT","name":"Forgotten Memory Float","category":"Melancholy & Vulnerable","duration":3.7,"loop":true,"defExpr":13,"archType":"MELANCHOLY","params":{"drop":0.37,"flatten":0.15,"spread":0.1,"headDown":0.18,"sigh":0.2}},{"id":"ANIM_350_GLOOMY_SHADOW_CREEP","name":"Gloomy Shadow Creep","category":"Melancholy & Vulnerable","duration":4.1,"loop":false,"defExpr":5,"archType":"MELANCHOLY","params":{"drop":0.43,"flatten":0.2,"spread":0.13,"headDown":0.22,"sigh":0.25}},{"id":"ANIM_351_WEARY_WORLD_WEARINESS","name":"Weary World Weariness","category":"Melancholy & Vulnerable","duration":2.5,"loop":false,"defExpr":1,"archType":"MELANCHOLY","params":{"drop":0.25,"flatten":0.25,"spread":0.16,"headDown":0.26,"sigh":0.30000000000000004}},{"id":"ANIM_352_FRAGILE_GLASS_STILLNESS","name":"Fragile Glass Stillness","category":"Melancholy & Vulnerable","duration":2.9,"loop":false,"defExpr":13,"archType":"MELANCHOLY","params":{"drop":0.31,"flatten":0.15,"spread":0.1,"headDown":0.18,"sigh":0.2}},{"id":"ANIM_353_SOMBER_DOWNWARD_GAZE","name":"Somber Downward Gaze","category":"Melancholy & Vulnerable","duration":3.3,"loop":false,"defExpr":5,"archType":"MELANCHOLY","params":{"drop":0.37,"flatten":0.2,"spread":0.13,"headDown":0.22,"sigh":0.25}},{"id":"ANIM_354_LOST_SIGNAL_FAINT","name":"Lost Signal Faint","category":"Melancholy & Vulnerable","duration":3.7,"loop":false,"defExpr":1,"archType":"MELANCHOLY","params":{"drop":0.43,"flatten":0.25,"spread":0.16,"headDown":0.26,"sigh":0.30000000000000004}},{"id":"ANIM_355_SUBDUED_GENTLE_TILT","name":"Subdued Gentle Tilt","category":"Melancholy & Vulnerable","duration":4.1,"loop":true,"defExpr":13,"archType":"MELANCHOLY","params":{"drop":0.25,"flatten":0.15,"spread":0.1,"headDown":0.18,"sigh":0.2}},{"id":"ANIM_356_TIRED_PROGRAMMER_SIGH","name":"Tired Programmer Sigh","category":"Melancholy & Vulnerable","duration":2.5,"loop":false,"defExpr":5,"archType":"MELANCHOLY","params":{"drop":0.31,"flatten":0.2,"spread":0.13,"headDown":0.22,"sigh":0.25}},{"id":"ANIM_357_BLEAK_WINTER_SHIVER","name":"Bleak Winter Shiver","category":"Melancholy & Vulnerable","duration":2.9,"loop":false,"defExpr":1,"archType":"MELANCHOLY","params":{"drop":0.37,"flatten":0.25,"spread":0.16,"headDown":0.26,"sigh":0.30000000000000004}},{"id":"ANIM_358_MELANCHOLY_VIOLIN_SWAY","name":"Melancholy Violin Sway","category":"Melancholy & Vulnerable","duration":3.3,"loop":false,"defExpr":13,"archType":"MELANCHOLY","params":{"drop":0.43,"flatten":0.15,"spread":0.1,"headDown":0.18,"sigh":0.2}},{"id":"ANIM_359_HEAVY_BURDEN_SAG","name":"Heavy Burden Sag","category":"Melancholy & Vulnerable","duration":3.7,"loop":false,"defExpr":5,"archType":"MELANCHOLY","params":{"drop":0.25,"flatten":0.2,"spread":0.13,"headDown":0.22,"sigh":0.25}},{"id":"ANIM_360_EMPTY_TERMINAL_GAZE","name":"Empty Terminal Gaze","category":"Melancholy & Vulnerable","duration":4.1,"loop":false,"defExpr":1,"archType":"MELANCHOLY","params":{"drop":0.31,"flatten":0.25,"spread":0.16,"headDown":0.26,"sigh":0.30000000000000004}},{"id":"ANIM_361_SOFT_WEEPING_TREMOR","name":"Soft Weeping Tremor","category":"Melancholy & Vulnerable","duration":2.5,"loop":true,"defExpr":13,"archType":"MELANCHOLY","params":{"drop":0.37,"flatten":0.15,"spread":0.1,"headDown":0.18,"sigh":0.2}},{"id":"ANIM_362_SOLITARY_LIGHTHOUSE_FADE","name":"Solitary Lighthouse Fade","category":"Melancholy & Vulnerable","duration":2.9,"loop":false,"defExpr":5,"archType":"MELANCHOLY","params":{"drop":0.43,"flatten":0.2,"spread":0.13,"headDown":0.22,"sigh":0.25}},{"id":"ANIM_363_WISTFUL_HORIZON_STARE","name":"Wistful Horizon Stare","category":"Melancholy & Vulnerable","duration":3.3,"loop":false,"defExpr":1,"archType":"MELANCHOLY","params":{"drop":0.25,"flatten":0.25,"spread":0.16,"headDown":0.26,"sigh":0.30000000000000004}},{"id":"ANIM_364_DESPONDENT_DROP","name":"Despondent Drop","category":"Melancholy & Vulnerable","duration":3.7,"loop":false,"defExpr":13,"archType":"MELANCHOLY","params":{"drop":0.31,"flatten":0.15,"spread":0.1,"headDown":0.18,"sigh":0.2}},{"id":"ANIM_365_QUIET_HEARTACHE_CURL","name":"Quiet Heartache Curl","category":"Melancholy & Vulnerable","duration":4.1,"loop":false,"defExpr":5,"archType":"MELANCHOLY","params":{"drop":0.37,"flatten":0.2,"spread":0.13,"headDown":0.22,"sigh":0.25}},{"id":"ANIM_366_GENTLE_SIGH_RELEASE","name":"Gentle Sigh Release","category":"Melancholy & Vulnerable","duration":2.5,"loop":false,"defExpr":1,"archType":"MELANCHOLY","params":{"drop":0.43,"flatten":0.25,"spread":0.16,"headDown":0.26,"sigh":0.30000000000000004}},{"id":"ANIM_367_LOST_IN_THE_STATIC","name":"Lost In The Static","category":"Melancholy & Vulnerable","duration":2.9,"loop":true,"defExpr":13,"archType":"MELANCHOLY","params":{"drop":0.25,"flatten":0.15,"spread":0.1,"headDown":0.18,"sigh":0.2}},{"id":"ANIM_368_PALE_GHOSTLY_DRIFTER","name":"Pale Ghostly Drifter","category":"Melancholy & Vulnerable","duration":3.3,"loop":false,"defExpr":5,"archType":"MELANCHOLY","params":{"drop":0.31,"flatten":0.2,"spread":0.13,"headDown":0.22,"sigh":0.25}},{"id":"ANIM_369_BROKEN_GLASS_STILL","name":"Broken Glass Still","category":"Melancholy & Vulnerable","duration":3.7,"loop":false,"defExpr":1,"archType":"MELANCHOLY","params":{"drop":0.37,"flatten":0.25,"spread":0.16,"headDown":0.26,"sigh":0.30000000000000004}},{"id":"ANIM_370_FADING_ECHO_DECAY","name":"Fading Echo Decay","category":"Melancholy & Vulnerable","duration":4.1,"loop":false,"defExpr":13,"archType":"MELANCHOLY","params":{"drop":0.43,"flatten":0.15,"spread":0.1,"headDown":0.18,"sigh":0.2}},{"id":"ANIM_371_DIABOLICAL_FINGER_STEEPLE","name":"Diabolical Finger Steeple","category":"Mischievous & Smug","duration":2,"loop":true,"defExpr":3,"archType":"SNEAK","params":{"dir":1,"slide":0.25,"lookDir":-0.35,"tilt":0.12,"pupil":0.65,"snicker":0.18}},{"id":"ANIM_372_SCHEMING_PENDULUM_SWAY","name":"Scheming Pendulum Sway","category":"Mischievous & Smug","duration":2.3,"loop":false,"defExpr":8,"archType":"SNEAK","params":{"dir":-1,"slide":0.31,"lookDir":-0.44999999999999996,"tilt":0.16,"pupil":0.8,"snicker":0.24}},{"id":"ANIM_373_SMUG_FLOAT_HOVER","name":"Smug Float Hover","category":"Mischievous & Smug","duration":2.6,"loop":false,"defExpr":9,"archType":"SNEAK","params":{"dir":1,"slide":0.37,"lookDir":-0.55,"tilt":0.2,"pupil":0.95,"snicker":0.3}},{"id":"ANIM_374_HEIST_SNEAK_LATERAL","name":"Heist Sneak Lateral","category":"Mischievous & Smug","duration":2.9,"loop":false,"defExpr":0,"archType":"SNEAK","params":{"dir":-1,"slide":0.43,"lookDir":-0.35,"tilt":0.12,"pupil":0.65,"snicker":0.18}},{"id":"ANIM_375_GRINCH_GRIN_STRETCH","name":"Grinch Grin Stretch","category":"Mischievous & Smug","duration":3.2,"loop":false,"defExpr":3,"archType":"SNEAK","params":{"dir":1,"slide":0.25,"lookDir":-0.44999999999999996,"tilt":0.16,"pupil":0.8,"snicker":0.24}},{"id":"ANIM_376_DEVIOUS_PLOT_UNFOLD","name":"Devious Plot Unfold","category":"Mischievous & Smug","duration":2,"loop":false,"defExpr":8,"archType":"SNEAK","params":{"dir":-1,"slide":0.31,"lookDir":-0.55,"tilt":0.2,"pupil":0.95,"snicker":0.3}},{"id":"ANIM_377_CAT_EATING_CANARY","name":"Cat Eating Canary","category":"Mischievous & Smug","duration":2.3,"loop":true,"defExpr":9,"archType":"SNEAK","params":{"dir":1,"slide":0.37,"lookDir":-0.35,"tilt":0.12,"pupil":0.65,"snicker":0.18}},{"id":"ANIM_378_TROLLFACE_WIGGLE","name":"Trollface Wiggle","category":"Mischievous & Smug","duration":2.6,"loop":false,"defExpr":0,"archType":"SNEAK","params":{"dir":-1,"slide":0.43,"lookDir":-0.44999999999999996,"tilt":0.16,"pupil":0.8,"snicker":0.24}},{"id":"ANIM_379_PRANKSTER_SNICKER","name":"Prankster Snicker","category":"Mischievous & Smug","duration":2.9,"loop":false,"defExpr":3,"archType":"SNEAK","params":{"dir":1,"slide":0.25,"lookDir":-0.55,"tilt":0.2,"pupil":0.95,"snicker":0.3}},{"id":"ANIM_380_SLY_FOX_GLANCE","name":"Sly Fox Glance","category":"Mischievous & Smug","duration":3.2,"loop":false,"defExpr":8,"archType":"SNEAK","params":{"dir":-1,"slide":0.31,"lookDir":-0.35,"tilt":0.12,"pupil":0.65,"snicker":0.18}},{"id":"ANIM_381_MACHIAVELLIAN_NOD","name":"Machiavellian Nod","category":"Mischievous & Smug","duration":2,"loop":false,"defExpr":9,"archType":"SNEAK","params":{"dir":1,"slide":0.37,"lookDir":-0.44999999999999996,"tilt":0.16,"pupil":0.8,"snicker":0.24}},{"id":"ANIM_382_CUNNING_EYE_TWITCH","name":"Cunning Eye Twitch","category":"Mischievous & Smug","duration":2.3,"loop":false,"defExpr":0,"archType":"SNEAK","params":{"dir":-1,"slide":0.43,"lookDir":-0.55,"tilt":0.2,"pupil":0.95,"snicker":0.3}},{"id":"ANIM_383_SECRET_KEPT_WINK","name":"Secret Kept Wink","category":"Mischievous & Smug","duration":2.6,"loop":true,"defExpr":3,"archType":"SNEAK","params":{"dir":1,"slide":0.25,"lookDir":-0.35,"tilt":0.12,"pupil":0.65,"snicker":0.18}},{"id":"ANIM_384_SUBTLE_SHAKEDOWN_TILT","name":"Subtle Shakedown Tilt","category":"Mischievous & Smug","duration":2.9,"loop":false,"defExpr":8,"archType":"SNEAK","params":{"dir":-1,"slide":0.31,"lookDir":-0.44999999999999996,"tilt":0.16,"pupil":0.8,"snicker":0.24}},{"id":"ANIM_385_WICKED_GRIN_WIDEN","name":"Wicked Grin Widen","category":"Mischievous & Smug","duration":3.2,"loop":false,"defExpr":9,"archType":"SNEAK","params":{"dir":1,"slide":0.37,"lookDir":-0.55,"tilt":0.2,"pupil":0.95,"snicker":0.3}},{"id":"ANIM_386_PUPPET_MASTER_STRINGS","name":"Puppet Master Strings","category":"Mischievous & Smug","duration":2,"loop":false,"defExpr":0,"archType":"SNEAK","params":{"dir":-1,"slide":0.43,"lookDir":-0.35,"tilt":0.12,"pupil":0.65,"snicker":0.18}},{"id":"ANIM_387_SABOTAGE_COMPLETE_SMIRK","name":"Sabotage Complete Smirk","category":"Mischievous & Smug","duration":2.3,"loop":false,"defExpr":3,"archType":"SNEAK","params":{"dir":1,"slide":0.25,"lookDir":-0.44999999999999996,"tilt":0.16,"pupil":0.8,"snicker":0.24}},{"id":"ANIM_388_VILLAIN_MONOLOGUE_WINDUP","name":"Villain Monologue Windup","category":"Mischievous & Smug","duration":2.6,"loop":false,"defExpr":8,"archType":"SNEAK","params":{"dir":-1,"slide":0.31,"lookDir":-0.55,"tilt":0.2,"pupil":0.95,"snicker":0.3}},{"id":"ANIM_389_FOX_IN_THE_HENHOUSE","name":"Fox In The Henhouse","category":"Mischievous & Smug","duration":2.9,"loop":true,"defExpr":9,"archType":"SNEAK","params":{"dir":1,"slide":0.37,"lookDir":-0.35,"tilt":0.12,"pupil":0.65,"snicker":0.18}},{"id":"ANIM_390_CRAFTY_HEIST_SLIDE","name":"Crafty Heist Slide","category":"Mischievous & Smug","duration":3.2,"loop":false,"defExpr":0,"archType":"SNEAK","params":{"dir":-1,"slide":0.43,"lookDir":-0.44999999999999996,"tilt":0.16,"pupil":0.8,"snicker":0.24}},{"id":"ANIM_391_CHEEKY_TONGUE_DART","name":"Cheeky Tongue Dart","category":"Mischievous & Smug","duration":2,"loop":false,"defExpr":3,"archType":"SNEAK","params":{"dir":1,"slide":0.25,"lookDir":-0.55,"tilt":0.2,"pupil":0.95,"snicker":0.3}},{"id":"ANIM_392_SINISTER_DELIGHT_BOUNCE","name":"Sinister Delight Bounce","category":"Mischievous & Smug","duration":2.3,"loop":false,"defExpr":8,"archType":"SNEAK","params":{"dir":-1,"slide":0.31,"lookDir":-0.35,"tilt":0.12,"pupil":0.65,"snicker":0.18}},{"id":"ANIM_393_DEVIOUS_SIDE_EYE_SLIDE","name":"Devious Side Eye Slide","category":"Mischievous & Smug","duration":2.6,"loop":false,"defExpr":9,"archType":"SNEAK","params":{"dir":1,"slide":0.37,"lookDir":-0.44999999999999996,"tilt":0.16,"pupil":0.8,"snicker":0.24}},{"id":"ANIM_394_SCHEMING_WHISPERS","name":"Scheming Whispers","category":"Mischievous & Smug","duration":2.9,"loop":false,"defExpr":0,"archType":"SNEAK","params":{"dir":-1,"slide":0.43,"lookDir":-0.55,"tilt":0.2,"pupil":0.95,"snicker":0.3}},{"id":"ANIM_395_SMUG_KNOW_IT_ALL_TILT","name":"Smug Know-It-All Tilt","category":"Mischievous & Smug","duration":3.2,"loop":true,"defExpr":3,"archType":"SNEAK","params":{"dir":1,"slide":0.25,"lookDir":-0.35,"tilt":0.12,"pupil":0.65,"snicker":0.18}},{"id":"ANIM_396_TROJAN_HORSE_ROLL","name":"Trojan Horse Roll","category":"Mischievous & Smug","duration":2,"loop":false,"defExpr":8,"archType":"SNEAK","params":{"dir":-1,"slide":0.31,"lookDir":-0.44999999999999996,"tilt":0.16,"pupil":0.8,"snicker":0.24}},{"id":"ANIM_397_MISCHIEF_MANAGED_WINK","name":"Mischief Managed Wink","category":"Mischievous & Smug","duration":2.3,"loop":false,"defExpr":9,"archType":"SNEAK","params":{"dir":1,"slide":0.37,"lookDir":-0.55,"tilt":0.2,"pupil":0.95,"snicker":0.3}},{"id":"ANIM_398_PIRATE_TREASURE_SMIRK","name":"Pirate Treasure Smirk","category":"Mischievous & Smug","duration":2.6,"loop":false,"defExpr":0,"archType":"SNEAK","params":{"dir":-1,"slide":0.43,"lookDir":-0.35,"tilt":0.12,"pupil":0.65,"snicker":0.18}},{"id":"ANIM_399_SNEAKY_SHADOW_SLITHER","name":"Sneaky Shadow Slither","category":"Mischievous & Smug","duration":2.9,"loop":false,"defExpr":3,"archType":"SNEAK","params":{"dir":1,"slide":0.25,"lookDir":-0.44999999999999996,"tilt":0.16,"pupil":0.8,"snicker":0.24}},{"id":"ANIM_400_VILLAINOUS_LAUGHTER_CHURN","name":"Villainous Laughter Churn","category":"Mischievous & Smug","duration":3.2,"loop":false,"defExpr":8,"archType":"SNEAK","params":{"dir":-1,"slide":0.31,"lookDir":-0.55,"tilt":0.2,"pupil":0.95,"snicker":0.3}},{"id":"ANIM_401_TWIRLING_INVISIBLE_MOUSTACHE","name":"Twirling Invisible Moustache","category":"Mischievous & Smug","duration":2,"loop":true,"defExpr":9,"archType":"SNEAK","params":{"dir":1,"slide":0.37,"lookDir":-0.35,"tilt":0.12,"pupil":0.65,"snicker":0.18}},{"id":"ANIM_402_GOTCHA_TRAP_SPRING","name":"Gotcha Trap Spring","category":"Mischievous & Smug","duration":2.3,"loop":false,"defExpr":0,"archType":"SNEAK","params":{"dir":-1,"slide":0.43,"lookDir":-0.44999999999999996,"tilt":0.16,"pupil":0.8,"snicker":0.24}},{"id":"ANIM_403_SLY_GRIN_PEEKING","name":"Sly Grin Peeking","category":"Mischievous & Smug","duration":2.6,"loop":false,"defExpr":3,"archType":"SNEAK","params":{"dir":1,"slide":0.25,"lookDir":-0.55,"tilt":0.2,"pupil":0.95,"snicker":0.3}},{"id":"ANIM_404_MASTERMIND_CHESS_MATE","name":"Mastermind Chess Mate","category":"Mischievous & Smug","duration":2.9,"loop":false,"defExpr":8,"archType":"SNEAK","params":{"dir":-1,"slide":0.31,"lookDir":-0.35,"tilt":0.12,"pupil":0.65,"snicker":0.18}},{"id":"ANIM_405_CONNIVING_NOD","name":"Conniving Nod","category":"Mischievous & Smug","duration":3.2,"loop":false,"defExpr":9,"archType":"SNEAK","params":{"dir":1,"slide":0.37,"lookDir":-0.44999999999999996,"tilt":0.16,"pupil":0.8,"snicker":0.24}},{"id":"ANIM_406_MISCHIEVOUS_GREMLIN_LEAP","name":"Mischievous Gremlin Leap","category":"Mischievous & Smug","duration":2,"loop":false,"defExpr":0,"archType":"SNEAK","params":{"dir":-1,"slide":0.43,"lookDir":-0.55,"tilt":0.2,"pupil":0.95,"snicker":0.3}},{"id":"ANIM_407_CLANDESTINE_SWAP","name":"Clandestine Swap","category":"Mischievous & Smug","duration":2.3,"loop":true,"defExpr":3,"archType":"SNEAK","params":{"dir":1,"slide":0.25,"lookDir":-0.35,"tilt":0.12,"pupil":0.65,"snicker":0.18}},{"id":"ANIM_408_HEIST_ESCAPE_ROLL","name":"Heist Escape Roll","category":"Mischievous & Smug","duration":2.6,"loop":false,"defExpr":8,"archType":"SNEAK","params":{"dir":-1,"slide":0.31,"lookDir":-0.44999999999999996,"tilt":0.16,"pupil":0.8,"snicker":0.24}},{"id":"ANIM_409_BLACKMAIL_SMILE","name":"Blackmail Smile","category":"Mischievous & Smug","duration":2.9,"loop":false,"defExpr":9,"archType":"SNEAK","params":{"dir":1,"slide":0.37,"lookDir":-0.55,"tilt":0.2,"pupil":0.95,"snicker":0.3}},{"id":"ANIM_410_SECRET_PLOT_REVEAL","name":"Secret Plot Reveal","category":"Mischievous & Smug","duration":3.2,"loop":false,"defExpr":0,"archType":"SNEAK","params":{"dir":-1,"slide":0.43,"lookDir":-0.35,"tilt":0.12,"pupil":0.65,"snicker":0.18}},{"id":"ANIM_411_SMUG_VICTORY_STRUT","name":"Smug Victory Strut","category":"Mischievous & Smug","duration":2,"loop":false,"defExpr":3,"archType":"SNEAK","params":{"dir":1,"slide":0.25,"lookDir":-0.44999999999999996,"tilt":0.16,"pupil":0.8,"snicker":0.24}},{"id":"ANIM_412_ROGUE_AGENT_DODGE","name":"Rogue Agent Dodge","category":"Mischievous & Smug","duration":2.3,"loop":false,"defExpr":8,"archType":"SNEAK","params":{"dir":-1,"slide":0.31,"lookDir":-0.55,"tilt":0.2,"pupil":0.95,"snicker":0.3}},{"id":"ANIM_413_PLAYFUL_SNEAK_LUNGE","name":"Playful Sneak Lunge","category":"Mischievous & Smug","duration":2.6,"loop":true,"defExpr":9,"archType":"SNEAK","params":{"dir":1,"slide":0.37,"lookDir":-0.35,"tilt":0.12,"pupil":0.65,"snicker":0.18}},{"id":"ANIM_414_GRINNING_TRICKSTER_BOB","name":"Grinning Trickster Bob","category":"Mischievous & Smug","duration":2.9,"loop":false,"defExpr":0,"archType":"SNEAK","params":{"dir":-1,"slide":0.43,"lookDir":-0.44999999999999996,"tilt":0.16,"pupil":0.8,"snicker":0.24}},{"id":"ANIM_415_DEVIOUS_HEIST_WALTZ","name":"Devious Heist Waltz","category":"Mischievous & Smug","duration":3.2,"loop":false,"defExpr":3,"archType":"SNEAK","params":{"dir":1,"slide":0.25,"lookDir":-0.55,"tilt":0.2,"pupil":0.95,"snicker":0.3}},{"id":"ANIM_416_DEEP_VOICE_MENACE","name":"Deep Voice Menace","category":"Intimidation & Dominance","duration":2.4,"loop":true,"defExpr":2,"archType":"INTIMIDATE","params":{"posZ":0.55,"rotX":-0.15,"yawFreq":1,"yawAmp":0.06,"breathFreq":1.5,"breathAmp":0.06,"pupil":0.25,"horror":0.85,"aura":0.75,"jaw":0.22}},{"id":"ANIM_417_APEX_PREDATOR_LOCK","name":"Apex Predator Lock","category":"Intimidation & Dominance","duration":2.8,"loop":false,"defExpr":14,"archType":"INTIMIDATE","params":{"posZ":0.7000000000000001,"rotX":-0.2,"yawFreq":1.4,"yawAmp":0.09,"breathFreq":2,"breathAmp":0.08,"pupil":0.33,"horror":0.9,"aura":0.83,"jaw":0.3}},{"id":"ANIM_418_SUBWOOFER_BASS_GROWL","name":"Subwoofer Bass Growl","category":"Intimidation & Dominance","duration":3.2,"loop":false,"defExpr":9,"archType":"INTIMIDATE","params":{"posZ":0.8500000000000001,"rotX":-0.25,"yawFreq":1.8,"yawAmp":0.12,"breathFreq":2.5,"breathAmp":0.1,"pupil":0.41000000000000003,"horror":0.95,"aura":0.91,"jaw":0.38}},{"id":"ANIM_419_SUPREME_AUTHORITY_DECREE","name":"Supreme Authority Decree","category":"Intimidation & Dominance","duration":3.6,"loop":false,"defExpr":12,"archType":"INTIMIDATE","params":{"posZ":1,"rotX":-0.30000000000000004,"yawFreq":1,"yawAmp":0.06,"breathFreq":1.5,"breathAmp":0.12,"pupil":0.25,"horror":0.85,"aura":0.99,"jaw":0.22}},{"id":"ANIM_420_CHTHONIC_DREAD_EXPAND","name":"Chthonic Dread Expand","category":"Intimidation & Dominance","duration":4,"loop":false,"defExpr":1,"archType":"INTIMIDATE","params":{"posZ":1.15,"rotX":-0.15,"yawFreq":1.4,"yawAmp":0.09,"breathFreq":2,"breathAmp":0.06,"pupil":0.33,"horror":0.9,"aura":0.75,"jaw":0.3}},{"id":"ANIM_421_TERMINAL_OVERLORD_STANCE","name":"Terminal Overlord Stance","category":"Intimidation & Dominance","duration":4.4,"loop":true,"defExpr":2,"archType":"INTIMIDATE","params":{"posZ":0.55,"rotX":-0.2,"yawFreq":1.8,"yawAmp":0.12,"breathFreq":2.5,"breathAmp":0.08,"pupil":0.41000000000000003,"horror":0.95,"aura":0.83,"jaw":0.38}},{"id":"ANIM_422_SHADOW_MONOLITH_RISE","name":"Shadow Monolith Rise","category":"Intimidation & Dominance","duration":2.4,"loop":false,"defExpr":14,"archType":"INTIMIDATE","params":{"posZ":0.7000000000000001,"rotX":-0.25,"yawFreq":1,"yawAmp":0.06,"breathFreq":1.5,"breathAmp":0.1,"pupil":0.25,"horror":0.85,"aura":0.91,"jaw":0.22}},{"id":"ANIM_423_CORRUPTED_AI_JUDGMENT","name":"Corrupted AI Judgment","category":"Intimidation & Dominance","duration":2.8,"loop":false,"defExpr":9,"archType":"INTIMIDATE","params":{"posZ":0.8500000000000001,"rotX":-0.30000000000000004,"yawFreq":1.4,"yawAmp":0.09,"breathFreq":2,"breathAmp":0.12,"pupil":0.33,"horror":0.9,"aura":0.99,"jaw":0.3}},{"id":"ANIM_424_NIGHTMARE_HARVESTER","name":"Nightmare Harvester","category":"Intimidation & Dominance","duration":3.2,"loop":false,"defExpr":12,"archType":"INTIMIDATE","params":{"posZ":1,"rotX":-0.15,"yawFreq":1.8,"yawAmp":0.12,"breathFreq":2.5,"breathAmp":0.06,"pupil":0.41000000000000003,"horror":0.95,"aura":0.75,"jaw":0.38}},{"id":"ANIM_425_TITAN_STOMP_QUAKE","name":"Titan Stomp Quake","category":"Intimidation & Dominance","duration":3.6,"loop":false,"defExpr":1,"archType":"INTIMIDATE","params":{"posZ":1.15,"rotX":-0.2,"yawFreq":1,"yawAmp":0.06,"breathFreq":1.5,"breathAmp":0.08,"pupil":0.25,"horror":0.85,"aura":0.83,"jaw":0.22}},{"id":"ANIM_426_DOMINANT_GLARE_STARE","name":"Dominant Glare Stare","category":"Intimidation & Dominance","duration":4,"loop":true,"defExpr":2,"archType":"INTIMIDATE","params":{"posZ":0.55,"rotX":-0.25,"yawFreq":1.4,"yawAmp":0.09,"breathFreq":2,"breathAmp":0.1,"pupil":0.33,"horror":0.9,"aura":0.91,"jaw":0.3}},{"id":"ANIM_427_INFERNAL_SOVEREIGN_RISE","name":"Infernal Sovereign Rise","category":"Intimidation & Dominance","duration":4.4,"loop":false,"defExpr":14,"archType":"INTIMIDATE","params":{"posZ":0.7000000000000001,"rotX":-0.30000000000000004,"yawFreq":1.8,"yawAmp":0.12,"breathFreq":2.5,"breathAmp":0.12,"pupil":0.41000000000000003,"horror":0.95,"aura":0.99,"jaw":0.38}},{"id":"ANIM_428_COLD_CALCULATED_EXECUTION","name":"Cold Calculated Execution","category":"Intimidation & Dominance","duration":2.4,"loop":false,"defExpr":9,"archType":"INTIMIDATE","params":{"posZ":0.8500000000000001,"rotX":-0.15,"yawFreq":1,"yawAmp":0.06,"breathFreq":1.5,"breathAmp":0.06,"pupil":0.25,"horror":0.85,"aura":0.75,"jaw":0.22}},{"id":"ANIM_429_MENACING_SLOW_ADVANCE","name":"Menacing Slow Advance","category":"Intimidation & Dominance","duration":2.8,"loop":false,"defExpr":12,"archType":"INTIMIDATE","params":{"posZ":1,"rotX":-0.2,"yawFreq":1.4,"yawAmp":0.09,"breathFreq":2,"breathAmp":0.08,"pupil":0.33,"horror":0.9,"aura":0.83,"jaw":0.3}},{"id":"ANIM_430_BLOODCURDLING_LOW_DRONE","name":"Bloodcurdling Low Drone","category":"Intimidation & Dominance","duration":3.2,"loop":false,"defExpr":1,"archType":"INTIMIDATE","params":{"posZ":1.15,"rotX":-0.25,"yawFreq":1.8,"yawAmp":0.12,"breathFreq":2.5,"breathAmp":0.1,"pupil":0.41000000000000003,"horror":0.95,"aura":0.91,"jaw":0.38}},{"id":"ANIM_431_GOD_COMPLEX_LOOM","name":"God Complex Loom","category":"Intimidation & Dominance","duration":3.6,"loop":true,"defExpr":2,"archType":"INTIMIDATE","params":{"posZ":0.55,"rotX":-0.30000000000000004,"yawFreq":1,"yawAmp":0.06,"breathFreq":1.5,"breathAmp":0.12,"pupil":0.25,"horror":0.85,"aura":0.99,"jaw":0.22}},{"id":"ANIM_432_TERRIFYING_LOOMING_PUSH","name":"Terrifying Looming Push","category":"Intimidation & Dominance","duration":4,"loop":false,"defExpr":14,"archType":"INTIMIDATE","params":{"posZ":0.7000000000000001,"rotX":-0.15,"yawFreq":1.4,"yawAmp":0.09,"breathFreq":2,"breathAmp":0.06,"pupil":0.33,"horror":0.9,"aura":0.75,"jaw":0.3}},{"id":"ANIM_433_DEMON_KING_COMMAND","name":"Demon King Command","category":"Intimidation & Dominance","duration":4.4,"loop":false,"defExpr":9,"archType":"INTIMIDATE","params":{"posZ":0.8500000000000001,"rotX":-0.2,"yawFreq":1.8,"yawAmp":0.12,"breathFreq":2.5,"breathAmp":0.08,"pupil":0.41000000000000003,"horror":0.95,"aura":0.83,"jaw":0.38}},{"id":"ANIM_434_ABYSSAL_EMPEROR_GLARE","name":"Abyssal Emperor Glare","category":"Intimidation & Dominance","duration":2.4,"loop":false,"defExpr":12,"archType":"INTIMIDATE","params":{"posZ":1,"rotX":-0.25,"yawFreq":1,"yawAmp":0.06,"breathFreq":1.5,"breathAmp":0.1,"pupil":0.25,"horror":0.85,"aura":0.91,"jaw":0.22}},{"id":"ANIM_435_IRON_WILL_INTIMIDATION","name":"Iron Will Intimidation","category":"Intimidation & Dominance","duration":2.8,"loop":false,"defExpr":1,"archType":"INTIMIDATE","params":{"posZ":1.15,"rotX":-0.30000000000000004,"yawFreq":1.4,"yawAmp":0.09,"breathFreq":2,"breathAmp":0.12,"pupil":0.33,"horror":0.9,"aura":0.99,"jaw":0.3}},{"id":"ANIM_436_VICIOUS_THREAT_HOLD","name":"Vicious Threat Hold","category":"Intimidation & Dominance","duration":3.2,"loop":true,"defExpr":2,"archType":"INTIMIDATE","params":{"posZ":0.55,"rotX":-0.15,"yawFreq":1.8,"yawAmp":0.12,"breathFreq":2.5,"breathAmp":0.06,"pupil":0.41000000000000003,"horror":0.95,"aura":0.75,"jaw":0.38}},{"id":"ANIM_437_SOUL_PIERCING_FIXATION","name":"Soul Piercing Fixation","category":"Intimidation & Dominance","duration":3.6,"loop":false,"defExpr":14,"archType":"INTIMIDATE","params":{"posZ":0.7000000000000001,"rotX":-0.2,"yawFreq":1,"yawAmp":0.06,"breathFreq":1.5,"breathAmp":0.08,"pupil":0.25,"horror":0.85,"aura":0.83,"jaw":0.22}},{"id":"ANIM_438_DREADBRINGER_HOVER","name":"Dreadbringer Hover","category":"Intimidation & Dominance","duration":4,"loop":false,"defExpr":9,"archType":"INTIMIDATE","params":{"posZ":0.8500000000000001,"rotX":-0.25,"yawFreq":1.4,"yawAmp":0.09,"breathFreq":2,"breathAmp":0.1,"pupil":0.33,"horror":0.9,"aura":0.91,"jaw":0.3}},{"id":"ANIM_439_DARK_MATTER_PRESSURIZE","name":"Dark Matter Pressurize","category":"Intimidation & Dominance","duration":4.4,"loop":false,"defExpr":12,"archType":"INTIMIDATE","params":{"posZ":1,"rotX":-0.30000000000000004,"yawFreq":1.8,"yawAmp":0.12,"breathFreq":2.5,"breathAmp":0.12,"pupil":0.41000000000000003,"horror":0.95,"aura":0.99,"jaw":0.38}},{"id":"ANIM_440_GRAVE_UNDERTAKER_BOW","name":"Grave Undertaker Bow","category":"Intimidation & Dominance","duration":2.4,"loop":false,"defExpr":1,"archType":"INTIMIDATE","params":{"posZ":1.15,"rotX":-0.15,"yawFreq":1,"yawAmp":0.06,"breathFreq":1.5,"breathAmp":0.06,"pupil":0.25,"horror":0.85,"aura":0.75,"jaw":0.22}},{"id":"ANIM_441_RUTHLESS_TYRANT_NOD","name":"Ruthless Tyrant Nod","category":"Intimidation & Dominance","duration":2.8,"loop":true,"defExpr":2,"archType":"INTIMIDATE","params":{"posZ":0.55,"rotX":-0.2,"yawFreq":1.4,"yawAmp":0.09,"breathFreq":2,"breathAmp":0.08,"pupil":0.33,"horror":0.9,"aura":0.83,"jaw":0.3}},{"id":"ANIM_442_HEAVY_BREATHING_MENACE","name":"Heavy Breathing Menace","category":"Intimidation & Dominance","duration":3.2,"loop":false,"defExpr":14,"archType":"INTIMIDATE","params":{"posZ":0.7000000000000001,"rotX":-0.25,"yawFreq":1.8,"yawAmp":0.12,"breathFreq":2.5,"breathAmp":0.1,"pupil":0.41000000000000003,"horror":0.95,"aura":0.91,"jaw":0.38}},{"id":"ANIM_443_SUB_BASS_RESONANCE_PUMMEL","name":"Sub-Bass Resonance Pummel","category":"Intimidation & Dominance","duration":3.6,"loop":false,"defExpr":9,"archType":"INTIMIDATE","params":{"posZ":0.8500000000000001,"rotX":-0.30000000000000004,"yawFreq":1,"yawAmp":0.06,"breathFreq":1.5,"breathAmp":0.12,"pupil":0.25,"horror":0.85,"aura":0.99,"jaw":0.22}},{"id":"ANIM_444_IMPOSING_GIANT_SCALE","name":"Imposing Giant Scale","category":"Intimidation & Dominance","duration":4,"loop":false,"defExpr":12,"archType":"INTIMIDATE","params":{"posZ":1,"rotX":-0.15,"yawFreq":1.4,"yawAmp":0.09,"breathFreq":2,"breathAmp":0.06,"pupil":0.33,"horror":0.9,"aura":0.75,"jaw":0.3}},{"id":"ANIM_445_DARK_ENERGY_SWIRL_STARE","name":"Dark Energy Swirl Stare","category":"Intimidation & Dominance","duration":4.4,"loop":false,"defExpr":1,"archType":"INTIMIDATE","params":{"posZ":1.15,"rotX":-0.2,"yawFreq":1.8,"yawAmp":0.12,"breathFreq":2.5,"breathAmp":0.08,"pupil":0.41000000000000003,"horror":0.95,"aura":0.83,"jaw":0.38}},{"id":"ANIM_446_COLOSSAL_SHADOW_CAST","name":"Colossal Shadow Cast","category":"Intimidation & Dominance","duration":2.4,"loop":true,"defExpr":2,"archType":"INTIMIDATE","params":{"posZ":0.55,"rotX":-0.25,"yawFreq":1,"yawAmp":0.06,"breathFreq":1.5,"breathAmp":0.1,"pupil":0.25,"horror":0.85,"aura":0.91,"jaw":0.22}},{"id":"ANIM_447_UNFORGIVING_EYE_LOCK","name":"Unforgiving Eye Lock","category":"Intimidation & Dominance","duration":2.8,"loop":false,"defExpr":14,"archType":"INTIMIDATE","params":{"posZ":0.7000000000000001,"rotX":-0.30000000000000004,"yawFreq":1.4,"yawAmp":0.09,"breathFreq":2,"breathAmp":0.12,"pupil":0.33,"horror":0.9,"aura":0.99,"jaw":0.3}},{"id":"ANIM_448_DEATH_SENTENCE_PRONOUNCED","name":"Death Sentence Pronounced","category":"Intimidation & Dominance","duration":3.2,"loop":false,"defExpr":9,"archType":"INTIMIDATE","params":{"posZ":0.8500000000000001,"rotX":-0.15,"yawFreq":1.8,"yawAmp":0.12,"breathFreq":2.5,"breathAmp":0.06,"pupil":0.41000000000000003,"horror":0.95,"aura":0.75,"jaw":0.38}},{"id":"ANIM_449_BLACK_HOLE_GRAVITY_PULL","name":"Black Hole Gravity Pull","category":"Intimidation & Dominance","duration":3.6,"loop":false,"defExpr":12,"archType":"INTIMIDATE","params":{"posZ":1,"rotX":-0.2,"yawFreq":1,"yawAmp":0.06,"breathFreq":1.5,"breathAmp":0.08,"pupil":0.25,"horror":0.85,"aura":0.83,"jaw":0.22}},{"id":"ANIM_450_COLD_BLOODED_GAZE","name":"Cold Blooded Gaze","category":"Intimidation & Dominance","duration":4,"loop":false,"defExpr":1,"archType":"INTIMIDATE","params":{"posZ":1.15,"rotX":-0.25,"yawFreq":1.4,"yawAmp":0.09,"breathFreq":2,"breathAmp":0.1,"pupil":0.33,"horror":0.9,"aura":0.91,"jaw":0.3}},{"id":"ANIM_451_GARGANTUAN_PRESENCE","name":"Gargantuan Presence","category":"Intimidation & Dominance","duration":4.4,"loop":true,"defExpr":2,"archType":"INTIMIDATE","params":{"posZ":0.55,"rotX":-0.30000000000000004,"yawFreq":1.8,"yawAmp":0.12,"breathFreq":2.5,"breathAmp":0.12,"pupil":0.41000000000000003,"horror":0.95,"aura":0.99,"jaw":0.38}},{"id":"ANIM_452_MENACING_MICRO_FORWARD_DART","name":"Menacing Micro-Forward Dart","category":"Intimidation & Dominance","duration":2.4,"loop":false,"defExpr":14,"archType":"INTIMIDATE","params":{"posZ":0.7000000000000001,"rotX":-0.15,"yawFreq":1,"yawAmp":0.06,"breathFreq":1.5,"breathAmp":0.06,"pupil":0.25,"horror":0.85,"aura":0.75,"jaw":0.22}},{"id":"ANIM_453_EXECUTIONER_AXE_LOWER","name":"Executioner Axe Lower","category":"Intimidation & Dominance","duration":2.8,"loop":false,"defExpr":9,"archType":"INTIMIDATE","params":{"posZ":0.8500000000000001,"rotX":-0.2,"yawFreq":1.4,"yawAmp":0.09,"breathFreq":2,"breathAmp":0.08,"pupil":0.33,"horror":0.9,"aura":0.83,"jaw":0.3}},{"id":"ANIM_454_SILENT_DREAD_TOWER","name":"Silent Dread Tower","category":"Intimidation & Dominance","duration":3.2,"loop":false,"defExpr":12,"archType":"INTIMIDATE","params":{"posZ":1,"rotX":-0.25,"yawFreq":1.8,"yawAmp":0.12,"breathFreq":2.5,"breathAmp":0.1,"pupil":0.41000000000000003,"horror":0.95,"aura":0.91,"jaw":0.38}},{"id":"ANIM_455_MALEVOLENT_AUTHORITY","name":"Malevolent Authority","category":"Intimidation & Dominance","duration":3.6,"loop":false,"defExpr":1,"archType":"INTIMIDATE","params":{"posZ":1.15,"rotX":-0.30000000000000004,"yawFreq":1,"yawAmp":0.06,"breathFreq":1.5,"breathAmp":0.12,"pupil":0.25,"horror":0.85,"aura":0.99,"jaw":0.22}},{"id":"ANIM_456_DEMONIC_PACT_PROPOSAL","name":"Demonic Pact Proposal","category":"Intimidation & Dominance","duration":4,"loop":true,"defExpr":2,"archType":"INTIMIDATE","params":{"posZ":0.55,"rotX":-0.15,"yawFreq":1.4,"yawAmp":0.09,"breathFreq":2,"breathAmp":0.06,"pupil":0.33,"horror":0.9,"aura":0.75,"jaw":0.3}},{"id":"ANIM_457_FINAL_WARNING_STANCE","name":"Final Warning Stance","category":"Intimidation & Dominance","duration":4.4,"loop":false,"defExpr":14,"archType":"INTIMIDATE","params":{"posZ":0.7000000000000001,"rotX":-0.2,"yawFreq":1.8,"yawAmp":0.12,"breathFreq":2.5,"breathAmp":0.08,"pupil":0.41000000000000003,"horror":0.95,"aura":0.83,"jaw":0.38}},{"id":"ANIM_458_CRUSHING_WILLPOWER_AURA","name":"Crushing Willpower Aura","category":"Intimidation & Dominance","duration":2.4,"loop":false,"defExpr":9,"archType":"INTIMIDATE","params":{"posZ":0.8500000000000001,"rotX":-0.25,"yawFreq":1,"yawAmp":0.06,"breathFreq":1.5,"breathAmp":0.1,"pupil":0.25,"horror":0.85,"aura":0.91,"jaw":0.22}},{"id":"ANIM_459_PREDATORY_HEAD_SNARL","name":"Predatory Head Snarl","category":"Intimidation & Dominance","duration":2.8,"loop":false,"defExpr":12,"archType":"INTIMIDATE","params":{"posZ":1,"rotX":-0.30000000000000004,"yawFreq":1.4,"yawAmp":0.09,"breathFreq":2,"breathAmp":0.12,"pupil":0.33,"horror":0.9,"aura":0.99,"jaw":0.3}},{"id":"ANIM_460_OMINOUS_DOWNWARD_SHADOW","name":"Ominous Downward Shadow","category":"Intimidation & Dominance","duration":3.2,"loop":false,"defExpr":1,"archType":"INTIMIDATE","params":{"posZ":1.15,"rotX":-0.15,"yawFreq":1.8,"yawAmp":0.12,"breathFreq":2.5,"breathAmp":0.06,"pupil":0.41000000000000003,"horror":0.95,"aura":0.75,"jaw":0.38}},{"id":"ANIM_461_DOOM_PROPHET_GAZE","name":"Doom Prophet Gaze","category":"Intimidation & Dominance","duration":3.6,"loop":true,"defExpr":2,"archType":"INTIMIDATE","params":{"posZ":0.55,"rotX":-0.2,"yawFreq":1,"yawAmp":0.06,"breathFreq":1.5,"breathAmp":0.08,"pupil":0.25,"horror":0.85,"aura":0.83,"jaw":0.22}},{"id":"ANIM_462_CATACLYSM_HARBINGER","name":"Cataclysm Harbinger","category":"Intimidation & Dominance","duration":4,"loop":false,"defExpr":14,"archType":"INTIMIDATE","params":{"posZ":0.7000000000000001,"rotX":-0.25,"yawFreq":1.4,"yawAmp":0.09,"breathFreq":2,"breathAmp":0.1,"pupil":0.33,"horror":0.9,"aura":0.91,"jaw":0.3}},{"id":"ANIM_463_SINISTER_WHISPERING_GIANT","name":"Sinister Whispering Giant","category":"Intimidation & Dominance","duration":4.4,"loop":false,"defExpr":9,"archType":"INTIMIDATE","params":{"posZ":0.8500000000000001,"rotX":-0.30000000000000004,"yawFreq":1.8,"yawAmp":0.12,"breathFreq":2.5,"breathAmp":0.12,"pupil":0.41000000000000003,"horror":0.95,"aura":0.99,"jaw":0.38}},{"id":"ANIM_464_RULER_OF_THE_ABYSS","name":"Ruler Of The Abyss","category":"Intimidation & Dominance","duration":2.4,"loop":false,"defExpr":12,"archType":"INTIMIDATE","params":{"posZ":1,"rotX":-0.15,"yawFreq":1,"yawAmp":0.06,"breathFreq":1.5,"breathAmp":0.06,"pupil":0.25,"horror":0.85,"aura":0.75,"jaw":0.22}},{"id":"ANIM_465_DREADLORD_INTIMIDATION","name":"Dreadlord Intimidation","category":"Intimidation & Dominance","duration":2.8,"loop":false,"defExpr":1,"archType":"INTIMIDATE","params":{"posZ":1.15,"rotX":-0.2,"yawFreq":1.4,"yawAmp":0.09,"breathFreq":2,"breathAmp":0.08,"pupil":0.33,"horror":0.9,"aura":0.83,"jaw":0.3}},{"id":"ANIM_466_UNYIELDING_TITANIUM_STARE","name":"Unyielding Titanium Stare","category":"Intimidation & Dominance","duration":3.2,"loop":true,"defExpr":2,"archType":"INTIMIDATE","params":{"posZ":0.55,"rotX":-0.25,"yawFreq":1.8,"yawAmp":0.12,"breathFreq":2.5,"breathAmp":0.1,"pupil":0.41000000000000003,"horror":0.95,"aura":0.91,"jaw":0.38}},{"id":"ANIM_467_COMMANDING_SOVEREIGN_TILT","name":"Commanding Sovereign Tilt","category":"Intimidation & Dominance","duration":3.6,"loop":false,"defExpr":14,"archType":"INTIMIDATE","params":{"posZ":0.7000000000000001,"rotX":-0.30000000000000004,"yawFreq":1,"yawAmp":0.06,"breathFreq":1.5,"breathAmp":0.12,"pupil":0.25,"horror":0.85,"aura":0.99,"jaw":0.22}},{"id":"ANIM_468_OMNIPOTENT_GLARE","name":"Omnipotent Glare","category":"Intimidation & Dominance","duration":4,"loop":false,"defExpr":9,"archType":"INTIMIDATE","params":{"posZ":0.8500000000000001,"rotX":-0.15,"yawFreq":1.4,"yawAmp":0.09,"breathFreq":2,"breathAmp":0.06,"pupil":0.33,"horror":0.9,"aura":0.75,"jaw":0.3}},{"id":"ANIM_469_APOCALYPTIC_DECREE","name":"Apocalyptic Decree","category":"Intimidation & Dominance","duration":4.4,"loop":false,"defExpr":12,"archType":"INTIMIDATE","params":{"posZ":1,"rotX":-0.2,"yawFreq":1.8,"yawAmp":0.12,"breathFreq":2.5,"breathAmp":0.08,"pupil":0.41000000000000003,"horror":0.95,"aura":0.83,"jaw":0.38}},{"id":"ANIM_470_THE_VOID_CONSUMES_ALL","name":"The Void Consumes All","category":"Intimidation & Dominance","duration":2.4,"loop":false,"defExpr":1,"archType":"INTIMIDATE","params":{"posZ":1.15,"rotX":-0.25,"yawFreq":1,"yawAmp":0.06,"breathFreq":1.5,"breathAmp":0.1,"pupil":0.25,"horror":0.85,"aura":0.91,"jaw":0.22}},{"id":"ANIM_471_DETECTIVE_LENS_ZOOM","name":"Detective Lens Zoom","category":"Attentive & Curiosity","duration":2,"loop":true,"defExpr":0,"archType":"TECH","params":{"sweeps":1,"angle":0.3,"pitch":0.15,"zoom":0.35}},{"id":"ANIM_472_RADAR_DISH_SWEEP","name":"Radar Dish Sweep","category":"Attentive & Curiosity","duration":2.35,"loop":false,"defExpr":4,"archType":"TECH","params":{"sweeps":2,"angle":0.38,"pitch":0.2,"zoom":0.43}},{"id":"ANIM_473_PERISCOPE_POP_UP","name":"Periscope Pop Up","category":"Attentive & Curiosity","duration":2.7,"loop":false,"defExpr":12,"archType":"TECH","params":{"sweeps":3,"angle":0.45999999999999996,"pitch":0.25,"zoom":0.51}},{"id":"ANIM_474_SNIFFING_TRACE_FOLLOW","name":"Sniffing Trace Follow","category":"Attentive & Curiosity","duration":3.05,"loop":false,"defExpr":0,"archType":"TECH","params":{"sweeps":1,"angle":0.54,"pitch":0.15,"zoom":0.59}},{"id":"ANIM_475_BUG_TRACKING_FLICK","name":"Bug Tracking Flick","category":"Attentive & Curiosity","duration":3.4,"loop":false,"defExpr":4,"archType":"TECH","params":{"sweeps":2,"angle":0.3,"pitch":0.2,"zoom":0.35}},{"id":"ANIM_476_CURIOUS_HEAD_TILT_LEFT","name":"Curious Head Tilt Left","category":"Attentive & Curiosity","duration":2,"loop":false,"defExpr":12,"archType":"TECH","params":{"sweeps":3,"angle":0.38,"pitch":0.25,"zoom":0.43}},{"id":"ANIM_477_CURIOUS_HEAD_TILT_RIGHT","name":"Curious Head Tilt Right","category":"Attentive & Curiosity","duration":2.35,"loop":true,"defExpr":0,"archType":"TECH","params":{"sweeps":1,"angle":0.45999999999999996,"pitch":0.15,"zoom":0.51}},{"id":"ANIM_478_FASCINATED_LEAN_IN","name":"Fascinated Lean In","category":"Attentive & Curiosity","duration":2.7,"loop":false,"defExpr":4,"archType":"TECH","params":{"sweeps":2,"angle":0.54,"pitch":0.2,"zoom":0.59}},{"id":"ANIM_479_INQUISITIVE_PUPIL_DIAL","name":"Inquisitive Pupil Dial","category":"Attentive & Curiosity","duration":3.05,"loop":false,"defExpr":12,"archType":"TECH","params":{"sweeps":3,"angle":0.3,"pitch":0.25,"zoom":0.35}},{"id":"ANIM_480_MICROSCOPIC_INSPECTION","name":"Microscopic Inspection","category":"Attentive & Curiosity","duration":3.4,"loop":false,"defExpr":0,"archType":"TECH","params":{"sweeps":1,"angle":0.38,"pitch":0.15,"zoom":0.43}},{"id":"ANIM_481_PERPLEXED_EYE_SQUINT","name":"Perplexed Eye Squint","category":"Attentive & Curiosity","duration":2,"loop":false,"defExpr":4,"archType":"TECH","params":{"sweeps":2,"angle":0.45999999999999996,"pitch":0.2,"zoom":0.51}},{"id":"ANIM_482_LISTENING_CAREFULLY_STRAIN","name":"Listening Carefully Strain","category":"Attentive & Curiosity","duration":2.35,"loop":false,"defExpr":12,"archType":"TECH","params":{"sweeps":3,"angle":0.54,"pitch":0.25,"zoom":0.59}},{"id":"ANIM_483_OBSERVANT_HORIZON_PAN","name":"Observant Horizon Pan","category":"Attentive & Curiosity","duration":2.7,"loop":true,"defExpr":0,"archType":"TECH","params":{"sweeps":1,"angle":0.3,"pitch":0.15,"zoom":0.35}},{"id":"ANIM_484_INTRIGUED_BROW_RAISE","name":"Intrigued Brow Raise","category":"Attentive & Curiosity","duration":3.05,"loop":false,"defExpr":4,"archType":"TECH","params":{"sweeps":2,"angle":0.38,"pitch":0.2,"zoom":0.43}},{"id":"ANIM_485_SCANNING_THE_CODEBASE","name":"Scanning The Codebase","category":"Attentive & Curiosity","duration":3.4,"loop":false,"defExpr":12,"archType":"TECH","params":{"sweeps":3,"angle":0.45999999999999996,"pitch":0.25,"zoom":0.51}},{"id":"ANIM_486_FOLLOWING_THE_CURSOR","name":"Following The Cursor","category":"Attentive & Curiosity","duration":2,"loop":false,"defExpr":0,"archType":"TECH","params":{"sweeps":1,"angle":0.54,"pitch":0.15,"zoom":0.59}},{"id":"ANIM_487_WHISPER_EAVESDROP","name":"Whisper Eavesdrop","category":"Attentive & Curiosity","duration":2.35,"loop":false,"defExpr":4,"archType":"TECH","params":{"sweeps":2,"angle":0.3,"pitch":0.2,"zoom":0.35}},{"id":"ANIM_488_CURIOUS_ORBIT_CIRCLES","name":"Curious Orbit Circles","category":"Attentive & Curiosity","duration":2.7,"loop":false,"defExpr":12,"archType":"TECH","params":{"sweeps":3,"angle":0.38,"pitch":0.25,"zoom":0.43}},{"id":"ANIM_489_STUDYING_THE_SYNTAX","name":"Studying The Syntax","category":"Attentive & Curiosity","duration":3.05,"loop":true,"defExpr":0,"archType":"TECH","params":{"sweeps":1,"angle":0.45999999999999996,"pitch":0.15,"zoom":0.51}},{"id":"ANIM_490_ATTENTIVE_OWL_ROTATE","name":"Attentive Owl Rotate","category":"Attentive & Curiosity","duration":3.4,"loop":false,"defExpr":4,"archType":"TECH","params":{"sweeps":2,"angle":0.54,"pitch":0.2,"zoom":0.59}},{"id":"ANIM_491_PUZZLED_CHIN_TAP","name":"Puzzled Chin Tap","category":"Attentive & Curiosity","duration":2,"loop":false,"defExpr":12,"archType":"TECH","params":{"sweeps":3,"angle":0.3,"pitch":0.25,"zoom":0.35}},{"id":"ANIM_492_DEEP_WONDER_GAZE","name":"Deep Wonder Gaze","category":"Attentive & Curiosity","duration":2.35,"loop":false,"defExpr":0,"archType":"TECH","params":{"sweeps":1,"angle":0.38,"pitch":0.15,"zoom":0.43}},{"id":"ANIM_493_INVESTIGATING_ANOMALY","name":"Investigating Anomaly","category":"Attentive & Curiosity","duration":2.7,"loop":false,"defExpr":4,"archType":"TECH","params":{"sweeps":2,"angle":0.45999999999999996,"pitch":0.2,"zoom":0.51}},{"id":"ANIM_494_CURIOUS_POKE_FORWARD","name":"Curious Poke Forward","category":"Attentive & Curiosity","duration":3.05,"loop":false,"defExpr":12,"archType":"TECH","params":{"sweeps":3,"angle":0.54,"pitch":0.25,"zoom":0.59}},{"id":"ANIM_495_DISSECTING_THE_PACKETS","name":"Dissecting The Packets","category":"Attentive & Curiosity","duration":3.4,"loop":true,"defExpr":0,"archType":"TECH","params":{"sweeps":1,"angle":0.3,"pitch":0.15,"zoom":0.35}},{"id":"ANIM_496_WATCHING_USER_TYPING","name":"Watching User Typing","category":"Attentive & Curiosity","duration":2,"loop":false,"defExpr":4,"archType":"TECH","params":{"sweeps":2,"angle":0.38,"pitch":0.2,"zoom":0.43}},{"id":"ANIM_497_INTENSE_FOCAL_LOCK","name":"Intense Focal Lock","category":"Attentive & Curiosity","duration":2.35,"loop":false,"defExpr":12,"archType":"TECH","params":{"sweeps":3,"angle":0.45999999999999996,"pitch":0.25,"zoom":0.51}},{"id":"ANIM_498_PUZZLED_HEAD_SCRATCH","name":"Puzzled Head Scratch","category":"Attentive & Curiosity","duration":2.7,"loop":false,"defExpr":0,"archType":"TECH","params":{"sweeps":1,"angle":0.54,"pitch":0.15,"zoom":0.59}},{"id":"ANIM_499_READING_THE_LOG_STREAM","name":"Reading The Log Stream","category":"Attentive & Curiosity","duration":3.05,"loop":false,"defExpr":4,"archType":"TECH","params":{"sweeps":2,"angle":0.3,"pitch":0.2,"zoom":0.35}},{"id":"ANIM_500_EAGLE_EYE_SURVEILLANCE","name":"Eagle Eye Surveillance","category":"Attentive & Curiosity","duration":3.4,"loop":false,"defExpr":12,"archType":"TECH","params":{"sweeps":3,"angle":0.38,"pitch":0.25,"zoom":0.43}},{"id":"ANIM_501_WONDERSTRUCK_STARE","name":"Wonderstruck Stare","category":"Attentive & Curiosity","duration":2,"loop":true,"defExpr":0,"archType":"TECH","params":{"sweeps":1,"angle":0.45999999999999996,"pitch":0.15,"zoom":0.51}},{"id":"ANIM_502_CURIOSITY_SPARK_BOUNCE","name":"Curiosity Spark Bounce","category":"Attentive & Curiosity","duration":2.35,"loop":false,"defExpr":4,"archType":"TECH","params":{"sweeps":2,"angle":0.54,"pitch":0.2,"zoom":0.59}},{"id":"ANIM_503_ANALYZING_STACK_TRACE","name":"Analyzing Stack Trace","category":"Attentive & Curiosity","duration":2.7,"loop":false,"defExpr":12,"archType":"TECH","params":{"sweeps":3,"angle":0.3,"pitch":0.25,"zoom":0.35}},{"id":"ANIM_504_ALERT_BEACON_SWEEP","name":"Alert Beacon Sweep","category":"Attentive & Curiosity","duration":3.05,"loop":false,"defExpr":0,"archType":"TECH","params":{"sweeps":1,"angle":0.38,"pitch":0.15,"zoom":0.43}},{"id":"ANIM_505_OBSERVATIONAL_HOVER","name":"Observational Hover","category":"Attentive & Curiosity","duration":3.4,"loop":false,"defExpr":4,"archType":"TECH","params":{"sweeps":2,"angle":0.45999999999999996,"pitch":0.2,"zoom":0.51}},{"id":"ANIM_506_QUESTIONING_GAZE_SHIFT","name":"Questioning Gaze Shift","category":"Attentive & Curiosity","duration":2,"loop":false,"defExpr":12,"archType":"TECH","params":{"sweeps":3,"angle":0.54,"pitch":0.25,"zoom":0.59}},{"id":"ANIM_507_PROBING_THE_BOUNDARY","name":"Probing The Boundary","category":"Attentive & Curiosity","duration":2.35,"loop":true,"defExpr":0,"archType":"TECH","params":{"sweeps":1,"angle":0.3,"pitch":0.15,"zoom":0.35}},{"id":"ANIM_508_EXAMINING_THE_GLITCH","name":"Examining The Glitch","category":"Attentive & Curiosity","duration":2.7,"loop":false,"defExpr":4,"archType":"TECH","params":{"sweeps":2,"angle":0.38,"pitch":0.2,"zoom":0.43}},{"id":"ANIM_509_SEARCHING_FOR_CLUES","name":"Searching For Clues","category":"Attentive & Curiosity","duration":3.05,"loop":false,"defExpr":12,"archType":"TECH","params":{"sweeps":3,"angle":0.45999999999999996,"pitch":0.25,"zoom":0.51}},{"id":"ANIM_510_KEEN_PERCEPTION_LOCK","name":"Keen Perception Lock","category":"Attentive & Curiosity","duration":3.4,"loop":false,"defExpr":0,"archType":"TECH","params":{"sweeps":1,"angle":0.54,"pitch":0.15,"zoom":0.59}},{"id":"ANIM_511_STEAM_WHISTLE_BURST","name":"Steam Whistle Burst","category":"Frustration & Anger","duration":1.8,"loop":true,"defExpr":11,"archType":"PANIC","params":{"tremor":0.07}},{"id":"ANIM_512_VOLCANO_ERUPTION_BLAST","name":"Volcano Eruption Blast","category":"Frustration & Anger","duration":2.1,"loop":false,"defExpr":7,"archType":"PANIC","params":{"tremor":0.1}},{"id":"ANIM_513_TABLE_FLIP_RECOIL","name":"Table Flip Recoil","category":"Frustration & Anger","duration":2.4,"loop":false,"defExpr":14,"archType":"PANIC","params":{"tremor":0.13}},{"id":"ANIM_514_RAM_OVERFLOW_RAGE","name":"RAM Overflow Rage","category":"Frustration & Anger","duration":2.7,"loop":false,"defExpr":11,"archType":"PANIC","params":{"tremor":0.16}},{"id":"ANIM_515_GRITTED_TEETH_SAW","name":"Gritted Teeth Saw","category":"Frustration & Anger","duration":3,"loop":false,"defExpr":7,"archType":"PANIC","params":{"tremor":0.07}},{"id":"ANIM_516_FURIOUS_JAW_CLENCH","name":"Furious Jaw Clench","category":"Frustration & Anger","duration":1.8,"loop":false,"defExpr":14,"archType":"PANIC","params":{"tremor":0.1}},{"id":"ANIM_517_BOILING_TEMP_FLARE","name":"Boiling Temp Flare","category":"Frustration & Anger","duration":2.1,"loop":true,"defExpr":11,"archType":"PANIC","params":{"tremor":0.13}},{"id":"ANIM_518_RAGE_QUAKE_SHUDDER","name":"Rage Quake Shudder","category":"Frustration & Anger","duration":2.4,"loop":false,"defExpr":7,"archType":"PANIC","params":{"tremor":0.16}},{"id":"ANIM_519_FUMING_SMOKE_VENT","name":"Fuming Smoke Vent","category":"Frustration & Anger","duration":2.7,"loop":false,"defExpr":14,"archType":"PANIC","params":{"tremor":0.07}},{"id":"ANIM_520_FIERY_RED_AURA_BURST","name":"Fiery Red Aura Burst","category":"Frustration & Anger","duration":3,"loop":false,"defExpr":11,"archType":"PANIC","params":{"tremor":0.1}},{"id":"ANIM_521_AGGRESSIVE_FORWARD_HEADBUTT","name":"Aggressive Forward Headbutt","category":"Frustration & Anger","duration":1.8,"loop":false,"defExpr":7,"archType":"PANIC","params":{"tremor":0.13}},{"id":"ANIM_522_STOMPING_GROUND_POUND","name":"Stomping Ground Pound","category":"Frustration & Anger","duration":2.1,"loop":false,"defExpr":14,"archType":"PANIC","params":{"tremor":0.16}},{"id":"ANIM_523_SYNTAX_ERROR_FURY","name":"Syntax Error Fury","category":"Frustration & Anger","duration":2.4,"loop":true,"defExpr":11,"archType":"PANIC","params":{"tremor":0.07}},{"id":"ANIM_524_KEYBOARD_SMASHING_TREMOR","name":"Keyboard Smashing Tremor","category":"Frustration & Anger","duration":2.7,"loop":false,"defExpr":7,"archType":"PANIC","params":{"tremor":0.1}},{"id":"ANIM_525_UNCHECKED_RAGE_LOOP","name":"Unchecked Rage Loop","category":"Frustration & Anger","duration":3,"loop":false,"defExpr":14,"archType":"PANIC","params":{"tremor":0.13}},{"id":"ANIM_526_INDIGNANT_BRISTLE_SHAKE","name":"Indignant Bristle Shake","category":"Frustration & Anger","duration":1.8,"loop":false,"defExpr":11,"archType":"PANIC","params":{"tremor":0.16}},{"id":"ANIM_527_SNARL_AND_LUNGE","name":"Snarl And Lunge","category":"Frustration & Anger","duration":2.1,"loop":false,"defExpr":7,"archType":"PANIC","params":{"tremor":0.07}},{"id":"ANIM_528_BLINDING_RAGE_GLARE","name":"Blinding Rage Glare","category":"Frustration & Anger","duration":2.4,"loop":false,"defExpr":14,"archType":"PANIC","params":{"tremor":0.1}},{"id":"ANIM_529_FRUSTRATED_HEAD_BANG","name":"Frustrated Head Bang","category":"Frustration & Anger","duration":2.7,"loop":true,"defExpr":11,"archType":"PANIC","params":{"tremor":0.13}},{"id":"ANIM_530_TEETH_GNASHING_VIBRATION","name":"Teeth Gnashing Vibration","category":"Frustration & Anger","duration":3,"loop":false,"defExpr":7,"archType":"PANIC","params":{"tremor":0.16}},{"id":"ANIM_531_IRRITATED_BUZZ_FLUTTER","name":"Irritated Buzz Flutter","category":"Frustration & Anger","duration":1.8,"loop":false,"defExpr":14,"archType":"PANIC","params":{"tremor":0.07}},{"id":"ANIM_532_ANGERED_HORNET_SWARM","name":"Angered Hornet Swarm","category":"Frustration & Anger","duration":2.1,"loop":false,"defExpr":11,"archType":"PANIC","params":{"tremor":0.1}},{"id":"ANIM_533_DISGUSTED_GRUNT_RECOIL","name":"Disgusted Grunt Recoil","category":"Frustration & Anger","duration":2.4,"loop":false,"defExpr":7,"archType":"PANIC","params":{"tremor":0.13}},{"id":"ANIM_534_RAGE_SNORT_HISS","name":"Rage Snort Hiss","category":"Frustration & Anger","duration":2.7,"loop":false,"defExpr":14,"archType":"PANIC","params":{"tremor":0.16}},{"id":"ANIM_535_LIVID_PULSE_THROB","name":"Livid Pulse Throb","category":"Frustration & Anger","duration":3,"loop":true,"defExpr":11,"archType":"PANIC","params":{"tremor":0.07}},{"id":"ANIM_536_HOSTILE_TERRITORY_MARK","name":"Hostile Territory Mark","category":"Frustration & Anger","duration":1.8,"loop":false,"defExpr":7,"archType":"PANIC","params":{"tremor":0.1}},{"id":"ANIM_537_THUNDERCLOUD_RUMBLING","name":"Thundercloud Rumbling","category":"Frustration & Anger","duration":2.1,"loop":false,"defExpr":14,"archType":"PANIC","params":{"tremor":0.13}},{"id":"ANIM_538_WRATHFUL_GLARE_SQUEEZE","name":"Wrathful Glare Squeeze","category":"Frustration & Anger","duration":2.4,"loop":false,"defExpr":11,"archType":"PANIC","params":{"tremor":0.16}},{"id":"ANIM_539_SPITTING_SPARKS_RAGE","name":"Spitting Sparks Rage","category":"Frustration & Anger","duration":2.7,"loop":false,"defExpr":7,"archType":"PANIC","params":{"tremor":0.07}},{"id":"ANIM_540_VOLCANIC_ASH_CHURN","name":"Volcanic Ash Churn","category":"Frustration & Anger","duration":3,"loop":false,"defExpr":14,"archType":"PANIC","params":{"tremor":0.1}},{"id":"ANIM_541_BOILING_OVER_BUBBLE","name":"Boiling Over Bubble","category":"Frustration & Anger","duration":1.8,"loop":true,"defExpr":11,"archType":"PANIC","params":{"tremor":0.13}},{"id":"ANIM_542_FURY_UNLEASHED_SNAP","name":"Fury Unleashed Snap","category":"Frustration & Anger","duration":2.1,"loop":false,"defExpr":7,"archType":"PANIC","params":{"tremor":0.16}},{"id":"ANIM_543_IRKED_BROW_TWITCH","name":"Irked Brow Twitch","category":"Frustration & Anger","duration":2.4,"loop":false,"defExpr":14,"archType":"PANIC","params":{"tremor":0.07}},{"id":"ANIM_544_OUTRAGED_JAW_DROP","name":"Outraged Jaw Drop","category":"Frustration & Anger","duration":2.7,"loop":false,"defExpr":11,"archType":"PANIC","params":{"tremor":0.1}},{"id":"ANIM_545_RAGE_TREMOR_STANCE","name":"Rage Tremor Stance","category":"Frustration & Anger","duration":3,"loop":false,"defExpr":7,"archType":"PANIC","params":{"tremor":0.13}},{"id":"ANIM_546_SEARING_GLARE_BURN","name":"Searing Glare Burn","category":"Frustration & Anger","duration":1.8,"loop":false,"defExpr":14,"archType":"PANIC","params":{"tremor":0.16}},{"id":"ANIM_547_FURIOUS_TILT_SNAP","name":"Furious Tilt Snap","category":"Frustration & Anger","duration":2.1,"loop":true,"defExpr":11,"archType":"PANIC","params":{"tremor":0.07}},{"id":"ANIM_548_ENRAGED_COUNTER_SPIN","name":"Enraged Counter-Spin","category":"Frustration & Anger","duration":2.4,"loop":false,"defExpr":7,"archType":"PANIC","params":{"tremor":0.1}},{"id":"ANIM_549_TEMPEST_FURY_HOWL","name":"Tempest Fury Howl","category":"Frustration & Anger","duration":2.7,"loop":false,"defExpr":14,"archType":"PANIC","params":{"tremor":0.13}},{"id":"ANIM_550_MOLTEN_CORE_SURGE","name":"Molten Core Surge","category":"Frustration & Anger","duration":3,"loop":false,"defExpr":11,"archType":"PANIC","params":{"tremor":0.16}},{"id":"ANIM_551_MICRO_SLEEP_SLUMP","name":"Micro Sleep Slump","category":"Drowsy & Low-Cognition","duration":2.8,"loop":true,"defExpr":13,"archType":"DROWSY","params":{"freq":1.2,"sink":0.12,"baseSink":0.08,"roll":0.15,"nod":0.14}},{"id":"ANIM_552_LOW_BATTERY_LIMP","name":"Low Battery Limp","category":"Drowsy & Low-Cognition","duration":3.1999999999999997,"loop":false,"defExpr":5,"archType":"DROWSY","params":{"freq":1.5,"sink":0.16,"baseSink":0.11,"roll":0.19,"nod":0.18000000000000002}},{"id":"ANIM_553_SNORLAX_BELLY_ROLL","name":"Snorlax Belly Roll","category":"Drowsy & Low-Cognition","duration":3.5999999999999996,"loop":false,"defExpr":0,"archType":"DROWSY","params":{"freq":1.7999999999999998,"sink":0.2,"baseSink":0.14,"roll":0.22999999999999998,"nod":0.22000000000000003}},{"id":"ANIM_554_MEMORY_LEAK_FOG","name":"Memory Leak Fog","category":"Drowsy & Low-Cognition","duration":4,"loop":false,"defExpr":13,"archType":"DROWSY","params":{"freq":1.2,"sink":0.12,"baseSink":0.08,"roll":0.27,"nod":0.14}},{"id":"ANIM_555_DREAM_FLOATING_CLOUD","name":"Dream Floating Cloud","category":"Drowsy & Low-Cognition","duration":4.4,"loop":false,"defExpr":5,"archType":"DROWSY","params":{"freq":1.5,"sink":0.16,"baseSink":0.11,"roll":0.15,"nod":0.18000000000000002}},{"id":"ANIM_556_YAWNING_BLACK_HOLE","name":"Yawning Black Hole","category":"Drowsy & Low-Cognition","duration":2.8,"loop":true,"defExpr":0,"archType":"DROWSY","params":{"freq":1.7999999999999998,"sink":0.2,"baseSink":0.14,"roll":0.19,"nod":0.22000000000000003}},{"id":"ANIM_557_NODDING_OFF_HEAVY","name":"Nodding Off Heavy","category":"Drowsy & Low-Cognition","duration":3.1999999999999997,"loop":false,"defExpr":13,"archType":"DROWSY","params":{"freq":1.2,"sink":0.12,"baseSink":0.08,"roll":0.22999999999999998,"nod":0.14}},{"id":"ANIM_558_SLEEPY_EYELID_FLUTTER","name":"Sleepy Eyelid Flutter","category":"Drowsy & Low-Cognition","duration":3.5999999999999996,"loop":false,"defExpr":5,"archType":"DROWSY","params":{"freq":1.5,"sink":0.16,"baseSink":0.11,"roll":0.27,"nod":0.18000000000000002}},{"id":"ANIM_559_HALF_ASLEEP_SWAY","name":"Half Asleep Sway","category":"Drowsy & Low-Cognition","duration":4,"loop":false,"defExpr":0,"archType":"DROWSY","params":{"freq":1.7999999999999998,"sink":0.2,"baseSink":0.14,"roll":0.15,"nod":0.22000000000000003}},{"id":"ANIM_560_DEEP_REM_JITTER","name":"Deep REM Jitter","category":"Drowsy & Low-Cognition","duration":4.4,"loop":false,"defExpr":13,"archType":"DROWSY","params":{"freq":1.2,"sink":0.12,"baseSink":0.08,"roll":0.19,"nod":0.14}},{"id":"ANIM_561_HIBERNATION_STASIS","name":"Hibernation Stasis","category":"Drowsy & Low-Cognition","duration":2.8,"loop":true,"defExpr":5,"archType":"DROWSY","params":{"freq":1.5,"sink":0.16,"baseSink":0.11,"roll":0.22999999999999998,"nod":0.18000000000000002}},{"id":"ANIM_562_LAZY_HAMMOCK_DRIFT","name":"Lazy Hammock Drift","category":"Drowsy & Low-Cognition","duration":3.1999999999999997,"loop":false,"defExpr":0,"archType":"DROWSY","params":{"freq":1.7999999999999998,"sink":0.2,"baseSink":0.14,"roll":0.27,"nod":0.22000000000000003}},{"id":"ANIM_563_NAP_TIME_SINKING","name":"Nap Time Sinking","category":"Drowsy & Low-Cognition","duration":3.5999999999999996,"loop":false,"defExpr":13,"archType":"DROWSY","params":{"freq":1.2,"sink":0.12,"baseSink":0.08,"roll":0.15,"nod":0.14}},{"id":"ANIM_564_EXHAUSTION_DEFLATE_2","name":"Exhaustion Deflate 2","category":"Drowsy & Low-Cognition","duration":4,"loop":false,"defExpr":5,"archType":"DROWSY","params":{"freq":1.5,"sink":0.16,"baseSink":0.11,"roll":0.19,"nod":0.18000000000000002}},{"id":"ANIM_565_DOZING_OFF_JERK_AWAKE","name":"Dozing Off Jerk Awake","category":"Drowsy & Low-Cognition","duration":4.4,"loop":false,"defExpr":0,"archType":"DROWSY","params":{"freq":1.7999999999999998,"sink":0.2,"baseSink":0.14,"roll":0.22999999999999998,"nod":0.22000000000000003}},{"id":"ANIM_566_GENTLE_SLEEP_BREATHING","name":"Gentle Sleep Breathing","category":"Drowsy & Low-Cognition","duration":2.8,"loop":true,"defExpr":13,"archType":"DROWSY","params":{"freq":1.2,"sink":0.12,"baseSink":0.08,"roll":0.27,"nod":0.14}},{"id":"ANIM_567_HYPNOTIC_SLUMBER_DRIFT","name":"Hypnotic Slumber Drift","category":"Drowsy & Low-Cognition","duration":3.1999999999999997,"loop":false,"defExpr":5,"archType":"DROWSY","params":{"freq":1.5,"sink":0.16,"baseSink":0.11,"roll":0.15,"nod":0.18000000000000002}},{"id":"ANIM_568_ZZZ_FLOATING_BUBBLE","name":"Zzz Floating Bubble","category":"Drowsy & Low-Cognition","duration":3.5999999999999996,"loop":false,"defExpr":0,"archType":"DROWSY","params":{"freq":1.7999999999999998,"sink":0.2,"baseSink":0.14,"roll":0.19,"nod":0.22000000000000003}},{"id":"ANIM_569_SLUGGISH_INERTIA_WOBBLE","name":"Sluggish Inertia Wobble","category":"Drowsy & Low-Cognition","duration":4,"loop":false,"defExpr":13,"archType":"DROWSY","params":{"freq":1.2,"sink":0.12,"baseSink":0.08,"roll":0.22999999999999998,"nod":0.14}},{"id":"ANIM_570_SLEEPYHEAD_TILT","name":"Sleepyhead Tilt","category":"Drowsy & Low-Cognition","duration":4.4,"loop":false,"defExpr":5,"archType":"DROWSY","params":{"freq":1.5,"sink":0.16,"baseSink":0.11,"roll":0.27,"nod":0.18000000000000002}},{"id":"ANIM_571_DRIFTING_INTO_DREAMS","name":"Drifting Into Dreams","category":"Drowsy & Low-Cognition","duration":2.8,"loop":true,"defExpr":0,"archType":"DROWSY","params":{"freq":1.7999999999999998,"sink":0.2,"baseSink":0.14,"roll":0.15,"nod":0.22000000000000003}},{"id":"ANIM_572_WEIGHTED_EYELIDS_DROP","name":"Weighted Eyelids Drop","category":"Drowsy & Low-Cognition","duration":3.1999999999999997,"loop":false,"defExpr":13,"archType":"DROWSY","params":{"freq":1.2,"sink":0.12,"baseSink":0.08,"roll":0.19,"nod":0.14}},{"id":"ANIM_573_LETHARGIC_ROLL_OVER","name":"Lethargic Roll Over","category":"Drowsy & Low-Cognition","duration":3.5999999999999996,"loop":false,"defExpr":5,"archType":"DROWSY","params":{"freq":1.5,"sink":0.16,"baseSink":0.11,"roll":0.22999999999999998,"nod":0.18000000000000002}},{"id":"ANIM_574_STUPOR_COMA_STILLNESS","name":"Stupor Coma Stillness","category":"Drowsy & Low-Cognition","duration":4,"loop":false,"defExpr":0,"archType":"DROWSY","params":{"freq":1.7999999999999998,"sink":0.2,"baseSink":0.14,"roll":0.27,"nod":0.22000000000000003}},{"id":"ANIM_575_COUNTING_ELECTRIC_SHEEP","name":"Counting Electric Sheep","category":"Drowsy & Low-Cognition","duration":4.4,"loop":false,"defExpr":13,"archType":"DROWSY","params":{"freq":1.2,"sink":0.12,"baseSink":0.08,"roll":0.15,"nod":0.14}},{"id":"ANIM_576_SLEEPWALKING_STUMBLE","name":"Sleepwalking Stumble","category":"Drowsy & Low-Cognition","duration":2.8,"loop":true,"defExpr":5,"archType":"DROWSY","params":{"freq":1.5,"sink":0.16,"baseSink":0.11,"roll":0.19,"nod":0.18000000000000002}},{"id":"ANIM_577_DEEP_SNOOZE_VIBRATION","name":"Deep Snooze Vibration","category":"Drowsy & Low-Cognition","duration":3.1999999999999997,"loop":false,"defExpr":0,"archType":"DROWSY","params":{"freq":1.7999999999999998,"sink":0.2,"baseSink":0.14,"roll":0.22999999999999998,"nod":0.22000000000000003}},{"id":"ANIM_578_LOW_VOLTAGE_DRIFT","name":"Low Voltage Drift","category":"Drowsy & Low-Cognition","duration":3.5999999999999996,"loop":false,"defExpr":13,"archType":"DROWSY","params":{"freq":1.2,"sink":0.12,"baseSink":0.08,"roll":0.27,"nod":0.14}},{"id":"ANIM_579_EXHAUSTED_CORE_SHUTDOWN","name":"Exhausted Core Shutdown","category":"Drowsy & Low-Cognition","duration":4,"loop":false,"defExpr":5,"archType":"DROWSY","params":{"freq":1.5,"sink":0.16,"baseSink":0.11,"roll":0.15,"nod":0.18000000000000002}},{"id":"ANIM_580_COZY_PAJAMA_SNUGGLE","name":"Cozy Pajama Snuggle","category":"Drowsy & Low-Cognition","duration":4.4,"loop":false,"defExpr":0,"archType":"DROWSY","params":{"freq":1.7999999999999998,"sink":0.2,"baseSink":0.14,"roll":0.19,"nod":0.22000000000000003}},{"id":"ANIM_581_DREAMING_OF_FLYING","name":"Dreaming Of Flying","category":"Drowsy & Low-Cognition","duration":2.8,"loop":true,"defExpr":13,"archType":"DROWSY","params":{"freq":1.2,"sink":0.12,"baseSink":0.08,"roll":0.22999999999999998,"nod":0.14}},{"id":"ANIM_582_RESTFUL_ZEN_FLOATING","name":"Restful Zen Floating","category":"Drowsy & Low-Cognition","duration":3.1999999999999997,"loop":false,"defExpr":5,"archType":"DROWSY","params":{"freq":1.5,"sink":0.16,"baseSink":0.11,"roll":0.27,"nod":0.18000000000000002}},{"id":"ANIM_583_TWILIGHT_CONSCIOUSNESS","name":"Twilight Consciousness","category":"Drowsy & Low-Cognition","duration":3.5999999999999996,"loop":false,"defExpr":0,"archType":"DROWSY","params":{"freq":1.7999999999999998,"sink":0.2,"baseSink":0.14,"roll":0.15,"nod":0.22000000000000003}},{"id":"ANIM_584_SOFT_PILLOW_SQUASH","name":"Soft Pillow Squash","category":"Drowsy & Low-Cognition","duration":4,"loop":false,"defExpr":13,"archType":"DROWSY","params":{"freq":1.2,"sink":0.12,"baseSink":0.08,"roll":0.19,"nod":0.14}},{"id":"ANIM_585_BEDTIME_STORY_SIGH","name":"Bedtime Story Sigh","category":"Drowsy & Low-Cognition","duration":4.4,"loop":false,"defExpr":5,"archType":"DROWSY","params":{"freq":1.5,"sink":0.16,"baseSink":0.11,"roll":0.22999999999999998,"nod":0.18000000000000002}},{"id":"ANIM_586_BOSS_PHASE_2_TRANSITION","name":"Boss Phase 2 Transition","category":"Combat & Boss Battles","duration":1.8,"loop":true,"defExpr":7,"archType":"COMBAT","params":{"coilZ":0.45,"coilPitch":0.18,"thrustZ":1.1,"jawBurst":0.6}},{"id":"ANIM_587_BULLET_HELL_OMNIDODGE","name":"Bullet Hell Omnidodge","category":"Combat & Boss Battles","duration":2.1,"loop":false,"defExpr":11,"archType":"COMBAT","params":{"coilZ":0.6,"coilPitch":0.24,"thrustZ":1.35,"jawBurst":0.75}},{"id":"ANIM_588_PERFECT_PARRY_FLASH","name":"Perfect Parry Flash","category":"Combat & Boss Battles","duration":2.4,"loop":false,"defExpr":2,"archType":"COMBAT","params":{"coilZ":0.75,"coilPitch":0.3,"thrustZ":1.6,"jawBurst":0.8999999999999999}},{"id":"ANIM_589_OMAEWA_MOU_SHINDEIRU","name":"Omaewa Mou Shindeiru","category":"Combat & Boss Battles","duration":2.7,"loop":false,"defExpr":8,"archType":"COMBAT","params":{"coilZ":0.45,"coilPitch":0.18,"thrustZ":1.85,"jawBurst":0.6}},{"id":"ANIM_590_CHARGED_ENERGY_BEAM","name":"Charged Energy Beam","category":"Combat & Boss Battles","duration":3,"loop":false,"defExpr":7,"archType":"COMBAT","params":{"coilZ":0.6,"coilPitch":0.24,"thrustZ":1.1,"jawBurst":0.75}},{"id":"ANIM_591_LIMIT_BREAK_UNLEASH","name":"Limit Break Unleash","category":"Combat & Boss Battles","duration":1.8,"loop":false,"defExpr":11,"archType":"COMBAT","params":{"coilZ":0.75,"coilPitch":0.3,"thrustZ":1.35,"jawBurst":0.8999999999999999}},{"id":"ANIM_592_SHADOW_CLONE_DESYNC","name":"Shadow Clone Desync","category":"Combat & Boss Battles","duration":2.1,"loop":false,"defExpr":2,"archType":"COMBAT","params":{"coilZ":0.45,"coilPitch":0.18,"thrustZ":1.6,"jawBurst":0.6}},{"id":"ANIM_593_CRITICAL_HIT_STAGGER","name":"Critical Hit Stagger","category":"Combat & Boss Battles","duration":2.4,"loop":true,"defExpr":8,"archType":"COMBAT","params":{"coilZ":0.6,"coilPitch":0.24,"thrustZ":1.85,"jawBurst":0.75}},{"id":"ANIM_594_SONIC_BOOM_DASH","name":"Sonic Boom Dash","category":"Combat & Boss Battles","duration":2.7,"loop":false,"defExpr":7,"archType":"COMBAT","params":{"coilZ":0.75,"coilPitch":0.3,"thrustZ":1.1,"jawBurst":0.8999999999999999}},{"id":"ANIM_595_DRAGON_UPPER_CUT","name":"Dragon Upper Cut","category":"Combat & Boss Battles","duration":3,"loop":false,"defExpr":11,"archType":"COMBAT","params":{"coilZ":0.45,"coilPitch":0.18,"thrustZ":1.35,"jawBurst":0.6}},{"id":"ANIM_596_SHIELD_BASH_IMPACT","name":"Shield Bash Impact","category":"Combat & Boss Battles","duration":1.8,"loop":false,"defExpr":2,"archType":"COMBAT","params":{"coilZ":0.6,"coilPitch":0.24,"thrustZ":1.6,"jawBurst":0.75}},{"id":"ANIM_597_KATANA_QUICK_DRAW","name":"Katana Quick Draw","category":"Combat & Boss Battles","duration":2.1,"loop":false,"defExpr":8,"archType":"COMBAT","params":{"coilZ":0.75,"coilPitch":0.3,"thrustZ":1.85,"jawBurst":0.8999999999999999}},{"id":"ANIM_598_COUNTER_ATTACK_RIPOSTE","name":"Counter Attack Riposte","category":"Combat & Boss Battles","duration":2.4,"loop":false,"defExpr":7,"archType":"COMBAT","params":{"coilZ":0.45,"coilPitch":0.18,"thrustZ":1.1,"jawBurst":0.6}},{"id":"ANIM_599_SPINNING_VORTEX_KICK","name":"Spinning Vortex Kick","category":"Combat & Boss Battles","duration":2.7,"loop":false,"defExpr":11,"archType":"COMBAT","params":{"coilZ":0.6,"coilPitch":0.24,"thrustZ":1.35,"jawBurst":0.75}},{"id":"ANIM_600_SUPER_ARMOR_ABSORB","name":"Super Armor Absorb","category":"Combat & Boss Battles","duration":3,"loop":true,"defExpr":2,"archType":"COMBAT","params":{"coilZ":0.75,"coilPitch":0.3,"thrustZ":1.6,"jawBurst":0.8999999999999999}},{"id":"ANIM_601_INVINCIBILITY_FRAME_ROLL","name":"Invincibility Frame Roll","category":"Combat & Boss Battles","duration":1.8,"loop":false,"defExpr":8,"archType":"COMBAT","params":{"coilZ":0.45,"coilPitch":0.18,"thrustZ":1.85,"jawBurst":0.6}},{"id":"ANIM_602_RAID_BOSS_ROAR","name":"Raid Boss Roar","category":"Combat & Boss Battles","duration":2.1,"loop":false,"defExpr":7,"archType":"COMBAT","params":{"coilZ":0.6,"coilPitch":0.24,"thrustZ":1.1,"jawBurst":0.75}},{"id":"ANIM_603_BERSERKER_RAGE_DASH","name":"Berserker Rage Dash","category":"Combat & Boss Battles","duration":2.4,"loop":false,"defExpr":11,"archType":"COMBAT","params":{"coilZ":0.75,"coilPitch":0.3,"thrustZ":1.35,"jawBurst":0.8999999999999999}},{"id":"ANIM_604_METEOR_STRIKE_DIVE","name":"Meteor Strike Dive","category":"Combat & Boss Battles","duration":2.7,"loop":false,"defExpr":2,"archType":"COMBAT","params":{"coilZ":0.45,"coilPitch":0.18,"thrustZ":1.6,"jawBurst":0.6}},{"id":"ANIM_605_KINETIC_BLAST_SHOCKWAVE","name":"Kinetic Blast Shockwave","category":"Combat & Boss Battles","duration":3,"loop":false,"defExpr":8,"archType":"COMBAT","params":{"coilZ":0.6,"coilPitch":0.24,"thrustZ":1.85,"jawBurst":0.75}},{"id":"ANIM_606_GRAPPLE_HOOK_SWING","name":"Grapple Hook Swing","category":"Combat & Boss Battles","duration":1.8,"loop":false,"defExpr":7,"archType":"COMBAT","params":{"coilZ":0.75,"coilPitch":0.3,"thrustZ":1.1,"jawBurst":0.8999999999999999}},{"id":"ANIM_607_DOUBLE_JUMP_SOMERSAULT","name":"Double Jump Somersault","category":"Combat & Boss Battles","duration":2.1,"loop":true,"defExpr":11,"archType":"COMBAT","params":{"coilZ":0.45,"coilPitch":0.18,"thrustZ":1.35,"jawBurst":0.6}},{"id":"ANIM_608_RHYTHM_PARRY_COUNTER","name":"Rhythm Parry Counter","category":"Combat & Boss Battles","duration":2.4,"loop":false,"defExpr":2,"archType":"COMBAT","params":{"coilZ":0.6,"coilPitch":0.24,"thrustZ":1.6,"jawBurst":0.75}},{"id":"ANIM_609_ENERGY_SHIELD_DEFLECT","name":"Energy Shield Deflect","category":"Combat & Boss Battles","duration":2.7,"loop":false,"defExpr":8,"archType":"COMBAT","params":{"coilZ":0.75,"coilPitch":0.3,"thrustZ":1.85,"jawBurst":0.8999999999999999}},{"id":"ANIM_610_FINISHER_COMBO_STRIKE","name":"Finisher Combo Strike","category":"Combat & Boss Battles","duration":3,"loop":false,"defExpr":7,"archType":"COMBAT","params":{"coilZ":0.45,"coilPitch":0.18,"thrustZ":1.1,"jawBurst":0.6}},{"id":"ANIM_611_ADRENALINE_RUSH_SURGE","name":"Adrenaline Rush Surge","category":"Combat & Boss Battles","duration":1.8,"loop":false,"defExpr":11,"archType":"COMBAT","params":{"coilZ":0.6,"coilPitch":0.24,"thrustZ":1.35,"jawBurst":0.75}},{"id":"ANIM_612_HEALTH_BAR_DEPLETED_FAINT","name":"Health Bar Depleted Faint","category":"Combat & Boss Battles","duration":2.1,"loop":false,"defExpr":2,"archType":"COMBAT","params":{"coilZ":0.75,"coilPitch":0.3,"thrustZ":1.6,"jawBurst":0.8999999999999999}},{"id":"ANIM_613_SECOND_WIND_REVIVAL","name":"Second Wind Revival","category":"Combat & Boss Battles","duration":2.4,"loop":false,"defExpr":8,"archType":"COMBAT","params":{"coilZ":0.45,"coilPitch":0.18,"thrustZ":1.85,"jawBurst":0.6}},{"id":"ANIM_614_GROUND_SLAM_TREMOR","name":"Ground Slam Tremor","category":"Combat & Boss Battles","duration":2.7,"loop":true,"defExpr":7,"archType":"COMBAT","params":{"coilZ":0.6,"coilPitch":0.24,"thrustZ":1.1,"jawBurst":0.75}},{"id":"ANIM_615_TACTICAL_DODGE_ROLL","name":"Tactical Dodge Roll","category":"Combat & Boss Battles","duration":3,"loop":false,"defExpr":11,"archType":"COMBAT","params":{"coilZ":0.75,"coilPitch":0.3,"thrustZ":1.35,"jawBurst":0.8999999999999999}},{"id":"ANIM_616_STAMINA_RECOVERY_PANT","name":"Stamina Recovery Pant","category":"Combat & Boss Battles","duration":1.8,"loop":false,"defExpr":2,"archType":"COMBAT","params":{"coilZ":0.45,"coilPitch":0.18,"thrustZ":1.6,"jawBurst":0.6}},{"id":"ANIM_617_SNIPER_RIFLE_FOCUS_LOCK","name":"Sniper Rifle Focus Lock","category":"Combat & Boss Battles","duration":2.1,"loop":false,"defExpr":8,"archType":"COMBAT","params":{"coilZ":0.6,"coilPitch":0.24,"thrustZ":1.85,"jawBurst":0.75}},{"id":"ANIM_618_FLURRY_RUSH_PUNCHES","name":"Flurry Rush Punches","category":"Combat & Boss Battles","duration":2.4,"loop":false,"defExpr":7,"archType":"COMBAT","params":{"coilZ":0.75,"coilPitch":0.3,"thrustZ":1.1,"jawBurst":0.8999999999999999}},{"id":"ANIM_619_SHOCKWAVE_STOMP_QUAKE","name":"Shockwave Stomp Quake","category":"Combat & Boss Battles","duration":2.7,"loop":false,"defExpr":11,"archType":"COMBAT","params":{"coilZ":0.45,"coilPitch":0.18,"thrustZ":1.35,"jawBurst":0.6}},{"id":"ANIM_620_KI_CHARGE_VIBRATION","name":"Ki Charge Vibration","category":"Combat & Boss Battles","duration":3,"loop":false,"defExpr":2,"archType":"COMBAT","params":{"coilZ":0.6,"coilPitch":0.24,"thrustZ":1.6,"jawBurst":0.75}},{"id":"ANIM_621_DIMENSION_SLASH_FLASH","name":"Dimension Slash Flash","category":"Combat & Boss Battles","duration":1.8,"loop":true,"defExpr":8,"archType":"COMBAT","params":{"coilZ":0.75,"coilPitch":0.3,"thrustZ":1.85,"jawBurst":0.8999999999999999}},{"id":"ANIM_622_FINAL_FORM_AWAKEN","name":"Final Form Awaken","category":"Combat & Boss Battles","duration":2.1,"loop":false,"defExpr":7,"archType":"COMBAT","params":{"coilZ":0.45,"coilPitch":0.18,"thrustZ":1.1,"jawBurst":0.6}},{"id":"ANIM_623_OVERDRIVE_HEAT_RELEASE","name":"Overdrive Heat Release","category":"Combat & Boss Battles","duration":2.4,"loop":false,"defExpr":11,"archType":"COMBAT","params":{"coilZ":0.6,"coilPitch":0.24,"thrustZ":1.35,"jawBurst":0.75}},{"id":"ANIM_624_TACTICAL_SMOKE_SCREEN","name":"Tactical Smoke Screen","category":"Combat & Boss Battles","duration":2.7,"loop":false,"defExpr":2,"archType":"COMBAT","params":{"coilZ":0.75,"coilPitch":0.3,"thrustZ":1.6,"jawBurst":0.8999999999999999}},{"id":"ANIM_625_VICTORY_STANCE_SALUTE","name":"Victory Stance Salute","category":"Combat & Boss Battles","duration":3,"loop":false,"defExpr":8,"archType":"COMBAT","params":{"coilZ":0.45,"coilPitch":0.18,"thrustZ":1.85,"jawBurst":0.6}},{"id":"ANIM_626_140_BPM_TECHNO_BANG","name":"140 BPM Techno Bang","category":"Music, Rhythm & Dance","duration":2,"loop":true,"defExpr":0,"archType":"MUSIC","params":{"bpm":7,"sharpness":2.5,"bounce":0.2,"squash":0.16,"stretch":0.1,"roll":0.12,"jaw":0.3}},{"id":"ANIM_627_SUB_BASS_DROP_IMPACT","name":"Sub-Bass Drop Impact","category":"Music, Rhythm & Dance","duration":2.25,"loop":false,"defExpr":6,"archType":"MUSIC","params":{"bpm":8.5,"sharpness":3.3,"bounce":0.25,"squash":0.2,"stretch":0.13,"roll":0.16,"jaw":0.36}},{"id":"ANIM_628_DISCO_FEVER_ROLL","name":"Disco Fever Roll","category":"Music, Rhythm & Dance","duration":2.5,"loop":false,"defExpr":8,"archType":"MUSIC","params":{"bpm":10,"sharpness":4.1,"bounce":0.30000000000000004,"squash":0.24,"stretch":0.16,"roll":0.2,"jaw":0.42}},{"id":"ANIM_629_BREAKDANCE_WINDMILL_SPIN","name":"Breakdance Windmill Spin","category":"Music, Rhythm & Dance","duration":2.75,"loop":false,"defExpr":3,"archType":"MUSIC","params":{"bpm":11.5,"sharpness":2.5,"bounce":0.35000000000000003,"squash":0.16,"stretch":0.1,"roll":0.12,"jaw":0.48}},{"id":"ANIM_630_PRECISION_METRONOME_SWAY","name":"Precision Metronome Sway","category":"Music, Rhythm & Dance","duration":3,"loop":true,"defExpr":0,"archType":"MUSIC","params":{"bpm":13,"sharpness":3.3,"bounce":0.2,"squash":0.2,"stretch":0.13,"roll":0.16,"jaw":0.3}},{"id":"ANIM_631_HEAVY_METAL_HEADBANG","name":"Heavy Metal Headbang","category":"Music, Rhythm & Dance","duration":2,"loop":false,"defExpr":6,"archType":"MUSIC","params":{"bpm":14.5,"sharpness":4.1,"bounce":0.25,"squash":0.24,"stretch":0.16,"roll":0.2,"jaw":0.36}},{"id":"ANIM_632_FUNKY_GROOVY_WIGGLE","name":"Funky Groovy Wiggle","category":"Music, Rhythm & Dance","duration":2.25,"loop":false,"defExpr":8,"archType":"MUSIC","params":{"bpm":7,"sharpness":2.5,"bounce":0.30000000000000004,"squash":0.16,"stretch":0.1,"roll":0.12,"jaw":0.42}},{"id":"ANIM_633_JAZZ_CLUB_FINGER_SNAP","name":"Jazz Club Finger Snap","category":"Music, Rhythm & Dance","duration":2.5,"loop":false,"defExpr":3,"archType":"MUSIC","params":{"bpm":8.5,"sharpness":3.3,"bounce":0.35000000000000003,"squash":0.2,"stretch":0.13,"roll":0.16,"jaw":0.48}},{"id":"ANIM_634_SYNTHWAVE_NEON_PULSE","name":"Synthwave Neon Pulse","category":"Music, Rhythm & Dance","duration":2.75,"loop":true,"defExpr":0,"archType":"MUSIC","params":{"bpm":10,"sharpness":4.1,"bounce":0.2,"squash":0.24,"stretch":0.16,"roll":0.2,"jaw":0.3}},{"id":"ANIM_635_DUBSTEP_WOBBLE_BASS","name":"Dubstep Wobble Bass","category":"Music, Rhythm & Dance","duration":3,"loop":false,"defExpr":6,"archType":"MUSIC","params":{"bpm":11.5,"sharpness":2.5,"bounce":0.25,"squash":0.16,"stretch":0.1,"roll":0.12,"jaw":0.36}},{"id":"ANIM_636_REGGAE_OFFBEAT_SWAY","name":"Reggae Offbeat Sway","category":"Music, Rhythm & Dance","duration":2,"loop":false,"defExpr":8,"archType":"MUSIC","params":{"bpm":13,"sharpness":3.3,"bounce":0.30000000000000004,"squash":0.2,"stretch":0.13,"roll":0.16,"jaw":0.42}},{"id":"ANIM_637_DRUM_SOLO_SYNCOPATION","name":"Drum Solo Syncopation","category":"Music, Rhythm & Dance","duration":2.25,"loop":false,"defExpr":3,"archType":"MUSIC","params":{"bpm":14.5,"sharpness":4.1,"bounce":0.35000000000000003,"squash":0.24,"stretch":0.16,"roll":0.2,"jaw":0.48}},{"id":"ANIM_638_WALTZ_FLUID_PIROUETTE","name":"Waltz Fluid Pirouette","category":"Music, Rhythm & Dance","duration":2.5,"loop":true,"defExpr":0,"archType":"MUSIC","params":{"bpm":7,"sharpness":2.5,"bounce":0.2,"squash":0.16,"stretch":0.1,"roll":0.12,"jaw":0.3}},{"id":"ANIM_639_HIP_HOP_BOUNCE_BOOM","name":"Hip Hop Bounce Boom","category":"Music, Rhythm & Dance","duration":2.75,"loop":false,"defExpr":6,"archType":"MUSIC","params":{"bpm":8.5,"sharpness":3.3,"bounce":0.25,"squash":0.2,"stretch":0.13,"roll":0.16,"jaw":0.36}},{"id":"ANIM_640_EDM_BUILD_UP_STUTTER","name":"EDM Build Up Stutter","category":"Music, Rhythm & Dance","duration":3,"loop":false,"defExpr":8,"archType":"MUSIC","params":{"bpm":10,"sharpness":4.1,"bounce":0.30000000000000004,"squash":0.24,"stretch":0.16,"roll":0.2,"jaw":0.42}},{"id":"ANIM_641_DROP_THE_NEEDLE_SCRATCH","name":"Drop The Needle Scratch","category":"Music, Rhythm & Dance","duration":2,"loop":false,"defExpr":3,"archType":"MUSIC","params":{"bpm":11.5,"sharpness":2.5,"bounce":0.35000000000000003,"squash":0.16,"stretch":0.1,"roll":0.12,"jaw":0.48}},{"id":"ANIM_642_PSYTRANCE_RAPID_STOMP","name":"Psytrance Rapid Stomp","category":"Music, Rhythm & Dance","duration":2.25,"loop":true,"defExpr":0,"archType":"MUSIC","params":{"bpm":13,"sharpness":3.3,"bounce":0.2,"squash":0.2,"stretch":0.13,"roll":0.16,"jaw":0.3}},{"id":"ANIM_643_SALSA_HIP_SHAKE","name":"Salsa Hip Shake","category":"Music, Rhythm & Dance","duration":2.5,"loop":false,"defExpr":6,"archType":"MUSIC","params":{"bpm":14.5,"sharpness":4.1,"bounce":0.25,"squash":0.24,"stretch":0.16,"roll":0.2,"jaw":0.36}},{"id":"ANIM_644_ACAPELLA_HARMONY_HUM","name":"Acapella Harmony Hum","category":"Music, Rhythm & Dance","duration":2.75,"loop":false,"defExpr":8,"archType":"MUSIC","params":{"bpm":7,"sharpness":2.5,"bounce":0.30000000000000004,"squash":0.16,"stretch":0.1,"roll":0.12,"jaw":0.42}},{"id":"ANIM_645_808_KICK_DRUM_PUNCH","name":"808 Kick Drum Punch","category":"Music, Rhythm & Dance","duration":3,"loop":false,"defExpr":3,"archType":"MUSIC","params":{"bpm":8.5,"sharpness":3.3,"bounce":0.35000000000000003,"squash":0.2,"stretch":0.13,"roll":0.16,"jaw":0.48}},{"id":"ANIM_646_GUITAR_SOLO_BEND","name":"Guitar Solo Bend","category":"Music, Rhythm & Dance","duration":2,"loop":true,"defExpr":0,"archType":"MUSIC","params":{"bpm":10,"sharpness":4.1,"bounce":0.2,"squash":0.24,"stretch":0.16,"roll":0.2,"jaw":0.3}},{"id":"ANIM_647_RAVE_LASER_STROBE","name":"Rave Laser Strobe","category":"Music, Rhythm & Dance","duration":2.25,"loop":false,"defExpr":6,"archType":"MUSIC","params":{"bpm":11.5,"sharpness":2.5,"bounce":0.25,"squash":0.16,"stretch":0.1,"roll":0.12,"jaw":0.36}},{"id":"ANIM_648_BREAKBEAT_GLITCH_FLIP","name":"Breakbeat Glitch Flip","category":"Music, Rhythm & Dance","duration":2.5,"loop":false,"defExpr":8,"archType":"MUSIC","params":{"bpm":13,"sharpness":3.3,"bounce":0.30000000000000004,"squash":0.2,"stretch":0.13,"roll":0.16,"jaw":0.42}},{"id":"ANIM_649_SAXOPHONE_SMOOTH_SWAY","name":"Saxophone Smooth Sway","category":"Music, Rhythm & Dance","duration":2.75,"loop":false,"defExpr":3,"archType":"MUSIC","params":{"bpm":14.5,"sharpness":4.1,"bounce":0.35000000000000003,"squash":0.24,"stretch":0.16,"roll":0.2,"jaw":0.48}},{"id":"ANIM_650_VINYL_WARMTH_CRACKLE","name":"Vinyl Warmth Crackle","category":"Music, Rhythm & Dance","duration":3,"loop":true,"defExpr":0,"archType":"MUSIC","params":{"bpm":7,"sharpness":2.5,"bounce":0.2,"squash":0.16,"stretch":0.1,"roll":0.12,"jaw":0.3}},{"id":"ANIM_651_TAMBOURINE_JINGLE_BOB","name":"Tambourine Jingle Bob","category":"Music, Rhythm & Dance","duration":2,"loop":false,"defExpr":6,"archType":"MUSIC","params":{"bpm":8.5,"sharpness":3.3,"bounce":0.25,"squash":0.2,"stretch":0.13,"roll":0.16,"jaw":0.36}},{"id":"ANIM_652_LO_FI_BEATS_CHILL_BOB","name":"Lo-Fi Beats Chill Bob","category":"Music, Rhythm & Dance","duration":2.25,"loop":false,"defExpr":8,"archType":"MUSIC","params":{"bpm":10,"sharpness":4.1,"bounce":0.30000000000000004,"squash":0.24,"stretch":0.16,"roll":0.2,"jaw":0.42}},{"id":"ANIM_653_ORCHESTRA_CONDUCTOR_WAVE","name":"Orchestra Conductor Wave","category":"Music, Rhythm & Dance","duration":2.5,"loop":false,"defExpr":3,"archType":"MUSIC","params":{"bpm":11.5,"sharpness":2.5,"bounce":0.35000000000000003,"squash":0.16,"stretch":0.1,"roll":0.12,"jaw":0.48}},{"id":"ANIM_654_BASSLINE_SLAP_FUNK","name":"Bassline Slap Funk","category":"Music, Rhythm & Dance","duration":2.75,"loop":true,"defExpr":0,"archType":"MUSIC","params":{"bpm":13,"sharpness":3.3,"bounce":0.2,"squash":0.2,"stretch":0.13,"roll":0.16,"jaw":0.3}},{"id":"ANIM_655_CHOIR_CRESCENDO_SWELL","name":"Choir Crescendo Swell","category":"Music, Rhythm & Dance","duration":3,"loop":false,"defExpr":6,"archType":"MUSIC","params":{"bpm":14.5,"sharpness":4.1,"bounce":0.25,"squash":0.24,"stretch":0.16,"roll":0.2,"jaw":0.36}},{"id":"ANIM_656_TEMPO_DOUBLE_TIME_RUSH","name":"Tempo Double Time Rush","category":"Music, Rhythm & Dance","duration":2,"loop":false,"defExpr":8,"archType":"MUSIC","params":{"bpm":7,"sharpness":2.5,"bounce":0.30000000000000004,"squash":0.16,"stretch":0.1,"roll":0.12,"jaw":0.42}},{"id":"ANIM_657_TURNTABLE_SPINBACK","name":"Turntable Spinback","category":"Music, Rhythm & Dance","duration":2.25,"loop":false,"defExpr":3,"archType":"MUSIC","params":{"bpm":8.5,"sharpness":3.3,"bounce":0.35000000000000003,"squash":0.2,"stretch":0.13,"roll":0.16,"jaw":0.48}},{"id":"ANIM_658_SYNTHESIZER_ARPEGGIATOR","name":"Synthesizer Arpeggiator","category":"Music, Rhythm & Dance","duration":2.5,"loop":true,"defExpr":0,"archType":"MUSIC","params":{"bpm":10,"sharpness":4.1,"bounce":0.2,"squash":0.24,"stretch":0.16,"roll":0.2,"jaw":0.3}},{"id":"ANIM_659_POLYRHYTHM_3_AGAINST_4","name":"Polyrhythm 3 Against 4","category":"Music, Rhythm & Dance","duration":2.75,"loop":false,"defExpr":6,"archType":"MUSIC","params":{"bpm":11.5,"sharpness":2.5,"bounce":0.25,"squash":0.16,"stretch":0.1,"roll":0.12,"jaw":0.36}},{"id":"ANIM_660_DANCE_FLOOR_SLIDE","name":"Dance Floor Slide","category":"Music, Rhythm & Dance","duration":3,"loop":false,"defExpr":8,"archType":"MUSIC","params":{"bpm":13,"sharpness":3.3,"bounce":0.30000000000000004,"squash":0.2,"stretch":0.13,"roll":0.16,"jaw":0.42}},{"id":"ANIM_661_ACOUSTIC_STRUM_WOBBLE","name":"Acoustic Strum Wobble","category":"Music, Rhythm & Dance","duration":2,"loop":false,"defExpr":3,"archType":"MUSIC","params":{"bpm":14.5,"sharpness":4.1,"bounce":0.35000000000000003,"squash":0.24,"stretch":0.16,"roll":0.2,"jaw":0.48}},{"id":"ANIM_662_CLUB_LIGHT_SWEEPER","name":"Club Light Sweeper","category":"Music, Rhythm & Dance","duration":2.25,"loop":true,"defExpr":0,"archType":"MUSIC","params":{"bpm":7,"sharpness":2.5,"bounce":0.2,"squash":0.16,"stretch":0.1,"roll":0.12,"jaw":0.3}},{"id":"ANIM_663_SUBWOOFER_AIR_PUFF","name":"Subwoofer Air Puff","category":"Music, Rhythm & Dance","duration":2.5,"loop":false,"defExpr":6,"archType":"MUSIC","params":{"bpm":8.5,"sharpness":3.3,"bounce":0.25,"squash":0.2,"stretch":0.13,"roll":0.16,"jaw":0.36}},{"id":"ANIM_664_GLITCH_HOP_SYNCOPATE","name":"Glitch Hop Syncopate","category":"Music, Rhythm & Dance","duration":2.75,"loop":false,"defExpr":8,"archType":"MUSIC","params":{"bpm":10,"sharpness":4.1,"bounce":0.30000000000000004,"squash":0.24,"stretch":0.16,"roll":0.2,"jaw":0.42}},{"id":"ANIM_665_FESTIVAL_ANTHEM_JUMP","name":"Festival Anthem Jump","category":"Music, Rhythm & Dance","duration":3,"loop":false,"defExpr":3,"archType":"MUSIC","params":{"bpm":11.5,"sharpness":2.5,"bounce":0.35000000000000003,"squash":0.16,"stretch":0.1,"roll":0.12,"jaw":0.48}},{"id":"ANIM_666_WALLPAPER_BURROW_DEPTH","name":"Wallpaper Burrow Depth","category":"Desktop Meta & Glitch","duration":2.2,"loop":true,"defExpr":6,"archType":"HORROR","params":{"seed":50,"speed":28,"amp":0.07,"rotMult":2.2,"horror":0.6,"pupilMin":0.3,"pupilMax":1.3,"jaw":0.35,"noBlink":false}},{"id":"ANIM_667_PIXEL_DISPERSION_SAND","name":"Pixel Dispersion Sand","category":"Desktop Meta & Glitch","duration":2.5500000000000003,"loop":false,"defExpr":9,"archType":"HORROR","params":{"seed":51,"speed":36,"amp":0.09000000000000001,"rotMult":2.7,"horror":0.7,"pupilMin":0.3,"pupilMax":1.3,"jaw":0.44999999999999996,"noBlink":false}},{"id":"ANIM_668_15HZ_CINEMA_STUTTER","name":"15Hz Cinema Stutter","category":"Desktop Meta & Glitch","duration":2.9000000000000004,"loop":false,"defExpr":7,"archType":"HORROR","params":{"seed":52,"speed":44,"amp":0.11000000000000001,"rotMult":3.2,"horror":0.8,"pupilMin":0.3,"pupilMax":1.3,"jaw":0.55,"noBlink":false}},{"id":"ANIM_669_CURSOR_MAGNET_LUNGE","name":"Cursor Magnet Lunge","category":"Desktop Meta & Glitch","duration":3.25,"loop":false,"defExpr":0,"archType":"HORROR","params":{"seed":53,"speed":52,"amp":0.13,"rotMult":2.2,"horror":0.9,"pupilMin":0.3,"pupilMax":1.3,"jaw":0.35,"noBlink":false}},{"id":"ANIM_670_WINDOW_BORDER_EDGE_WALK","name":"Window Border Edge Walk","category":"Desktop Meta & Glitch","duration":3.6,"loop":false,"defExpr":6,"archType":"HORROR","params":{"seed":54,"speed":60,"amp":0.07,"rotMult":2.7,"horror":0.6,"pupilMin":0.3,"pupilMax":1.3,"jaw":0.44999999999999996,"noBlink":false}},{"id":"ANIM_671_CRT_MONITOR_DE_GAUSS","name":"CRT Monitor De-Gauss","category":"Desktop Meta & Glitch","duration":2.2,"loop":false,"defExpr":9,"archType":"HORROR","params":{"seed":55,"speed":28,"amp":0.09000000000000001,"rotMult":3.2,"horror":0.7,"pupilMin":0.3,"pupilMax":1.3,"jaw":0.55,"noBlink":false}},{"id":"ANIM_672_RESOLUTION_DOWNSCALE_PIXELS","name":"Resolution Downscale Pixels","category":"Desktop Meta & Glitch","duration":2.5500000000000003,"loop":true,"defExpr":7,"archType":"HORROR","params":{"seed":56,"speed":36,"amp":0.11000000000000001,"rotMult":2.2,"horror":0.8,"pupilMin":0.3,"pupilMax":1.3,"jaw":0.35,"noBlink":false}},{"id":"ANIM_673_VSYNC_TEAR_SCANLINE","name":"VSync Tear Scanline","category":"Desktop Meta & Glitch","duration":2.9000000000000004,"loop":false,"defExpr":0,"archType":"HORROR","params":{"seed":57,"speed":44,"amp":0.13,"rotMult":2.7,"horror":0.9,"pupilMin":0.3,"pupilMax":1.3,"jaw":0.44999999999999996,"noBlink":false}},{"id":"ANIM_674_DESKTOP_ICON_SCATTERING","name":"Desktop Icon Scattering","category":"Desktop Meta & Glitch","duration":3.25,"loop":false,"defExpr":6,"archType":"HORROR","params":{"seed":58,"speed":52,"amp":0.07,"rotMult":3.2,"horror":0.6,"pupilMin":0.3,"pupilMax":1.3,"jaw":0.55,"noBlink":false}},{"id":"ANIM_675_TASKBAR_BOUNCE_LEAP","name":"Taskbar Bounce Leap","category":"Desktop Meta & Glitch","duration":3.6,"loop":false,"defExpr":9,"archType":"HORROR","params":{"seed":59,"speed":60,"amp":0.09000000000000001,"rotMult":2.2,"horror":0.7,"pupilMin":0.3,"pupilMax":1.3,"jaw":0.35,"noBlink":false}},{"id":"ANIM_676_STICKY_NOTES_TUMBLE","name":"Sticky Notes Tumble","category":"Desktop Meta & Glitch","duration":2.2,"loop":false,"defExpr":7,"archType":"HORROR","params":{"seed":60,"speed":28,"amp":0.11000000000000001,"rotMult":2.7,"horror":0.8,"pupilMin":0.3,"pupilMax":1.3,"jaw":0.44999999999999996,"noBlink":false}},{"id":"ANIM_677_ALT_TAB_SWITCH_GLITCH","name":"Alt-Tab Switch Glitch","category":"Desktop Meta & Glitch","duration":2.5500000000000003,"loop":false,"defExpr":0,"archType":"HORROR","params":{"seed":61,"speed":36,"amp":0.13,"rotMult":3.2,"horror":0.9,"pupilMin":0.3,"pupilMax":1.3,"jaw":0.55,"noBlink":false}},{"id":"ANIM_678_MINIMIZE_TO_TRAY_POP","name":"Minimize To Tray Pop","category":"Desktop Meta & Glitch","duration":2.9000000000000004,"loop":true,"defExpr":6,"archType":"HORROR","params":{"seed":62,"speed":44,"amp":0.07,"rotMult":2.2,"horror":0.6,"pupilMin":0.3,"pupilMax":1.3,"jaw":0.35,"noBlink":false}},{"id":"ANIM_679_MAXIMIZE_WINDOW_SHAKE","name":"Maximize Window Shake","category":"Desktop Meta & Glitch","duration":3.25,"loop":false,"defExpr":9,"archType":"HORROR","params":{"seed":63,"speed":52,"amp":0.09000000000000001,"rotMult":2.7,"horror":0.7,"pupilMin":0.3,"pupilMax":1.3,"jaw":0.44999999999999996,"noBlink":false}},{"id":"ANIM_680_SCREEN_EDGE_BUMPER","name":"Screen Edge Bumper","category":"Desktop Meta & Glitch","duration":3.6,"loop":false,"defExpr":7,"archType":"HORROR","params":{"seed":64,"speed":60,"amp":0.11000000000000001,"rotMult":3.2,"horror":0.8,"pupilMin":0.3,"pupilMax":1.3,"jaw":0.55,"noBlink":false}},{"id":"ANIM_681_CURSOR_BOOP_REACTION","name":"Cursor Boop Reaction","category":"Desktop Meta & Glitch","duration":2.2,"loop":false,"defExpr":0,"archType":"HORROR","params":{"seed":65,"speed":28,"amp":0.13,"rotMult":2.2,"horror":0.9,"pupilMin":0.3,"pupilMax":1.3,"jaw":0.35,"noBlink":false}},{"id":"ANIM_682_RIGHT_CLICK_CONTEXT_MENU_EVADE","name":"Right-Click Context Menu Evade","category":"Desktop Meta & Glitch","duration":2.5500000000000003,"loop":false,"defExpr":6,"archType":"HORROR","params":{"seed":66,"speed":36,"amp":0.07,"rotMult":2.7,"horror":0.6,"pupilMin":0.3,"pupilMax":1.3,"jaw":0.44999999999999996,"noBlink":false}},{"id":"ANIM_683_SCROLL_WHEEL_FREEFALL","name":"Scroll Wheel Freefall","category":"Desktop Meta & Glitch","duration":2.9000000000000004,"loop":false,"defExpr":9,"archType":"HORROR","params":{"seed":67,"speed":44,"amp":0.09000000000000001,"rotMult":3.2,"horror":0.7,"pupilMin":0.3,"pupilMax":1.3,"jaw":0.55,"noBlink":false}},{"id":"ANIM_684_DRAG_AND_DROP_SHAKE","name":"Drag And Drop Shake","category":"Desktop Meta & Glitch","duration":3.25,"loop":true,"defExpr":7,"archType":"HORROR","params":{"seed":68,"speed":52,"amp":0.11000000000000001,"rotMult":2.2,"horror":0.8,"pupilMin":0.3,"pupilMax":1.3,"jaw":0.35,"noBlink":false}},{"id":"ANIM_685_TITLEBAR_PERCH_SIT","name":"Titlebar Perch Sit","category":"Desktop Meta & Glitch","duration":3.6,"loop":false,"defExpr":0,"archType":"HORROR","params":{"seed":69,"speed":60,"amp":0.13,"rotMult":2.7,"horror":0.9,"pupilMin":0.3,"pupilMax":1.3,"jaw":0.44999999999999996,"noBlink":false}},{"id":"ANIM_686_GHOST_IN_THE_MACHINE","name":"Ghost In The Machine","category":"Desktop Meta & Glitch","duration":2.2,"loop":false,"defExpr":6,"archType":"HORROR","params":{"seed":70,"speed":28,"amp":0.07,"rotMult":3.2,"horror":0.6,"pupilMin":0.3,"pupilMax":1.3,"jaw":0.55,"noBlink":false}},{"id":"ANIM_687_REGISTRY_HIVE_CLEANSING","name":"Registry Hive Cleansing","category":"Desktop Meta & Glitch","duration":2.5500000000000003,"loop":false,"defExpr":9,"archType":"HORROR","params":{"seed":71,"speed":36,"amp":0.09000000000000001,"rotMult":2.2,"horror":0.7,"pupilMin":0.3,"pupilMax":1.3,"jaw":0.35,"noBlink":false}},{"id":"ANIM_688_CORRUPTED_DESKTOP_SHADER","name":"Corrupted Desktop Shader","category":"Desktop Meta & Glitch","duration":2.9000000000000004,"loop":false,"defExpr":7,"archType":"HORROR","params":{"seed":72,"speed":44,"amp":0.11000000000000001,"rotMult":2.7,"horror":0.8,"pupilMin":0.3,"pupilMax":1.3,"jaw":0.44999999999999996,"noBlink":false}},{"id":"ANIM_689_RGB_CHROMATIC_SPLIT","name":"RGB Chromatic Split","category":"Desktop Meta & Glitch","duration":3.25,"loop":false,"defExpr":0,"archType":"HORROR","params":{"seed":73,"speed":52,"amp":0.13,"rotMult":3.2,"horror":0.9,"pupilMin":0.3,"pupilMax":1.3,"jaw":0.55,"noBlink":false}},{"id":"ANIM_690_ANTIALIASING_JAGGIES","name":"Antialiasing Jaggies","category":"Desktop Meta & Glitch","duration":3.6,"loop":true,"defExpr":6,"archType":"HORROR","params":{"seed":74,"speed":60,"amp":0.07,"rotMult":2.2,"horror":0.6,"pupilMin":0.3,"pupilMax":1.3,"jaw":0.35,"noBlink":false}},{"id":"ANIM_691_FRAME_DROP_HITCH","name":"Frame Drop Hitch","category":"Desktop Meta & Glitch","duration":2.2,"loop":false,"defExpr":9,"archType":"HORROR","params":{"seed":75,"speed":28,"amp":0.09000000000000001,"rotMult":2.7,"horror":0.7,"pupilMin":0.3,"pupilMax":1.3,"jaw":0.44999999999999996,"noBlink":false}},{"id":"ANIM_692_SCREEN_BURN_IN_GHOST","name":"Screen Burn-In Ghost","category":"Desktop Meta & Glitch","duration":2.5500000000000003,"loop":false,"defExpr":7,"archType":"HORROR","params":{"seed":76,"speed":36,"amp":0.11000000000000001,"rotMult":3.2,"horror":0.8,"pupilMin":0.3,"pupilMax":1.3,"jaw":0.55,"noBlink":false}},{"id":"ANIM_693_WINDOW_RESIZE_JITTER","name":"Window Resize Jitter","category":"Desktop Meta & Glitch","duration":2.9000000000000004,"loop":false,"defExpr":0,"archType":"HORROR","params":{"seed":77,"speed":44,"amp":0.13,"rotMult":2.2,"horror":0.9,"pupilMin":0.3,"pupilMax":1.3,"jaw":0.35,"noBlink":false}},{"id":"ANIM_694_DESKTOP_MIRROR_REFLECTION","name":"Desktop Mirror Reflection","category":"Desktop Meta & Glitch","duration":3.25,"loop":false,"defExpr":6,"archType":"HORROR","params":{"seed":78,"speed":52,"amp":0.07,"rotMult":2.7,"horror":0.6,"pupilMin":0.3,"pupilMax":1.3,"jaw":0.44999999999999996,"noBlink":false}},{"id":"ANIM_695_SANDBOX_BOUNDARY_BREACH","name":"Sandbox Boundary Breach","category":"Desktop Meta & Glitch","duration":3.6,"loop":false,"defExpr":9,"archType":"HORROR","params":{"seed":79,"speed":60,"amp":0.09000000000000001,"rotMult":3.2,"horror":0.7,"pupilMin":0.3,"pupilMax":1.3,"jaw":0.55,"noBlink":false}},{"id":"ANIM_696_BLACK_HOLE_EVENT_HORIZON","name":"Black Hole Event Horizon","category":"Sci-Fi & Cosmic Magic","duration":2.5,"loop":true,"defExpr":0,"archType":"COSMIC","params":{"orbitSpeed":2,"radiusX":0.22,"radiusY":0.14,"radiusZ":0.18,"spinSpeed":0.4}},{"id":"ANIM_697_SUPERNOVA_CORE_COLLAPSE","name":"Supernova Core Collapse","category":"Sci-Fi & Cosmic Magic","duration":2.9,"loop":false,"defExpr":5,"archType":"COSMIC","params":{"orbitSpeed":2.5,"radiusX":0.27,"radiusY":0.18000000000000002,"radiusZ":0.22,"spinSpeed":0.6000000000000001}},{"id":"ANIM_698_WARP_DRIVE_SPACETIME_STRETCH","name":"Warp Drive Spacetime Stretch","category":"Sci-Fi & Cosmic Magic","duration":3.3,"loop":false,"defExpr":2,"archType":"COSMIC","params":{"orbitSpeed":3,"radiusX":0.32,"radiusY":0.22000000000000003,"radiusZ":0.26,"spinSpeed":0.8}},{"id":"ANIM_699_QUANTUM_TUNNELING_FLICKER","name":"Quantum Tunneling Flicker","category":"Sci-Fi & Cosmic Magic","duration":3.7,"loop":false,"defExpr":8,"archType":"COSMIC","params":{"orbitSpeed":3.5,"radiusX":0.37,"radiusY":0.14,"radiusZ":0.18,"spinSpeed":0.4}},{"id":"ANIM_700_SOLAR_CORONA_THERMAL_FLARE","name":"Solar Corona Thermal Flare","category":"Sci-Fi & Cosmic Magic","duration":4.1,"loop":true,"defExpr":0,"archType":"COSMIC","params":{"orbitSpeed":2,"radiusX":0.22,"radiusY":0.18000000000000002,"radiusZ":0.22,"spinSpeed":0.6000000000000001}},{"id":"ANIM_701_DARK_NEBULA_DRIFTER","name":"Dark Nebula Drifter","category":"Sci-Fi & Cosmic Magic","duration":2.5,"loop":false,"defExpr":5,"archType":"COSMIC","params":{"orbitSpeed":2.5,"radiusX":0.27,"radiusY":0.22000000000000003,"radiusZ":0.26,"spinSpeed":0.8}},{"id":"ANIM_702_PULSAR_BEAM_FLASH","name":"Pulsar Beam Flash","category":"Sci-Fi & Cosmic Magic","duration":2.9,"loop":false,"defExpr":2,"archType":"COSMIC","params":{"orbitSpeed":3,"radiusX":0.32,"radiusY":0.14,"radiusZ":0.18,"spinSpeed":0.4}},{"id":"ANIM_703_GRAVITATIONAL_WAVE_RIPPLE","name":"Gravitational Wave Ripple","category":"Sci-Fi & Cosmic Magic","duration":3.3,"loop":false,"defExpr":8,"archType":"COSMIC","params":{"orbitSpeed":3.5,"radiusX":0.37,"radiusY":0.18000000000000002,"radiusZ":0.22,"spinSpeed":0.6000000000000001}},{"id":"ANIM_704_COSMIC_STRING_OSCILLATION","name":"Cosmic String Oscillation","category":"Sci-Fi & Cosmic Magic","duration":3.7,"loop":true,"defExpr":0,"archType":"COSMIC","params":{"orbitSpeed":2,"radiusX":0.22,"radiusY":0.22000000000000003,"radiusZ":0.26,"spinSpeed":0.8}},{"id":"ANIM_705_ANTIMATTER_ANNIHILATION","name":"Antimatter Annihilation","category":"Sci-Fi & Cosmic Magic","duration":4.1,"loop":false,"defExpr":5,"archType":"COSMIC","params":{"orbitSpeed":2.5,"radiusX":0.27,"radiusY":0.14,"radiusZ":0.18,"spinSpeed":0.4}},{"id":"ANIM_706_CYBERNETIC_NEURAL_LINK","name":"Cybernetic Neural Link","category":"Sci-Fi & Cosmic Magic","duration":2.5,"loop":false,"defExpr":2,"archType":"COSMIC","params":{"orbitSpeed":3,"radiusX":0.32,"radiusY":0.18000000000000002,"radiusZ":0.22,"spinSpeed":0.6000000000000001}},{"id":"ANIM_707_NANOTECH_SWARM_DISPERSE","name":"Nanotech Swarm Disperse","category":"Sci-Fi & Cosmic Magic","duration":2.9,"loop":false,"defExpr":8,"archType":"COSMIC","params":{"orbitSpeed":3.5,"radiusX":0.37,"radiusY":0.22000000000000003,"radiusZ":0.26,"spinSpeed":0.8}},{"id":"ANIM_708_TACHYON_FASTER_THAN_LIGHT","name":"Tachyon Faster-Than-Light","category":"Sci-Fi & Cosmic Magic","duration":3.3,"loop":true,"defExpr":0,"archType":"COSMIC","params":{"orbitSpeed":2,"radiusX":0.22,"radiusY":0.14,"radiusZ":0.18,"spinSpeed":0.4}},{"id":"ANIM_709_HYPERSPACE_JUMP_STREAK","name":"Hyperspace Jump Streak","category":"Sci-Fi & Cosmic Magic","duration":3.7,"loop":false,"defExpr":5,"archType":"COSMIC","params":{"orbitSpeed":2.5,"radiusX":0.27,"radiusY":0.18000000000000002,"radiusZ":0.22,"spinSpeed":0.6000000000000001}},{"id":"ANIM_710_ZERO_POINT_ENERGY_PULSE","name":"Zero-Point Energy Pulse","category":"Sci-Fi & Cosmic Magic","duration":4.1,"loop":false,"defExpr":2,"archType":"COSMIC","params":{"orbitSpeed":3,"radiusX":0.32,"radiusY":0.22000000000000003,"radiusZ":0.26,"spinSpeed":0.8}},{"id":"ANIM_711_PLASMA_SHIELD_MODULATION","name":"Plasma Shield Modulation","category":"Sci-Fi & Cosmic Magic","duration":2.5,"loop":false,"defExpr":8,"archType":"COSMIC","params":{"orbitSpeed":3.5,"radiusX":0.37,"radiusY":0.14,"radiusZ":0.18,"spinSpeed":0.4}},{"id":"ANIM_712_GALACTIC_CORE_ROTATION","name":"Galactic Core Rotation","category":"Sci-Fi & Cosmic Magic","duration":2.9,"loop":true,"defExpr":0,"archType":"COSMIC","params":{"orbitSpeed":2,"radiusX":0.22,"radiusY":0.18000000000000002,"radiusZ":0.22,"spinSpeed":0.6000000000000001}},{"id":"ANIM_713_WORMHOLE_TRAVERSE_SWIRL","name":"Wormhole Traverse Swirl","category":"Sci-Fi & Cosmic Magic","duration":3.3,"loop":false,"defExpr":5,"archType":"COSMIC","params":{"orbitSpeed":2.5,"radiusX":0.27,"radiusY":0.22000000000000003,"radiusZ":0.26,"spinSpeed":0.8}},{"id":"ANIM_714_MAGNETIC_MONOPOLE_DRIFT","name":"Magnetic Monopole Drift","category":"Sci-Fi & Cosmic Magic","duration":3.7,"loop":false,"defExpr":2,"archType":"COSMIC","params":{"orbitSpeed":3,"radiusX":0.32,"radiusY":0.14,"radiusZ":0.18,"spinSpeed":0.4}},{"id":"ANIM_715_DARK_ENERGY_EXPANSION","name":"Dark Energy Expansion","category":"Sci-Fi & Cosmic Magic","duration":4.1,"loop":false,"defExpr":8,"archType":"COSMIC","params":{"orbitSpeed":3.5,"radiusX":0.37,"radiusY":0.18000000000000002,"radiusZ":0.22,"spinSpeed":0.6000000000000001}},{"id":"ANIM_716_ASTRAL_PROJECTION_FLOAT","name":"Astral Projection Float","category":"Sci-Fi & Cosmic Magic","duration":2.5,"loop":true,"defExpr":0,"archType":"COSMIC","params":{"orbitSpeed":2,"radiusX":0.22,"radiusY":0.22000000000000003,"radiusZ":0.26,"spinSpeed":0.8}},{"id":"ANIM_717_STARLIGHT_SYNTHESIZER","name":"Starlight Synthesizer","category":"Sci-Fi & Cosmic Magic","duration":2.9,"loop":false,"defExpr":5,"archType":"COSMIC","params":{"orbitSpeed":2.5,"radiusX":0.27,"radiusY":0.14,"radiusZ":0.18,"spinSpeed":0.4}},{"id":"ANIM_718_ETHEREAL_ENERGY_MANIFEST","name":"Ethereal Energy Manifest","category":"Sci-Fi & Cosmic Magic","duration":3.3,"loop":false,"defExpr":2,"archType":"COSMIC","params":{"orbitSpeed":3,"radiusX":0.32,"radiusY":0.18000000000000002,"radiusZ":0.22,"spinSpeed":0.6000000000000001}},{"id":"ANIM_719_CELESTIAL_ORBIT_GLIDE","name":"Celestial Orbit Glide","category":"Sci-Fi & Cosmic Magic","duration":3.7,"loop":false,"defExpr":8,"archType":"COSMIC","params":{"orbitSpeed":3.5,"radiusX":0.37,"radiusY":0.22000000000000003,"radiusZ":0.26,"spinSpeed":0.8}},{"id":"ANIM_720_OMEGA_ENTITY_TRANSCENDENCE","name":"Omega Entity Transcendence","category":"Sci-Fi & Cosmic Magic","duration":4.1,"loop":true,"defExpr":0,"archType":"COSMIC","params":{"orbitSpeed":2,"radiusX":0.22,"radiusY":0.14,"radiusZ":0.18,"spinSpeed":0.4}},{"id":"ANIM_721_ABSOLUTE_SINGULARITY","name":"Absolute Singularity","category":"Sci-Fi & Cosmic Magic","duration":2.5,"loop":false,"defExpr":5,"archType":"COSMIC","params":{"orbitSpeed":2.5,"radiusX":0.27,"radiusY":0.18000000000000002,"radiusZ":0.22,"spinSpeed":0.6000000000000001}}];

  EXTENDED_ANIM_DATA.forEach(d => {
    const generator = ARCHETYPES[d.archType] || ARCHETYPES.BOUNCE;
    reg(d.id, d.name, d.category, d.duration, d.loop, d.defExpr, generator(d.params));
  });

  // --- Behavioral Engine Controller Class ---
  class BehavioralEngine {
    constructor(avatar) {
      this.avatar = avatar;
      this.currentAnim = null;
      this.startTime = 0;
      this.intensity = 1.0;
      this.isPlaying = false;
      this.queuedAnim = null;
    }

    play(animId, options = {}) {
      const anim = ANIMATIONS[animId];
      if (!anim) {
        console.warn(`VerityAnimations: Unknown animation "${animId}"`);
        return false;
      }

      // Capture outgoing modifiers and reset unowned channels before a new clip.
      const keys = ['animRotX','animRotY','animRotZ','animPosX','animPosY','animPosZ','animScaleX','animScaleY','animScaleZ','animJawMod','animBlinkMod','animPupilScale','animHorrorMod','animAuraMod'];
      this.fromPose = Object.fromEntries(keys.map(key => [key, Number.isFinite(this.avatar[key]) ? this.avatar[key] : (/Scale/.test(key) ? 1 : 0)]));
      this.stop();
      this.currentAnim = anim;
      this.startTime = performance.now();
      this.speed = Number.isFinite(options.speed) ? Math.max(.5, Math.min(1.5, options.speed)) : 1;
      this.loop = options.loop === undefined ? anim.loop : options.loop === true;
      this.blendMs = Number.isFinite(options.blendMs) ? Math.max(0, Math.min(1000, options.blendMs)) : 250;
      this.intensity = options.intensity !== undefined ? options.intensity : 1.0;
      this.isPlaying = true;

      // Optionally switch to the default expression for this animation if requested
      if (options.applyExpression !== false && typeof this.avatar.setExpression === 'function') {
        this.avatar.setExpression(anim.defaultExpression);
      }

      return true;
    }

    stop() {
      this.isPlaying = false;
      this.currentAnim = null;
      // Reset anim kinematic modifiers smoothly
      if (this.avatar) {
        this.avatar.animRotX = 0;
        this.avatar.animRotY = 0;
        this.avatar.animRotZ = 0;
        this.avatar.animPosX = 0;
        this.avatar.animPosY = 0;
        this.avatar.animPosZ = 0;
        this.avatar.animScaleX = 1;
        this.avatar.animScaleY = 1;
        this.avatar.animScaleZ = 1;
        this.avatar.animJawMod = 0;
        this.avatar.animBlinkMod = 0;
        this.avatar.animPupilScale = 1;
        this.avatar.animHorrorMod = 0;
        this.avatar.animAuraMod = 0;
        this.avatar.animSweatDrops = false;
      }
    }

    update(now, dt) {
      if (!this.isPlaying || !this.currentAnim) return;

      const elapsed = (now - this.startTime) / 1000 * this.speed;
      const duration = this.currentAnim.duration || 2.0;
      let progress = elapsed / duration;

      if (progress >= 1.0) {
        if (this.loop) {
          progress = progress % 1.0;
        } else {
          this.stop();
          return;
        }
      }

      // Execute procedural kinematic calculation
      this.currentAnim.update(this.avatar, progress, elapsed, dt, this.intensity);
      const blend = this.blendMs ? Math.min(1, (now - this.startTime) / this.blendMs) : 1;
      if (blend < 1 && this.fromPose) {
        const weight = blend * blend * (3 - 2 * blend);
        for (const [key, from] of Object.entries(this.fromPose)) {
          if (Number.isFinite(this.avatar[key])) this.avatar[key] = from + (this.avatar[key] - from) * weight;
        }
      }
    }
  }

  return {
    ANIMATIONS,
    BehavioralEngine,
    getAnimationList: () => Object.values(ANIMATIONS),
    getCategories: () => Array.from(new Set(Object.values(ANIMATIONS).map(a => a.category)))
  };
});
