// Microphone capture works in Electron without a browser speech service.
// Listening pauses during replies so Verity never transcribes its own voice.
class VerityVoiceConversation {
  constructor({ endpoint, onText, onState, onError, isBusy }) {
    Object.assign(this, { endpoint, onText, onState, onError, isBusy });
    this.enabled = false;
    this.generation = 0;
  }
  async start() {
    if (this.enabled) return;
    this.enabled = true;
    const generation = ++this.generation;
    this.onState('starting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
      if (!this.enabled || generation !== this.generation) { stream.getTracks().forEach(t => t.stop()); return; }
      this.stream = stream;
      this.context = new AudioContext();
      await this.context.resume();
      if (!this.enabled || generation !== this.generation) return;
      this.analyser = this.context.createAnalyser();
      this.analyser.fftSize = 2048;
      this.context.createMediaStreamSource(stream).connect(this.analyser);
      this.samples = new Float32Array(this.analyser.fftSize);
      this.cooldown = 0;
      this.timer = setInterval(() => this.tick(), 50);
      this.onState('listening');
    } catch (error) { if (generation === this.generation) { this.stop(); this.onError(error.name === 'NotAllowedError' ? 'Microphone access was denied. Allow it in Windows privacy settings and try again.' : error.message); } }
  }
  tick() {
    if (!this.enabled || this.transcribing) return;
    const now = performance.now();
    if (this.isBusy()) {
      if (this.recorder?.state === 'recording') { this.discard = true; this.recorder.stop(); }
      this.cooldown = now + 700;
      this.onState('waiting');
      return;
    }
    if (now < this.cooldown) return;
    this.onState('listening');
    if (!this.recorder || this.recorder.state === 'inactive') this.beginRecording();
    if (!this.enabled) return;
    this.analyser.getFloatTimeDomainData(this.samples);
    const rms = Math.sqrt(this.samples.reduce((sum, x) => sum + x * x, 0) / this.samples.length);
    if (rms > 0.018) { this.voicedMs += 50; this.lastSound = now; }
    if ((this.voicedMs >= 200 && now - this.lastSound > 1000) || now - this.startedAt > 20000) {
      this.discard = this.voicedMs < 200;
      this.recorder.stop();
    }
  }
  beginRecording() {
    const mimeType = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus'].find(type => MediaRecorder.isTypeSupported(type));
    if (!mimeType) { this.stop(); this.onError('Audio recording is unavailable on this device. You can still type below.'); return; }
    const recorder = new MediaRecorder(this.stream, { mimeType });
    const generation = this.generation;
    const chunks = [];
    this.recorder = recorder;
    this.startedAt = performance.now();
    this.lastSound = this.startedAt;
    this.voicedMs = 0;
    this.discard = false;
    recorder.ondataavailable = event => { if (event.data.size) chunks.push(event.data); };
    recorder.onstop = async () => {
      if (!this.enabled || this.discard || generation !== this.generation) return;
      this.transcribing = true;
      this.onState('transcribing');
      const controller = new AbortController();
      this.request = controller;
      const timeout = setTimeout(() => controller.abort(), 35000);
      try {
        const endpoint = typeof this.endpoint === 'function' ? this.endpoint() : this.endpoint;
        const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': mimeType }, body: new Blob(chunks, { type: mimeType }), signal: controller.signal });
        const data = await response.json();
        if (!response.ok) throw Error(data.error || 'Could not transcribe audio.');
        if (this.enabled && generation === this.generation && data.text?.trim()) this.onText(data.text.trim());
      } catch (error) {
        if (this.enabled && generation === this.generation) { this.stop(); this.onError(error.name === 'AbortError' ? 'Voice input timed out. Click the microphone to retry.' : error.message); }
      } finally {
        clearTimeout(timeout);
        if (generation === this.generation) { this.transcribing = false; this.request = null; }
      }
    };
    recorder.start();
  }
  stop() {
    this.enabled = false;
    this.generation++;
    clearInterval(this.timer);
    this.discard = true;
    if (this.recorder?.state === 'recording') this.recorder.stop();
    this.stream?.getTracks().forEach(t => t.stop());
    this.context?.close().catch(() => {});
    this.request?.abort();
    this.transcribing = false;
    this.recorder = null;
    this.onState('off');
  }
}
window.VerityVoiceConversation = VerityVoiceConversation;
