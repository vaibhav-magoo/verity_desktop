(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.VerityPresence = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const defaults = { emotionMode: 'auto', expression: 0, idle: true, gaze: true,
    interval: 12, intensity: 0.55,
    allowed: ['ANIM_002_PURRING_WARMTH', 'ANIM_007_CHEERFUL_TILT', 'ANIM_073_CURIOUS_COCKED_HEAD', 'ANIM_079_ATTENTIVE_MICRO_BLINK'] };
  function normalize(value = {}, catalog) {
    const s = { ...defaults, ...value };
    s.emotionMode = s.emotionMode === 'locked' ? 'locked' : 'auto';
    s.expression = Number.isInteger(s.expression) && s.expression >= 0 && s.expression < 15 ? s.expression : 0;
    s.interval = Number.isFinite(+s.interval) ? Math.max(5, Math.min(60, +s.interval)) : 12;
    s.intensity = Number.isFinite(+s.intensity) ? Math.max(0.1, Math.min(1, +s.intensity)) : 0.55;
    s.idle = s.idle === true; s.gaze = s.gaze === true;
    s.allowed = [...new Set(Array.isArray(s.allowed) ? s.allowed.filter(id => typeof id === 'string' && (!catalog || catalog[id])) : defaults.allowed)];
    return s;
  }
  function pick(allowed, previous, random = Math.random) {
    const pool = allowed.filter(id => id !== previous);
    const choices = pool.length ? pool : allowed;
    return choices.length ? choices[Math.min(choices.length - 1, Math.floor(random() * choices.length))] : null;
  }
  function attach(avatar) {
    const catalog = window.VerityAnimations.ANIMATIONS;
    const desk = window.verityDesktop;
    const director = window.VerityEmotionDirector ? new window.VerityEmotionDirector.Director() : null;
    let pendingPlan = null;
    let pendingExpression = false, automaticFace = false;
    const seenDecisions = new Set();
    avatar._globalGaze = Boolean(desk?.onCursor);
    let saved; try { saved = JSON.parse(localStorage.getItem('verity-presence') || '{}'); } catch (_) {}
    let settings = normalize(saved, catalog), next = performance.now() + 12000, idleEnd = 0, reactionEnd = 0, previous = null;
    let pointerDown = false;
    const originalExpression = avatar.setExpression.bind(avatar);
    const originalPlay = avatar.playBehavior.bind(avatar);
    const originalStop = avatar.stopBehavior.bind(avatar);
    const originalMode = avatar.setAnimationMode?.bind(avatar);
    if (originalMode) avatar.setAnimationMode = mode => {
      originalMode(mode);
      if (settings.emotionMode === 'locked') originalExpression(settings.expression);
    };
    avatar.setExpression = id => {
      automaticFace = pendingExpression; pendingExpression = false;
      const result = originalExpression(settings.emotionMode === 'locked' ? settings.expression : id);
      if (automaticFace && settings.emotionMode !== 'locked' && avatar.targetExpr) {
        const emotion = director?.current.emotion;
        if (['concern', 'apology', 'neutral', 'uncertainty'].includes(emotion)) {
          avatar.targetExpr.restCurve = ['concern', 'apology'].includes(emotion) ? -.05 : .04;
          avatar.targetExpr.restWidth = .52;
          avatar.targetExpr.restOpen = 0;
          avatar.targetExpr.horrorLevel = 0;
        }
      }
      return result;
    };
    avatar.playBehavior = (id, options = {}) => {
      idleEnd = 0; next = performance.now() + settings.interval * 1000;
      const planOptions = !options.manual && pendingPlan ? { intensity: pendingPlan.intensity, speed: pendingPlan.speed, blendMs: pendingPlan.transitionMs, loop: false } : {};
      reactionEnd = catalog[id] && !options.manual ? performance.now() + Math.min(10000, catalog[id].duration * 2000 / (planOptions.speed || 1)) : 0;
      // A motion never silently replaces an explicitly selected expression.
      const played = originalPlay(id, { applyExpression: false, ...planOptions, ...options });
      if (played) director?.played(id);
      pendingPlan = null;
      return played;
    };
    function prepareDecision(decision) {
      if (director && decision && !decision.emotionPlan && ['thinking', 'tool_call', 'error'].includes(decision.type) && decision.status !== 'finished') {
        const text = decision.type === 'error' ? 'There is an error.' : decision.type === 'tool_call' ? 'Inspect the file.' : 'How can I help?';
        Object.assign(decision, window.VerityEmotionDirector.fields(window.VerityEmotionDirector.plan({ text })));
      }
      if (!director || !decision?.emotionPlan) return decision;
      const id = decision.emotionPlan.decisionId;
      if (id && seenDecisions.has(id)) {
        // SSE and the HTTP response may deliver the same reply. Speak normally,
        // but do not restart or replace its already-running performance.
        decision.animation = null; decision.expression = undefined; decision.mode = undefined;
        return decision;
      }
      const resolved = director.accept(decision.emotionPlan, {
        expression: settings.emotionMode === 'locked' ? settings.expression : undefined,
        speaking: Boolean(avatar.isSpeaking)
      });
      if (!resolved) return decision;
      if (id) { seenDecisions.add(id); if (seenDecisions.size > 100) seenDecisions.delete(seenDecisions.values().next().value); }
      Object.assign(decision, resolved);
      pendingExpression = true;
      pendingPlan = resolved.animation ? resolved.emotionPlan : null;
      if (!resolved.animation && avatar.behaviorEngine?.isPlaying) avatar.stopBehavior();
      window.dispatchEvent(new CustomEvent('verity:emotion-plan', { detail: resolved.emotionPlan }));
      return decision;
    }
    avatar.prepareEmotionDecision = prepareDecision;
    avatar.stopBehavior = () => { idleEnd = 0; reactionEnd = 0; next = performance.now() + settings.interval * 1000; originalStop(); };
    function apply(value, persist = false) {
      settings = normalize(value, catalog);
      avatar.options.mouseTrack = settings.gaze;
      if (!settings.gaze) avatar.targetRotX = avatar.targetRotY = 0;
      if (idleEnd) { originalStop(); idleEnd = 0; }
      next = performance.now() + settings.interval * 1000;
      if (settings.emotionMode === 'locked') originalExpression(settings.expression);
      if (persist) {
        try { localStorage.setItem('verity-presence', JSON.stringify(settings)); } catch (_) {}
        if (desk?.setPresence) desk.setPresence(settings);
      }
      window.dispatchEvent(new CustomEvent('verity:presence', { detail: settings }));
    }
    const updateGaze = p => {
      if (!settings.gaze || pointerDown) return;
      const r = avatar.container.getBoundingClientRect();
      if (!r.width || !r.height) return;
      avatar.targetRotY = Math.max(-1, Math.min(1, (p.x - r.left - r.width / 2) / Math.max(240, r.width))) * 0.36;
      avatar.targetRotX = Math.max(-1, Math.min(1, (p.y - r.top - r.height / 2) / Math.max(240, r.height))) * 0.24;
    };
    const down = () => { pointerDown = true; if (idleEnd) avatar.stopBehavior(); };
    const up = () => { pointerDown = false; };
    window.addEventListener('pointerdown', down); window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up); window.addEventListener('blur', up);
    const unsubscribeCursor = desk?.onCursor?.(updateGaze);
    const unsubscribeSettings = desk?.onPresence?.(value => apply(value));
    desk?.getPresence?.().then(value => { if (value) apply(value); }).catch(() => {});
    apply(settings);
    const timer = setInterval(() => {
      const now = performance.now();
      if (reactionEnd && now >= reactionEnd) {
        originalStop(); reactionEnd = 0; next = now + settings.interval * 1000;
      }
      const busy = avatar.isSpeaking || avatar.presenceBusy || pointerDown || document.body.classList.contains('thinking') ||
        document.getElementById('sendChatBtn')?.disabled || document.getElementById('send')?.disabled ||
        (avatar.animMode && avatar.animMode !== 'none');
      if (idleEnd && (now >= idleEnd || busy || !settings.idle)) { originalStop(); idleEnd = 0; next = now + settings.interval * 1000; }
      if (!settings.idle || busy || document.hidden || now < next || avatar.behaviorEngine?.isPlaying) return;
      const previousMood = director?.current.emotion;
      const id = director ? director.idle(settings.allowed, settings.emotionMode === 'locked' ? settings.expression : undefined) : pick(settings.allowed, previous);
      if (director && previousMood !== director.current.emotion && automaticFace && settings.emotionMode !== 'locked') {
        pendingExpression = true;
        avatar.setExpression(director.current.expression);
      }
      next = now + settings.interval * 1000;
      if (!id) return;
      originalPlay(id, { intensity: settings.intensity, applyExpression: false });
      director?.played(id);
      previous = id;
      idleEnd = now + Math.min(8000, catalog[id].duration * 2000);
    }, 200);
    const dispose = () => {
      clearInterval(timer); unsubscribeCursor?.(); unsubscribeSettings?.();
      window.removeEventListener('pointerdown', down); window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up); window.removeEventListener('blur', up);
    };
    window.addEventListener('beforeunload', dispose, { once: true });
    return { get settings() { return settings; }, prepareDecision, configure: patch => apply({ ...settings, ...patch }, true), dispose };
  }
  return { defaults, normalize, pick, attach };
});
