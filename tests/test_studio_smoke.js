const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
app.setPath('userData', path.join(__dirname, '.smoke-profile'));
ipcMain.handle('verity:get-presence', () => null);
ipcMain.handle('verity:get-microphone', () => ({enabled:false, state:'off'}));
ipcMain.handle('verity:get-always-on-top', () => false);
app.whenReady().then(async () => {
  const win = new BrowserWindow({ show: false, width: 1180, height: 780, webPreferences: { offscreen: true, backgroundThrottling: false, preload: path.join(__dirname, '..', 'src', 'preload.js'), contextIsolation: true } });
  const errors = [];
  win.webContents.on('console-message', (_e, level, message) => { if (level === 3 && /Uncaught|TypeError|ReferenceError/.test(message)) errors.push(message); });
  try {
    await win.loadFile(path.join(__dirname, '..', 'src', 'index.html'));
    const result = await win.webContents.executeJavaScript(`(async () => {
      const buttons = [...document.querySelectorAll('.studio-nav [data-view]')];
      if (buttons.length !== 4) throw Error('Missing navigation');
      for (const button of buttons) {
        button.click();
        if (!button.classList.contains('selected')) throw Error('Navigation failed');
      }
      document.querySelector('[data-view="presence"]').click();
      document.getElementById('presenceMode').value = 'locked';
      document.getElementById('presenceMode').dispatchEvent(new Event('change'));
      document.getElementById('presenceExpression').value = '5';
      document.getElementById('presenceExpression').dispatchEvent(new Event('change'));
      avatar.setExpression(9);
      if (avatar.currentExprIndex !== 5) throw Error('Expression lock failed');
      presence.configure({ emotionMode: 'auto' });
      const emotionalReply = VerityEmotionDirector.fields(VerityEmotionDirector.plan({ message: 'I feel sad today.', text: 'I am here with you.' }));
      const duplicate = structuredClone(emotionalReply);
      presence.prepareDecision(emotionalReply);
      avatar.setExpression(emotionalReply.expression);
      avatar.playBehavior(emotionalReply.animation);
      if (avatar.targetExpr.restCurve >= 0) throw Error('Concern should soften the smile');
      if (!VerityEmotionDirector.catalog[avatar.behaviorEngine.currentAnim.id].emotions.includes('concern')) throw Error('Incompatible concern motion');
      presence.prepareDecision(duplicate);
      if (duplicate.animation !== null || duplicate.expression !== undefined) throw Error('Duplicate reply restarted emotion');
      const gazeBefore = avatar.targetRotY;
      return { navigation: buttons.length, expression: avatar.currentExprIndex, gazeBefore, canvas: !!document.querySelector('canvas') };
    })()`);
    win.webContents.send('verity:cursor', { x: -900, y: 1500 });
    await new Promise(resolve => setTimeout(resolve, 150));
    result.gaze = await win.webContents.executeJavaScript('({x:avatar.targetRotX,y:avatar.targetRotY})');
    if (result.gaze.y !== -0.36 || result.gaze.x !== 0.24) throw Error('External cursor gaze failed');
    await win.webContents.executeJavaScript("document.querySelector('[data-view=conversation]').click()");
    await new Promise(resolve => setTimeout(resolve, 1000));
    await win.webContents.capturePage();
    await win.webContents.executeJavaScript('document.getAnimations().forEach(animation => { if (Number.isFinite(animation.effect.getComputedTiming().endTime)) animation.finish(); })');
    await new Promise(resolve => setTimeout(resolve, 100));
    fs.writeFileSync(path.join(__dirname, 'studio-preview.png'), (await win.webContents.capturePage()).toPNG());
    await win.webContents.executeJavaScript("document.querySelector('[data-view=presence]').click()");
    await new Promise(resolve => setTimeout(resolve, 1000));
    await win.webContents.capturePage();
    await win.webContents.executeJavaScript('document.getAnimations().forEach(animation => { if (Number.isFinite(animation.effect.getComputedTiming().endTime)) animation.finish(); })');
    await new Promise(resolve => setTimeout(resolve, 100));
    result.presencePanel = await win.webContents.executeJavaScript(`(() => { const p = document.querySelector('.presence-panel'); return { hidden:p.hidden, opacity:getComputedStyle(p).opacity, height:p.getBoundingClientRect().height }; })()`);
    fs.writeFileSync(path.join(__dirname, 'presence-preview.png'), (await win.webContents.capturePage()).toPNG());
    win.setSize(900, 600);
    await new Promise(resolve => setTimeout(resolve, 150));
    result.smallLayout = await win.webContents.executeJavaScript(`(() => {
      const nav = document.querySelector('.studio-nav').getBoundingClientRect();
      const column = document.querySelector('.control-column').getBoundingClientRect();
      if (column.right > innerWidth || column.left < 0 || nav.right > innerWidth) throw Error('Layout overflow');
      return true;
    })()`);
    win.setSize(640, 800);
    await new Promise(resolve => setTimeout(resolve, 150));
    result.mobileLayout = await win.webContents.executeJavaScript(`(() => {
      const stage = document.querySelector('.stage-shell').getBoundingClientRect();
      const column = document.querySelector('.control-column').getBoundingClientRect();
      if (column.top < stage.bottom || column.right > innerWidth) throw Error('Mobile stack overflow ' + JSON.stringify({column:column.toJSON(),stage:stage.toJSON(),width:innerWidth}));
      return true;
    })()`);
    await win.loadFile(path.join(__dirname, '..', 'src', 'orb.html'));
    result.companion = await win.webContents.executeJavaScript("!!document.querySelector('canvas') && !!window.VerityPresence");
    if (!result.companion) throw Error('Companion failed to load');
    if (errors.length) throw Error(errors.join('\n'));
    fs.writeFileSync(path.join(__dirname, 'smoke-result.json'), JSON.stringify(result));
    console.log(JSON.stringify(result));
  } catch (error) { console.error(error, JSON.stringify(errors)); process.exitCode = 1; }
  win.destroy(); app.exit(process.exitCode || 0);
});

