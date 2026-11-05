const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { EventEmitter } = require('node:events');

// Exercise the real main-process IPC handlers with deterministic desktop pixels.
let cursor = { x: 800, y: 600 }, writes = 0;
const ipc = new EventEmitter(); ipc.handle = () => {};
class Window extends EventEmitter {
  constructor(options) { super(); this.bounds = { x: options.x, y: options.y, width: options.width, height: options.height }; this.webContents = { send() {} }; }
  isDestroyed() { return false; }
  getBounds() { return { ...this.bounds }; }
  getPosition() { return [this.bounds.x, this.bounds.y]; }
  setBounds(bounds) { writes++; this.bounds = { ...bounds }; }
  setAlwaysOnTop() {} setVisibleOnAllWorkspaces() {} setIgnoreMouseEvents() {}
  loadFile() {} loadURL() {} setBackgroundColor() {} setIcon() {}
}
const electron = { BrowserWindow: Window, ipcMain: ipc,
  screen: { getCursorScreenPoint: () => cursor, getPrimaryDisplay: () => ({ workArea: { x: 0, y: 0, width: 1920, height: 1080 } }) },
  app: { requestSingleInstanceLock: () => true, commandLine: { appendSwitch() {} }, setPath() {}, setName() {}, setAppUserModelId() {},
    getPath: () => __dirname + '/.orb-test-profile', on() {}, whenReady: () => ({ then() {} }) },
  globalShortcut: {}, Menu: {} };
const main = vm.createContext({ require: name => name === 'electron' ? electron : name === './launch.js' ? {} : name.startsWith('./') ? require('../src/' + name.slice(2)) : require(name),
  __dirname, process, console, setInterval, clearInterval, setTimeout });
vm.runInContext(fs.readFileSync('./src/main.js', 'utf8'), main);
const win = vm.runInContext('createOrb()', main);
const start = win.getBounds();
ipc.emit('orb:drag-start');
for (let i = 0; i < 500; i++) ipc.emit('orb:drag-move');
assert.equal(writes, 0, 'Stationary hold must not write window bounds');
cursor = { x: 850, y: 640 }; ipc.emit('orb:drag-move');
assert.equal(win.bounds.width, start.width); assert.equal(win.bounds.height, start.height);
assert.equal(win.bounds.x, start.x + 50);
for (let i = 0; i < 500; i++) ipc.emit('orb:drag-move');
assert.equal(writes, 1, 'Repeated move events must not repeatedly resize the window');
ipc.emit('orb:resize-step', {}, 30); assert.equal(writes, 1, 'Wheel resizing is blocked during drag');
win.emit('blur'); cursor.x += 50; ipc.emit('orb:drag-move'); assert.equal(writes, 1);
ipc.emit('orb:resize-start');
for (let i = 0; i < 500; i++) ipc.emit('orb:resize-move');
assert.equal(writes, 1, 'Corner hold alone must not resize');
cursor.x -= 40; cursor.y -= 20; ipc.emit('orb:resize-move');
assert.equal(win.bounds.width, start.width + 40); assert.equal(win.bounds.height, start.height + 20);
const resized = win.getBounds();
for (let i = 0; i < 500; i++) ipc.emit('orb:resize-move');
assert.equal(writes, 2); assert.deepEqual(win.getBounds(), resized);
ipc.emit('orb:resize-end'); cursor.x -= 50; ipc.emit('orb:resize-move'); assert.equal(writes, 2);
let prevented = false; win.emit('will-resize', { preventDefault() { prevented = true; } }); assert(prevented);

// Execute the renderer's actual pointer handlers, including cancellation paths.
class Element {
  constructor() { this.listeners = {}; }
  addEventListener(type, fn) { (this.listeners[type] ||= []).push(fn); }
  setPointerCapture() {} releasePointerCapture() {}
  emit(type, options = {}) {
    for (const fn of this.listeners[type] || []) fn({ type, button: 0, buttons: 1, pointerId: 1, screenX: 100, screenY: 100, preventDefault() {}, ...options });
  }
}
const ball = new Element(), handle = new Element(), windowTarget = new Element(), documentTarget = new Element();
let now = 0, clicks = 0, dragMoves = 0, resizeMoves = 0, ends = 0;
const renderer = vm.createContext({ $: id => id === 'ballHit' ? ball : handle, window: windowTarget, document: documentTarget,
  performance: { now: () => now }, setTimeout: fn => fn(), CustomEvent: class {}, hitAt: () => true,
  setIgnore() {}, openChat: () => clicks++, avatar: { playBehavior() {} }, orb: {
    dragStart() {}, dragMove: () => dragMoves++, dragEnd: () => ends++, resizeStart() {},
    resizeMove: () => resizeMoves++, resizeEnd: () => ends++, contextMenu() {}, resizeStep() {} } });
vm.runInContext('let dragging=false, resizing=false, isMiniMode=false, resizeDownPos=null;', renderer);
const html = fs.readFileSync('./src/orb.html', 'utf8');
vm.runInContext(html.slice(html.indexOf("  const ballHit = $('ballHit');"), html.indexOf('  // Miniaturize button click')), renderer);
ball.emit('pointerdown'); now = 5000;
for (let i = 0; i < 500; i++) ball.emit('pointermove');
assert.equal(dragMoves, 0); assert.equal(resizeMoves, 0);
ball.emit('pointerup'); assert.equal(clicks, 0, 'Long press must not become a click or expand mini mode');
ball.emit('pointerdown'); ball.emit('pointermove', { screenX: 120 }); assert.equal(dragMoves, 1);
ball.emit('lostpointercapture'); ball.emit('pointermove', { screenX: 140 }); assert.equal(dragMoves, 1);
handle.emit('pointerdown'); handle.emit('pointermove'); assert.equal(resizeMoves, 0);
handle.emit('pointermove', { screenX: 80 }); assert.equal(resizeMoves, 1);
handle.emit('pointermove', { screenX: 70, buttons: 0 });
handle.emit('pointermove', { screenX: 60 }); assert.equal(resizeMoves, 1);
ball.emit('pointerdown'); ball.emit('pointercancel'); assert.equal(clicks, 0);
ball.emit('pointerdown'); now += 100; ball.emit('pointerup'); assert.equal(clicks, 1, 'Short click must still open chat');
assert(ends >= 5);
console.log('Popup hold, stable bounds, drag, corner resize, capture loss, cancellation and short-click regressions passed.');
