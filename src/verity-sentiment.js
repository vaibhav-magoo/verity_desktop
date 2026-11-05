/**
 * VERITY 3D // Client-Side Real-Time Sentiment & Emotion Appraisal Engine
 * ======================================================================
 * - Evaluates multi-dimensional affect: Valence [-1..1], Arousal [0..1], Dominance [-1..1], Horror [0..1]
 * - Classifies into discrete emotional taxonomy (Joy, Panic, Skepticism, Creepy, Melancholy, etc.)
 * - Maps affective state to one of the 120 Behavioral Animations and 15 Reference Expressions
 * - Sub-millisecond browser/Node execution with optional HTTP bridge to Python sentiment service
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.VeritySentiment = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : this), function () {
  'use strict';
  const EmotionDirector = typeof module === 'object' && module.exports ? require('./verity-emotion-director') : globalThis.VerityEmotionDirector;

  class SentimentController {
    constructor(options = {}) {
      this.pythonServiceUrl = options.pythonServiceUrl || 'http://127.0.0.1:4778/api/analyze';
      this.enableRemote = options.enableRemote !== false;
      this.requests = new WeakMap();
    }

    /**
     * Sub-millisecond synchronous lexical analysis
     */
    analyzeLocal(text, context = {}) {
      return { text, ...EmotionDirector.fields(EmotionDirector.plan({ text, ...context })) };
    }

    /**
     * Async analysis attempting Python FastAPI engine first with instant local fallback
     */
    async analyze(text, speaker = 'user') {
      if (this.enableRemote && typeof fetch !== 'undefined') {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 250);
        try {
          const res = await fetch(this.pythonServiceUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, speaker }),
            signal: controller.signal
          });
          if (res.ok) {
            const data = await res.json();
            // The remote classifier is advice, never a direct playback command.
            const emotion = String(data.primary_emotion || '').toLowerCase();
            const appraisal = this.analyzeLocal(text, { advisory: { emotion } });
            return { ...appraisal, isRemote: true };
          }
        } catch (_) {
          // Silent local fallback
        } finally {
          // Keep the deadline active through response-body parsing as well as
          // the initial fetch. A stalled JSON body must never block playback.
          clearTimeout(timeoutId);
        }
      }
      return this.analyzeLocal(text);
    }

    /**
     * Controls the 3D Verity avatar: applies facial expression and triggers behavioral animation
     */
    async controlAvatar(avatar, text, options = {}) {
      if (!avatar) return null;
      const request = (this.requests.get(avatar) || 0) + 1;
      this.requests.set(avatar, request);
      const appraisal = await this.analyze(text, options.speaker || 'user');
      if (this.requests.get(avatar) !== request) return appraisal;

      if (typeof avatar.prepareEmotionDecision === 'function') avatar.prepareEmotionDecision(appraisal);

      // 1. Set Facial Expression
      const exprIdx = (options.expression !== undefined) ? options.expression : appraisal.recommendedExpression;
      if (typeof avatar.setExpression === 'function') {
        avatar.setExpression(exprIdx);
      }

      // 2. Play Behavioral Animation
      const animId = options.animation || appraisal.recommendedAnimation;
      if (animId && typeof avatar.playBehavior === 'function') {
        avatar.playBehavior(animId, {
          intensity: (options.intensity !== undefined) ? options.intensity : appraisal.intensity,
          applyExpression: false // Already applied above
        });
      }

      // 3. Dispatch event for UI monitors
      if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
        window.dispatchEvent(new CustomEvent('verity:sentiment', { detail: appraisal }));
      }

      return appraisal;
    }
  }

  return {
    SentimentController,
    defaultController: new SentimentController()
  };
});
