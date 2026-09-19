/* Realmforge V11.7.0 — canonical production bootstrap.
   This file owns only architecture namespaces and module registration.
   Gameplay remains supplied by the frozen V11.5.3 compatibility layer until
   individual systems are deliberately migrated behind these contracts. */
window.RF = window.RF || {};
(() => {
  'use strict';
  const RF = window.RF;
  RF.Core = RF.Core || {};
  RF.Systems = RF.Systems || {};
  RF.Platform = RF.Platform || {};
  RF.Catalog = RF.Catalog || {};
  RF.Views = RF.Views || {};
  RF.Assets = RF.Assets || {};
  RF.Modules = RF.Modules || {};

  const registry = RF.Modules.registry instanceof Map ? RF.Modules.registry : new Map();
  RF.Modules.registry = registry;
  RF.Modules.register = function(name, api, meta = {}) {
    if (!name || typeof name !== 'string') throw new Error('Realmforge module name is required.');
    registry.set(name, { name, api, meta: { canonical: true, ...meta } });
    return api;
  };
  RF.Modules.get = name => registry.get(name)?.api;
  RF.Modules.info = name => registry.get(name) || null;
  RF.Modules.list = () => Array.from(registry.values()).map(x => ({ name: x.name, ...x.meta }));

  RF.Core.contract = Object.freeze({
    appVersion: '11.7.0',
    saveSchema: '11.5.3',
    architecture: 'canonical-boundary-v1',
    legacyBaseline: '11.5.3'
  });
  RF.Modules.register('core.bootstrap', RF.Core.contract, { owner: 'core', status: 'canonical' });
})();
