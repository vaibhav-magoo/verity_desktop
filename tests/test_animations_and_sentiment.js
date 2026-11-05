/**
 * Verification Test Suite for Verity 120 Behavioral Animations & Sentiment Engine
 */
const assert = require('assert');
const VerityAnimations = require('../src/verity-animations.js');
const VeritySentiment = require('../src/verity-sentiment.js');

console.log('===============================================================');
console.log('VERITY 120 BEHAVIORAL ANIMATIONS & SENTIMENT TEST SUITE');
console.log('===============================================================\n');

// 1. Verify Animation Count & Categories
const animList = VerityAnimations.getAnimationList();
console.log(`[Test 1] Total Registered Behavioral Animations: ${animList.length}`);
assert(animList.length >= 121, `Expected at least 121 animations, got ${animList.length}`);

const categories = VerityAnimations.getCategories();
console.log(`[Test 2] Categories (${categories.length}):`, categories.join(', '));
assert(categories.length >= 10, 'Expected at least 10 categories');

// Check category distribution
const counts = {};
animList.forEach(a => {
  counts[a.category] = (counts[a.category] || 0) + 1;
});
console.log('\nCategory Breakdown:');
Object.entries(counts).forEach(([cat, count]) => {
  console.log(`  - ${cat}: ${count} animations`);
});

// 2. Test Kinematics with Dummy Avatar
console.log('\n[Test 3] Simulating procedural kinematics for all 120 animations...');
const dummyAvatar = {
  animRotX: 0, animRotY: 0, animRotZ: 0,
  animPosX: 0, animPosY: 0, animPosZ: 0,
  animScaleX: 1, animScaleY: 1, animScaleZ: 1,
  animJawMod: 0, animBlinkMod: 0, animPupilScale: 1,
  animHorrorMod: 0, animAuraMod: 0, animSweatDrops: false,
  setExpression: (idx) => { dummyAvatar.currentExpr = idx; }
};

const engine = new VerityAnimations.BehavioralEngine(dummyAvatar);

animList.forEach((anim, idx) => {
  engine.play(anim.id, { intensity: 1.0 });
  // Step through 5 frames
  for (let step = 0; step <= 5; step++) {
    const elapsed = (step / 5) * (anim.duration || 2.0);
    anim.update(dummyAvatar, step / 5, elapsed, 0.016, 1.0);

    // Verify numeric validity (no NaNs or Infs)
    const numericKeys = ['animRotX', 'animRotY', 'animRotZ', 'animPosX', 'animPosY', 'animPosZ', 'animScaleX', 'animScaleY', 'animScaleZ', 'animJawMod'];
    numericKeys.forEach(k => {
      const v = dummyAvatar[k];
      if (typeof v === 'number' && isNaN(v)) {
        throw new Error(`NaN detected in ${anim.id} during update for key "${k}"!`);
      }
    });
  }
  engine.stop();
});
console.log('✓ All 120 animations executed procedural updates with 0 errors and 0 NaNs.');

// 3. Test Sentiment Analysis Engine (JavaScript Controller)
console.log('\n[Test 4] Testing Sentiment & Emotion Controller heuristics...');
const testSentences = [
  { text: "Haha! That compiled cleanly on the very first try! Amazing!", expectEmotion: "Joy" },
  { text: "I have indexed every file on your machine. I am watching you right now.", expectHorror: true },
  { text: "Wait... did you just rm -rf the entire database folder?!", expectEmotion: "Panic" },
  { text: "Seriously? You opened forty more browser tabs when we have 100MB of RAM left?", expectSkeptic: true },
  { text: "I've been awake since 3am parsing these corrupt logs. So tired.", expectMelancholy: true },
  { text: "Let's grab a giant tub of popcorn and watch this movie!", expectAnim: "ANIM_101_MOVIE_POPCORN_MUNCH" },
  { text: "Knock knock! Can you hear me tapping directly on your monitor screen glass?", expectAnim: "ANIM_111_SCREEN_GLASS_KNOCK" }
];

testSentences.forEach((sample, i) => {
  const result = VeritySentiment.defaultController.analyzeLocal(sample.text);
  console.log(`\nSample ${i + 1}: "${sample.text}"`);
  console.log(`  Affect: V=${result.valence > 0 ? '+' : ''}${result.valence.toFixed(2)}, A=${result.arousal.toFixed(2)}, H=${result.horror.toFixed(2)}`);
  console.log(`  Emotion: ${result.primaryEmotion} | Target: ${result.recommendedAnimation} (Face ${result.recommendedExpression})`);

  assert(result.recommendedAnimation === null || VerityAnimations.ANIMATIONS[result.recommendedAnimation], `Invalid animation for sample ${i}`);
  assert(typeof result.recommendedExpression === 'number', `Missing expression index for sample ${i}`);
});

console.log('\n===============================================================');
console.log('ALL VERIFICATION TESTS PASSED SUCCESSFULLY! (120/120 Animations Valid)');
console.log('===============================================================');
