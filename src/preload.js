const { contextBridge, ipcRenderer } = require('electron');

const on = (channel) => (callback) => {
  const listener = (_e, payload) => callback(payload);
  ipcRenderer.on(channel, listener);
  return () => ipcRenderer.removeListener(channel, listener);
};

contextBridge.exposeInMainWorld('verityDesktop', {
  isElectron: true,
  onCursor: on('verity:cursor'),
  onPresence: on('verity:presence'),
  getPresence: () => ipcRenderer.invoke('verity:get-presence'),
  setPresence: (settings) => ipcRenderer.send('verity:set-presence', settings),
  getProviderSettings: () => ipcRenderer.invoke('verity:get-provider-settings'),
  saveProviderSettings: (settings) => ipcRenderer.invoke('verity:save-provider-settings', settings),
  microphone: {
    getState: () => ipcRenderer.invoke('verity:get-microphone'),
    toggle: () => ipcRenderer.send('verity:toggle-microphone'),
    update: (state) => ipcRenderer.send('verity:update-microphone', state),
    onState: on('verity:microphone-state'),
    onCommand: on('verity:microphone-command')
  },
  // Studio window
  popOut: (ballCenter) => ipcRenderer.send('verity:pop-out', ballCenter),
  setAlwaysOnTop: (enabled) => ipcRenderer.send('verity:set-always-on-top', Boolean(enabled)),
  getAlwaysOnTop: () => ipcRenderer.invoke('verity:get-always-on-top'),
  minimize: () => ipcRenderer.send('verity:minimize'),
  toggleMaximize: () => ipcRenderer.send('verity:toggle-maximize'),
  close: () => ipcRenderer.send('verity:close'),
  openStudio: () => ipcRenderer.send('verity:open-studio'),
  quit: () => ipcRenderer.send('verity:quit'),
  // Orb window
  orb: {
    setIgnoreMouse: (ignore) => ipcRenderer.send('orb:ignore-mouse', Boolean(ignore)),
    dragStart: () => ipcRenderer.send('orb:drag-start'),
    dragMove: () => ipcRenderer.send('orb:drag-move'),
    dragEnd: () => ipcRenderer.send('orb:drag-end'),
    resizeStart: () => ipcRenderer.send('orb:resize-start'),
    resizeMove: () => ipcRenderer.send('orb:resize-move'),
    resizeEnd: () => ipcRenderer.send('orb:resize-end'),
    resizeStep: (step) => ipcRenderer.send('orb:resize-step', step),
    toggleMini: () => ipcRenderer.send('orb:toggle-mini'),
    setMini: (flag) => ipcRenderer.send('orb:set-mini', Boolean(flag)),
    setPreset: (preset) => ipcRenderer.send('orb:set-preset', preset),
    focus: () => ipcRenderer.send('orb:focus'),
    contextMenu: () => ipcRenderer.send('orb:context-menu'),
    onSummon: on('orb:summon'),
    onLaunch: on('orb:launch'),
    onLanded: on('orb:landed'),
    onAppear: on('orb:appear'),
    onMiniChanged: on('orb:mini-changed')
  }
});
