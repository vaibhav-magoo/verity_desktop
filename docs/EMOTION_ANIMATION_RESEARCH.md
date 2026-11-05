# Improving Verity's emotion-to-animation selection

Research and local audit: 29 October 2026. This report proposes changes; it does not modify runtime behavior.

## Recommendation

Add a shared emotion director between conversation interpretation and animation playback. Use context-aware appraisal to select a response intention, retrieve compatible motions from an annotated catalog, and coordinate face, motion, gaze and voice as one plan. Retain deterministic constraints for manual locks, idle allowlists and interruption priorities.

Start with a curated subset of roughly 30–50 visually validated motions. This is a proposed engineering starting point, not a research-established optimum. Having 721 IDs does not establish that users can distinguish 721 emotional meanings.

## Findings in the current implementation

The JavaScript registry contains 721 animations across 16 categories, including 144 looping animations. Its basic metadata includes name, category, duration, loop status and default expression, but no emotional intensity ranges, contextual exclusions, speech compatibility or transition descriptions.

The Hermes path applies `analyzeLocal(spokenText)` to the assistant's response alone. That omits the preceding user message, the event being discussed and whose emotion is being described. The cloud response path can propose animation IDs directly, while the Python service supplies another mapping path. A shared final director would make these routes consistent.

Actual outputs from the current local JavaScript analyzer:

| Input | Observed result | Problem |
| --- | --- | --- |
| I finally fixed that bug! I am so happy! | Analytical Focus / Deep Debug Squint | Technical-topic override suppresses explicit joy. |
| I am not tired anymore. | Sleepy / Big Yawn Stretch | A late keyword override ignores negation. |
| That scary movie was hilarious. | Movie Popcorn / expression 0 / pitch -11 | Face, motion and voice describe incompatible reactions. |
| Great. It crashed again. | Serenity & Warmth / Purring Warmth | Positive keyword and missing inflection/context handling misread likely frustration. |
| My friend is sad, but I feel relieved. | Neutral / Cheerful Tilt | No separation between speakers or emotional subjects. |
| I feel sad today. | Exhaustion & Fatigue / Heavy Sigh Deflate | Low arousal sadness collapses into tiredness. |

These are diagnostic examples, not a representative accuracy benchmark. Sarcasm and ambiguous messages can have multiple acceptable interpretations.

Relevant implementation locations: `verity-sentiment.js` (appraisal and overrides), `hermes-gateway-client.js` (response-only appraisal), `verity-animations.js` (catalog and playback), `verity-presence.js` (locks, idle eligibility and timing), and `launch.js` (cloud response instructions).

## Research implications

### 1. Interpret events and conversational intent

Appraisal-based virtual-human work evaluates events relative to goals, expectedness, controllability and responsibility. That is a stronger conceptual model than equating words with emotions. For Verity, distinguish an unresolved failure from a failure that has just been repaired. [USC: Lessons Learned from Virtual Humans](https://ict.usc.edu/pubs/Lessons%20Learned%20from%20Virtual%20Humans.pdf).

Proposed appraisal fields:

- User emotion and emotional subject: user, another person, fictional character, or Verity.
- Event: success, setback, uncertainty, request, loss, thanks, joke or ordinary task.
- Response intention: celebrate, reassure, acknowledge, investigate, apologize or explain.
- Display emotion, intensity and confidence.
- Negation, quotation, sarcasm uncertainty and explicit roleplay request.

Pass the recent relevant dialogue, current task outcome and proposed reply into this stage. Use an LLM for interpretation initially; validate a structured output rather than accepting arbitrary animation IDs. Any model-supplied confidence needs empirical calibration before it becomes a probability or a hard threshold.

### 2. Separate empathy from mirroring

An angry user does not necessarily need an angry avatar. A sad user may need attentive concern; a frustrated user may need calm acknowledgment. EmpatheticDialogues provides about 25,000 conversations grounded in emotional situations and evaluates appropriate responding, making it useful for response-intention examples. It is not an animation-label dataset. [Rashkin et al., ACL 2019](https://aclanthology.org/P19-1534/).

GoEmotions provides 58,000 English Reddit comments with 27 emotion categories plus neutral. It is useful for a richer taxonomy and initial classifier training, but its original baseline performance and domain make clear that a generic classifier is not sufficient evidence of reliable desktop-dialogue interpretation. Use Verity-specific conversational examples for evaluation. [Demszky et al., ACL 2020](https://aclanthology.org/2020.acl-main.372/).

### 3. Select from a grounded catalog

For each curated motion, annotate:

- Supported display emotions and response intentions.
- Valence and arousal range; intended energy and amplitude.
- Compatible facial expressions and effects on eyes, mouth and posture.
- Whether it is suitable while speaking, listening, working or idle.
- Context exclusions: for example, celebration during bad news.
- Duration, recovery phase, interruptibility, cooldown and compatible transitions.
- Whether it is ordinary behavior, a prop interaction, or theatrical roleplay.

Filter incompatible candidates first. Rank the survivors by emotion fit, intention fit, intensity fit, continuity and repetition cost. Randomness should select only among similarly suitable candidates; it should not choose the underlying emotion. For idle, intersect the user-selected allowlist with the current mood and playback constraints. If nothing fits, remain still.

EMOTION explores LLM-directed expressive gesture sequences and feedback-based refinement, reporting encouraging results in some humanoid-robot scenarios. It supports investigating a constrained language-to-motion planner, but does not establish that the same gestures or results transfer to a sphere. [Huang et al., EMOTION](https://arxiv.org/abs/2410.23234).

### 4. Coordinate the performance

Produce one plan with a facial target, motion, amplitude, speed, gaze target, voice settings and timing anchors. Validate the combination before playback. Treat a locked face as a hard constraint: choose a compatible motion or skip the motion.

Behavior Markup Language research separates planning from realization and synchronizes speech, gaze and gesture through explicit timing points. Verity can adopt this idea without adopting the entire BML format. Begin with prepare, accent, hold and recover phases; align the accent with an important word or speech onset. [University of Twente: continuous interaction and BML](https://ris.utwente.nl/ws/files/6395967/Reidsma11continuous.pdf).

Timing research demonstrates that people infer properties such as confidence from changes in motion timing even when the path stays constant. This suggests testing speed and pauses as independent parameters, rather than controlling everything with one intensity scalar. The cited study concerns robot manipulation, so sphere-specific mappings still need validation. [Zhou et al., Expressive Robot Motion Timing](https://arxiv.org/abs/1802.01536).

### 5. Maintain continuity

Keep a short-lived display state so expressions do not jump on every sentence. Use a minimum hold, a stronger-evidence threshold for switching, and gradual decay toward attentive neutral. Strong new events should still interrupt quickly. Exact transition durations should be tuned through viewing tests, not treated as universal constants.

CTEM links evolving emotional state, behavioral history and feedback; its authors report improved perceived coherence and naturalness in a 21-day companion-agent study. Its instant-messaging setting is evidence for investigating continuity, not direct validation of an animated sphere. Start with short-term continuity before adding long-term mood persistence. [Microsoft Research, CHI 2026](https://www.microsoft.com/en-us/research/publication/toward-natural-and-companionable-virtual-agents-via-cross-temporal-emotional-modeling/).

## Proposed sphere-specific vocabulary

These are design hypotheses to test, not universal emotion rules.

| Intended response | Candidate movement | Facial/gaze treatment |
| --- | --- | --- |
| Quiet approval | One small nod | Soft smile, stable gaze |
| Celebration | Brief light bounce | Happy face; no uncontrolled spinning |
| Curiosity | Small head tilt and pause | Attentive eyes |
| Concern | Gentle lean toward the user | Softened mouth, reduced movement |
| Uncertainty | Small alternating tilt | Restrained questioning face |
| Relief | Brief release of tension, settle | Relaxed eyes and mouth |
| Focus | Stable posture, occasional small scan | Attentive eyes; no permanent squint |
| Apology | Brief downward nod, return to eye contact | Concerned, non-comic face |

The present expression palette is heavily oriented toward smiles, exaggerated grins and alarm. Selection alone may not produce convincing concern or apology. Add or blend subtle concerned, attentive-neutral and uncertain faces where visual tests show a gap.

## Implementation and evaluation order

1. Build a small benchmark of actual desktop conversations, including negation, sarcasm, quotes, mixed emotions, technical success/failure and emotional topic changes. Keep a held-out set.
2. Repair the confirmed override failures and consolidate all response routes into one director.
3. Annotate and visually validate the first 30–50 motions. Preserve the larger library for manual exploration.
4. Add structured context appraisal and constrained candidate selection. Permit a no-motion result when uncertain.
5. Add shared face/motion/voice planning, transition control, cooldowns and mood-compatible idle selection.
6. Compare the current and proposed systems using the same conversations and rendered clips. Collect user preferences before considering fine-tuning.

Measure contextual appropriateness, intended-emotion recognition from clips, face/motion/voice contradictions, unnecessary switching, repetition and response latency. Evaluate at the actual popup size as well as in the studio. Ask viewers what the sphere conveys without showing the animation's name. Record allowed alternative reactions rather than insisting that every message has exactly one correct clip.

A useful feedback control would offer “too intense,” “wrong emotion,” and “this fits.” Store these as preference evidence; do not blindly change the policy after one ambiguous rating. Keep idle-pool and manual-expression choices authoritative.

The highest-value first implementation is context-aware selection over a small, well-described animation catalog. Model fine-tuning and adding more animations should follow evidence that this simpler approach is insufficient.
