/* Realmforge V11.11.0 production finalizer. */
(() => {
  'use strict';
  const RF=window.RF;
  RF.VERSION='11.11.0';
  RF.BUILD={version:'11.11.0',title:'Canonical Commerce & Dungeons',built:'19 Sep 2026 • 07:05 BST',buildId:'20260919-0705-bst'};
  RF.PRODUCTION_FOUNDATION=RF.PRODUCTION_FOUNDATION||{};
  Object.assign(RF.PRODUCTION_FOUNDATION,{
    phase:6,
    architecture:'canonical-systems-v5',
    legacyBaseline:'11.5.3',
    compatibilityLayer:'js/legacy/compat_gameplay_systems_trimmed_v1153.js',
    saveSchema:RF.Core.contract.saveSchema,
    persistenceOwner:'core.campaigns', migrationOwner:'core.migrations', contentOwner:'data.catalog', configOwner:'data.config',
    canonicalModules:RF.Modules.list().map(x=>x.name)
  });
  RF.Modules.register('core.finalize',RF.PRODUCTION_FOUNDATION,{owner:'core',status:'canonical'});
})();
