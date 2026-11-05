const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const policy = require('../src/verity-presence');
const catalog = require('../src/verity-animations').ANIMATIONS;
const { SentimentController } = require('../src/verity-sentiment');
assert.equal(policy.pick([], null), null);
assert.equal(policy.pick(['a', 'b'], 'a', () => 0), 'b');
assert.equal(policy.pick(['a'], 'a'), 'a');
assert.deepEqual(policy.normalize({ allowed: ['bad', 'ANIM_002_PURRING_WARMTH'] }, catalog).allowed, ['ANIM_002_PURRING_WARMTH']);
assert.equal(policy.normalize({ expression: NaN }).expression, 0);
let now = 0, tick, stopped = 0, expression, played = [], speaking = false;
const listeners = new Map();
const avatar = { options: {}, animMode: 'none', behaviorEngine: { isPlaying: false },
  get isSpeaking() { return speaking; },
  container: { getBoundingClientRect: () => ({ left: 0, top: 0, width: 400, height: 400 }) },
  setExpression: id => { expression = id; },
  playBehavior: (id, options) => { played.push({id, options}); avatar.behaviorEngine.isPlaying = true; return true; },
  stopBehavior: () => { stopped++; avatar.behaviorEngine.isPlaying = false; }
};
const context = { performance: { now: () => now }, setInterval: fn => { tick = fn; }, clearInterval() {},
  localStorage: { getItem: () => null, setItem() {} }, CustomEvent: class {},
  document: { hidden: false, body: { classList: { contains: () => false } }, getElementById: () => null },
  window: { VerityAnimations: { ANIMATIONS: catalog }, addEventListener: (key, fn) => listeners.set(key, fn), removeEventListener() {}, dispatchEvent() {} }
};
vm.createContext(context); vm.runInContext(fs.readFileSync('./src/verity-presence.js', 'utf8'), context);
const controller = context.VerityPresence.attach(avatar);
controller.configure({ emotionMode: 'locked', expression: 5 }); avatar.setExpression(9); assert.equal(expression, 5);
controller.configure({ emotionMode: 'auto', allowed: ['ANIM_002_PURRING_WARMTH'], interval: 5 });
now = 6000; tick(); assert.equal(played.length, 1); assert.equal(played[0].options.applyExpression, false);
speaking = true; tick(); assert.equal(stopped, 1);
now = 20000; tick(); assert.equal(played.length, 1);
speaking = false; controller.configure({ allowed: [] }); now = 30000; tick(); assert.equal(played.length, 1);
controller.configure({ allowed: ['ANIM_002_PURRING_WARMTH'] }); avatar.playBehavior('ANIM_003_PLAYFUL_WINK', { manual: true });
now = 50000; tick(); assert.equal(played.length, 2, 'Idle must not interrupt manual motion');
controller.dispose();
const sentiment = new SentimentController({ enableRemote: false });
for (const text of ['Watch the mouse inside the window', 'The memory is behind the dark panel', 'This is not scary']) {
  assert.equal(sentiment.analyzeLocal(text).horror, 0);
}
assert.notEqual(sentiment.analyzeLocal('Use the escape key').recommendedAnimation, 'ANIM_121_BOX_BREAKOUT_POP');
assert.notEqual(sentiment.analyzeLocal('Use a tapestry').recommendedAnimation, 'ANIM_111_SCREEN_GLASS_KNOCK');
console.log('Presence policy, idle interruption, manual priority and emotion regressions passed.');
