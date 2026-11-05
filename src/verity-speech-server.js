const AIProviders = require('./ai-providers');

function handle(req, res, getSettings = () => ({})) {
  const requestUrl = new URL(req.url, 'http://127.0.0.1');
  if (req.method !== 'POST' || requestUrl.pathname !== '/api/transcribe') return false;
  const reply = (status, body) => {
    if (!res.writableEnded) { res.writeHead(status, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(body)); }
  };
  if (!/^audio\/(webm|ogg|wav|mp4|mpeg)/.test(req.headers['content-type'] || '')) {
    reply(415, { error: 'Expected a supported audio recording.' }); req.resume(); return true;
  }
  const mime = req.headers['content-type'].split(';')[0];
  const chunks = [];
  let size = 0;
  let tooLarge = false;
  req.on('data', chunk => {
    if (tooLarge) return;
    size += chunk.length;
    if (size > 10 * 1024 * 1024) {
      tooLarge = true;
      chunks.length = 0;
      reply(413, { error: 'Recording is too long. Try a shorter message.' });
      return;
    }
    chunks.push(chunk);
  });
  req.on('end', async () => {
    if (res.writableEnded) return;
    if (!size) { reply(400, { error: 'The recording was empty.' }); return; }
    try {
      const settings = getSettings() || {};
      const requestedProvider = requestUrl.searchParams.get('provider');
      const id = requestedProvider === 'hermes' ? (settings.provider || 'groq') : (requestedProvider || settings.provider || 'groq');
      const text = await AIProviders.transcribe({ id, settings, audio: Buffer.concat(chunks), mime });
      reply(200, { text });
    } catch (error) {
      reply(502, { error: error.message || 'Voice transcription failed.' });
    }
  });
  return true;
}

module.exports = { handle };
