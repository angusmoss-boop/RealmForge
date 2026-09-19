/* Realmforge V11.13.0 — Canonical Finalisation Bundle */

/* ===== js/core/save_boot.js ===== */
/* Runs after gameplay compatibility has defined all historical migration functions. */
(() => {
  'use strict';
  const RF=window.RF;
  const count=RF.Core.Migrations.installHistoricalBaseline();
  // Re-normalise the already loaded campaign under the single canonical chain,
  // then reconcile it with the verified slot index.
  if(RF.state)RF.state=RF.Core.Migrations.normalize(RF.state);
  RF.Core.Campaigns.SCHEMA=RF.Core.contract.saveSchema;
  RF.Core.Campaigns.reconcileBoot();
  RF.PRODUCTION_FOUNDATION=RF.PRODUCTION_FOUNDATION||{};
  RF.PRODUCTION_FOUNDATION.saveCore={owner:'canonical',historicalNormalizers:count,slotFormat:'v95-compatible',schema:RF.Core.contract.saveSchema};
  RF.Modules.register('core.saveBoot',RF.PRODUCTION_FOUNDATION.saveCore,{owner:'core',status:'canonical'});
})();

/* ===== js/data/finalize.js ===== */
/* Realmforge V11.11.0 — canonical content finalizer / ownership contract. */
(() => {
  'use strict';
  const RF=window.RF;
  const expected=RF.Content?.expectedLegacyBlocks||0;
  const applied=RF.Content?.appliedLegacyBlocks?.()||[];
  const summary=RF.Catalog?.summary?.()||{};
  const validation=RF.Catalog?.validate?.()||[];
  const info={owner:'data',status:'canonical',legacyBlocksExpected:expected,legacyBlocksApplied:applied.length,allBlocksApplied:applied.length===expected,summary,validationIssues:validation};
  RF.PRODUCTION_FOUNDATION=RF.PRODUCTION_FOUNDATION||{};
  RF.PRODUCTION_FOUNDATION.contentCore=info;
  RF.Modules.register('data.contentCore',info,{owner:'data',status:'canonical'});
})();

/* ===== js/data/config_finalize.js ===== */
/* Realmforge V11.11.0 — canonical configuration validation / ownership contract. */
(() => {
  'use strict';
  const RF=window.RF,C=RF.Config;
  const issues=[];
  const items=RF.DATA?.items||{}, enemies=RF.DATA?.enemies||{}, locations=RF.DATA?.locations||{};
  const markets=C?.get('commerce.markets')||{};
  for(const [loc,m] of Object.entries(markets)){
    if(!locations[loc])issues.push(`market missing location ${loc}`);
    for(const row of (m.stock||[]))if(!items[row[0]])issues.push(`market ${loc} stocks missing item ${row[0]}`);
  }
  const ecosystems=C?.get('world.ecosystems')||{};
  for(const [loc,rows] of Object.entries(ecosystems)){
    if(!locations[loc])issues.push(`ecosystem missing location ${loc}`);
    if(rows.length!==8)issues.push(`ecosystem ${loc} has ${rows.length} species, expected 8`);
    for(const [id] of rows)if(!enemies[id])issues.push(`ecosystem ${loc} references missing enemy ${id}`);
  }
  const liveDungeons=RF.Systems?.Dungeons?.definitions?.()||RF.V1062?.DUNGEONS||{};
  for(const [loc,d] of Object.entries(liveDungeons)){
    if(!locations[loc])issues.push(`dungeon missing location ${loc}`);
    if(!enemies[d.boss])issues.push(`dungeon ${loc} boss missing ${d.boss}`);
    for(const id of (d.rewards||[]))if(!items[id])issues.push(`dungeon ${loc} reward missing ${id}`);
    for(const row of (d.materials||[]))if(!items[row[0]])issues.push(`dungeon ${loc} material missing ${row[0]}`);
  }
  const sites=C?.get('crime.greenvaleBurglarySites')||[];
  for(const s of sites)for(const id of (s.items||[]))if(!items[id])issues.push(`burglary ${s.id} references missing item ${id}`);
  const statBalance=C?.get('equipment.statBalance')||{};
  for(const id of Object.keys(statBalance))if(!items[id])issues.push(`equipment stat config references missing item ${id}`);
  const entitySpecs=C?.get('dungeons.v114EntitySpecs')||[];
  for(const [id] of entitySpecs)if(!enemies[id])issues.push(`V11.4 entity spec was not registered: ${id}`);
  const gearSpecs=C?.get('dungeons.v114GearSpecs')||[];
  for(const [id] of gearSpecs)if(!items[id])issues.push(`V11.4 gear spec was not registered: ${id}`);
  const info={owner:'data',status:'canonical',definitions:C?.size?.()||0,keys:C?.keys?.()||[],issues,valid:issues.length===0};
  RF.PRODUCTION_FOUNDATION=RF.PRODUCTION_FOUNDATION||{};
  RF.PRODUCTION_FOUNDATION.configCore=info;
  RF.Modules.register('data.configCore',info,{owner:'data',status:'canonical'});
})();

/* ===== js/systems/research.js ===== */
(() => {
  'use strict';
  const RF = window.RF;
  const api = {
    encounters: (state, location, force = false) => RF.refreshEncounters(state, location, force),
    observe: id => RF.researchEnemy(id),
    identified: (state, id) => RF.V1049?.identified ? RF.V1049.identified(state, id) : (RF.V1048?.identified ? RF.V1048.identified(state, id) : false),
    profile: state => RF.V1152?.profile ? RF.V1152.profile(state) : null,
    uniqueNearby: state => RF.V1153?.uniqueNearby ? RF.V1153.uniqueNearby(state) : (RF.refreshEncounters(state) || [])
  };
  RF.Systems.Research = RF.Modules.register('systems.research', api, { owner: 'systems', status: 'canonical-facade', delegatesTo: 'legacy-v11.5.3' });
})();

/* ===== js/systems/crafting.js ===== */
(() => {
  'use strict';
  const RF = window.RF;
  const api = {
    craft: (...args) => RF.craft(...args),
    finish: activity => RF.finishCraft(activity),
    productionTap: (...args) => typeof RF.productionTap === 'function' ? RF.productionTap(...args) : null,
    cookAtFire: (...args) => typeof RF.cookAtFire === 'function' ? RF.cookAtFire(...args) : null,
    startCooking: (...args) => typeof RF.startCooking === 'function' ? RF.startCooking(...args) : null,
    brew: (...args) => typeof RF.brewExperiment === 'function' ? RF.brewExperiment(...args) : null,
    analysis: (...args) => RF.V1056?.craftAnalysis ? RF.V1056.craftAnalysis(...args) : null
  };
  RF.Systems.Crafting = RF.Modules.register('systems.crafting', api, { owner: 'systems', status: 'canonical-facade', delegatesTo: 'legacy-v11.5.3' });
})();

/* ===== js/ui/shell.js ===== */
/* Canonical UI facade. Future screens should register/render through RF.Views
   instead of adding version wrappers directly to RF.UI. */
(() => {
  'use strict';
  const RF = window.RF;
  const api = {
    render: state => RF.UI.render(state || RF.state),
    navigate(tab, state = RF.state) {
      RF.UI.tab = tab;
      RF.UI.render(state);
      return tab;
    },
    modal: () => RF.UI.modal,
    openModal(modal, state = RF.state) { RF.UI.modal = modal; RF.UI.render(state); return modal; },
    closeModal(state = RF.state) { RF.UI.modal = null; RF.UI.render(state); },
    currentTab: () => RF.UI.tab,
    root: () => document.getElementById('app')
  };
  RF.Views.Shell = RF.Modules.register('ui.shell', api, { owner: 'ui', status: 'canonical-facade', delegatesTo: 'legacy-v11.5.3' });
})();

/* ===== js/core/system_ownership_v11_13.js ===== */
/* Realmforge V11.13.0 — canonical system ownership verification. */
(() => {
  'use strict';
  const RF=window.RF;
  const commerce=RF.Systems?.Commerce,dungeons=RF.Systems?.Dungeons,travel=RF.Systems?.Travel,quests=RF.Systems?.Quests,wayfinder=RF.Systems?.Wayfinder;
  const combat=RF.Systems?.Combat,equipment=RF.Systems?.Equipment,inventory=RF.Systems?.Inventory;
  const combatExpected=['js/v8_1.js','js/v10_35.js','js/v10_36.js','js/v10_57.js','js/v10_58.js','js/v10_59.js','js/v10_60.js','js/v11_3_2.js'];
  const equipmentExpected=['js/v10_3.js','js/v10_50.js','js/v10_53.js','js/v10_55.js','js/v11_5.js'];
  const inventoryExpected=['js/v10_42.js','js/v10_43.js','js/v10_44.js','js/v10_45.js','js/v10_46.js','js/v10_47.js','js/v10_51.js','js/v10_52.js','js/v10_56.js'];
  const hasAll=(api,list)=>!!api&&list.every(x=>api.installedStages?.includes(x));
  const checks={
    commerceCanonical:!!commerce&&RF.Modules.info('systems.commerce')?.meta?.status==='canonical',
    commerceInstalled:!!commerce?.installed&&!!RF.V1054?.trade&&!!RF.openMarket,
    dungeonsCanonical:!!dungeons&&RF.Modules.info('systems.dungeons')?.meta?.status==='canonical',
    dungeonsInstalled:!!dungeons?.installed&&!!RF.V1062?.start&&!!RF.V1062?.DUNGEONS,
    travelCanonical:!!travel&&RF.Modules.info('systems.travel')?.meta?.status==='canonical',
    travelInstalled:Array.isArray(travel?.installedStages)&&travel.installedStages.includes('v9-routing')&&travel.installedStages.includes('js/v10_17.js')&&travel.installedStages.includes('js/v10_20.js')&&travel.installedStages.includes('js/v11_2_2.js'),
    routeReady:typeof RF.v9Route==='function'&&typeof RF.V1020?.openRoutePreview==='function'&&typeof RF.V1017?.overlayHtml==='function',
    questsCanonical:!!quests&&RF.Modules.info('systems.quests')?.meta?.status==='canonical',
    questsInstalled:quests?.installed===true&&typeof RF.v93AcceptQuest==='function'&&typeof RF.UI?.quests==='function',
    wayfinderCanonical:!!wayfinder&&RF.Modules.info('systems.wayfinder')?.meta?.status==='canonical',
    wayfinderInstalled:wayfinder?.installed===true&&typeof RF.V1151?.progressHint==='function',
    combatCanonical:!!combat&&RF.Modules.info('systems.combat')?.meta?.status==='canonical',
    combatStages:hasAll(combat,combatExpected),
    combatReady:typeof RF.startBattle==='function'&&typeof RF.battleAbility==='function'&&typeof RF.UI?.combatPopup==='function'&&typeof RF.V1057?.actionCategoryHtml==='function',
    equipmentCanonical:!!equipment&&RF.Modules.info('systems.equipment')?.meta?.status==='canonical',
    equipmentStages:hasAll(equipment,equipmentExpected),
    equipmentReady:typeof RF.equipToSlot==='function'&&typeof RF.unequipSlot==='function'&&typeof RF.equipTool==='function'&&typeof RF.weaponDamage==='function'&&typeof RF.armor==='function',
    inventoryCanonical:!!inventory&&RF.Modules.info('systems.inventory')?.meta?.status==='canonical',
    inventoryStages:hasAll(inventory,inventoryExpected),
    inventoryReady:typeof RF.addItem==='function'&&typeof RF.packCapacity==='function'&&typeof RF.UI?.inventory==='function'&&typeof RF.V1056?.isOver==='function',
    marketCount:Object.keys(RF.V1054?.MARKETS||{}).length,
    dungeonCount:Object.keys(RF.V1062?.DUNGEONS||{}).length
  };
  checks.valid=Object.entries(checks).filter(([k])=>!['marketCount','dungeonCount'].includes(k)).every(([,v])=>!!v)&&checks.marketCount===10&&checks.dungeonCount===8;
  RF.PRODUCTION_FOUNDATION=RF.PRODUCTION_FOUNDATION||{};
  RF.PRODUCTION_FOUNDATION.systemOwnership=checks;
  RF.Modules.register('core.systemOwnership',checks,{owner:'core',status:'canonical'});
})();

/* ===== js/core/finalize.js ===== */
/* Realmforge V11.13.0 production finalizer. */
(() => {
  'use strict';
  const RF=window.RF;
  RF.VERSION='11.13.0';
  RF.BUILD={version:'11.13.0',title:'Canonical Combat & Loadouts',built:'19 Sep 2026 • 06:20 BST',buildId:'20260919-0620-bst'};
  RF.PRODUCTION_FOUNDATION=RF.PRODUCTION_FOUNDATION||{};
  Object.assign(RF.PRODUCTION_FOUNDATION,{
    phase:8,
    architecture:'canonical-systems-v7',
    legacyBaseline:'11.5.3',
    compatibilityLayer:'js/legacy/compat_gameplay_combat_loadout_trimmed_v1153.js',
    saveSchema:RF.Core.contract.saveSchema,
    persistenceOwner:'core.campaigns',migrationOwner:'core.migrations',contentOwner:'data.catalog',configOwner:'data.config',
    travelOwner:'systems.travel',questOwner:'systems.quests',wayfinderOwner:'systems.wayfinder',
    combatOwner:'systems.combat',equipmentOwner:'systems.equipment',inventoryOwner:'systems.inventory',
    canonicalModules:RF.Modules.list().map(x=>x.name)
  });
  RF.Modules.register('core.finalize',RF.PRODUCTION_FOUNDATION,{owner:'core',status:'canonical'});
})();
