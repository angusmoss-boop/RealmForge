/* Realmforge V11.12.0 production finalizer. */
(() => {
  'use strict';
  const RF=window.RF;
  RF.VERSION='11.12.0';
  RF.BUILD={version:'11.12.0',title:'Canonical Roads & Quests',built:'19 Sep 2026 • 05:35 BST',buildId:'20260919-0535-bst'};
  RF.PRODUCTION_FOUNDATION=RF.PRODUCTION_FOUNDATION||{};
  Object.assign(RF.PRODUCTION_FOUNDATION,{
    phase:7,
    architecture:'canonical-systems-v6',
    legacyBaseline:'11.5.3',
    compatibilityLayer:'js/legacy/compat_gameplay_world_quest_trimmed_v1153.js',
    saveSchema:RF.Core.contract.saveSchema,
    persistenceOwner:'core.campaigns',migrationOwner:'core.migrations',contentOwner:'data.catalog',configOwner:'data.config',
    travelOwner:'systems.travel',questOwner:'systems.quests',wayfinderOwner:'systems.wayfinder',
    canonicalModules:RF.Modules.list().map(x=>x.name)
  });
  RF.Modules.register('core.finalize',RF.PRODUCTION_FOUNDATION,{owner:'core',status:'canonical'});
})();
