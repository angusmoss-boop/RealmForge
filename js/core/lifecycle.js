/* Realmforge V11.20.0 — Canonical App Lifecycle.
   Owns base startup/offline catch-up orchestration while leaving simulation cadence to
   systems.timeEnergy and resume/stall recovery to systems.travel / Clock Sentinel. */
(() => {
  'use strict';
  const RF = window.RF;
  let booted = false;
  const platform = () => RF.Platform?.active || {};
  const wallNow = () => {
    const v = platform().now?.();
    return Number.isFinite(v) ? v : Date.now();
  };
  const perfNow = () => {
    const v = platform().monotonicNow?.();
    if (Number.isFinite(v)) return v;
    return typeof performance !== 'undefined' && performance.now ? performance.now() : wallNow();
  };


  function installShellAffordances() {
    // Save transfer UX is owned by canonical Core State. Lifecycle only asks it to install
    // the active platform affordances, preventing late legacy handlers from stealing ownership.
    return RF.Core.State?.installTransferAffordances?.() ?? false;
  }

  function installLegacyBoot() {
    if (booted) return false;
    booted = true;
    installShellAffordances();
    RF.state = RF.load();
    if (RF.state) {
      const rawUsed = Object.values(RF.state.inventory || {}).filter(q => (+q || 0) > 0).length;
      const rawCap = 28 + Math.floor((Math.max(1, RF.state.player?.level || 1) - 1) / 2);
      const rawOver = rawUsed > rawCap;
      const now = wallNow();
      const away = Math.max(0, now - (RF.state.lastReal || now));
      const awayMin = Math.min(120, Math.floor(away / 60000));
      if (!rawOver && awayMin >= 2) {
        RF.advanceWorld(awayMin * .15);
        RF.log(RF.state, `While you were away, ${awayMin} real minutes passed. The world moved on a little.`, 'important');
      }
      RF.log(RF.state, 'Campaign loaded.');
      RF.state.speed = rawOver ? 0 : 1;
      RF.state.paused = rawOver;
    }
    RF.UI.render(RF.state);
    RF.lastTick = perfNow();
    requestAnimationFrame(RF.tick);
    platform().registerServiceWorker?.('./sw.js')?.catch?.(() => {});
    return true;
  }

  const api = {
    installLegacyBoot, installShellAffordances,
    get booted() { return booted; },
    wallNow,
    monotonicNow: perfNow,
    visible: () => platform().isVisible?.() ?? true,
    onResume: handler => platform().onResume?.(handler) || (() => {})
  };
  RF.Core.Lifecycle = RF.Modules.register('core.lifecycle', api, {
    owner: 'core', status: 'canonical', extractedIn: '11.20.0',
    owns: ['startup', 'offline-catch-up', 'initial-frame', 'service-worker-bootstrap', 'save-import-export-affordances'],
    travelRecoveryOwner: 'systems.travel', timeOwner: 'systems.timeEnergy'
  });
})();
