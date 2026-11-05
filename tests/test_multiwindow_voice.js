// Real renderers and server, deterministic model/audio; no provider calls.
const { app, BrowserWindow, ipcMain } = require('electron');
const { EventEmitter } = require('events');
const assert = require('assert/strict');
const fs = require('fs');
const path = require('path');
require('https').request = (_options, callback) => {
  const request = new EventEmitter();
  request.setTimeout = () => {};
  request.write = () => {};
  request.end = () => setTimeout(() => {
    const response = new EventEmitter(); response.statusCode = 200;
    callback(response);
    response.emit('data', JSON.stringify({ choices: [{ message: { content: JSON.stringify({ text: 'One reply only.', expression: 5 }) } }] }));
    response.emit('end');
  }, 100);
  return request;
};
process.env.GROQ_API_KEY = 'test-only';
require('../src/hermes-gateway-client').prototype.checkHealth = async () => ({ online: false });
const { createVerityServer } = require('../src/launch');
app.setPath('userData', path.join(__dirname, '.multiwindow-test-profile'));
app.commandLine.appendSwitch('use-fake-device-for-media-stream');
app.commandLine.appendSwitch('use-fake-ui-for-media-stream');
const windows = [];
require('../src/verity-microphone')(ipcMain, () => windows);
ipcMain.handle('verity:get-presence', () => null);
ipcMain.handle('verity:get-always-on-top', () => false);
const server = createVerityServer();
const evaluate = (win, source) => win.webContents.executeJavaScript(source);
async function until(win, expression) {
  await evaluate(win, `(async () => { const until = Date.now() + 10000; while (!(${expression})) { if (Date.now() > until) throw Error('Timed out: ' + ${JSON.stringify(expression)}); await new Promise(r => setTimeout(r, 50)); } })()`);
}
const timeout = setTimeout(() => { console.error('Multiwindow test timed out'); app.exit(1); }, 60000);
app.whenReady().then(async () => {
  try {
    await new Promise(resolve => server.listen(4788, '127.0.0.1', resolve));
    for (const file of ['index.html', 'orb.html']) {
      const win = new BrowserWindow({ show: false, frame: false, width: 560, height: 260, webPreferences: { preload: path.join(__dirname, '..', 'src', 'preload.js'), backgroundThrottling: false } });
      windows.push(win);
      await win.loadURL('http://127.0.0.1:4788/' + file);
      await evaluate(win, `window.voiceCalls = 0; window.capturedStreams = [];
        window.speechSynthesis.speak = utterance => { window.voiceCalls++; utterance.onstart?.(); utterance.onend?.(); };
        const realFetch = window.fetch.bind(window);
        window.fetch = (url, options) => String(url).includes('/api/tts/stream') ? Promise.resolve(new Response('{}', {status:503})) : String(url).includes('/api/hermes/status') ? Promise.resolve(new Response('{"online":false}')) : realFetch(url, options);
        const getMedia = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
        navigator.mediaDevices.getUserMedia = async options => { const stream = await getMedia(options); window.capturedStreams.push(stream); return stream; }; void 0;`);
    }
    const [studio, popup] = windows;
    await evaluate(studio, "conversationHistory=[]; autoVoiceCheckbox.checked=true; dispatchChatMessage('Hello from Studio');");
    await until(studio, 'voiceCalls === 1 && !isMainBrainThinking');
    assert.equal(await evaluate(popup, 'voiceCalls'), 0, 'Popup must not voice Studio replies');
    // A broadcast without a client ID must still be recognized as a chat reply.
    for (const win of windows) await evaluate(win, "window.__lastChatAt=0");
    await fetch('http://127.0.0.1:4788/api/chat', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({message:'An external chat client', provider:'groq'}) });
    await evaluate(studio, 'new Promise(r => setTimeout(r, 100))');
    assert.equal(await evaluate(studio, 'voiceCalls'), 1);
    assert.equal(await evaluate(popup, 'voiceCalls'), 0);
    await evaluate(popup, "document.getElementById('input').value='Hello from popup'; document.getElementById('send').click();");
    await until(popup, 'voiceCalls === 1');
    assert.equal(await evaluate(studio, 'voiceCalls'), 1, 'Studio must not voice popup replies');

    // Start in Studio, stop from the popup, and confirm hardware tracks released.
    await evaluate(studio, "document.getElementById('micBtn').click()");
    await until(studio, 'capturedStreams.length === 1');
    await until(popup, "document.getElementById('popupMic').getAttribute('aria-pressed') === 'true'");
    await evaluate(popup, "document.getElementById('popupMic').click()");
    await until(studio, "capturedStreams[0].getTracks().every(t => t.readyState === 'ended')");
    await until(popup, "document.getElementById('popupMic').textContent === 'Mic off'");

    // The popup also owns capture when it starts the mic; Studio can stop it.
    await evaluate(popup, "document.getElementById('popupMic').click()");
    await until(popup, 'capturedStreams.length === 1');
    await until(studio, "document.getElementById('micBtn').getAttribute('aria-pressed') === 'true'");
    await evaluate(studio, "document.getElementById('micBtn').click()");
    await until(popup, "capturedStreams[0].getTracks().every(t => t.readyState === 'ended')");

    await evaluate(popup, "document.getElementById('popupMic').click()");
    await until(popup, "document.getElementById('popupMic').getAttribute('aria-pressed') === 'true'");
    // Stop remains reachable in both normal and miniature popup layouts.
    for (const mini of [false, true]) {
      popup.setSize(mini ? 120 : 560, mini ? 120 : 260);
      await until(popup, mini ? 'innerWidth < 140 && innerHeight < 140' : 'innerWidth > 500');
      await evaluate(popup, `document.body.classList.toggle('mini-mode', ${mini}); document.body.classList.remove('hover','focused');`);
      assert(await evaluate(popup, `(() => { const b=document.getElementById('popupMic'); const r=b.getBoundingClientRect(); return getComputedStyle(b).display!=='none' && r.left>=0 && r.right<=innerWidth && r.top>=0 && r.bottom<=innerHeight && document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)===b; })()`), 'Mic control is hidden or obstructed');
    }
    console.log('PASS: one spoken reply across both windows; shared mic state; stop from either window releases tracks; popup control reachable at normal and mini sizes.');
  } catch (error) { console.error(error); process.exitCode = 1; }
  clearTimeout(timeout); windows.forEach(win => win.destroy()); server.closeAllConnections(); server.close(); app.exit(process.exitCode || 0);
});
