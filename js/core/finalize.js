/* Production Foundation II finalizer. No save-schema migration occurs here. */
(() => {
  'use strict';
  const RF = window.RF;
  RF.VERSION = '11.7.0';
  RF.BUILD = {
    version: '11.7.0',
    title: 'Canonical Architecture',
    built: '19 Sep 2026 • 03:28 BST',
    buildId: '20260919-0328-bst'
  };
  RF.PRODUCTION_FOUNDATION = RF.PRODUCTION_FOUNDATION || {};
  Object.assign(RF.PRODUCTION_FOUNDATION, {
    phase: 2,
    architecture: 'canonical-boundary-v1',
    legacyBaseline: '11.5.3',
    compatibilityLayer: 'js/legacy/compat_v1153.js',
    saveSchema: RF.V95?.SCHEMA || '11.5.3',
    canonicalModules: RF.Modules.list().map(x => x.name)
  });
  RF.Modules.register('core.finalize', RF.PRODUCTION_FOUNDATION, { owner: 'core', status: 'canonical' });
})();
