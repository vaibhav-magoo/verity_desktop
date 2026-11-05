# Verity Studio

Start conversational mode with `npm run conversation`. Type and press Enter, or
click the microphone for hands-free turns. Pause for about a second to send a
spoken message; listening resumes after Verity finishes replying. Click the
microphone again to stop. Voice input sends recorded utterances to Groq for
transcription. The physical microphone must be allowed in Windows settings.
The popup has a persistent Mic off / Mic on · Stop button, including in compact
mode. Its state is shared with Studio: either button stops the active microphone,
even when recording began in the other window. Chat replies are spoken only by
the window that sent the message; the other window receives visual updates.

The Conversation window defaults to the configured Groq model. Add
`GROQ_API_KEY` to the local `.env` file (see `.env.example`). Recent conversation
context is saved locally across restarts, with up to 20 exchanges sent as context.
New chat clears this saved context. Follow-ups submitted during a reply are queued
for the same conversation. The optional side agent must be selected explicitly.

The desktop app starts the local voice service when needed and reuses one already
running. Its first startup can take a while to load the models. Browser speech is
used if local synthesis is unavailable. `npm run test:conversation:live` runs an
isolated live provider check, including context, queuing, persistence,
transcription, simulated microphone capture, and spoken audio playback; it uses
the configured API account and requires the local voice service for playback.

Start the desktop app with `npm start`. The sidebar opens Conversation, Presence,
Motion library, and Voice & faces. Open companion detaches Verity onto the desktop.

In Presence:
- Automatic emotion follows conversation appraisal; Locked expression preserves
  the selected face even when replies or animations request a different face.
- Random idle animations chooses exclusively from checked motions. Clear selection
  stops idle motion. Pause and intensity are adjustable. Immediate repeats are
  avoided when more than one motion is selected.
- Idle clips last at most two cycles or eight seconds. Speech, thinking, dragging,
  special modes, and manual library playback take priority. Automatic reactions
  also expire so a looping reaction cannot block idle motion indefinitely.
- Follow the mouse uses Electron's desktop cursor coordinates outside the window,
  accounting for window position and zoom. Browser-only use is limited to the page.
  Coordinates are processed locally, not recorded or sent to the chat service.

Settings synchronize between desktop windows and persist across restarts.
Manual library playback can be stopped with the library's Stop button.

The emotion director now uses a curated 32-motion automatic vocabulary. It
interprets the current user message, short conversational continuations and
validated model advice, then selects a compatible face, motion and voice profile.
Concern/apology soften the mouth rather than retaining a broad smile. The
Presence panel explains the current reaction. The full 721-motion library remains
available for manual playback.

Automatic idle choices are limited to cataloged quiet motions, intersected with
your allowlist, the current mood, a locked expression and recent-motion cooldowns.
Old selections outside this quiet catalog stay saved but do not run automatically.
An empty compatible set means no motion. Clear selection removes old entries too.
Automatic reactions play one cycle, with independent movement speed and intensity,
and blend from the outgoing pose. Brief weak inputs preserve the prior reaction;
idle mood eventually returns to neutral. Duplicate HTTP/SSE deliveries do not
restart the same performance.

This release uses deterministic context rules plus optional structured advice
from the existing cloud reply. It does not train a new model or claim calibrated
emotion probabilities. The catalog is an initial engineering selection, not a
human-rated perceptual benchmark. Word-level speech alignment and preference
learning remain future work.

Emotion changes are runtime rules and prompting, not a model retraining job.
Ordinary technical terms no longer trigger horror; remote appraisal is checked
against the same context rules. Older async appraisals cannot overwrite newer ones.

Checks: `npm run test:presence`, `node tests/test_animations_and_sentiment.js`,
`npm run test:hermes`, `npm run test:emotion`, `npm run test:orb`. `tests/test_studio_smoke.js` runs in Electron with an isolated
profile and verifies navigation, expression locking, cursor delivery, minimum
window layout, and companion loading. Live chat and voice require their services.
