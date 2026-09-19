/* Realmforge V11.9.0 production finalizer. */
(() => {
  'use strict';
  const RF=window.RF;
  RF.VERSION='11.9.0';
  RF.BUILD={version:'11.9.0',title:'Canonical Content Core',built:'19 Sep 2026 • 05:42 BST',buildId:'20260919-0542-bst'};
  RF.PRODUCTION_FOUNDATION=RF.PRODUCTION_FOUNDATION||{};
  Object.assign(RF.PRODUCTION_FOUNDATION,{
    phase:4,
    architecture:'canonical-content-core-v3',
    legacyBaseline:'11.5.3',
    compatibilityLayer:'js/legacy/compat_gameplay_data_trimmed_v1153.js',
    saveSchema:RF.Core.contract.saveSchema,
    persistenceOwner:'core.campaigns', migrationOwner:'core.migrations', contentOwner:'data.catalog',
    canonicalModules:RF.Modules.list().map(x=>x.name)
  });
  RF.Modules.register('core.finalize',RF.PRODUCTION_FOUNDATION,{owner:'core',status:'canonical'});
})();
