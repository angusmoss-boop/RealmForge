/* Realmforge V11.18.0 production finalizer. */
(() => {
  'use strict';
  const RF=window.RF;
  RF.VERSION='11.18.0';
  RF.BUILD={version:'11.18.0',title:'Canonical Interface & Codex',built:'19 Sep 2026 • 18:20 BST',buildId:'20260919-1820-bst'};
  RF.PRODUCTION_FOUNDATION=RF.PRODUCTION_FOUNDATION||{};
  Object.assign(RF.PRODUCTION_FOUNDATION,{
    phase:13,architecture:'canonical-systems-v11',legacyBaseline:'11.5.3',compatibilityLayer:'js/legacy/compat_gameplay_ui_presentation_trimmed_v1153.js',saveSchema:RF.Core.contract.saveSchema,
    persistenceOwner:'core.campaigns',migrationOwner:'core.migrations',contentOwner:'data.catalog',configOwner:'data.config',
    travelOwner:'systems.travel',questOwner:'systems.quests',wayfinderOwner:'systems.wayfinder',combatOwner:'systems.combat',equipmentOwner:'systems.equipment',inventoryOwner:'systems.inventory',
    researchOwner:'systems.research',craftingOwner:'systems.crafting',skillsOwner:'systems.skills',fieldcraftOwner:'systems.fieldcraft',
    gatheringOwner:'systems.gathering',huntingOwner:'systems.hunting',fishingOwner:'systems.fishing',cookingOwner:'systems.cooking',
    explorationOwner:'systems.exploration',locksOwner:'systems.locks',crimeOwner:'systems.crime',propertyOwner:'systems.property',timeEnergyOwner:'systems.timeEnergy',focusClockOwner:'ui.focusClock',databaseOwner:'ui.database',navigationOwner:'ui.navigation',presentationOwner:'ui.presentation',overlayOwner:'ui.overlays',canonicalModules:RF.Modules.list().map(x=>x.name)
  });
  RF.Modules.register('core.finalize',RF.PRODUCTION_FOUNDATION,{owner:'core',status:'canonical'});
})();
