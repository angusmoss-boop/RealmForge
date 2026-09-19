/* Realmforge V11.10.0 production finalizer. */
(() => {
  'use strict';
  const RF=window.RF;
  RF.VERSION='11.10.0';
  RF.BUILD={version:'11.10.0',title:'Canonical World Config',built:'19 Sep 2026 • 06:18 BST',buildId:'20260919-0618-bst'};
  RF.PRODUCTION_FOUNDATION=RF.PRODUCTION_FOUNDATION||{};
  Object.assign(RF.PRODUCTION_FOUNDATION,{
    phase:5,
    architecture:'canonical-world-config-v4',
    legacyBaseline:'11.5.3',
    compatibilityLayer:'js/legacy/compat_gameplay_config_trimmed_v1153.js',
    saveSchema:RF.Core.contract.saveSchema,
    persistenceOwner:'core.campaigns', migrationOwner:'core.migrations', contentOwner:'data.catalog', configOwner:'data.config',
    canonicalModules:RF.Modules.list().map(x=>x.name)
  });
  RF.Modules.register('core.finalize',RF.PRODUCTION_FOUNDATION,{owner:'core',status:'canonical'});
})();
