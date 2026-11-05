const http = require('http');
const https = require('https');

const PROVIDERS = [
  { id: 'groq', name: 'Groq', env: 'GROQ_API_KEY', base: 'https://api.groq.com/openai/v1/', model: 'openai/gpt-oss-120b' },
  { id: 'openai', name: 'OpenAI', env: 'OPENAI_API_KEY', base: 'https://api.openai.com/v1/', model: 'gpt-4o-mini' },
  { id: 'azure', name: 'Azure OpenAI', env: 'AZURE_OPENAI_API_KEY', base: '', model: '', native: 'azure', endpoint: true },
  { id: 'anthropic', name: 'Anthropic Claude', env: 'ANTHROPIC_API_KEY', base: 'https://api.anthropic.com/', model: 'claude-haiku-4-5-20251001', native: 'anthropic' },
  { id: 'google', name: 'Google Gemini', env: 'GOOGLE_API_KEY', base: 'https://generativelanguage.googleapis.com/v1beta/', model: 'gemini-3.5-flash', native: 'google' },
  { id: 'openrouter', name: 'OpenRouter', env: 'OPENROUTER_API_KEY', base: 'https://openrouter.ai/api/v1/', model: 'openai/gpt-4o-mini' },
  { id: 'mistral', name: 'Mistral', env: 'MISTRAL_API_KEY', base: 'https://api.mistral.ai/v1/', model: 'mistral-small-latest' },
  { id: 'deepseek', name: 'DeepSeek', env: 'DEEPSEEK_API_KEY', base: 'https://api.deepseek.com/', model: 'deepseek-flash' },
  { id: 'xai', name: 'xAI', env: 'XAI_API_KEY', base: 'https://api.x.ai/v1/', model: 'grok-4.6' },
  { id: 'together', name: 'Together AI', env: 'TOGETHER_API_KEY', base: 'https://api.together.xyz/v1/', model: 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo' },
  { id: 'fireworks', name: 'Fireworks AI', env: 'FIREWORKS_API_KEY', base: 'https://api.fireworks.ai/inference/v1/', model: 'accounts/fireworks/models/llama-v3p1-8b-instruct' },
  { id: 'cerebras', name: 'Cerebras', env: 'CEREBRAS_API_KEY', base: 'https://api.cerebras.ai/v1/', model: 'llama3.1-8b' },
  { id: 'perplexity', name: 'Perplexity', env: 'PERPLEXITY_API_KEY', base: 'https://api.perplexity.ai/', model: 'sonar' },
  { id: 'cohere', name: 'Cohere', env: 'COHERE_API_KEY', base: 'https://api.cohere.com/compatibility/v1/', model: 'command-r-08-2024' },
  { id: 'sambanova', name: 'SambaNova', env: 'SAMBANOVA_API_KEY', base: 'https://api.sambanova.ai/v1/', model: 'Meta-Llama-3.3-70B-Instruct' },
  { id: 'ollama', name: 'Ollama (local)', env: '', base: 'http://127.0.0.1:11434/v1/', model: 'qwen2.5:7b', local: true },
  { id: 'lmstudio', name: 'LM Studio (local)', env: '', base: 'http://127.0.0.1:1234/v1/', model: 'local-model', local: true },
  { id: 'custom', name: 'Custom OpenAI-compatible', env: 'CUSTOM_OPENAI_API_KEY', base: '', model: '', custom: true }
];

function getProvider(id) {
  return PROVIDERS.find(provider => provider.id === id) || null;
}

function validateBaseUrl(baseUrl, allowLocalHttp = false) {
  if (!baseUrl) return;
  let parsed;
  try { parsed = new URL(baseUrl); } catch (_) { throw new Error('Enter a valid provider URL.'); }
  const localHost = ['localhost', '127.0.0.1', '::1'].includes(parsed.hostname.replace(/^\[|\]$/g, ''));
  if (parsed.protocol !== 'https:' && !(allowLocalHttp && parsed.protocol === 'http:' && localHost)) {
    throw new Error('Provider URLs must use HTTPS. HTTP is allowed for local servers only.');
  }
  if (parsed.username || parsed.password) throw new Error('Do not put credentials in the provider URL.');
}

function resolveConfig(id, settings = {}) {
  const provider = getProvider(id);
  if (!provider) throw new Error('Choose a supported AI provider.');
  const isSelected = settings.provider === id;
  const apiKey = settings.credentials?.[id] || (isSelected && settings.apiKey) || (settings.allowEnvironmentCredentials !== false && provider.env && process.env[provider.env]) || '';
  const baseUrl = settings.baseUrls?.[id] || (isSelected && settings.baseUrl) || (provider.custom && process.env.CUSTOM_OPENAI_BASE_URL) || (provider.endpoint && process.env.AZURE_OPENAI_ENDPOINT) || provider.base;
  const model = settings.models?.[id] || (isSelected && settings.model) || (provider.env && process.env[`${provider.env.replace(/_API_KEY$/, '')}_MODEL`]) || provider.model;
  if (!provider.local && !apiKey) throw new Error(`Add your ${provider.name} API key in Provider settings to connect.`);
  if ((provider.custom || provider.endpoint) && !baseUrl) throw new Error(`Enter the base URL for ${provider.name}.`);
  validateBaseUrl(baseUrl, Boolean(provider.local || provider.custom));
  return { provider, apiKey, baseUrl, model };
}

function listProviders(settings = {}) {
  return PROVIDERS.map(provider => {
    const config = {
      apiKey: settings.credentials?.[provider.id] || (settings.provider === provider.id && settings.apiKey) || (settings.allowEnvironmentCredentials !== false && provider.env && process.env[provider.env]),
      baseUrl: settings.baseUrls?.[provider.id] || (settings.provider === provider.id && settings.baseUrl) || (provider.custom && process.env.CUSTOM_OPENAI_BASE_URL) || (provider.endpoint && process.env.AZURE_OPENAI_ENDPOINT),
      local: provider.local
    };
    return {
      id: provider.id,
      name: provider.name,
      env: provider.env,
      local: Boolean(provider.local),
      baseUrl: config.baseUrl || '',
      defaultModel: settings.models?.[provider.id] || (settings.provider === provider.id && settings.model) || (provider.env && process.env[`${provider.env.replace(/_API_KEY$/, '')}_MODEL`]) || provider.model,
      configured: Boolean(provider.local || (config.apiKey && (!(provider.custom || provider.endpoint) || config.baseUrl))),
      hasSavedKey: Boolean(settings.credentials?.[provider.id] || (settings.provider === provider.id && settings.apiKey)),
      needsKey: !provider.local && !(config.apiKey),
      needsBaseUrl: Boolean((provider.custom || provider.endpoint) && !config.baseUrl)
    };
  });
}

function requestJson(target, { method = 'POST', headers = {}, body, timeoutMs = 60000 } = {}) {
  const parsed = new URL(target);
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return Promise.reject(new Error('Provider URL must use HTTP or HTTPS.'));
  const transport = parsed.protocol === 'https:' ? https : http;
  const payload = body == null ? null : Buffer.from(JSON.stringify(body));
  return new Promise((resolve, reject) => {
    const req = transport.request(parsed, {
      method,
      headers: { Accept: 'application/json', ...(payload ? { 'Content-Type': 'application/json', 'Content-Length': payload.length } : {}), ...headers }
    }, response => {
      let data = '';
      response.setEncoding('utf8');
      response.on('data', chunk => { data += chunk; });
      response.on('end', () => {
        let json;
        try { json = JSON.parse(data); }
        catch (_) { return reject(new Error(`Provider returned an unreadable response (HTTP ${response.statusCode}).`)); }
        if (response.statusCode < 200 || response.statusCode >= 300) {
          return reject(new Error(json.error?.message || json.message || `Provider request failed (HTTP ${response.statusCode}).`));
        }
        resolve(json);
      });
    });
    req.setTimeout(timeoutMs, () => req.destroy(new Error('Provider request timed out. Try again or choose another model.')));
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

function messagesText(content) {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) return content.map(part => part.text || '').join('\n');
  return '';
}

function transcribe({ id, settings = {}, audio, mime = 'audio/webm' }) {
  if (!['openai', 'groq', 'custom'].includes(id)) return Promise.reject(new Error('Voice transcription is available with OpenAI or Groq. Choose one of those providers for microphone input.'));
  const config = resolveConfig(id, settings);
  const boundary = `verity-${require('crypto').randomBytes(12).toString('hex')}`;
  const ext = mime.split('/')[1]?.split(';')[0] || 'webm';
  const body = Buffer.concat([
    Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="model"\r\n\r\n${id === 'groq' ? 'whisper-large-v3-turbo' : 'whisper-1'}\r\n--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="speech.${ext}"\r\nContent-Type: ${mime}\r\n\r\n`),
    audio,
    Buffer.from(`\r\n--${boundary}--\r\n`)
  ]);
  const url = new URL('audio/transcriptions', config.baseUrl.endsWith('/') ? config.baseUrl : `${config.baseUrl}/`);
  const transport = url.protocol === 'https:' ? https : http;
  return new Promise((resolve, reject) => {
    const req = transport.request(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${config.apiKey}`, 'Content-Type': `multipart/form-data; boundary=${boundary}`, 'Content-Length': body.length }
    }, response => {
      let data = '';
      response.setEncoding('utf8');
      response.on('data', chunk => { data += chunk; });
      response.on('end', () => {
        let parsed;
        try { parsed = JSON.parse(data); } catch (_) { return reject(new Error('Could not read the transcription response.')); }
        if (response.statusCode < 200 || response.statusCode >= 300) return reject(new Error(parsed.error?.message || `Transcription failed (HTTP ${response.statusCode}).`));
        resolve(parsed.text || '');
      });
    });
    req.setTimeout(30000, () => req.destroy(new Error('Voice transcription timed out.')));
    req.on('error', reject);
    req.end(body);
  });
}

async function complete({ id, model, messages, settings = {} }) {
  const config = resolveConfig(id, settings);
  const targetModel = model || config.model;
  const { provider, apiKey, baseUrl } = config;
  if (!targetModel && provider.endpoint) throw new Error(`Enter your ${provider.name} deployment name in the model field.`);
  let response;

  if (provider.native === 'azure') {
    const root = baseUrl.replace(/\/+$/, '').replace(/\/openai\/v1$/i, '');
    response = await requestJson(`${root}/openai/v1/chat/completions`, {
      headers: { 'api-key': apiKey },
      body: { model: targetModel, messages, temperature: 0.75, max_tokens: 700 }
    });
    return messagesText(response.choices?.[0]?.message?.content);
  }

  if (provider.native === 'anthropic') {
    const system = messages.filter(message => message.role === 'system').map(message => message.content).join('\n\n');
    response = await requestJson(new URL('v1/messages', baseUrl).href, {
      headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: { model: targetModel, max_tokens: 700, system, messages: messages.filter(message => message.role !== 'system') }
    });
    return messagesText(response.content);
  }

  if (provider.native === 'google') {
    const system = messages.filter(message => message.role === 'system').map(message => message.content).join('\n\n');
    const contents = messages.filter(message => message.role !== 'system').map(message => ({
      role: message.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: message.content }]
    }));
    const target = new URL(`models/${encodeURIComponent(targetModel)}:generateContent`, baseUrl);
    target.searchParams.set('key', apiKey);
    response = await requestJson(target.href, {
      body: { systemInstruction: { parts: [{ text: system }] }, contents, generationConfig: { temperature: 0.75, maxOutputTokens: 700, responseMimeType: 'application/json' } }
    });
    return (response.candidates?.[0]?.content?.parts || []).map(part => part.text || '').join('\n');
  }

  const target = new URL('chat/completions', baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`);
  const headers = {};
  if (apiKey) headers.Authorization = `Bearer ${apiKey}`;
  response = await requestJson(target.href, {
    headers,
    body: { model: targetModel, messages, temperature: 0.75, max_tokens: 700 }
  });
  return messagesText(response.choices?.[0]?.message?.content);
}

async function listModels({ id, settings = {} }) {
  const config = resolveConfig(id, settings);
  const { provider, apiKey, baseUrl } = config;
  let target;
  let headers = {};
  if (provider.native === 'azure') {
    const root = baseUrl.replace(/\/+$/, '').replace(/\/openai\/v1$/i, '');
    target = `${root}/openai/v1/models`;
    headers = { 'api-key': apiKey };
  } else if (provider.native === 'anthropic') {
    target = new URL('v1/models', baseUrl).href;
    headers = { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' };
  } else if (provider.native === 'google') {
    const parsed = new URL('models', baseUrl);
    parsed.searchParams.set('key', apiKey);
    target = parsed.href;
  } else {
    target = new URL('models', baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`).href;
    if (apiKey) headers.Authorization = `Bearer ${apiKey}`;
  }
  const result = await requestJson(target, { method: 'GET', headers, timeoutMs: 15000 });
  const models = provider.native === 'google'
    ? (result.models || []).filter(model => !model.supportedGenerationMethods || model.supportedGenerationMethods.includes('generateContent')).map(model => (model.name || '').replace(/^models\//, ''))
    : (result.data || result.models || []).map(model => typeof model === 'string' ? model : model.id || model.name).filter(Boolean);
  return [...new Set(models)].sort((a, b) => a.localeCompare(b)).slice(0, 300);
}

module.exports = { PROVIDERS, getProvider, resolveConfig, listProviders, validateBaseUrl, complete, listModels, transcribe };
