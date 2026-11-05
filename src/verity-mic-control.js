// Shared button state, including when the other window owns the microphone.
window.bindVerityMicrophone = function(controller, render) {
  const bridge = window.verityDesktop?.microphone;
  let enabled = false;
  let lastState = null;
  const originalState = controller.onState;
  const display = snapshot => { enabled = snapshot.enabled; render(snapshot); };
  controller.onState = state => {
    originalState?.(state);
    if (state === lastState) return;
    lastState = state;
    if (bridge) bridge.update(state);
    else display({ enabled: state !== 'off', state });
  };
  if (bridge) {
    bridge.onState(display);
    bridge.onCommand(start => start ? controller.start() : controller.stop());
    bridge.getState().then(display).catch(() => display({ enabled: false, state: 'off' }));
  } else display({ enabled: false, state: 'off' });
  window.addEventListener('beforeunload', () => controller.stop());
  return () => {
    if (bridge) bridge.toggle();
    else if (enabled) controller.stop();
    else controller.start();
  };
};
