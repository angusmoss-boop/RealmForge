/* Canonical state/save facade.
   Calls are deliberately late-bound to RF.* so the current stable V11.5.3
   implementations remain authoritative while callers gain one clean API. */
(() => {
  'use strict';
  const RF = window.RF;
  const api = {
    current: () => RF.state || null,
    replace(state) { RF.state = state; return state; },
    newGame: (...args) => RF.newGame(...args),
    save: state => RF.save(state || RF.state),
    load: () => RF.load(),
    export: state => RF.exportSave(state || RF.state),
    import: payload => RF.importSave(payload),
    schema: () => RF.V95?.SCHEMA || RF.Core.contract.saveSchema,
    appVersion: () => RF.VERSION,
    snapshot(state = RF.state) {
      if (!state) return null;
      return JSON.parse(JSON.stringify(state));
    }
  };
  RF.Core.State = RF.Modules.register('core.state', api, { owner: 'core', status: 'canonical-facade', delegatesTo: 'legacy-v11.5.3' });
})();
