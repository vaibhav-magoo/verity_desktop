/**
 * VERITY 3D // Hermes Agent Gateway Client & Embodied Interaction Bridge
 * ======================================================================
 * Connects Verity 3D Desktop Sphere to Nous Research's Hermes Agent Gateway.
 * 
 * - Communicates with Hermes Gateway OpenAI-compatible API (default: http://127.0.0.1:8642/v1)
 * - Tracks persistent multi-turn conversations via `X-Hermes-Session-Key`
 * - Intercepts tool calls (bash, file I/O, web search, memory) and triggers
 *   corresponding Verity 3D behavioral animations in real-time
 * - Parses final agent speech and feeds it to Verity's Sentiment Engine & Kokoro TTS
 */

const http = require('http');
const https = require('https');
const url = require('url');
const VeritySentiment = require('./verity-sentiment.js');

class HermesGatewayClient {
  constructor(options = {}) {
    this.gatewayUrl = options.gatewayUrl || process.env.HERMES_GATEWAY_URL || 'http://127.0.0.1:8642/v1';
    this.apiKey = options.apiKey || process.env.HERMES_API_KEY || '';
    this.sessionKey = options.sessionKey || process.env.HERMES_SESSION_KEY || 'verity-desktop-session';
    this.defaultModel = options.model || process.env.HERMES_MODEL || 'nousresearch/hermes-3-llama-3.1-8b';
    this.cfClientId = options.cfClientId || process.env.CF_ACCESS_CLIENT_ID || '';
    this.cfClientSecret = options.cfClientSecret || process.env.CF_ACCESS_CLIENT_SECRET || '';
    this.timeoutMs = options.timeoutMs || 30000;
  }

  /**
   * Helper to construct request headers including optional Cloudflare Zero Trust Service Tokens
   */
  getHeaders(extra = {}) {
    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'X-Hermes-Session-Key': this.sessionKey,
      ...extra
    };
    if (this.cfClientId && this.cfClientSecret) {
      headers['CF-Access-Client-Id'] = this.cfClientId;
      headers['CF-Access-Client-Secret'] = this.cfClientSecret;
    }
    return headers;
  }

  /**
   * Check if Hermes Gateway is online and retrieve registered models
   */
  async checkHealth() {
    try {
      const parsed = new url.URL(`${this.gatewayUrl.replace(/\/+$/, '')}/models`);
      const isHttps = parsed.protocol === 'https:';
      const transport = isHttps ? https : http;

      return await new Promise((resolve) => {
        const req = transport.request({
          hostname: parsed.hostname,
          port: parsed.port || (isHttps ? 443 : 80),
          path: parsed.pathname,
          method: 'GET',
          headers: this.getHeaders(),
          timeout: 2500
        }, (res) => {
          let data = '';
          res.on('data', chunk => { data += chunk; });
          res.on('end', () => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              try {
                const json = JSON.parse(data);
                const models = (json.data || []).map(m => m.id || m);
                resolve({
                  online: true,
                  gatewayUrl: this.gatewayUrl,
                  sessionKey: this.sessionKey,
                  models: models.length > 0 ? models : [this.defaultModel]
                });
              } catch (_) {
                resolve({ online: true, gatewayUrl: this.gatewayUrl, sessionKey: this.sessionKey, models: [this.defaultModel] });
              }
            } else {
              resolve({ online: false, error: `HTTP ${res.statusCode}`, gatewayUrl: this.gatewayUrl });
            }
          });
        });

        req.on('error', (err) => {
          resolve({ online: false, error: err.message, gatewayUrl: this.gatewayUrl });
        });

        req.on('timeout', () => {
          req.destroy();
          resolve({ online: false, error: 'Connection timeout', gatewayUrl: this.gatewayUrl });
        });

        req.end();
      });
    } catch (err) {
      return { online: false, error: err.message, gatewayUrl: this.gatewayUrl };
    }
  }

  /**
   * Map a tool name or action from Hermes Agent to a Verity 3D animation & facial expression
   */
  mapToolToVerityState(toolName, toolArgs = {}) {
    const name = (toolName || '').toLowerCase();
    
    // Terminal, Bash, Script execution
    if (name.includes('bash') || name.includes('shell') || name.includes('terminal') || name.includes('execute') || name.includes('command')) {
      return {
        animation: 'ANIM_032_TERMINAL_HACK_MODE',
        expression: 1, // Unamused / Focused
        statusText: `Terminal tool: ${toolName}`,
        thought: 'Executing terminal routine...'
      };
    }

    // Code editing / debugging / patching
    if (name.includes('edit') || name.includes('patch') || name.includes('write') || name.includes('code') || name.includes('compile')) {
      return {
        animation: 'ANIM_023_DEEP_DEBUG_SQUINT',
        expression: 12, // Suspicious / Deep inspection
        statusText: `Code synthesis: ${toolName}`,
        thought: 'Inspecting code structures...'
      };
    }

    // File reading / filesystem exploration
    if (name.includes('read') || name.includes('file') || name.includes('dir') || name.includes('find') || name.includes('grep')) {
      return {
        animation: 'ANIM_024_DATA_SCAN_SWEEP',
        expression: 0, // Classic Smile
        statusText: `Data scan: ${toolName}`,
        thought: 'Scanning file matrix...'
      };
    }

    // Web browsing, searching, HTTP calls
    if (name.includes('web') || name.includes('search') || name.includes('browser') || name.includes('fetch') || name.includes('curl')) {
      return {
        animation: 'ANIM_074_EAGER_LEAN_IN',
        expression: 0, // Classic
        statusText: `Network query: ${toolName}`,
        thought: 'Retrieving external intel...'
      };
    }

    // Memory / Skill retrieval or synthesis
    if (name.includes('memory') || name.includes('skill') || name.includes('learn') || name.includes('recall')) {
      return {
        animation: 'ANIM_025_EUREKA_EPIPHANY',
        expression: 8, // Parted Grin
        statusText: `Memory synthesis: ${toolName}`,
        thought: 'Synthesizing adaptive memory...'
      };
    }

    // Default tool state
    return {
      animation: 'ANIM_073_CURIOUS_COCKED_HEAD',
      expression: 0,
      statusText: `Agent executing ${toolName}...`,
      thought: 'Processing tool action...'
    };
  }

  /**
   * Send a user query to Hermes Agent Gateway with streaming tool-call events
   * @param {Object} params
   * @param {string} params.message - User prompt
   * @param {Array} params.history - Conversation history
   * @param {string} [params.model] - Target model
   * @param {Function} [params.onAgentEvent] - Callback for intermediate thinking/tool states
   * @returns {Promise<Object>} Final synthesized response with sentiment & animations
   */
  async chat({ message, history = [], model = null, onAgentEvent = null }) {
    const targetModel = model || this.defaultModel;
    const parsed = new url.URL(`${this.gatewayUrl.replace(/\/+$/, '')}/chat/completions`);
    const isHttps = parsed.protocol === 'https:';
    const transport = isHttps ? https : http;

    // Notify Verity that Hermes is contemplating the user query
    if (typeof onAgentEvent === 'function') {
      onAgentEvent({
        type: 'thinking',
        animation: 'ANIM_073_CURIOUS_COCKED_HEAD',
        expression: 0,
        text: 'Listening to user instruction...'
      });
    }

    const messages = [
      ...history.slice(-8),
      { role: 'user', content: message }
    ];

    const postPayload = JSON.stringify({
      model: targetModel,
      messages: messages,
      stream: false,
      temperature: 0.7
    });

    return new Promise((resolve, reject) => {
      const req = transport.request({
        hostname: parsed.hostname,
        port: parsed.port || (isHttps ? 443 : 80),
        path: parsed.pathname,
        method: 'POST',
        headers: this.getHeaders({
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postPayload),
          'User-Agent': 'Verity-Desktop-Hermes-Client/1.0'
        }),
        timeout: this.timeoutMs
      }, (res) => {
        let resBody = '';
        res.on('data', chunk => { resBody += chunk; });
        res.on('end', () => {
          try {
            if (res.statusCode < 200 || res.statusCode >= 300) {
              return reject(new Error(`Hermes Gateway error (HTTP ${res.statusCode}): ${resBody}`));
            }

            const parsedData = JSON.parse(resBody);
            const choice = parsedData.choices && parsedData.choices[0];
            const msgObj = choice ? choice.message : {};
            const rawContent = (msgObj.content || '').trim();

            // Detect if Hermes agent returned an error (e.g. unconfigured provider)
            if (choice && choice.finish_reason === 'error') {
              return reject(new Error(rawContent || 'Hermes returned finish_reason: error'));
            }
            if (parsedData.hermes && parsedData.hermes.failed) {
              return reject(new Error(parsedData.hermes.error || rawContent || 'Hermes agent reported failure'));
            }
            if (rawContent.includes("couldn't connect to the AI model service") || rawContent.includes("Hermes is not connected to any AI provider")) {
              return reject(new Error(rawContent));
            }

            // Check if Hermes called tools during this turn
            if (msgObj.tool_calls && Array.isArray(msgObj.tool_calls) && msgObj.tool_calls.length > 0) {
              const tool = msgObj.tool_calls[0];
              const toolName = (tool.function && tool.function.name) || tool.name || 'tool';
              const state = this.mapToolToVerityState(toolName);
              if (typeof onAgentEvent === 'function') {
                onAgentEvent({
                  type: 'tool_call',
                  tool: toolName,
                  ...state
                });
              }
            }

            // Extract spoken response
            let spokenText = rawContent;
            
            // Clean markdown blocks or thought tags if present (<thought>...</thought> or <think>...</think>)
            spokenText = spokenText.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
            spokenText = spokenText.replace(/<thought>[\s\S]*?<\/thought>/gi, '').trim();

            if (!spokenText) {
              spokenText = "Action completed by Hermes Agent.";
            }

            // Real-Time Sentiment & Emotion Appraisal of Hermes response
            const appraisal = VeritySentiment.defaultController.analyzeLocal(spokenText, { message, history });

            const result = {
              ok: true,
              source: 'hermes-agent',
              model: targetModel,
              reply: spokenText,
              expression: appraisal.recommendedExpression,
              animation: appraisal.recommendedAnimation,
              mode: appraisal.primaryEmotion === 'Creepy Uncanny' ? 'creepy' : 'none',
              valence: appraisal.valence,
              arousal: appraisal.arousal,
              dominance: appraisal.dominance,
              horror: appraisal.horror,
              emotionPlan: appraisal.emotionPlan,
              pitch: appraisal.recommendedPitch,
              voice_effect: appraisal.recommendedVoiceEffect,
              primaryEmotion: appraisal.primaryEmotion
            };

            resolve(result);
          } catch (err) {
            reject(new Error(`Failed to parse Hermes Gateway response: ${err.message}`));
          }
        });
      });

      req.on('error', (err) => {
        if (typeof onAgentEvent === 'function') {
          onAgentEvent({
            type: 'error',
            animation: 'ANIM_044_KERNEL_PANIC_SHAKE',
            expression: 7,
            text: 'Hermes Gateway connection failed'
          });
        }
        reject(err);
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Hermes Gateway request timed out'));
      });

      req.write(postPayload);
      req.end();
    });
  }
}

module.exports = HermesGatewayClient;
