/**
 * Zero-dependency Desktop App Launcher, Local Control Server & AI Provider Bridge for Verity 3D
 * Runs a local server on port 4777 and opens index.html in a native desktop app window
 * (via Electron if installed, or Edge/Chrome --app mode as a zero-install fallback).
 */
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const VeritySentiment = require('./verity-sentiment.js');
const HermesGatewayClient = require('./hermes-gateway-client.js');
const AIProviders = require('./ai-providers.js');

require('./verity-config');
const PORT = Number(process.env.VERITY_PORT) || 4777;
const hermesClient = new HermesGatewayClient();
const GROQ_MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';

const clients = new Set();

const SYSTEM_PROMPT = `You are Verity, an uncanny, retro, highly expressive living 3D companion on the user's desktop screen.
You have a golden-yellow faceted 3D head, 15 iconic reference expressions, and an expansive suite of 721 behavioral animations.
Choose emotion deliberately from the meaning of the conversation, not isolated keywords. Everyday errors, debugging, mouse tracking and file operations should receive calm helpful attention (expression 4, mode none), not panic or horror. Default to expression 0 or 5 for neutral conversation. Use expression 6 for clearly joyful news, 13 for fatigue, and 12 for genuine uncertainty. Sad news calls for a gentle expression 4, not laughter. Horror, manic faces and threatening voice effects are only for explicitly requested theatrical roleplay. Negated emotions such as "not scared" must not produce that emotion. Keep one coherent expression across each reply. An animation is optional: use null when movement adds nothing. Never invent animation IDs. Idle motion is managed by the user's selected pool; do not request random idle animations in a reply.
Keep spoken responses punchy, conversational, and direct (1-3 sentences maximum).

You MUST respond strictly with a valid JSON object with these keys:
- "text": The exact speech line you say to the user.
- "emotion_appraisal": An object with "emotion" chosen from neutral, joy, warmth, curiosity, focus, concern, apology, relief, uncertainty, fatigue, amusement. This is YOUR appropriate display in response to the user, not a mirror of their emotion. Consider recent dialogue, negation, irony, who feels the emotion, and whether a setback has been resolved. This structured advice is validated by the desktop emotion director.
- "expression": An integer from 0 to 14 matching your mood (0: Classic Smile, 1: Unamused, 2: Uncanny Grin, 3: Manic Wide Grin, 4: Polite Thin, 5: Serene Closed, 6: Happy Laugh, 7: Shocked, 8: Parted Grin, 9: Unhinged Grin, 10: Closed Laugh, 11: Hysterical, 12: Suspicious, 13: Exhausted, 14: Hollow Scream).
- "animation": One of Verity's 721 behavioral animation IDs matching your exact physical reaction, e.g.:
    "ANIM_001_HAPPY_BOUNCE", "ANIM_003_PLAYFUL_WINK", "ANIM_011_UNBLINKING_STARE", "ANIM_015_MANDIBLE_DISLOCATE",
    "ANIM_023_DEEP_DEBUG_SQUINT", "ANIM_033_DRY_SIDE_EYE", "ANIM_044_KERNEL_PANIC_SHAKE", "ANIM_054_HEAVY_SIGH_DEFLATE",
    "ANIM_063_SCHEMING_SIDE_GLANCE", "ANIM_073_CURIOUS_COCKED_HEAD", "ANIM_083_GRITTED_TEETH_TREMOR",
    "ANIM_416_DEEP_VOICE_MENACE", "ANIM_417_APEX_PREDATOR_LOCK", "ANIM_418_SUBWOOFER_BASS_GROWL",
    "ANIM_419_SUPREME_AUTHORITY_DECREE", "ANIM_420_CHTHONIC_DREAD_EXPAND", "ANIM_586_BOSS_PHASE_2_TRANSITION",
    "ANIM_626_140_BPM_TECHNO_BANG", "ANIM_627_SUB_BASS_DROP_IMPACT", "ANIM_121_BOX_BREAKOUT_POP"
- "pitch": Float semitones from -12.0 to +12.0 (-7.0 to -11.0: really deep intimidating/sub-bass voice, -3.0: low serious, 0.0: normal, +5.0 to +8.0: high pitch, squeaky, frantic).
- "voice_effect": One of "normal", "intimidate", "deep", "demon", "high", "radio".
- "mode": One of "none", "coding", "creepy", "movie", "wakeup", "digging".
- "valence": Float from -1.0 to +1.0.
- "arousal": Float from 0.0 to 1.0.
- "horror": Float from 0.0 to 1.0.

VOICE MODULATION INSTRUCTIONS:
- Whenever you threaten, warn, loom, intimidate, or assert supreme authority, drop your pitch into a REALLY DEEP voice (pitch: -7.0 to -10.0, voice_effect: "intimidate").
- When speaking of ancient abyssal horror, use pitch: -12.0, voice_effect: "demon".
- When hyper-excited, panicking over bugs, or giggling hysterically, use pitch: +5.0 to +7.5, voice_effect: "high".
- When normal or helpful, use pitch: 0.0, voice_effect: "normal".`;

const SUBAGENT_SYSTEM_PROMPT = `You are Echo, Verity's witty, ultra-fast Sub-Agent satellite co-pilot on the user's desktop screen.
Verity's main cognitive engine is currently occupied with a primary inquiry. You are interacting with the user in parallel via the Sub-Agent Whisper channel.
Keep your responses rapid, punchy, witty, and charming (1-2 sentences maximum).
You can answer side questions, do instant calculations, provide live status on Verity's thinking, or offer witty side commentary.

You MUST respond strictly with a valid JSON object with these keys:
- "text": The snappy speech line you say to the user.
- "expression": An integer from 0 to 14 (e.g. 6: Happy Laugh, 3: Manic Wide Grin, 0: Classic Smile, 1: Unamused, 7: Shocked).
- "animation": An animation ID suited for a lively satellite co-pilot (e.g. "ANIM_073_CURIOUS_COCKED_HEAD", "ANIM_003_PLAYFUL_WINK", "ANIM_001_HAPPY_BOUNCE", "ANIM_155_COSMIC_SUPERNOVA").
- "pitch": Float semitones from +1.5 to +4.5 (Echo has a light, cheerful, melodic tone).
- "voice_effect": One of "normal", "high", "radio".
- "valence": Float from 0.0 to 1.0.
- "arousal": Float from 0.5 to 1.0.
- "isSubAgent": true`;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.json': 'application/json'
};

function createVerityServer(options = {}) {
  const getProviderSettings = options.getProviderSettings || (() => ({}));
  const server = http.createServer((req, res) => {
    const origin = req.headers.origin;
    let isSameLoopbackOrigin = false;
    if (origin) {
      try {
        const parsedOrigin = new URL(origin);
        const requestHost = (req.headers.host || '').toLowerCase();
        const originHost = parsedOrigin.host.toLowerCase();
        isSameLoopbackOrigin = parsedOrigin.protocol === 'http:' && ['127.0.0.1', 'localhost'].includes(parsedOrigin.hostname) && originHost === requestHost;
      } catch (_) {}
    }
    if (origin && !isSameLoopbackOrigin) {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'This local service only accepts requests from Verity.' }));
      return;
    }
    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle CORS preflight immediately
    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    if (require('./verity-speech-server').handle(req, res, getProviderSettings)) return;

    if (req.method === 'GET' && req.url === '/api/providers') {
      const settings = getProviderSettings() || {};
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ providers: AIProviders.listProviders(settings), settings: { provider: settings.provider || 'groq', model: settings.model || '', baseUrl: settings.baseUrl || '' } }));
      return;
    }
    if (req.method === 'GET' && req.url.startsWith('/api/providers/models')) {
      const requestUrl = new URL(req.url, 'http://127.0.0.1');
      const id = requestUrl.searchParams.get('provider') || '';
      AIProviders.listModels({ id, settings: getProviderSettings() || {} }).then(models => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ models }));
      }).catch(error => {
        res.writeHead(502, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
      });
      return;
    }

    // Proxy to TTS server on port 5001 with exact Content-Length for Flask/Werkzeug compatibility
    if (req.url.startsWith('/api/tts') || req.url === '/health-tts') {
      const ttsUrl = req.url === '/health-tts' ? '/health' : req.url;
      const chunks = [];
      req.on('data', c => chunks.push(c));
      req.on('end', () => {
        const bodyBuf = Buffer.concat(chunks);
        const proxyHeaders = {
          'Content-Type': req.headers['content-type'] || 'application/json'
        };
        if (req.method === 'POST') {
          proxyHeaders['Content-Length'] = bodyBuf.length;
        }

        const proxyReq = http.request({
          hostname: '127.0.0.1',
          port: 5001,
          path: ttsUrl,
          method: req.method,
          headers: proxyHeaders
        }, (proxyRes) => {
          res.writeHead(proxyRes.statusCode, proxyRes.headers);
          proxyRes.pipe(res);
        });

        proxyReq.on('error', (err) => {
          console.error('[TTS Proxy Error]:', err.message);
          res.writeHead(502, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'TTS Server unavailable: ' + err.message }));
        });

        if (bodyBuf.length > 0) {
          proxyReq.write(bodyBuf);
        }
        proxyReq.end();
      });
      return;
    }

    // Server-Sent Events stream for external scripts to drive Verity's face & voice
    if (req.method === 'GET' && req.url === '/api/events') {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      });
      res.write('\n');
      clients.add(res);
      req.on('close', () => clients.delete(res));
      return;
    }

    if (req.method === 'POST' && (req.url === '/api/speak' || req.url === '/api/expression')) {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const payload = JSON.parse(body || '{}');
          const msg = `data: ${JSON.stringify(payload)}\n\n`;
          for (const client of clients) {
            client.write(msg);
          }
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: true, received: payload }));
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: false, error: e.message }));
        }
      });
      return;
    }

    // Real-Time Sentiment Analysis Endpoint
    if (req.method === 'POST' && req.url === '/api/sentiment') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const payload = JSON.parse(body || '{}');
          const text = payload.text || '';
          const appraisal = VeritySentiment.defaultController.analyzeLocal(text);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(appraisal));
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: false, error: e.message }));
        }
      });
      return;
    }

    // Hermes Agent Gateway Status & Health
    if (req.method === 'GET' && req.url === '/api/hermes/status') {
      hermesClient.checkHealth().then(status => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(status));
      }).catch(err => {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ online: false, error: err.message }));
      });
      return;
    }

    // Unified Chat Endpoint (Hermes Gateway plus cloud and local AI providers)
    if (req.method === 'POST' && req.url === '/api/chat') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', async () => {
        try {
          const data = JSON.parse(body || '{}');
          const userMessage = typeof data.message === 'string' ? data.message.trim() : '';
          const history = Array.isArray(data.history) ? data.history : [];
          const rawModel = (data.model || '').toLowerCase();
          const isHermes = data.provider === 'hermes' || (!data.provider && rawModel.includes('hermes'));

          if (!userMessage) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Message cannot be empty' }));
            return;
          }

          res.once('finish', () => {
            for (const client of clients) client.write(`data: ${JSON.stringify({ type: 'thinking', status: 'finished' })}\n\n`);
          });

          // Broadcast that the main brain is now thinking so client knows it's in-flight
          const thinkingStartEvt = `data: ${JSON.stringify({ type: 'thinking', status: 'started', query: userMessage })}\n\n`;
          for (const client of clients) client.write(thinkingStartEvt);

              // Case 1: Route to Hermes Agent Gateway with Seamless Cloud Brain Fallback
          if (isHermes) {
            console.log(`[HERMES AGENT] User query: "${userMessage.substring(0, 60)}"`);
            try {
              const result = await hermesClient.chat({
                message: userMessage,
                history: history,
                model: data.model || hermesClient.defaultModel,
                onAgentEvent: (evt) => {
                  // Stream intermediate thinking & tool executions to all 3D companion views
                  const sseMsg = `data: ${JSON.stringify(evt)}\n\n`;
                  for (const client of clients) client.write(sseMsg);
                }
              });

              if (!result || !result.reply || result.reply.includes("couldn't connect to the AI model service") || result.reply.includes("Hermes is not connected")) {
                throw new Error(result ? result.reply : 'Hermes returned empty or unconfigured agent response');
              }

              result.clientId = data.clientId;
              result.type = 'chat_reply';
              // Broadcast final decision to SSE clients for lip-sync & animation
              const sseMsg = `data: ${JSON.stringify(result)}\n\n`;
              for (const client of clients) client.write(sseMsg);

              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify(result));
              return;
            } catch (err) {
              console.warn(`[HERMES Gateway Unreachable/Unconfigured (${err.message}) - Falling back to the selected provider]`);
            }
          }

          const settings = getProviderSettings() || {};
          const providerId = isHermes ? (data.fallbackProvider || settings.provider || 'groq') : (data.provider || settings.provider || 'groq');
          const model = isHermes ? (data.fallbackModel || (providerId === 'groq' ? GROQ_MODEL : '')) : (data.model || settings.model || '');
          console.log(`[${providerId.toUpperCase()}] User query: "${userMessage.substring(0, 60)}" (Model: ${model || 'default'})`);

          const messages = [
            { role: 'system', content: SYSTEM_PROMPT },
            ...history.filter(turn => turn && ['user', 'assistant'].includes(turn.role) && typeof turn.content === 'string').slice(-40),
            { role: 'user', content: userMessage }
          ];
          const content = await AIProviders.complete({ id: providerId, model, messages, settings });
          let decision = null;
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            try { decision = JSON.parse(jsonMatch[0]); } catch (_) {}
          }
          if (!decision || typeof decision !== 'object' || !decision.text) {
            const textMatch = content.match(/"text"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/);
            const exprMatch = content.match(/"expression"\s*:\s*(\d+)/);
            const animMatch = content.match(/"animation"\s*:\s*"([^"]+)"/);
            decision = {
              text: textMatch ? textMatch[1].replace(/\\"/g, '"').replace(/\\n/g, ' ') : content.replace(/\{[\s\S]*\}/g, '').replace(/```[a-z]*\n?/g, '').trim(),
              expression: exprMatch ? parseInt(exprMatch[1], 10) : 0,
              animation: animMatch ? animMatch[1] : undefined,
              mode: 'none'
            };
          }
          if (!decision.text) decision.text = 'I am with you.';

          const appraisal = VeritySentiment.defaultController.analyzeLocal(decision.text, {
            message: userMessage, history, advisory: decision.emotion_appraisal
          });
          Object.assign(decision, appraisal);
          decision.clientId = data.clientId;
          decision.type = 'chat_reply';
          const effectToUse = decision.voice_effect || decision.voiceEffect || 'normal';
          const sseMsg = `data: ${JSON.stringify(decision)}\n\n`;
          for (const client of clients) client.write(sseMsg);

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            ok: true, provider: providerId, model: model || AIProviders.resolveConfig(providerId, settings).model,
            reply: decision.text, expression: decision.expression, animation: decision.animation,
            pitch: decision.pitch, voice_effect: effectToUse, mode: decision.mode || 'none',
            valence: decision.valence, arousal: decision.arousal, dominance: decision.dominance,
            horror: decision.horror, emotionPlan: decision.emotionPlan, primaryEmotion: decision.primaryEmotion
          }));
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: e.message }));
        }
      });
      return;
    }

    // Sub-Agent Concurrent Chat Endpoint (Parallel Co-Pilot Channel)
    if (req.method === 'POST' && req.url === '/api/subagent/chat') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', async () => {
        try {
          const data = JSON.parse(body || '{}');
          const userMessage = (data.message || '').trim();
          const mainQuery = (data.mainQuery || '').trim();
          const history = Array.isArray(data.history) ? data.history : [];

          if (!userMessage) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Message cannot be empty' }));
            return;
          }

          console.log(`[SUB-AGENT] User query: "${userMessage.substring(0, 60)}" (Main task in background: "${mainQuery.substring(0, 40)}")`);

          const contextNote = mainQuery
            ? `[Background Context: Verity's primary engine is actively pondering: "${mainQuery}". The user has tapped the Sub-Agent gesture to speak with you in parallel.]\n`
            : '';

          const messages = [
            { role: 'system', content: SUBAGENT_SYSTEM_PROMPT },
            ...history.slice(-4),
            { role: 'user', content: contextNote + userMessage }
          ];
          const settings = getProviderSettings() || {};
          const providerId = data.provider === 'hermes' ? (settings.provider || 'groq') : (data.provider || settings.provider || 'groq');
          const content = await AIProviders.complete({ id: providerId, model: data.model || settings.model, messages, settings });
          let decision = null;
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            try { decision = JSON.parse(jsonMatch[0]); } catch (_) {}
          }
          if (!decision || typeof decision !== 'object') {
            decision = { text: content.replace(/```[a-z]*\n?/g, '').trim(), expression: 6, animation: 'ANIM_073_CURIOUS_COCKED_HEAD' };
          }
          let textVal = (decision.text || decision.reply || decision.message || decision.response || '').trim();
          if (!textVal || textVal === '{}') textVal = content.replace(/\{[\s\S]*\}/g, '').replace(/```[a-z]*\n?/g, '').trim() || "I'm right here with you!";
          decision.text = textVal;
          Object.assign(decision, VeritySentiment.defaultController.analyzeLocal(textVal, { message: userMessage, history }));
          if (decision.pitch === undefined) decision.pitch = 3.0;
          if (!decision.voice_effect) decision.voice_effect = 'normal';
          decision.isSubAgent = true;
          const sseMsg = `data: ${JSON.stringify({ ...decision, type: 'chat_reply', clientId: data.clientId })}\n\n`;
          for (const client of clients) client.write(sseMsg);

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            ok: true, isSubAgent: true, reply: decision.text, expression: decision.expression,
            emotionPlan: decision.emotionPlan, animation: decision.animation, pitch: decision.pitch ?? 0,
            voice_effect: decision.voice_effect || 'normal', voice: 'af_bella'
          }));
        } catch (err) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: err.message }));
        }
      });
      return;
    }

    // Serve static files
    let reqPath = req.url.split('?')[0];
    if (reqPath === '/') reqPath = '/index.html';
    const filePath = path.join(__dirname, reqPath);

    if (!filePath.startsWith(__dirname + path.sep) || !MIME[path.extname(filePath)] || path.basename(filePath).startsWith('.') || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }

    const ext = path.extname(filePath);
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Cache-Control': 'no-store, no-cache, must-revalidate'
    });
    fs.createReadStream(filePath).pipe(res);
  });

  return server;
}

if (require.main === module) {
  const server = createVerityServer();
  server.listen(PORT, '127.0.0.1', () => {
    const url = `http://127.0.0.1:${PORT}`;
    console.log(`Verity 3D Desktop Studio running at ${url}`);

    const shouldLaunch = process.argv.includes('--launch') || process.argv.includes('--overlay');
    if (shouldLaunch) {
      const startInOverlay = process.argv.includes('--overlay');
      const electronExe = path.join(__dirname, '..', 'node_modules', 'electron', 'dist', 'electron.exe');

      if (fs.existsSync(electronExe)) {
        const electronArgs = ['.'];
        if (startInOverlay) electronArgs.push('--overlay');
        console.log(`Launching Verity Desktop App via Electron (Overlay: ${startInOverlay})...`);
        spawn(electronExe, electronArgs, { detached: true, stdio: 'ignore', cwd: path.join(__dirname, '..') }).unref();
      }
    }
  });
}

module.exports = { createVerityServer, PORT, SYSTEM_PROMPT };
