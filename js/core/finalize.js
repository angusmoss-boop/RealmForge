/* Realmforge V11.23.0 production finalizer. */
(() => {
  'use strict';
  const RF=window.RF;
  RF.VERSION='11.23.0';
  RF.BUILD={version:'11.23.0',title:'Canonical Character, Progression & Vault Ancestry',built:'19 Sep 2026 • 20:51 BST',buildId:'20260919-v1123-character-progression-vault'};
  RF.PRODUCTION_FOUNDATION=RF.PRODUCTION_FOUNDATION||{};
  Object.assign(RF.PRODUCTION_FOUNDATION,{
    phase:17,architecture:'canonical-systems-v11',legacyBaseline:'11.5.3',compatibilityLayer:'js/legacy/compat_gameplay_character_progression_trimmed_v1153.js',saveSchema:RF.Core.contract.saveSchema,
    persistenceOwner:'core.campaigns',migrationOwner:'core.migrations',contentOwner:'data.catalog',configOwner:'data.config',
    characterOwner:'systems.character',travelOwner:'systems.travel',questOwner:'systems.quests',wayfinderOwner:'systems.wayfinder',combatOwner:'systems.combat',equipmentOwner:'systems.equipment',inventoryOwner:'systems.inventory',
    researchOwner:'systems.research',craftingOwner:'systems.crafting',skillsOwner:'systems.skills',fieldcraftOwner:'systems.fieldcraft',
    gatheringOwner:'systems.gathering',huntingOwner:'systems.hunting',fishingOwner:'systems.fishing',cookingOwner:'systems.cooking',
    explorationOwner:'systems.exploration',locksOwner:'systems.locks',crimeOwner:'systems.crime',propertyOwner:'systems.property',timeEnergyOwner:'systems.timeEnergy',focusClockOwner:'ui.focusClock',databaseOwner:'ui.database',navigationOwner:'ui.navigation',presentationOwner:'ui.presentation',overlayOwner:'ui.overlays',appShellOwner:'ui.appShell',developerOwner:'ui.developer',platformOwner:'platform.browser',lifecycleOwner:'core.lifecycle',worldOwner:'systems.world',socialOwner:'systems.social',canonicalModules:RF.Modules.list().map(x=>x.name)
  });
  RF.Modules.register('core.finalize',RF.PRODUCTION_FOUNDATION,{owner:'core',status:'canonical'});
})();
