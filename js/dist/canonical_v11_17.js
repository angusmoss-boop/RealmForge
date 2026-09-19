/* Realmforge V11.17.0 — Canonical Finalisation Bundle */

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


/* Realmforge V11.17.0 — canonical system ownership verification. */
(() => {
  'use strict';
  const RF=window.RF;
  const commerce=RF.Systems?.Commerce,dungeons=RF.Systems?.Dungeons,travel=RF.Systems?.Travel,quests=RF.Systems?.Quests,wayfinder=RF.Systems?.Wayfinder;
  const combat=RF.Systems?.Combat,equipment=RF.Systems?.Equipment,inventory=RF.Systems?.Inventory,research=RF.Systems?.Research,crafting=RF.Systems?.Crafting,skills=RF.Systems?.Skills;
  const fieldcraft=RF.Systems?.Fieldcraft,gathering=RF.Systems?.Gathering,hunting=RF.Systems?.Hunting,fishing=RF.Systems?.Fishing,cooking=RF.Systems?.Cooking;
  const exploration=RF.Systems?.Exploration,locks=RF.Systems?.Locks,crime=RF.Systems?.Crime,property=RF.Systems?.Property,timeEnergy=RF.Systems?.TimeEnergy,focusClock=RF.Views?.FocusClock;
  const expected={
    combat:["js/v8_1.js", "js/v10_35.js", "js/v10_36.js", "js/v10_57.js", "js/v10_58.js", "js/v10_59.js", "js/v10_60.js", "js/v11_3_2.js"],
    equipment:["js/v10_3.js", "js/v10_50.js", "js/v10_53.js", "js/v10_55.js", "js/v11_5.js"],
    inventory:["js/v10_42.js", "js/v10_43.js", "js/v10_44.js", "js/v10_45.js", "js/v10_46.js", "js/v10_47.js", "js/v10_51.js", "js/v10_52.js", "js/v10_56.js"],
    research:["js/v10_48.js", "js/v10_49.js", "js/v11_5_2.js", "js/v11_5_3.js"],
    crafting:["js/v10_15.js", "js/v10_18.js", "js/v10_19.js", "js/v10_28.js"],skills:["js/v10_37.js", "js/v11_2.js"],
    fieldcraft:["js/v5.js", "js/v6.js"],fieldcraftFragments:["v7-rare-skilling", "v7-marsh-cooking", "v7-camp-extras"],
    exploration:["js/v10_25.js", "js/v10_26.js", "js/v10_34.js"],explorationFragments:["v7-excavation"],
    locks:["js/v10_27.js", "js/v10_29.js", "js/v10_32.js"],
    crime:["js/v10_4.js", "js/v10_5.js", "js/v10_6.js", "js/v10_8.js", "js/v10_30.js", "js/v10_31.js"],crimeFragments:["v3-crime-base", "v4-bounty-resolution", "v9_2-crime-foundation", "v10-pickpocket-tuning", "v10_2-pickpocket-feedback", "v10_2-pickpocket-ui"],
    property:["js/v10_24.js"],propertyFragments:["v4-home-actions", "v10-inn-rest"],
    timeEnergyStages:["js/v10_22.js", "js/v10_23.js"],timeEnergyFragments:["v8-time-controls", "v8_3-manual-pause", "v10-energy-core", "v10_2-world-clock", "v10_26-combat-clock"],focusClock:["js/v9_6.js"],gatheringFragments:["v10_22-continuous-gathering"]
  };
  const hasAll=(api,list)=>!!api&&list.every(x=>api.installedStages?.includes(x));
  const hasFrags=(api,list)=>!!api&&list.every(x=>api.installedFragments?.includes(x));
  const checks={
    commerceCanonical:!!commerce&&RF.Modules.info('systems.commerce')?.meta?.status==='canonical',commerceInstalled:!!commerce?.installed&&!!RF.V1054?.trade&&!!RF.openMarket,
    dungeonsCanonical:!!dungeons&&RF.Modules.info('systems.dungeons')?.meta?.status==='canonical',dungeonsInstalled:!!dungeons?.installed&&!!RF.V1062?.start&&!!RF.V1062?.DUNGEONS,
    travelCanonical:!!travel&&RF.Modules.info('systems.travel')?.meta?.status==='canonical',travelInstalled:Array.isArray(travel?.installedStages)&&travel.installedStages.includes('v9-routing')&&travel.installedStages.includes('js/v10_17.js')&&travel.installedStages.includes('js/v10_20.js')&&travel.installedStages.includes('js/v11_2_2.js'),
    questsCanonical:!!quests&&RF.Modules.info('systems.quests')?.meta?.status==='canonical',questsInstalled:quests?.installed===true&&typeof RF.v93AcceptQuest==='function'&&typeof RF.UI?.quests==='function',
    wayfinderCanonical:!!wayfinder&&RF.Modules.info('systems.wayfinder')?.meta?.status==='canonical',wayfinderInstalled:wayfinder?.installed===true&&typeof RF.V1151?.progressHint==='function',
    combatCanonical:!!combat&&RF.Modules.info('systems.combat')?.meta?.status==='canonical',combatStages:hasAll(combat,expected.combat),
    equipmentCanonical:!!equipment&&RF.Modules.info('systems.equipment')?.meta?.status==='canonical',equipmentStages:hasAll(equipment,expected.equipment),
    inventoryCanonical:!!inventory&&RF.Modules.info('systems.inventory')?.meta?.status==='canonical',inventoryStages:hasAll(inventory,expected.inventory),
    researchCanonical:!!research&&RF.Modules.info('systems.research')?.meta?.status==='canonical',researchStages:hasAll(research,expected.research),
    craftingCanonical:!!crafting&&RF.Modules.info('systems.crafting')?.meta?.status==='canonical',craftingStages:hasAll(crafting,expected.crafting),
    skillsCanonical:!!skills&&RF.Modules.info('systems.skills')?.meta?.status==='canonical',skillsStages:hasAll(skills,expected.skills),
    fieldcraftCanonical:!!fieldcraft&&RF.Modules.info('systems.fieldcraft')?.meta?.status==='canonical',fieldcraftStages:hasAll(fieldcraft,expected.fieldcraft),fieldcraftFragments:hasFrags(fieldcraft,expected.fieldcraftFragments),
    gatheringCanonical:!!gathering&&RF.Modules.info('systems.gathering')?.meta?.status==='canonical',huntingCanonical:!!hunting&&RF.Modules.info('systems.hunting')?.meta?.status==='canonical',fishingCanonical:!!fishing&&RF.Modules.info('systems.fishing')?.meta?.status==='canonical',cookingCanonical:!!cooking&&RF.Modules.info('systems.cooking')?.meta?.status==='canonical',
    explorationCanonical:!!exploration&&RF.Modules.info('systems.exploration')?.meta?.status==='canonical',explorationStages:hasAll(exploration,expected.exploration),explorationFragments:hasFrags(exploration,expected.explorationFragments),
    locksCanonical:!!locks&&RF.Modules.info('systems.locks')?.meta?.status==='canonical',locksStages:hasAll(locks,expected.locks),
    crimeCanonical:!!crime&&RF.Modules.info('systems.crime')?.meta?.status==='canonical',crimeStages:hasAll(crime,expected.crime),crimeFragments:hasFrags(crime,expected.crimeFragments),
    propertyCanonical:!!property&&RF.Modules.info('systems.property')?.meta?.status==='canonical',propertyStages:hasAll(property,expected.property),propertyFragments:hasFrags(property,expected.propertyFragments),
    timeEnergyCanonical:!!timeEnergy&&RF.Modules.info('systems.timeEnergy')?.meta?.status==='canonical',timeEnergyStages:hasAll(timeEnergy,expected.timeEnergyStages),timeEnergyFragments:hasFrags(timeEnergy,expected.timeEnergyFragments),
    focusClockCanonical:!!focusClock&&RF.Modules.info('ui.focusClock')?.meta?.status==='canonical',focusClockStages:hasAll(focusClock,expected.focusClock),gatheringFragments:hasFrags(gathering,expected.gatheringFragments),
    explorationReady:typeof RF.V1025?.finishExplore==='function'&&typeof RF.startExcavation==='function'&&typeof RF.excavateTile==='function',
    locksReady:typeof RF.V1027?.startLock==='function'&&typeof RF.V1027?.turnLock==='function'&&RF.V1029?.PINS===4&&!!RF.V1032,
    crimeReady:typeof RF.commitCrime==='function'&&typeof RF.startPickpocket==='function'&&typeof RF.v92BurglaryAttempt==='function'&&typeof RF.V1031?.cooldownRemaining==='function',
    propertyReady:typeof RF.buyHome==='function'&&typeof RF.restAtHome==='function'&&typeof RF.v10RestUntil==='function'&&typeof RF.V1024?.startHomeCook==='function',
    timeEnergyReady:typeof RF.v10SpendEnergy==='function'&&typeof RF.V1023?.minutesPerEnergy==='number'&&typeof RF.v96CaptureClock==='function'&&typeof RF.V1026?.restoreClock==='function',
    marketCount:Object.keys(RF.V1054?.MARKETS||{}).length,dungeonCount:Object.keys(RF.V1062?.DUNGEONS||{}).length
  };
  checks.valid=Object.entries(checks).filter(([k])=>!['marketCount','dungeonCount'].includes(k)).every(([,v])=>!!v)&&checks.marketCount===10&&checks.dungeonCount===8;
  RF.PRODUCTION_FOUNDATION=RF.PRODUCTION_FOUNDATION||{};RF.PRODUCTION_FOUNDATION.systemOwnership=checks;RF.Modules.register('core.systemOwnership',checks,{owner:'core',status:'canonical'});
})();


/* Realmforge V11.17.0 production finalizer. */
(() => {
  'use strict';
  const RF=window.RF;
  RF.VERSION='11.17.0';
  RF.BUILD={version:'11.17.0',title:'Canonical Time & Energy',built:'19 Sep 2026 • 17:10 BST',buildId:'20260919-1710-bst'};
  RF.PRODUCTION_FOUNDATION=RF.PRODUCTION_FOUNDATION||{};
  Object.assign(RF.PRODUCTION_FOUNDATION,{
    phase:12,architecture:'canonical-systems-v11',legacyBaseline:'11.5.3',compatibilityLayer:'js/legacy/compat_gameplay_time_energy_trimmed_v1153.js',saveSchema:RF.Core.contract.saveSchema,
    persistenceOwner:'core.campaigns',migrationOwner:'core.migrations',contentOwner:'data.catalog',configOwner:'data.config',
    travelOwner:'systems.travel',questOwner:'systems.quests',wayfinderOwner:'systems.wayfinder',combatOwner:'systems.combat',equipmentOwner:'systems.equipment',inventoryOwner:'systems.inventory',
    researchOwner:'systems.research',craftingOwner:'systems.crafting',skillsOwner:'systems.skills',fieldcraftOwner:'systems.fieldcraft',
    gatheringOwner:'systems.gathering',huntingOwner:'systems.hunting',fishingOwner:'systems.fishing',cookingOwner:'systems.cooking',
    explorationOwner:'systems.exploration',locksOwner:'systems.locks',crimeOwner:'systems.crime',propertyOwner:'systems.property',timeEnergyOwner:'systems.timeEnergy',focusClockOwner:'ui.focusClock',canonicalModules:RF.Modules.list().map(x=>x.name)
  });
  RF.Modules.register('core.finalize',RF.PRODUCTION_FOUNDATION,{owner:'core',status:'canonical'});
})();

