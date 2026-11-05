const assert = require('node:assert/strict');
const { plan, Director, catalog, rank } = require('../src/verity-emotion-director');
const { ANIMATIONS, BehavioralEngine } = require('../src/verity-animations');
const { defaultController } = require('../src/verity-sentiment');
const cases = [
  ['I finally fixed that bug! I am so happy!', 'joy'],
  ['I am not tired anymore.', 'relief'],
  ['That scary movie was hilarious.', 'amusement'],
  ['Great. It crashed again.', 'concern'],
  ['My friend is sad, but I feel relieved.', 'relief'],
  ['I feel sad today.', 'concern'],
  ['I am not sad.', 'neutral'],
  ['I am not very happy.', 'neutral'],
  ['I am not angry, just confused.', 'uncertainty'],
  ['Please act creepy.', 'theatrical'],
  ["Don't act creepy.", 'neutral'],
  ['The log says "I am angry".', 'neutral'],
  ['I am afraid.', 'concern'],
  ['Thank you for your help.', 'warmth'],
  ['How does that work?', 'curiosity'],
  ['Please inspect the database.', 'focus'],
  ['I am exhausted.', 'fatigue'],
  ['My mistake, I apologize.', 'apology'],
  ['Here is some ordinary text.', 'neutral']
];
for (const [text, expected] of cases) {
  const p = plan({ text });
  assert.equal(p.emotion, expected, text);
  assert.equal(defaultController.analyzeLocal(text).primaryEmotion, expected);
  assert(!p.animation || catalog[p.animation]);
  assert.equal(p.voice_effect, 'normal');
  if (expected !== 'theatrical') assert.equal(p.horror, 0);
}
assert.equal(plan({ message: 'I am sad.', text: 'Happy to help!' }).emotion, 'concern', 'Assistant wording must not erase user context');
assert.equal(plan({ message: 'Yes, please.', history: [{ role:'user', content:'I am sad.' }] }).emotion, 'concern');
assert.equal(plan({ message: 'Debug this file.', history: [{ role:'user', content:'I am sad.' }] }).emotion, 'focus');
assert.equal(plan({ message: 'Hello', advisory: { emotion:'joy', animation:'invented' } }).emotion, 'joy');
assert.equal(plan({ message: 'I am sad', advisory: { emotion:'joy' } }).emotion, 'concern');
assert.equal(plan({ advisory: { emotion:'theatrical' } }).emotion, 'neutral');
assert.equal(plan({ advisory: { emotion:'constructor' } }).emotion, 'neutral');
assert(Object.keys(catalog).length >= 30);
for (const motion of Object.values(catalog)) { assert(ANIMATIONS[motion.id]); assert(motion.expressions.length); }
let now = 100000;
const d = new Director(() => now);
let response = d.accept(plan({ text:'I am sad' }));
assert.equal(response.primaryEmotion, 'concern');
assert.equal(d.idle(['ANIM_007_CHEERFUL_TILT']), null, 'Sad context must exclude cheerful idle');
assert.equal(d.idle([]), null);
response = d.accept(plan({ text:'I am happy' }), { expression:13 });
assert.equal(response.animation, null, 'Locked exhausted face cannot accompany a happy bounce');
assert.equal(response.expression, 13);
response = d.accept(plan({ text:'I am sad' })); d.played(response.animation);
const next = d.accept(plan({ text:'I am sad' })); assert.notEqual(next.animation, response.animation);
const quiet = rank(plan({ text:'I am sad' }), { speaking:true }); assert(quiet.every(m => m.speechSafe));
response = d.accept(plan({ text:'I am sad' }));
now += 100; assert.equal(d.accept(plan({ text:'Something unclassified' })).primaryEmotion, 'concern');
now += 20000; d.idle(['ANIM_079_ATTENTIVE_MICRO_BLINK']); assert.equal(d.current.emotion, 'neutral');
assert.equal(d.accept({ version:1, emotion:'constructor' }), null);

const avatar = { animRotX: .7, setExpression() {} };
const engine = new BehavioralEngine(avatar);
engine.play('ANIM_002_PURRING_WARMTH', { loop:false, speed:.8, blendMs:350 });
engine.update(engine.startTime, .016); assert.equal(avatar.animRotX, .7, 'Blend must start from the outgoing pose');
engine.update(engine.startTime + 4000, .016); assert.equal(engine.isPlaying, false, 'Automatic reactions must finish even for loop clips');
engine.play('ANIM_002_PURRING_WARMTH'); engine.update(engine.startTime + 5000, .016); assert(engine.isPlaying, 'Manual loop semantics stay intact');
console.log(`Emotion director: ${cases.length} language cases, context, locks, cooldowns, idle compatibility, input validation and transition checks passed (${Object.keys(catalog).length} curated motions).`);
