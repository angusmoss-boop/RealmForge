/* Realmforge V11.15.0 — Canonical Finalisation Bundle */

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

/* ===== js/core/system_ownership_v11_15.js ===== */
/* Realmforge V11.15.0 — canonical system ownership verification. */
(() => {
  'use strict';
  const RF=window.RF;
  const commerce=RF.Systems?.Commerce,dungeons=RF.Systems?.Dungeons,travel=RF.Systems?.Travel,quests=RF.Systems?.Quests,wayfinder=RF.Systems?.Wayfinder;
  const combat=RF.Systems?.Combat,equipment=RF.Systems?.Equipment,inventory=RF.Systems?.Inventory,research=RF.Systems?.Research,crafting=RF.Systems?.Crafting,skills=RF.Systems?.Skills;
  const fieldcraft=RF.Systems?.Fieldcraft,gathering=RF.Systems?.Gathering,hunting=RF.Systems?.Hunting,fishing=RF.Systems?.Fishing,cooking=RF.Systems?.Cooking;
  const expected={
    combat:["js/v8_1.js", "js/v10_35.js", "js/v10_36.js", "js/v10_57.js", "js/v10_58.js", "js/v10_59.js", "js/v10_60.js", "js/v11_3_2.js"],
    equipment:["js/v10_3.js", "js/v10_50.js", "js/v10_53.js", "js/v10_55.js", "js/v11_5.js"],
    inventory:["js/v10_42.js", "js/v10_43.js", "js/v10_44.js", "js/v10_45.js", "js/v10_46.js", "js/v10_47.js", "js/v10_51.js", "js/v10_52.js", "js/v10_56.js"],
    research:["js/v10_48.js", "js/v10_49.js", "js/v11_5_2.js", "js/v11_5_3.js"],crafting:["js/v10_15.js", "js/v10_18.js", "js/v10_19.js", "js/v10_28.js"],skills:["js/v10_37.js", "js/v11_2.js"],
    fieldcraft:["js/v5.js","js/v6.js","js/v10_24.js"],fieldcraftFragments:["v7-rare-skilling","v7-marsh-cooking","v7-camp-extras"]
  };
  const hasAll=(api,list)=>!!api&&list.every(x=>api.installedStages?.includes(x));
  const checks={
    commerceCanonical:!!commerce&&RF.Modules.info('systems.commerce')?.meta?.status==='canonical',commerceInstalled:!!commerce?.installed&&!!RF.V1054?.trade&&!!RF.openMarket,
    dungeonsCanonical:!!dungeons&&RF.Modules.info('systems.dungeons')?.meta?.status==='canonical',dungeonsInstalled:!!dungeons?.installed&&!!RF.V1062?.start&&!!RF.V1062?.DUNGEONS,
    travelCanonical:!!travel&&RF.Modules.info('systems.travel')?.meta?.status==='canonical',travelInstalled:Array.isArray(travel?.installedStages)&&travel.installedStages.includes('v9-routing')&&travel.installedStages.includes('js/v10_17.js')&&travel.installedStages.includes('js/v10_20.js')&&travel.installedStages.includes('js/v11_2_2.js'),
    questsCanonical:!!quests&&RF.Modules.info('systems.quests')?.meta?.status==='canonical',questsInstalled:quests?.installed===true&&typeof RF.v93AcceptQuest==='function'&&typeof RF.UI?.quests==='function',
    wayfinderCanonical:!!wayfinder&&RF.Modules.info('systems.wayfinder')?.meta?.status==='canonical',wayfinderInstalled:wayfinder?.installed===true&&typeof RF.V1151?.progressHint==='function',
    combatCanonical:!!combat&&RF.Modules.info('systems.combat')?.meta?.status==='canonical',combatStages:hasAll(combat,expected.combat),
    equipmentCanonical:!!equipment&&RF.Modules.info('systems.equipment')?.meta?.status==='canonical',equipmentStages:hasAll(equipment,expected.equipment),
    inventoryCanonical:!!inventory&&RF.Modules.info('systems.inventory')?.meta?.status==='canonical',inventoryStages:hasAll(inventory,expected.inventory),
    researchCanonical:!!research&&RF.Modules.info('systems.research')?.meta?.status==='canonical',researchStages:hasAll(research,expected.research),researchReady:typeof RF.researchEnemy==='function'&&typeof RF.refreshEncounters==='function'&&typeof RF.V1152?.profile==='function'&&typeof RF.V1153?.uniqueNearby==='function',
    craftingCanonical:!!crafting&&RF.Modules.info('systems.crafting')?.meta?.status==='canonical',craftingStages:hasAll(crafting,expected.crafting),craftingReady:typeof RF.v9StartCraftQty==='function'&&typeof RF.V1028?.craftAnalysis==='function'&&typeof RF.productionTap==='function'&&typeof RF.hammerForge==='function',
    skillsCanonical:!!skills&&RF.Modules.info('systems.skills')?.meta?.status==='canonical',skillsStages:hasAll(skills,expected.skills),skillsReady:typeof RF.effectiveSkillLevel==='function'&&typeof RF.meetsSkillRequirement==='function'&&typeof RF.normalizeSkillRequirements==='function'&&typeof RF.UI?.skills==='function',
    fieldcraftCanonical:!!fieldcraft&&RF.Modules.info('systems.fieldcraft')?.meta?.status==='canonical',fieldcraftStages:hasAll(fieldcraft,expected.fieldcraft),fieldcraftFragments:expected.fieldcraftFragments.every(x=>fieldcraft?.installedFragments?.includes(x)),
    gatheringCanonical:!!gathering&&RF.Modules.info('systems.gathering')?.meta?.status==='canonical',gatheringReady:typeof RF.resourceState==='function'&&typeof RF.resourcesHere==='function'&&typeof RF.startGather==='function'&&typeof RF.workTap==='function'&&typeof RF.finishActiveGather==='function',
    huntingCanonical:!!hunting&&RF.Modules.info('systems.hunting')?.meta?.status==='canonical',huntingReady:typeof RF.startHunt==='function'&&typeof RF.huntTrack==='function'&&typeof RF.huntStrike==='function'&&typeof RF.huntFail==='function',
    fishingCanonical:!!fishing&&RF.Modules.info('systems.fishing')?.meta?.status==='canonical',fishingReady:typeof RF.castLine==='function'&&typeof RF.reelFish==='function'&&typeof RF.fishEscapes==='function',
    cookingCanonical:!!cooking&&RF.Modules.info('systems.cooking')?.meta?.status==='canonical',cookingReady:typeof RF.cookAtFire==='function'&&typeof RF.turnCook==='function'&&typeof RF.V1024?.startHomeCook==='function'&&typeof RF.V1024?.hasIngredients==='function',
    marketCount:Object.keys(RF.V1054?.MARKETS||{}).length,dungeonCount:Object.keys(RF.V1062?.DUNGEONS||{}).length
  };
  checks.valid=Object.entries(checks).filter(([k])=>!['marketCount','dungeonCount'].includes(k)).every(([,v])=>!!v)&&checks.marketCount===10&&checks.dungeonCount===8;
  RF.PRODUCTION_FOUNDATION=RF.PRODUCTION_FOUNDATION||{};RF.PRODUCTION_FOUNDATION.systemOwnership=checks;RF.Modules.register('core.systemOwnership',checks,{owner:'core',status:'canonical'});
})();

/* ===== js/core/finalize.js ===== */
/* Realmforge V11.15.0 production finalizer. */
(() => {
  'use strict';
  const RF=window.RF;
  RF.VERSION='11.15.0';
  RF.BUILD={version:'11.15.0',title:'Canonical Fieldcraft Foundations',built:'19 Sep 2026 • 06:56 BST',buildId:'20260919-0656-bst'};
  RF.PRODUCTION_FOUNDATION=RF.PRODUCTION_FOUNDATION||{};
  Object.assign(RF.PRODUCTION_FOUNDATION,{
    phase:10,architecture:'canonical-systems-v9',legacyBaseline:'11.5.3',compatibilityLayer:'js/legacy/compat_gameplay_fieldcraft_trimmed_v1153.js',saveSchema:RF.Core.contract.saveSchema,
    persistenceOwner:'core.campaigns',migrationOwner:'core.migrations',contentOwner:'data.catalog',configOwner:'data.config',
    travelOwner:'systems.travel',questOwner:'systems.quests',wayfinderOwner:'systems.wayfinder',combatOwner:'systems.combat',equipmentOwner:'systems.equipment',inventoryOwner:'systems.inventory',
    researchOwner:'systems.research',craftingOwner:'systems.crafting',skillsOwner:'systems.skills',fieldcraftOwner:'systems.fieldcraft',
    gatheringOwner:'systems.gathering',huntingOwner:'systems.hunting',fishingOwner:'systems.fishing',cookingOwner:'systems.cooking',canonicalModules:RF.Modules.list().map(x=>x.name)
  });
  RF.Modules.register('core.finalize',RF.PRODUCTION_FOUNDATION,{owner:'core',status:'canonical'});
})();
