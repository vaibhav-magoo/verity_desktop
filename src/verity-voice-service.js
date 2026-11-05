const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Reuse an existing speech service; only stop processes this app started.
module.exports = function manageVoiceService(app) {
  let child = null;
  let quitting = false;
  const check = http.get('http://127.0.0.1:5001/health', response => response.resume());
  check.setTimeout(1500, () => check.destroy());
  check.on('error', () => {
    if (quitting || child) return;
    const python = path.join(__dirname, '..', '.venv', process.platform === 'win32' ? 'Scripts/python.exe' : 'bin/python');
    if (!fs.existsSync(python)) return;
    const output = fs.openSync(path.join(__dirname, '..', 'conversation-voice.log'), 'a');
    const errors = fs.openSync(path.join(__dirname, '..', 'conversation-voice-error.log'), 'a');
    try {
      child = spawn(python, ['-u', path.join(__dirname, '..', 'services', 'kokoro_tts_server.py')], {
        cwd: path.join(__dirname, '..'), windowsHide: true, stdio: ['ignore', output, errors]
      });
      child.on('error', error => console.warn('Voice service could not start:', error.message));
      child.on('exit', () => { child = null; });
    } finally { fs.closeSync(output); fs.closeSync(errors); }
  });
  app.on('before-quit', () => {
    quitting = true;
    check.destroy();
    if (!child?.pid) return;
    if (process.platform === 'win32') spawn('taskkill', ['/pid', String(child.pid), '/T', '/F'], { windowsHide: true, stdio: 'ignore' });
    else child.kill();
  });
};
