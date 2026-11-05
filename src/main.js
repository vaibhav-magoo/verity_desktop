const { app, BrowserWindow, ipcMain, screen, globalShortcut, Menu, safeStorage } = require('electron');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { createVerityServer } = require('./launch.js');
const appIcon = path.join(__dirname, 'assets', 'verity.png');
app.setName('Verity');
if (process.platform === 'win32') app.setAppUserModelId('com.verity.desktop');

// Early single instance lock: prevent secondary instances from locking GPU cache / user-data
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.exit(0);
}

// Ensure transparent window visuals on Windows DWM and eliminate GPU/HTTP cache lock conflicts
app.commandLine.appendSwitch('enable-transparent-visuals');
app.commandLine.appendSwitch('disable-gpu-shader-disk-cache');
app.commandLine.appendSwitch('disable-http-cache');
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

// Keep settings in a stable per-user folder so encrypted provider keys survive restarts.
try {
  app.setPath('userData', path.join(app.getPath('appData'), 'Verity'));
} catch (_) {}

const PORT = process.env.VERITY_PORT || 4777;
let controlPort = Number(PORT) || 4777;

// Global shortcuts
const SHORTCUT_CHAT = 'Control+Alt+V';   // summon the floating agent's chat box
const SHORTCUT_STUDIO = 'Control+Alt+O'; // toggle the full studio window

// Orb (floating agent) window geometry.
// Ball sits on the right, chat bubble and input bar sit to the left of the sphere.
const ORB_NORMAL_W = 560;
const ORB_NORMAL_H = 260;
const ORB_MINI_W = 120;
const ORB_MINI_H = 120;
const DOCK_MARGIN = 20;

let studioWin = null;
let startupWin = null;
let orbWin = null;
let orbHome = null; // last user-chosen resting position {x, y}
let lastNormalBounds = null;
let isOrbMini = false;
let orbAlwaysOnTop = true;
let quitting = false;
let cursorTimer = null;
require('./verity-microphone')(ipcMain, () => [studioWin, orbWin]);
let presenceSettings = null;
const presencePath = path.join(app.getPath('userData'), 'presence.json');
let providerSettings = { provider: 'groq', model: '', baseUrl: '', credentials: {}, models: {}, baseUrls: {} };
const providerSettingsPath = path.join(app.getPath('userData'), 'ai-provider-settings.enc');
function publicProviderSettings() {
  const { credentials = {}, models = {}, baseUrls = {}, apiKey, envKeysMigrated, ...settings } = providerSettings;
  return {
    ...settings,
    model: models[settings.provider] || settings.model || '',
    baseUrl: baseUrls[settings.provider] || settings.baseUrl || '',
    hasApiKey: Boolean(credentials[settings.provider] || apiKey)
  };
}
function loadProviderSettings() {
  try {
    if (!safeStorage.isEncryptionAvailable()) return;
    providerSettings = { ...providerSettings, ...JSON.parse(safeStorage.decryptString(fs.readFileSync(providerSettingsPath))) };
  } catch (_) {}
}
function migrateProviderKeys() {
  if (providerSettings.envKeysMigrated || !safeStorage.isEncryptionAvailable()) return;
  const credentials = { ...(providerSettings.credentials || {}) };
  if (providerSettings.apiKey && !credentials[providerSettings.provider]) credentials[providerSettings.provider] = providerSettings.apiKey;
  for (const provider of require('./ai-providers').PROVIDERS) {
    const value = provider.env && process.env[provider.env];
    if (!credentials[provider.id] && typeof value === 'string' && value.trim()) credentials[provider.id] = value.trim().slice(0, 2000);
  }
  const { apiKey, ...existing } = providerSettings;
  const migrated = { ...existing, credentials, envKeysMigrated: true };
  try {
    fs.mkdirSync(path.dirname(providerSettingsPath), { recursive: true });
    fs.writeFileSync(providerSettingsPath, safeStorage.encryptString(JSON.stringify(migrated)), { mode: 0o600 });
    providerSettings = migrated;
  } catch (error) { console.warn('Could not migrate provider settings:', error.message); }
}
function saveProviderSettings(next) {
  const validIds = new Set(require('./ai-providers').PROVIDERS.map(provider => provider.id));
  if (!validIds.has(next.provider)) throw new Error('Select a supported provider.');
  const model = String(next.model || '').trim().slice(0, 160);
  const baseUrl = String(next.baseUrl || '').trim().slice(0, 500);
  if (baseUrl) require('./ai-providers').validateBaseUrl(baseUrl, ['ollama', 'lmstudio', 'custom'].includes(next.provider));
  if (!safeStorage.isEncryptionAvailable()) throw new Error('Secure credential storage is not available on this device.');
  const credentials = { ...(providerSettings.credentials || {}) };
  if (next.apiKey === null) delete credentials[next.provider];
  else if (typeof next.apiKey === 'string' && next.apiKey.trim()) credentials[next.provider] = next.apiKey.trim().slice(0, 2000);
  const models = { ...(providerSettings.models || {}), [next.provider]: model };
  const baseUrls = { ...(providerSettings.baseUrls || {}), [next.provider]: baseUrl };
  const updated = { provider: next.provider, model, baseUrl, credentials, models, baseUrls, envKeysMigrated: providerSettings.envKeysMigrated };
  fs.mkdirSync(path.dirname(providerSettingsPath), { recursive: true });
  fs.writeFileSync(providerSettingsPath, safeStorage.encryptString(JSON.stringify(updated)), { mode: 0o600 });
  providerSettings = updated;
  return publicProviderSettings();
}
try { presenceSettings = require('./verity-presence').normalize(JSON.parse(require('fs').readFileSync(presencePath, 'utf8')), require('./verity-animations').ANIMATIONS); } catch (_) {}
ipcMain.handle('verity:get-presence', () => presenceSettings);
ipcMain.on('verity:set-presence', (event, value) => {
  if (![studioWin, orbWin].some(win => win && !win.isDestroyed() && win.webContents === event.sender)) return;
  presenceSettings = require('./verity-presence').normalize(value, require('./verity-animations').ANIMATIONS);
  try { require('fs').writeFileSync(presencePath, JSON.stringify(presenceSettings)); } catch (error) { console.warn('Could not save presence settings:', error.message); }
  for (const win of [studioWin, orbWin]) {
    if (win && !win.isDestroyed()) win.webContents.send('verity:presence', presenceSettings);
  }
});
ipcMain.handle('verity:get-provider-settings', (event) => {
  if (![studioWin, orbWin].some(win => win && !win.isDestroyed() && win.webContents === event.sender)) return null;
  return publicProviderSettings();
});
ipcMain.handle('verity:save-provider-settings', (event, value) => {
  if (![studioWin, orbWin].some(win => win && !win.isDestroyed() && win.webContents === event.sender)) throw new Error('Provider settings can only be changed from Verity.');
  return saveProviderSettings(value || {});
});

function webPrefs() {
  return {
    preload: path.join(__dirname, 'preload.js'),
    contextIsolation: true,
    nodeIntegration: false,
    webSecurity: false
  };
}

function defaultDock(w = ORB_NORMAL_W, h = ORB_NORMAL_H) {
  const { x, y, width, height } = screen.getPrimaryDisplay().workArea;
  return {
    x: x + width - w - DOCK_MARGIN,
    y: y + height - h - DOCK_MARGIN
  };
}

// ---------------------------------------------------------------------------
// STUDIO WINDOW (opaque, resizable, fully usable controls)
// ---------------------------------------------------------------------------
function createStudio(show = true) {
  if (studioWin && !studioWin.isDestroyed()) {
    if (show) { if (orbWin && !orbWin.isDestroyed()) orbWin.hide(); studioWin.show(); studioWin.focus(); }
    return studioWin;
  }
  const { x, y, width, height } = screen.getPrimaryDisplay().workArea;
  const w = Math.min(1180, width - 80);
  const h = Math.min(780, height - 60);

  studioWin = new BrowserWindow({
    icon: appIcon,
    width: w,
    height: h,
    x: Math.round(x + (width - w) / 2),
    y: Math.round(y + (height - h) / 2),
    minWidth: 900,
    minHeight: 600,
    frame: false,
    transparent: false,
    backgroundColor: '#0a0a0b',
    show: false,
    resizable: true,
    webPreferences: webPrefs()
  });
  studioWin.setMenuBarVisibility(false);
  studioWin.setIcon(appIcon);
  studioWin.loadURL(`http://127.0.0.1:${controlPort}/index.html`);
  studioWin.once('ready-to-show', () => {
    if (show) {
      if (orbWin && !orbWin.isDestroyed()) orbWin.hide();
      studioWin.show();
      if (startupWin && !startupWin.isDestroyed()) startupWin.destroy();
      startupWin = null;
    }
  });

  // Closing the studio never kills the permanent floating agent.
  studioWin.on('close', (e) => {
    if (!quitting && orbWin && !orbWin.isDestroyed()) {
      e.preventDefault();
      studioWin.hide();
      showOrbAtHome();
    }
  });
  studioWin.on('closed', () => { studioWin = null; });
  return studioWin;
}

// ---------------------------------------------------------------------------
// ORB WINDOW (transparent, frameless, always-on-top permanent floating agent)
// ---------------------------------------------------------------------------
function createOrb(pos) {
  if (orbWin && !orbWin.isDestroyed()) return orbWin;
  const initialW = isOrbMini ? ORB_MINI_W : (lastNormalBounds ? lastNormalBounds.width : ORB_NORMAL_W);
  const initialH = isOrbMini ? ORB_MINI_H : (lastNormalBounds ? lastNormalBounds.height : ORB_NORMAL_H);
  const p = pos || orbHome || defaultDock(initialW, initialH);

  orbWin = new BrowserWindow({
    icon: appIcon,
    width: initialW,
    height: initialH,
    x: Math.round(p.x),
    y: Math.round(p.y),
    transparent: true,
    frame: false,
    hasShadow: false,
    resizable: true, // Keep true on Windows to preserve WS_THICKFRAME and layered DWM alpha
    minWidth: 100,
    minHeight: 100,
    maxWidth: 1600,
    maxHeight: 1200,
    thickFrame: false,
    titleBarStyle: 'hidden',
    maximizable: false,
    minimizable: false,
    fullscreenable: false,
    skipTaskbar: true,
    alwaysOnTop: orbAlwaysOnTop,
    show: false,
    webPreferences: webPrefs()
  });
  if (orbAlwaysOnTop) orbWin.setAlwaysOnTop(true, 'status');
  orbWin.setIcon(appIcon);
  orbWin.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  // Start fully click-through; the renderer flips this when the pointer is over the ball / UI.
  orbWin.setIgnoreMouseEvents(true, { forward: true });
  orbWin.loadURL(`http://127.0.0.1:${controlPort}/orb.html`);
  // Sizing is handled explicitly by the corner control and presets. Prevent
  // Windows' native long-press/edge resizing from competing with captured drag.
  orbWin.on('will-resize', event => event.preventDefault());

  // DWM focus-loss / blur safeguard: prevent Windows DWM from painting opaque black on blur
  orbWin.on('blur', () => {
    dragOrigin = null;
    resizeOrigin = null;
    if (orbWin && !orbWin.isDestroyed()) {
      orbWin.setBackgroundColor('#00000000');
    }
  });

  orbWin.on('closed', () => { orbWin = null; });
  return orbWin;
}

function showOrbAtHome() {
  const win = createOrb();
  const reveal = () => { if (studioWin && !studioWin.isDestroyed()) studioWin.hide(); win.show(); win.webContents.send('orb:appear'); };
  if (win.webContents.isLoading()) win.webContents.once('did-finish-load', reveal);
  else reveal();
  return win;
}

function easeInOutCubic(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

// Shoot the ball out of the studio window along an arc and let it settle at the dock.
function popOutFromStudio(ballCenter) {
  const sb = studioWin && !studioWin.isDestroyed() ? studioWin.getContentBounds() : null;
  const targetW = isOrbMini ? ORB_MINI_W : (lastNormalBounds ? lastNormalBounds.width : ORB_NORMAL_W);
  const targetH = isOrbMini ? ORB_MINI_H : (lastNormalBounds ? lastNormalBounds.height : ORB_NORMAL_H);
  const dock = orbHome || defaultDock(targetW, targetH);

  // Ball sits on the right side of the window
  const orbBallCX = isOrbMini ? Math.round(targetW / 2) : Math.round(targetW - 114);
  const orbBallCY = isOrbMini ? Math.round(targetH / 2) : Math.round(targetH / 2);

  let start = dock;
  if (sb && ballCenter) {
    start = { x: sb.x + ballCenter.cx - orbBallCX, y: sb.y + ballCenter.cy - orbBallCY };
  }

  const win = createOrb(start);
  const go = () => {
    win.setPosition(Math.round(start.x), Math.round(start.y));
    if (studioWin && !studioWin.isDestroyed()) studioWin.hide();
    win.show();
    win.webContents.send('orb:launch');

    const t0 = Date.now();
    const dur = 850;
    const arc = 170;
    const timer = setInterval(() => {
      if (!win || win.isDestroyed()) return clearInterval(timer);
      const t = Math.min(1, (Date.now() - t0) / dur);
      const e = easeInOutCubic(t);
      const x = start.x + (dock.x - start.x) * e;
      const y = start.y + (dock.y - start.y) * e - Math.sin(Math.PI * t) * arc;
      win.setPosition(Math.round(x), Math.round(y));
      if (t >= 1) {
        clearInterval(timer);
        win.webContents.send('orb:landed');
      }
    }, 16);
  };
  if (win.webContents.isLoading()) win.webContents.once('did-finish-load', go);
  else go();
}

function summonChat() {
  const win = createOrb();
  const doIt = () => {
    if (studioWin && !studioWin.isDestroyed()) studioWin.hide();
    if (isOrbMini) {
      toggleMini(false);
    }
    if (!win.isVisible()) win.show();
    win.setIgnoreMouseEvents(false);
    win.focus();
    win.moveTop();
    win.webContents.send('orb:summon');
  };
  if (win.webContents.isLoading()) win.webContents.once('did-finish-load', doIt);
  else doIt();
}

function toggleStudio() {
  if (studioWin && !studioWin.isDestroyed() && studioWin.isVisible()) {
    studioWin.hide();
    showOrbAtHome();
    return;
  }
  createStudio(true);
}

// ---------------------------------------------------------------------------
// IPC
// ---------------------------------------------------------------------------
ipcMain.on('verity:pop-out', (_e, ballCenter) => popOutFromStudio(ballCenter));
ipcMain.on('verity:open-studio', () => { createStudio(true); });
ipcMain.on('verity:quit', () => { quitting = true; app.quit(); });
ipcMain.on('verity:minimize', () => { if (studioWin && !studioWin.isDestroyed()) studioWin.minimize(); });
ipcMain.on('verity:close', () => { if (studioWin && !studioWin.isDestroyed()) studioWin.close(); });
ipcMain.on('verity:toggle-maximize', () => {
  if (!studioWin || studioWin.isDestroyed()) return;
  studioWin.isMaximized() ? studioWin.unmaximize() : studioWin.maximize();
});

ipcMain.on('verity:set-always-on-top', (e, flag) => {
  const win = BrowserWindow.fromWebContents(e.sender);
  if (!win || win.isDestroyed()) return;
  const on = Boolean(flag);
  win.setAlwaysOnTop(on, on ? 'status' : 'normal');
  if (win === orbWin) orbAlwaysOnTop = on;
});
ipcMain.handle('verity:get-always-on-top', (e) => {
  const win = BrowserWindow.fromWebContents(e.sender);
  return win && !win.isDestroyed() ? win.isAlwaysOnTop() : false;
});

// Miniaturize toggle
function toggleMini(forceState) {
  if (!orbWin || orbWin.isDestroyed()) return;
  const willBeMini = typeof forceState === 'boolean' ? forceState : !isOrbMini;
  if (willBeMini === isOrbMini) return;

  const curBounds = orbWin.getBounds();
  if (willBeMini) {
    // Save previous normal bounds
    lastNormalBounds = { ...curBounds };
    isOrbMini = true;
    const targetW = ORB_MINI_W;
    const targetH = ORB_MINI_H;
    // Anchor bottom-right corner so sphere stays at the exact same screen position
    const newX = curBounds.x + (curBounds.width - targetW);
    const newY = curBounds.y + (curBounds.height - targetH);
    orbWin.setBounds({
      x: Math.round(newX),
      y: Math.round(newY),
      width: targetW,
      height: targetH
    });
    orbWin.webContents.send('orb:mini-changed', true);
  } else {
    isOrbMini = false;
    const targetBounds = lastNormalBounds || { ...defaultDock(ORB_NORMAL_W, ORB_NORMAL_H), width: ORB_NORMAL_W, height: ORB_NORMAL_H };
    const newX = curBounds.x - (targetBounds.width - curBounds.width);
    const newY = curBounds.y - (targetBounds.height - curBounds.height);
    orbWin.setBounds({
      x: Math.round(newX),
      y: Math.round(newY),
      width: targetBounds.width,
      height: targetBounds.height
    });
    orbWin.webContents.send('orb:mini-changed', false);
  }
  const [fx, fy] = orbWin.getPosition();
  orbHome = { x: fx, y: fy };
}

function setOrbPreset(preset) {
  if (!orbWin || orbWin.isDestroyed()) return;
  if (preset === 'mini') {
    toggleMini(true);
    return;
  }
  if (isOrbMini) {
    isOrbMini = false;
    orbWin.webContents.send('orb:mini-changed', false);
  }
  let w = ORB_NORMAL_W;
  let h = ORB_NORMAL_H;
  if (preset === 'compact') { w = 440; h = 220; }
  else if (preset === 'standard') { w = 560; h = 260; }
  else if (preset === 'large') { w = 700; h = 320; }

  const b = orbWin.getBounds();
  const newX = b.x + (b.width - w);
  const newY = b.y + (b.height - h);
  orbWin.setBounds({ x: Math.round(newX), y: Math.round(newY), width: w, height: h });
  lastNormalBounds = { x: newX, y: newY, width: w, height: h };
  orbHome = { x: newX, y: newY };
}

// Orb: click-through toggling, manual drag, resize, context menu
ipcMain.on('orb:ignore-mouse', (_e, ignore) => {
  if (!orbWin || orbWin.isDestroyed()) return;
  if (ignore) orbWin.setIgnoreMouseEvents(true, { forward: true });
  else orbWin.setIgnoreMouseEvents(false);
});

let dragOrigin = null;
ipcMain.on('orb:drag-start', () => {
  if (!orbWin || orbWin.isDestroyed()) return;
  if (dragOrigin) return;
  resizeOrigin = null;
  const bounds = orbWin.getBounds();
  const c = screen.getCursorScreenPoint();
  dragOrigin = { bounds, cx: c.x, cy: c.y };
});
ipcMain.on('orb:drag-move', () => {
  if (!dragOrigin || !orbWin || orbWin.isDestroyed()) return;
  const c = screen.getCursorScreenPoint();
  const bounds = dragOrigin.bounds;
  const target = { ...bounds, x: Math.round(bounds.x + c.x - dragOrigin.cx), y: Math.round(bounds.y + c.y - dragOrigin.cy) };
  const current = orbWin.getBounds();
  if (Object.keys(target).some(key => target[key] !== current[key])) orbWin.setBounds(target);
});
ipcMain.on('orb:drag-end', () => {
  dragOrigin = null;
  if (orbWin && !orbWin.isDestroyed()) {
    const [x, y] = orbWin.getPosition();
    orbHome = { x, y };
  }
});

// Interactive resize from top-left handle
let resizeOrigin = null;
ipcMain.on('orb:resize-start', () => {
  if (!orbWin || orbWin.isDestroyed()) return;
  if (resizeOrigin || isOrbMini) return;
  dragOrigin = null;
  const bounds = orbWin.getBounds();
  const c = screen.getCursorScreenPoint();
  resizeOrigin = { bounds, cx: c.x, cy: c.y };
});

ipcMain.on('orb:resize-move', () => {
  if (!resizeOrigin || !orbWin || orbWin.isDestroyed()) return;
  const c = screen.getCursorScreenPoint();
  const deltaX = c.x - resizeOrigin.cx;
  const deltaY = c.y - resizeOrigin.cy;
  // A held pointer (including synthetic moves caused by a bounds update) is
  // not a resize. Use the original screen-space anchor for the whole gesture.
  if (Math.abs(deltaX) + Math.abs(deltaY) < 4) return;

  const orig = resizeOrigin.bounds;
  const minW = 320;
  const minH = 180;
  const maxW = 1200;
  const maxH = 800;

  const newW = Math.max(minW, Math.min(maxW, orig.width - deltaX));
  const newH = Math.max(minH, Math.min(maxH, orig.height - deltaY));
  const newX = orig.x + (orig.width - newW);
  const newY = orig.y + (orig.height - newH);

  const target = {
    x: Math.round(newX),
    y: Math.round(newY),
    width: Math.round(newW),
    height: Math.round(newH)
  };
  const current = orbWin.getBounds();
  if (Object.keys(target).some(key => target[key] !== current[key])) orbWin.setBounds(target);
  if (isOrbMini) {
    isOrbMini = false;
    orbWin.webContents.send('orb:mini-changed', false);
  }
});

ipcMain.on('orb:resize-end', () => {
  resizeOrigin = null;
  if (orbWin && !orbWin.isDestroyed()) {
    const b = orbWin.getBounds();
    orbHome = { x: b.x, y: b.y };
    if (!isOrbMini) {
      lastNormalBounds = { ...b };
    }
  }
});

// Mouse wheel / keyboard resize step
ipcMain.on('orb:resize-step', (_e, step) => {
  if (!orbWin || orbWin.isDestroyed() || isOrbMini || dragOrigin || resizeOrigin || !Number.isFinite(step)) return;
  step = Math.max(-30, Math.min(30, step));
  const b = orbWin.getBounds();
  const stepW = step;
  const stepH = Math.round(step * (ORB_NORMAL_H / ORB_NORMAL_W));
  const newW = Math.max(340, Math.min(1100, b.width + stepW));
  const newH = Math.max(180, Math.min(700, b.height + stepH));
  const newX = b.x + (b.width - newW);
  const newY = b.y + (b.height - newH);
  orbWin.setBounds({ x: Math.round(newX), y: Math.round(newY), width: newW, height: newH });
  lastNormalBounds = { x: newX, y: newY, width: newW, height: newH };
  orbHome = { x: newX, y: newY };
});

ipcMain.on('orb:toggle-mini', () => toggleMini());
ipcMain.on('orb:set-mini', (_e, flag) => toggleMini(Boolean(flag)));
ipcMain.on('orb:set-preset', (_e, preset) => setOrbPreset(preset));

ipcMain.on('orb:focus', () => {
  if (!orbWin || orbWin.isDestroyed()) return;
  orbWin.focus();
});

ipcMain.on('orb:context-menu', () => {
  if (!orbWin || orbWin.isDestroyed()) return;
  const curW = orbWin.getBounds().width;
  const menu = Menu.buildFromTemplate([
    { label: 'Chat  (Ctrl+Alt+V)', click: () => summonChat() },
    { label: 'Open Studio  (Ctrl+Alt+O)', click: () => createStudio(true) },
    { type: 'separator' },
    {
      label: isOrbMini ? 'Restore Size (Normal)' : 'Miniaturize (Compact Mode)',
      click: () => toggleMini()
    },
    {
      label: 'Popup Size',
      submenu: [
        { label: 'Miniaturized (120 × 120)', type: 'radio', checked: isOrbMini, click: () => setOrbPreset('mini') },
        { label: 'Compact (440 × 220)', type: 'radio', checked: !isOrbMini && curW <= 480, click: () => setOrbPreset('compact') },
        { label: 'Standard (560 × 260)', type: 'radio', checked: !isOrbMini && curW > 480 && curW <= 620, click: () => setOrbPreset('standard') },
        { label: 'Large (700 × 320)', type: 'radio', checked: !isOrbMini && curW > 620, click: () => setOrbPreset('large') },
      ]
    },
    { type: 'separator' },
    {
      label: 'Always on top',
      type: 'checkbox',
      checked: orbWin.isAlwaysOnTop(),
      click: (item) => {
        orbAlwaysOnTop = item.checked;
        orbWin.setAlwaysOnTop(orbAlwaysOnTop, orbAlwaysOnTop ? 'status' : 'normal');
      }
    },
    {
      label: 'Reset position & size',
      click: () => {
        isOrbMini = false;
        orbHome = null;
        lastNormalBounds = null;
        const d = defaultDock(ORB_NORMAL_W, ORB_NORMAL_H);
        orbWin.setBounds({ x: d.x, y: d.y, width: ORB_NORMAL_W, height: ORB_NORMAL_H });
        orbWin.webContents.send('orb:mini-changed', false);
      }
    },
    { type: 'separator' },
    { label: 'Quit Verity', click: () => { quitting = true; app.quit(); } }
  ]);
  menu.popup({ window: orbWin });
});

// ---------------------------------------------------------------------------
// Local control server (Port 4777): Hermes/Groq brain, Kokoro TTS proxy, avatar control
// ---------------------------------------------------------------------------
function startControlServer() {
  return new Promise(resolve => {
    let attempts = 0;
    const bind = (port) => {
      try {
        const server = createVerityServer({ getProviderSettings: () => ({ ...providerSettings, allowEnvironmentCredentials: false }) });
        server.once('error', (err) => {
          if (err.code === 'EADDRINUSE' && attempts < 10) { attempts++; bind((Number(PORT) || 4777) + attempts); return; }
          console.warn('Could not bind local provider server:', err.message);
          resolve();
        });
        server.listen(port, '127.0.0.1', () => {
          controlPort = server.address().port;
          console.log(`Verity Brain & TTS Server active on port ${controlPort}`);
          resolve();
        });
      } catch (err) {
        console.warn('Could not bind local provider server:', err.message);
        resolve();
      }
    };
    bind(controlPort);
  });
}

app.on('second-instance', (_event, commandLine) => {
  if (commandLine.includes('--overlay')) summonChat();
  else createStudio(true);
});

app.whenReady().then(async () => {
  if (!process.argv.includes('--overlay')) {
    startupWin = new BrowserWindow({ width:520, height:340, frame:false, resizable:false, icon:appIcon,
      backgroundColor:'#15191f', show:false, webPreferences:{ contextIsolation:true, nodeIntegration:false } });
    startupWin.setIcon(appIcon);
    startupWin.loadFile(path.join(__dirname, 'startup.html'));
    startupWin.once('ready-to-show', () => { if (startupWin && !startupWin.isDestroyed()) startupWin.show(); });
  }
  loadProviderSettings();
  migrateProviderKeys();
  await startControlServer();
  require('./verity-voice-service')(app);
  // Cursor and window bounds use DIP; account for renderer zoom as well.
  cursorTimer = setInterval(() => {
    if (presenceSettings && !presenceSettings.gaze) return;
    const point = screen.getCursorScreenPoint();
    for (const win of [studioWin, orbWin]) {
      if (!win || win.isDestroyed() || !win.isVisible() || win.isMinimized() || win.webContents.isLoading()) continue;
      const bounds = win.getContentBounds();
      const zoom = win.webContents.getZoomFactor();
      win.webContents.send('verity:cursor', { x: (point.x - bounds.x) / zoom, y: (point.y - bounds.y) / zoom });
    }
  }, 33);

  // Default: permanent floating agent. `--studio` (or plain `.` with no flag) opens the studio first.
  const wantStudio = process.argv.includes('--studio') || !process.argv.includes('--overlay');
  if (wantStudio) {
    createStudio(true);
  } else {
    showOrbAtHome();
  }

  if (!globalShortcut.register(SHORTCUT_CHAT, summonChat)) {
    console.warn('Could not register shortcut', SHORTCUT_CHAT);
  }
  if (!globalShortcut.register(SHORTCUT_STUDIO, toggleStudio)) {
    console.warn('Could not register shortcut', SHORTCUT_STUDIO);
  }
});

app.on('before-quit', () => { quitting = true; });
app.on('will-quit', () => { clearInterval(cursorTimer); globalShortcut.unregisterAll(); });
app.on('window-all-closed', () => { app.quit(); });
