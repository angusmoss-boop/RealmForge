/* Realmforge V11.8.0 production finalizer. */
(() => {
  'use strict';
  const RF=window.RF;
  RF.VERSION='11.8.0';
  RF.BUILD={version:'11.8.0',title:'Canonical Save Core',built:'19 Sep 2026 • 04:18 BST',buildId:'20260919-0418-bst'};
  RF.PRODUCTION_FOUNDATION=RF.PRODUCTION_FOUNDATION||{};
  Object.assign(RF.PRODUCTION_FOUNDATION,{
    phase:3,
    architecture:'canonical-save-core-v2',
    legacyBaseline:'11.5.3',
    compatibilityLayer:'js/legacy/compat_gameplay_v1153.js',
    saveSchema:RF.Core.contract.saveSchema,
    persistenceOwner:'core.campaigns',
    migrationOwner:'core.migrations',
    canonicalModules:RF.Modules.list().map(x=>x.name)
  });
  RF.Modules.register('core.finalize',RF.PRODUCTION_FOUNDATION,{owner:'core',status:'canonical'});
})();
