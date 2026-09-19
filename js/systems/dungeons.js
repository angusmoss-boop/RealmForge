(() => {
  'use strict';
  const RF = window.RF;
  const V = () => RF.V1062 || null;
  const api = {
    legacyNamespace: V,
    open: (...args) => V()?.open ? V().open(...args) : (V()?.openDungeon ? V().openDungeon(...args) : null),
    start: (...args) => V()?.start ? V().start(...args) : (V()?.startDungeon ? V().startDungeon(...args) : null),
    activeRun: state => state?.v1062?.active || null,
    records: state => state?.v1062?.records || {}
  };
  RF.Systems.Dungeons = RF.Modules.register('systems.dungeons', api, { owner: 'systems', status: 'canonical-facade', delegatesTo: 'legacy-v11.0-in-v1062' });
})();
