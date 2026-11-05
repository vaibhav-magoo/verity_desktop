(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./verity-animations'));
  else root.VerityEmotionDirector = factory(root.VerityAnimations);
})(typeof globalThis !== 'undefined' ? globalThis : this, function (animations) {
  'use strict';
  let sequence = 0;
  const instanceId = Math.random().toString(36).slice(2);
  // Small, explicit automatic vocabulary; the full library remains available manually.
  const groups = {
    joy: [1, 3, 5, 6, 9, 10, 25], warmth: [2, 7, 75, 79, 98],
    curiosity: [73, 74, 79], focus: [23, 24, 27, 28, 79],
    concern: [62, 75, 79], apology: [56, 59, 75],
    relief: [2, 75, 98], uncertainty: [34, 35, 73],
    fatigue: [54, 57, 93, 95, 99], neutral: [79],
    theatrical: [11, 13, 16], amusement: [3, 6, 64]
  };
  const profiles = {
    neutral: [4, 0, .25, 'attend'], joy: [6, .85, .7, 'celebrate'],
    warmth: [5, .6, .3, 'acknowledge'], curiosity: [0, .2, .45, 'investigate'],
    focus: [4, .1, .35, 'explain'], concern: [4, -.35, .25, 'reassure'],
    apology: [4, -.3, .25, 'apologize'], relief: [5, .6, .25, 'acknowledge'],
    uncertainty: [12, -.1, .35, 'clarify'], fatigue: [13, -.25, .15, 'rest'],
    theatrical: [2, -.4, .6, 'perform'], amusement: [6, .7, .55, 'share-humor']
  };
  const catalog = {};
  for (const [emotion, numbers] of Object.entries(groups)) for (const number of numbers) {
    const motion = animations.getAnimationList().find(a => a.id.startsWith(`ANIM_${String(number).padStart(3, '0')}_`));
    if (!motion) throw new Error(`Missing curated motion ${number}`);
    const entry = catalog[motion.id] ||= { id: motion.id, name: motion.name, emotions: [], expressions: [],
      duration: motion.duration, energy: [1, 6, 9, 25].includes(number) ? .75 : .3,
      speechSafe: [2, 7, 24, 62, 73, 75, 79, 98].includes(number),
      idleSafe: [2, 7, 27, 57, 73, 75, 79, 93, 98].includes(number), cooldownMs: 12000 };
    entry.emotions.push(emotion);
    entry.expressions = [...new Set([...entry.expressions, profiles[emotion][0]])];
  }
  function clean(text) {
    return String(text || '').slice(0, 12000).toLowerCase().replace(/[’‘]/g, "'")
      .replace(/```[\s\S]*?```|`[^`]*`|"[^"\n]*"/g, ' ');
  }
  function classify(text) {
    const raw = clean(text);
    // A contrastive first-person clause identifies whose emotion should dominate.
    const self = raw.match(/\b(?:but|however)\s+i\s+(?:feel|am|'m)\s+(.+)/);
    const t = (self ? self[0] : raw).replace(/\b(?:not|never|no longer|isn't|aren't|don't|wasn't)\s+(?:\w+\s+){0,2}(?:sad|happy|tired|sleepy|scared|angry|excited|afraid)\b/g, ' ');
    const hit = (pattern, emotion, reason) => pattern.test(t) ? { emotion, evidence: 'explicit', reason } : null;
    return (/\b(?:not tired anymore|no longer tired|not scared anymore)\b/.test(raw) ? { emotion: 'relief', evidence: 'explicit', reason: 'A negative state has ended.' } : null) ||
      (!/\b(?:don't|do not|never|not)\b.{0,20}\b(?:act|pretend|perform|roleplay|be)\b/.test(t) ? hit(/\b(?:act|pretend|perform|roleplay|be)\b.{0,25}\b(?:creepy|scary|demonic|horror)\b/, 'theatrical', 'Explicit theatrical request.') : null) ||
      hit(/\b(?:great|wonderful|perfect)\b.{0,35}\b(?:crashed|failed|broken|again)\b/, 'concern', 'Positive wording conflicts with a repeated setback.') ||
      hit(/\b(?:relieved|relief|finally safe)\b/, 'relief', 'Relief is explicitly expressed.') ||
      hit(/\b(?:hilarious|funny|haha|laughing|amused)\b/, 'amusement', 'Amusement is explicitly expressed.') ||
      hit(/\b(?:happy|excited|proud|celebrate|congratulations|yay)\b|\bfinally\b.{0,25}\b(?:fixed|solved|worked|passed)\b/, 'joy', 'Positive outcome or expressed joy.') ||
      hit(/\b(?:sad|grief|grieving|lonely|died|passed away|heartbroken|scared|afraid|angry|frustrated|annoyed|upset)\b/, 'concern', 'Distress calls for attentive support rather than mirroring.') ||
      hit(/\b(?:sorry|apologize|my mistake|my fault)\b/, 'apology', 'Acknowledgment of responsibility.') ||
      hit(/\b(?:tired|sleepy|exhausted|goodnight)\b/, 'fatigue', 'Unnegated fatigue.') ||
      hit(/\b(?:thanks|thank you|grateful|appreciate|love)\b/, 'warmth', 'Gratitude or warmth.') ||
      hit(/\b(?:confused|unsure|uncertain|not sure|don't understand)\b/, 'uncertainty', 'Uncertainty is expressed.') ||
      hit(/\b(?:crash(?:ed)?|fail(?:ed)?|broken|error)\b/, 'concern', 'An unresolved setback.') ||
      hit(/\b(?:code|debug|file|memory|mouse|database|compile|build)\b/, 'focus', 'Ordinary task context.') ||
      hit(/\b(?:why|how|what|curious|wonder)\b.*\?/, 'curiosity', 'A question invites investigation.') ||
      { emotion: 'neutral', evidence: 'uncertain', reason: 'No clear emotional evidence; use restrained attention.' };
  }
  function rank(plan, { allowed, expression, speaking = false, idle = false, recent = [], now = Date.now() } = {}) {
    return Object.values(catalog).filter(m => m.emotions.includes(plan.emotion) &&
      (!allowed || allowed.includes(m.id)) && (expression === undefined || m.expressions.includes(expression)) &&
      (!speaking || m.speechSafe) && (!idle || m.idleSafe) &&
      !recent.some(r => r.id === m.id && now - r.at < m.cooldownMs))
      .map(m => ({ ...m, score: 1 - Math.abs(m.energy - plan.intensity) }))
      .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
  }
  function plan({ text = '', message, history = [], advisory } = {}) {
    const user = String((message === undefined ? text : message) || '');
    let appraisal = classify(user);
    // Only carry context across a short, ambiguous continuation, never a clear new topic.
    if (appraisal.evidence === 'uncertain' && /^(?:yes|yeah|okay|ok|please|that|it|still|thanks)\b/i.test(user.trim()) && user.length < 100) {
      const previous = history.filter(x => x.role === 'user' && typeof x.content === 'string').slice(-2).reverse();
      const context = previous.map(x => classify(x.content)).find(x => x.evidence === 'explicit');
      if (context) appraisal = { ...context, evidence: 'context', reason: 'Recent user context informs an ambiguous continuation.' };
    }
    // Model advice can help ambiguous inputs, but cannot override direct evidence,
    // invent motions, or enable theatrical behavior without an explicit request.
    if (appraisal.evidence === 'uncertain' && advisory && Object.hasOwn(profiles, advisory.emotion) && advisory.emotion !== 'theatrical') {
      appraisal = { emotion: advisory.emotion, evidence: 'model-advice', reason: 'Structured model advice; not a calibrated probability.' };
    }
    if (message !== undefined && /\b(?:my mistake|i apologize|i'm sorry i|i was wrong)\b/i.test(text)) appraisal = { emotion: 'apology', evidence: 'explicit', reason: 'Verity acknowledges its own mistake.' };
    const [expression, valence, arousal, intention] = profiles[appraisal.emotion];
    const p = { version: 1, decisionId: `${instanceId}-${++sequence}`, ...appraisal, intention, expression, valence, arousal, dominance: 0, horror: appraisal.emotion === 'theatrical' ? .6 : 0,
      intensity: appraisal.evidence === 'uncertain' ? .2 : Math.min(.8, .25 + arousal * .6),
      speed: ['concern', 'apology', 'relief', 'fatigue'].includes(appraisal.emotion) ? .8 : 1,
      pitch: appraisal.emotion === 'theatrical' ? -3 : 0, voice_effect: 'normal', mode: 'none',
      holdMs: 2200, decayMs: 18000, transitionMs: 350 };
    p.animation = appraisal.evidence === 'uncertain' ? null : rank(p)[0]?.id || null;
    return p;
  }
  function fields(p) {
    return { emotionPlan: p, expression: p.expression, animation: p.animation, mode: p.mode,
      primaryEmotion: p.emotion, recommendedExpression: p.expression, recommendedAnimation: p.animation,
      recommendedPitch: p.pitch, recommendedVoiceEffect: p.voice_effect,
      pitch: p.pitch, voice_effect: p.voice_effect, valence: p.valence, arousal: p.arousal,
      dominance: p.dominance, horror: p.horror, intensity: p.intensity };
  }
  class Director {
    constructor(clock = Date.now) { this.clock = clock; this.current = plan(); this.changedAt = 0; this.recent = []; }
    accept(candidate, constraints = {}) {
      if (!candidate || candidate.version !== 1 || !Object.hasOwn(profiles, candidate.emotion)) return null;
      const now = this.clock();
      // Rebuild all playback parameters from a known profile, not untrusted payload IDs.
      let p = plan({ advisory: { emotion: candidate.emotion } });
      if (candidate.emotion === 'theatrical' && candidate.evidence === 'explicit') p = plan({ text: 'act creepy' });
      if (candidate.emotion === 'neutral') p = plan();
      if (candidate.evidence === 'explicit' || candidate.evidence === 'context') p.evidence = candidate.evidence;
      p.reason = String(candidate.reason || p.reason).slice(0, 240);
      if (now - this.changedAt < this.current.holdMs && p.evidence === 'uncertain') p = { ...this.current };
      if (p.emotion !== this.current.emotion) this.changedAt = now;
      p.expression = constraints.expression === undefined ? p.expression : constraints.expression;
      p.animation = p.evidence === 'uncertain' ? null : rank(p, { ...constraints, now, recent: this.recent })[0]?.id || null;
      this.current = p; this.lastEvidence = now;
      return fields(p);
    }
    played(id) { const at = this.clock(); this.recent = [...this.recent.filter(r => at - r.at < 60000), { id, at }].slice(-20); }
    idle(allowed, expression, random = Math.random) {
      if (this.clock() - (this.lastEvidence || 0) > this.current.decayMs) this.current = plan();
      const choices = rank(this.current, { allowed, expression, idle: true, recent: this.recent, now: this.clock() });
      if (!choices.length) return null;
      const top = choices.filter(x => x.score >= choices[0].score - .15);
      return top[Math.min(top.length - 1, Math.floor(random() * top.length))].id;
    }
  }
  return { catalog, profiles, classify, plan, fields, rank, Director };
});
