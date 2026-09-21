/* Realmforge V11.30.0 production finalizer. */
(() => {
  'use strict';
  const RF=window.RF;
  RF.VERSION='11.30.0';
  RF.BUILD={version:'11.30.0',title:'Canonical Content Sources & V12 Readiness',built:'21 Sep 2026 • 14:22 BST',buildId:'20260921-v1130-content-v12-readiness'};
  RF.PRODUCTION_FOUNDATION=RF.PRODUCTION_FOUNDATION||{};
  Object.assign(RF.PRODUCTION_FOUNDATION,{
    phase:23,architecture:'canonical-systems-v11',legacyBaseline:'11.5.3',compatibilityLayer:'js/legacy/compat_gameplay_scoped_residuals_trimmed_v1153.js',saveSchema:RF.Core.contract.saveSchema,
    persistenceOwner:'core.campaigns',migrationOwner:'core.migrations',contentOwner:'data.catalog',configOwner:'data.config',assetOwner:'data.assets',authoringOwner:'data.authoring',compatibilityClassificationOwner:'core.compatibilityClassification',
    scopedRuntimeOwner:'core.scopedRuntime',cadenceOwner:'systems.cadence',characterOwner:'systems.character',collectionOwner:'systems.collection',worldEventsOwner:'systems.worldEvents',travelOwner:'systems.travel',questOwner:'systems.quests',wayfinderOwner:'systems.wayfinder',combatOwner:'systems.combat',equipmentOwner:'systems.equipment',inventoryOwner:'systems.inventory',
    researchOwner:'systems.research',craftingOwner:'systems.crafting',skillsOwner:'systems.skills',fieldcraftOwner:'systems.fieldcraft',
    gatheringOwner:'systems.gathering',huntingOwner:'systems.hunting',fishingOwner:'systems.fishing',cookingOwner:'systems.cooking',
    explorationOwner:'systems.exploration',locksOwner:'systems.locks',crimeOwner:'systems.crime',propertyOwner:'systems.property',timeEnergyOwner:'systems.timeEnergy',focusClockOwner:'ui.focusClock',databaseOwner:'ui.database',navigationOwner:'ui.navigation',presentationOwner:'ui.presentation',overlayOwner:'ui.overlays',appShellOwner:'ui.appShell',developerOwner:'ui.developer',platformOwner:'platform.browser',lifecycleOwner:'core.lifecycle',worldOwner:'systems.world',socialOwner:'systems.social',canonicalModules:RF.Modules.list().map(x=>x.name)
  });
  RF.PRODUCTION_FOUNDATION.contentAuthoring=RF.Authoring?.report?.()||null;
  RF.PRODUCTION_FOUNDATION.contentSources={baseParts:9,legacyBlocks:RF.Content?.legacyBlockCount?.()||0,configDefinitions:RF.Config?.size?.()||0,assets:RF.Assets?.count?.()||0,contentPacks:'js/data/content/packs'};
  RF.PRODUCTION_FOUNDATION.compatibilityClassification=RF.Core?.CompatibilityClassification?.summary?.()||null;
  RF.Modules.register('core.finalize',RF.PRODUCTION_FOUNDATION,{owner:'core',status:'canonical'});
})();
