(() => {
  const $ = id => document.getElementById(id);
  const presence = window.verityPresence;
  const workspace = document.querySelector('.bento-workspace');
  const column = document.querySelector('.control-column');
  column.setAttribute('aria-label', 'Studio controls');
  const modules = [...column.children];
  const preview = document.querySelector('.stage-shell');
  const chatModule = modules[0];
  document.body.classList.add('studio-redesign');
  const nav = document.createElement('nav');
  nav.className = 'studio-nav'; nav.setAttribute('aria-label', 'Studio sections');
  nav.innerHTML = `<div class="nav-wordmark"><img src="./assets/verity-wordmark.png" alt="Verity" /></div>
    <div class="nav-caption">YOUR COMPANION</div>
    <button data-view="conversation" class="selected"><span>Conversation</span></button>
    <details class="customize-menu">
      <summary><svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="3"/><circle cx="15" cy="17" r="3"/></svg><span>Customize</span><svg class="nav-icon disclosure-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m8 10 4 4 4-4"/></svg></summary>
      <div class="customize-options" aria-label="Customization sections">
        <button data-view="presence"><span>Presence</span></button>
        <button data-view="motion"><span>Motion library</span></button>
        <button data-view="voice"><span>Voice & faces</span></button>
        <details class="customize-tools"><summary>Sphere</summary><div class="customize-tools-content sphere-tools"></div></details>
        <details class="customize-tools"><summary>Quick actions</summary><div class="customize-tools-content quick-tools"></div></details>
      </div>
    </details>
    <div class="nav-bottom"><span class="live-dot"></span> Made to be here.<small>Ctrl + Alt + V · Quick chat</small><button id="desktopCompanion">Open companion ↗</button></div>`;
  workspace.before(nav);
  nav.after(nav.querySelector('.nav-bottom'));
  const customize = nav.querySelector('.customize-menu');
  const closeCustomize = (restoreFocus = false) => {
    customize.open = false;
    if (restoreFocus) customize.querySelector('summary').focus();
  };
  document.addEventListener('pointerdown', event => {
    if (!customize.contains(event.target)) closeCustomize();
  });
  customize.addEventListener('keydown', event => {
    if (event.key === 'Escape') { event.preventDefault(); closeCustomize(true); }
  });
  const pin = $('btnWindowPin');
  const syncPinLabel = () => {
    const pinned = pin.classList.contains('active-pinned');
    pin.setAttribute('aria-pressed', String(pinned));
    pin.setAttribute('aria-label', pinned ? 'Unpin window' : 'Keep window on top');
  };
  syncPinLabel();
  new MutationObserver(syncPinLabel).observe(pin, { attributes: true, attributeFilter: ['class', 'title'] });
  const icons = {
    conversation: '<path d="M4 4.5h16v11H9l-5 4z"/><path d="M8 8.5h8M8 11.5h5"/>',
    presence: '<circle cx="12" cy="12" r="8"/><path d="M8 14c2 3 6 3 8 0M8 9h.01M16 9h.01"/>',
    motion: '<path d="M3 12c3-9 6 9 9 0s6 9 9 0"/>',
    voice: '<path d="M4 10v4M8 6v12M12 3v18M16 7v10M20 10v4"/>'
  };
  nav.querySelectorAll('[data-view]').forEach(button => {
    const label = button.querySelector('span');
    button.replaceChildren(label);
    button.insertAdjacentHTML('afterbegin', `<svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true">${icons[button.dataset.view]}</svg>`);
  });
  const heading = document.createElement('div'); heading.className = 'workspace-heading';
  heading.innerHTML = '<div><h1>Conversation</h1></div>';
  workspace.prepend(heading);
  const unified = document.createElement('section');
  unified.className = 'unified-workspace';
  unified.setAttribute('aria-label', 'Verity companion and conversation');
  workspace.insertBefore(unified, preview);
  unified.append(preview, chatModule);
  const ribbon = document.createElement('div');
  ribbon.className = 'unified-tool-ribbon';
  ribbon.setAttribute('aria-label', 'AI model settings');
  customize.querySelector('.sphere-tools').append(document.querySelector('.stage-footer-bar'));
  customize.querySelector('.quick-tools').append(document.querySelector('.companion-chips-row'));
  const chatCore = chatModule.querySelector('.doppelrand-core');
  const providerRow = chatCore.querySelector(':scope > .btn-row');
  const providerPanel = $('providerSetupPanel');
  const voiceControl = $('autoVoiceCheckbox').closest('label');
  const newChat = $('newChatBtn');
  const chatActions = document.createElement('div');
  chatActions.className = 'chat-header-actions';
  chatCore.querySelector('.eyebrow-row').append(chatActions);
  chatActions.append(voiceControl);
  if (newChat) chatActions.append(newChat);
  providerRow.classList.add('model-selector-row');
  $('providerSetupToggle').innerHTML = '<span>Setup</span>';
  providerPanel.classList.add('model-setup-panel');
  ribbon.append(providerRow, providerPanel);
  unified.append(ribbon);
  const toolGroups = [...customize.querySelectorAll('.customize-tools')];
  const positionTools = () => {
    if (providerPanel.hidden) return;
    const anchor = $('providerSetupToggle').getBoundingClientRect();
    const width = Math.min(560, window.innerWidth - 32);
    providerPanel.style.width = `${width}px`;
    providerPanel.style.left = `${Math.max(16, Math.min(anchor.right - width, window.innerWidth - width - 16))}px`;
    providerPanel.style.bottom = `${Math.max(16, window.innerHeight - anchor.top + 10)}px`;
    providerPanel.style.maxHeight = `${Math.max(100, anchor.top - 26)}px`;
  };
  toolGroups.forEach(group => group.addEventListener('toggle', () => {
    if (group.open) toolGroups.forEach(other => { if (other !== group) other.open = false; });
  }));
  $('providerSetupToggle').addEventListener('click', () => requestAnimationFrame(positionTools));
  document.addEventListener('pointerdown', event => {
    if (!ribbon.contains(event.target) && !providerPanel.hidden) {
      providerPanel.hidden = true;
      $('providerSetupToggle').setAttribute('aria-expanded', 'false');
    }
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !providerPanel.hidden) {
      providerPanel.hidden = true;
      $('providerSetupToggle').setAttribute('aria-expanded', 'false');
      $('providerSetupToggle').focus();
    }
  });
  window.addEventListener('resize', positionTools);
  workspace.addEventListener('scroll', positionTools, { passive: true });
  const intro = document.createElement('div'); intro.className = 'stage-intro';
  intro.hidden = true;
  document.querySelector('.stage-core').prepend(intro);
  const detach = $('desktopCompanion');
  detach.className = 'detach-companion gold-primary';
  detach.innerHTML = '<span>Companion</span><span class="btn-icon-circle" aria-hidden="true"><svg class="nav-icon" viewBox="0 0 24 24"><path d="M7 17 17 7M8 7h9v9"/></svg></span>';
  detach.title = 'Open floating desktop companion';
  document.querySelector('.stage-core').append(detach);
  const footer = document.createElement('div'); footer.className = 'presence-summary'; footer.id = 'presenceSummary';
  document.querySelector('.stage-core').append(footer);
  const panel = document.createElement('section'); panel.className = 'presence-panel';
  panel.innerHTML = `<div class="panel-heading"><span class="nav-caption">BEHAVIOR CONTROLS</span><h2>A presence of your own.</h2><p>Choose how Verity reacts, rests, and follows your attention.</p></div>
    <div class="setting-block"><h3>Emotion direction</h3><p>Automatic follows the conversation. Locked keeps your chosen face.</p>
    <label class="setting-row">Emotion mode <select id="presenceMode"><option value="auto">Automatic</option><option value="locked">Locked expression</option></select></label>
    <label class="setting-row">Expression <select id="presenceExpression"></select></label></div>
    <div class="setting-block"><h3>Quiet moments</h3>
    <label class="setting-row">Random idle animations <input id="presenceIdle" type="checkbox"></label>
    <p>Only checked motions can play at idle. No immediate repeats; each runs for at most two cycles. An empty list means stillness.</p>
    <label class="setting-row">Pause between motions <select id="presenceInterval"><option value="5">5 seconds</option><option value="12">12 seconds</option><option value="25">25 seconds</option><option value="60">60 seconds</option></select></label>
    <label class="setting-row">Movement intensity <input id="presenceIntensity" type="range" min="0.1" max="1" step="0.05"></label>
    <div class="pool-heading"><span id="poolCount"></span><button id="clearIdlePool">Clear selection</button></div>
    <input id="idleSearch" type="search" placeholder="Find an idle motion…" aria-label="Search idle animations">
    <div id="idlePool" class="idle-pool"></div></div>
    <div class="setting-block"><h3>Attention</h3><label class="setting-row">Follow the mouse <input id="presenceGaze" type="checkbox"></label><p id="gazeDescription"></p></div>`;
  column.append(panel);
  const presenceCore = document.createElement('div'); presenceCore.className = 'presence-core';
  presenceCore.append(...panel.childNodes); panel.append(presenceCore);
  const reaction = document.createElement('div'); reaction.className = 'setting-block';
  reaction.innerHTML = '<h3>Current reaction</h3><p id="emotionDirection">Attentive neutral · waiting for context</p><p id="emotionReason">Reactions follow the conversation. Idle motion stays within your selection and the current mood.</p>';
  presenceCore.querySelector('.panel-heading').after(reaction);
  window.addEventListener('verity:emotion-plan', ({ detail }) => {
    $('emotionDirection').textContent = `${detail.emotion} · ${detail.intention}`;
    $('emotionReason').textContent = detail.reason;
  });
  const views = { conversation: [], presence: [panel, modules[1]], motion: [modules[2]], voice: [modules[3]] };
  const titles = { conversation: 'Conversation', presence: 'Presence', motion: 'Motion', voice: 'Voice & faces' };
  function show(view, restoreFocus = false) {
    if (customize.open) closeCustomize(restoreFocus);
    customize.classList.toggle('selected', view !== 'conversation');
    toolGroups.forEach(group => { group.open = false; });
    column.append(...views[view]);
    [...modules, panel].forEach(el => { el.hidden = !views[view].includes(el); });
    chatModule.hidden = view !== 'conversation';
    column.hidden = view === 'conversation';
    unified.classList.toggle('is-conversation', view === 'conversation');
    document.body.classList.toggle('view-conversation', view === 'conversation');
    nav.querySelectorAll('[data-view]').forEach(btn => { const active = btn.dataset.view === view; btn.classList.toggle('selected', active); btn.setAttribute('aria-current', active ? 'page' : 'false'); });
    heading.querySelector('h1').textContent = titles[view]; column.scrollTop = 0;
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      views[view].forEach((el, index) => {
        el.getAnimations().forEach(animation => animation.cancel());
        el.animate([{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'translateY(0)' }],
          { duration: 220, delay: index * 20, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' });
      });
    }
  }
  nav.querySelectorAll('[data-view]').forEach(btn => btn.onclick = event => show(btn.dataset.view, event.detail === 0));
  $('desktopCompanion').onclick = () => {
    if (window.verityDesktop) window.verityDesktop.popOut();
    else $('desktopCompanion').textContent = 'Open in the desktop app to detach';
  };
  window.EXPRESSIONS.forEach((expression, i) => $('presenceExpression').add(new Option(expression.name, i)));
  const animations = window.VerityAnimations.getAnimationList();
  function renderPool() {
    const s = presence.settings, term = $('idleSearch').value.toLowerCase();
    const idleCatalog = window.VerityEmotionDirector.catalog;
    $('poolCount').textContent = `${s.allowed.filter(id => idleCatalog[id]?.idleSafe).length} quiet motions selected`;
    const fragment = document.createDocumentFragment();
    animations.filter(a => idleCatalog[a.id]?.idleSafe && a.name.toLowerCase().includes(term)).sort((a,b) => Number(s.allowed.includes(b.id)) - Number(s.allowed.includes(a.id))).forEach(a => {
      const label = document.createElement('label'); label.className = 'idle-choice';
      const input = document.createElement('input'); input.type = 'checkbox'; input.checked = s.allowed.includes(a.id);
      input.onchange = () => presence.configure({ allowed: input.checked ? [...presence.settings.allowed, a.id] : presence.settings.allowed.filter(id => id !== a.id) });
      const text = document.createElement('span'); text.textContent = a.name;
      label.append(input, text); fragment.append(label);
    });
    $('idlePool').replaceChildren(fragment);
  }
  function sync() {
    const s = presence.settings;
    $('presenceMode').value = s.emotionMode; $('presenceExpression').value = s.expression;
    $('presenceExpression').disabled = s.emotionMode !== 'locked';
    $('presenceIdle').checked = s.idle; $('presenceGaze').checked = s.gaze;
    $('presenceInterval').value = s.interval; $('presenceIntensity').value = s.intensity;
    $('presenceSummary').textContent = `${s.emotionMode === 'locked' ? 'Expression locked' : 'Emotion · automatic'}  /  ${s.idle ? 'Idle · curated' : 'Idle · paused'}  /  ${s.gaze ? 'Gaze · on' : 'Gaze · off'}`;
    renderPool();
  }
  for (const [id, key, type] of [['presenceMode','emotionMode','value'],['presenceExpression','expression','number'],['presenceIdle','idle','checked'],['presenceGaze','gaze','checked'],['presenceInterval','interval','number'],['presenceIntensity','intensity','number']]) {
    $(id).onchange = () => presence.configure({ [key]: type === 'checked' ? $(id).checked : type === 'number' ? +$(id).value : $(id).value });
  }
  $('clearIdlePool').onclick = () => presence.configure({ allowed: [] });
  $('idleSearch').oninput = renderPool;
  $('gazeDescription').textContent = window.verityDesktop ? 'Desktop-wide tracking follows the cursor outside the app, across your displays. Switch off anytime.' : 'Browser mode follows the cursor inside this page. Use the desktop app for tracking outside the window.';
  window.addEventListener('verity:presence', sync);
  document.querySelector('.brand-tag').textContent = 'COMPANION';
  const labels = ['Conversation', 'Emotion insights', 'Motion library', 'Voice studio'];
  modules.forEach((el, i) => { const title = el.querySelector('.eyebrow-pill'); if (title) title.textContent = labels[i]; });
  $('chatInput').placeholder = 'Message Verity';
  $('chatInput').setAttribute('aria-label', 'Message Verity');
  $('brainProviderSelect').setAttribute('aria-label', 'AI provider');
  $('providerApiKeyInput').setAttribute('aria-label', 'Provider API key');
  $('providerBaseUrlInput').setAttribute('aria-label', 'Custom or local server URL');
  const welcome = $('chatHistory').firstElementChild;
  if (welcome) welcome.textContent = 'Hi, I’m Verity. What’s on your mind?';
  $('containmentStatusText').textContent = 'HERE WITH YOU';
  document.querySelectorAll('button[title]').forEach(button => button.setAttribute('aria-label', button.title));
  // Interface symbols are normalized to SVG marks by the shared UI sweep after startup.
  $('micIcon').innerHTML = '<svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M6 10v2a6 6 0 0 0 12 0v-2M12 18v3M8 21h8"/></svg>';
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) {
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) entry.target.animate(
        [{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'translateY(0)' }],
        { duration: 850, easing: 'cubic-bezier(.16,1,.3,1)' });
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.08 });
  document.querySelectorAll('.stage-shell,.setting-block').forEach(el => observer.observe(el));
  window.addEventListener('beforeunload', () => observer.disconnect(), { once: true });
  sync(); show('conversation');
  // Guide first-time users through provider setup without opening the tool ribbon.
  if (window.verityDesktop?.getProviderSettings && !localStorage.getItem('verity.setup-complete.v2')) {
    const setup = document.createElement('dialog');
    setup.className = 'welcome-setup';
    setup.innerHTML = `<form class="welcome-setup-card" method="dialog">
      <span class="setup-kicker">WELCOME TO VERITY</span>
      <h2>Make yourself at home.</h2>
      <p>Choose your AI provider to start a conversation. You can change this later in AI settings.</p>
      <label>Provider<select id="welcomeProvider" required></select></label>
      <label>API key<input id="welcomeKey" type="password" autocomplete="off" placeholder="Paste your API key"></label>
      <label>Model <span>optional</span><input id="welcomeModel" placeholder="Provider default"></label>
      <label>Endpoint URL <span>optional</span><input id="welcomeEndpoint" type="url" placeholder="For custom or local providers"></label>
      <p class="setup-note">Your key is encrypted and stored on this device.</p>
      <p class="setup-error" role="alert"></p>
      <div class="setup-actions"><button type="button" class="setup-skip">Set up later</button><button type="submit" class="setup-save">Save &amp; continue <span aria-hidden="true">→</span></button></div>
    </form>`;
    document.body.append(setup);
    const provider = setup.querySelector('#welcomeProvider');
    const key = setup.querySelector('#welcomeKey');
    const model = setup.querySelector('#welcomeModel');
    const endpoint = setup.querySelector('#welcomeEndpoint');
    const error = setup.querySelector('.setup-error');
    let settings = {};
    Promise.all([window.verityDesktop.getProviderSettings(), fetch('/api/providers').then(r => { if (!r.ok) throw Error(); return r.json(); })]).then(([saved, catalog]) => {
      settings = saved || {};
      for (const item of catalog.providers || []) provider.add(new Option(item.name, item.id));
      provider.value = settings.provider || 'groq';
      model.value = settings.model || '';
      endpoint.value = settings.baseUrl || '';
      key.placeholder = settings.hasApiKey ? 'Saved securely · enter to replace' : 'Paste your API key';
    }).catch(() => { provider.add(new Option('Groq', 'groq')); error.textContent = 'Could not load providers. You can configure them later in AI settings.'; });
    provider.addEventListener('change', () => { model.value = ''; endpoint.value = ''; key.value = ''; key.placeholder = 'Paste your API key'; });
    const finish = reload => { localStorage.setItem('verity.setup-complete.v2', '1'); setup.close(); setup.remove(); if (reload) location.reload(); };
    setup.querySelector('.setup-skip').addEventListener('click', () => finish(false));
    setup.addEventListener('cancel', event => event.preventDefault());
    setup.querySelector('form').addEventListener('submit', async event => {
      event.preventDefault();
      const button = setup.querySelector('.setup-save');
      button.disabled = true; error.textContent = '';
      try {
        await window.verityDesktop.saveProviderSettings({ provider: provider.value, model: model.value.trim(), baseUrl: endpoint.value.trim(), apiKey: key.value });
        key.value = ''; finish(true);
      } catch (err) { error.textContent = err.message || 'Could not save settings.'; button.disabled = false; }
    });
    setTimeout(() => setup.showModal(), 1800);
  }
})();
