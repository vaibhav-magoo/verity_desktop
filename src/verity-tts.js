(function (root) {
  async function requestVoiceStream({ base, directBase, payload, signal, onWait, timeoutMs = 30000 }) {
    const deadline = Date.now() + timeoutMs;
    const body = JSON.stringify(payload);
    let lastError;
    while (Date.now() < deadline) {
      for (const url of [...new Set([base, directBase])]) {
        if (signal.aborted) throw new DOMException('Cancelled', 'AbortError');
        try {
          const response = await fetch(`${url}/api/tts/stream`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body, signal
          });
          if (response.ok && response.body) return response;
          if (![502, 503, 504].includes(response.status)) throw Object.assign(new Error(`Voice service returned HTTP ${response.status}`), { permanent: true });
          lastError = new Error(`Voice service returned HTTP ${response.status}`);
        } catch (error) {
          if (signal.aborted || error.name === 'AbortError' || error.permanent) throw error;
          lastError = error;
        }
      }
      onWait?.();
      await new Promise((resolve, reject) => {
        const timer = setTimeout(() => { signal.removeEventListener('abort', cancel); resolve(); }, 1000);
        const cancel = () => { clearTimeout(timer); reject(new DOMException('Cancelled', 'AbortError')); };
        signal.addEventListener('abort', cancel, { once: true });
        if (signal.aborted) cancel();
      });
    }
    throw new Error(`Custom voice unavailable${lastError ? `: ${lastError.message}` : ''}`);
  }
  root.VerityTTS = { requestVoiceStream };
  if (typeof module !== 'undefined') module.exports = root.VerityTTS;
})(typeof window !== 'undefined' ? window : globalThis);
