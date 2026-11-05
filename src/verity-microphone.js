// One microphone owner across Studio and the popup. Either window can stop it.
module.exports = function registerMicrophone(ipcMain, getWindows) {
  let owner = null;
  let state = 'off';
  const observed = new WeakSet();
  const snapshot = () => ({ enabled: !!owner, state });
  const trusted = sender => getWindows().some(win => win && !win.isDestroyed() && win.webContents === sender);
  const broadcast = () => {
    for (const win of getWindows()) if (win && !win.isDestroyed()) win.webContents.send('verity:microphone-state', snapshot());
  };
  const stop = () => {
    const previous = owner;
    owner = null; state = 'off';
    if (previous && !previous.isDestroyed()) previous.send('verity:microphone-command', false);
    broadcast();
  };
  ipcMain.handle('verity:get-microphone', () => snapshot());
  ipcMain.on('verity:toggle-microphone', ({ sender }) => {
    if (!trusted(sender)) return;
    if (owner) { stop(); return; }
    owner = sender; state = 'starting';
    if (!observed.has(sender)) {
      observed.add(sender);
      const release = () => { if (owner === sender) stop(); };
      sender.once('destroyed', release);
      sender.on('render-process-gone', release);
      sender.on('did-start-loading', release);
    }
    sender.send('verity:microphone-command', true);
    broadcast();
  });
  ipcMain.on('verity:update-microphone', ({ sender }, next) => {
    if (sender !== owner || !['off', 'starting', 'listening', 'waiting', 'transcribing'].includes(next)) return;
    if (next === 'off') { owner = null; state = 'off'; }
    else state = next;
    broadcast();
  });
};
