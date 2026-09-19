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
/* Realmforge V11.22.0 — canonical system/UI ownership verification. */
(() => {
  'use strict';
  const RF=window.RF;
  const commerce=RF.Systems?.Commerce,dungeons=RF.Systems?.Dungeons,travel=RF.Systems?.Travel,quests=RF.Systems?.Quests,wayfinder=RF.Systems?.Wayfinder;
  const combat=RF.Systems?.Combat,equipment=RF.Systems?.Equipment,inventory=RF.Systems?.Inventory,research=RF.Systems?.Research,crafting=RF.Systems?.Crafting,skills=RF.Systems?.Skills;
  const fieldcraft=RF.Systems?.Fieldcraft,gathering=RF.Systems?.Gathering,hunting=RF.Systems?.Hunting,fishing=RF.Systems?.Fishing,cooking=RF.Systems?.Cooking,world=RF.Systems?.World,social=RF.Systems?.Social,encounters=RF.Systems?.Encounters;
  const exploration=RF.Systems?.Exploration,locks=RF.Systems?.Locks,crime=RF.Systems?.Crime,property=RF.Systems?.Property,timeEnergy=RF.Systems?.TimeEnergy;
  const focusClock=RF.Views?.FocusClock,database=RF.Views?.Database,navigation=RF.Views?.Navigation,presentation=RF.Views?.Presentation,overlays=RF.Views?.Overlays,appShell=RF.Views?.AppShell,developer=RF.Views?.Developer,itemBrowser=RF.Views?.ItemBrowser,lifecycle=RF.Core?.Lifecycle;
  const expected={
    combat:["js/v8_1.js","js/v10_35.js","js/v10_36.js","js/v10_57.js","js/v10_58.js","js/v10_59.js","js/v10_60.js","js/v11_3_2.js"],
    equipment:["js/v10_3.js","js/v10_50.js","js/v10_53.js","js/v10_55.js","js/v11_5.js"],
    inventory:["js/v10_42.js","js/v10_43.js","js/v10_44.js","js/v10_45.js","js/v10_46.js","js/v10_47.js","js/v10_51.js","js/v10_52.js","js/v10_56.js"],
    research:["js/v10_48.js","js/v10_49.js","js/v11_5_2.js","js/v11_5_3.js"],
    crafting:["js/v10_15.js","js/v10_18.js","js/v10_19.js","js/v10_28.js"],skills:["js/v10_37.js","js/v11_2.js"],
    fieldcraft:["js/v5.js","js/v6.js"],fieldcraftFragments:["v7-rare-skilling","v7-marsh-cooking","v7-camp-extras"],
    exploration:["js/v10_25.js","js/v10_26.js","js/v10_34.js"],explorationFragments:["v7-excavation"],
    locks:["js/v10_27.js","js/v10_29.js","js/v10_32.js"],
    crime:["js/v10_4.js","js/v10_5.js","js/v10_6.js","js/v10_8.js","js/v10_30.js","js/v10_31.js"],crimeFragments:["v3-crime-base","v4-bounty-resolution","v9_2-crime-foundation","v10-pickpocket-tuning","v10_2-pickpocket-feedback","v10_2-pickpocket-ui","v9_2-crime-modal-ui","v9_2-crime-bind-ui","v9_2-reedmere-crime-ui"],
    property:["js/v10_24.js"],propertyFragments:["v4-home-actions","v10-inn-rest"],
    timeEnergyStages:["js/v10_22.js","js/v10_23.js"],timeEnergyFragments:["v8-time-controls","v8_3-manual-pause","v10-energy-core","v10_2-world-clock","v10_26-combat-clock"],focusClock:["js/v9_6.js"],gatheringFragments:["v10_22-continuous-gathering"],
    database:["js/v9_4.js","js/v10_61.js","js/v11_1.js","js/v11_3.js"],
    navigation:["js/v10_38.js"],
    presentation:["js/v10_39.js","js/v10_40.js","js/v10_41.js","js/v11_3_1.js"],
    overlays:["js/v11_2_1.js","js/v11_2_3.js"],
    appShell:["js/v9_5.js"],appShellFragments:["v10_1-app-shell"],developer:["js/v10_33.js"],
    world:["js/v2.js"],worldFragments:["v9_2-encounter-ecology"],socialFragments:["v4-social-core","v4-dialogue-ui","v4-people-ui","v4-guild-ui","v4-talk-action","v9_2-dialogue"],presentationFragments:["v9_1-weather-scene"],combatFragments:["v8_3-cadence-motion","v9_1-parry-focus","v9_2-defeat-xp"],travelFragments:["v8_3-travel-repair"],encounterFragments:["v9_1-inspect-ui","v9_1-inspect-bind"],itemBrowserFragments:["v8_3-deliberate-item-ui","v9_2-category-ui","v9_3-filter-ui","v9_3-detail-bank-ui"],developerFragments:["v9_3-developer-shell","v9_3-developer-actions-bind"]
  };
  const hasAll=(api,list)=>!!api&&list.every(x=>api.installedStages?.includes(x));
  const hasFrags=(api,list)=>!!api&&list.every(x=>api.installedFragments?.includes(x));
  const canonical=(name,api)=>!!api&&RF.Modules.info(name)?.meta?.status==='canonical';
  const checks={
    commerceCanonical:canonical('systems.commerce',commerce),commerceInstalled:!!commerce?.installed&&!!RF.V1054?.trade&&!!RF.openMarket,
    dungeonsCanonical:canonical('systems.dungeons',dungeons),dungeonsInstalled:!!dungeons?.installed&&!!RF.V1062?.start&&!!RF.V1062?.DUNGEONS,
    travelCanonical:canonical('systems.travel',travel),travelInstalled:Array.isArray(travel?.installedStages)&&travel.installedStages.includes('v9-routing')&&travel.installedStages.includes('js/v10_17.js')&&travel.installedStages.includes('js/v10_20.js')&&travel.installedStages.includes('js/v11_2_2.js'),travelFragments:hasFrags(travel,expected.travelFragments),
    questsCanonical:canonical('systems.quests',quests),questsInstalled:quests?.installed===true&&typeof RF.v93AcceptQuest==='function'&&typeof RF.UI?.quests==='function',
    wayfinderCanonical:canonical('systems.wayfinder',wayfinder),wayfinderInstalled:wayfinder?.installed===true&&typeof RF.V1151?.progressHint==='function',
    combatCanonical:canonical('systems.combat',combat),combatStages:hasAll(combat,expected.combat),combatFragments:hasFrags(combat,expected.combatFragments),
    equipmentCanonical:canonical('systems.equipment',equipment),equipmentStages:hasAll(equipment,expected.equipment),
    inventoryCanonical:canonical('systems.inventory',inventory),inventoryStages:hasAll(inventory,expected.inventory),
    researchCanonical:canonical('systems.research',research),researchStages:hasAll(research,expected.research),
    craftingCanonical:canonical('systems.crafting',crafting),craftingStages:hasAll(crafting,expected.crafting),
    skillsCanonical:canonical('systems.skills',skills),skillsStages:hasAll(skills,expected.skills),
    fieldcraftCanonical:canonical('systems.fieldcraft',fieldcraft),fieldcraftStages:hasAll(fieldcraft,expected.fieldcraft),fieldcraftFragments:hasFrags(fieldcraft,expected.fieldcraftFragments),
    gatheringCanonical:canonical('systems.gathering',gathering),huntingCanonical:canonical('systems.hunting',hunting),fishingCanonical:canonical('systems.fishing',fishing),cookingCanonical:canonical('systems.cooking',cooking),
    explorationCanonical:canonical('systems.exploration',exploration),explorationStages:hasAll(exploration,expected.exploration),explorationFragments:hasFrags(exploration,expected.explorationFragments),
    locksCanonical:canonical('systems.locks',locks),locksStages:hasAll(locks,expected.locks),
    crimeCanonical:canonical('systems.crime',crime),crimeStages:hasAll(crime,expected.crime),crimeFragments:hasFrags(crime,expected.crimeFragments),
    propertyCanonical:canonical('systems.property',property),propertyStages:hasAll(property,expected.property),propertyFragments:hasFrags(property,expected.propertyFragments),
    timeEnergyCanonical:canonical('systems.timeEnergy',timeEnergy),timeEnergyStages:hasAll(timeEnergy,expected.timeEnergyStages),timeEnergyFragments:hasFrags(timeEnergy,expected.timeEnergyFragments),
    focusClockCanonical:canonical('ui.focusClock',focusClock),focusClockStages:hasAll(focusClock,expected.focusClock),gatheringFragments:hasFrags(gathering,expected.gatheringFragments),
    databaseCanonical:canonical('ui.database',database),databaseStages:hasAll(database,expected.database),databaseReady:typeof RF.UI?.database==='function'&&typeof RF.v94DetailHtml==='function'&&typeof RF.V1061?.entries==='function'&&typeof RF.V111?.facilities==='function'&&typeof RF.V113?.dungeonEntries==='function',
    navigationCanonical:canonical('ui.navigation',navigation),navigationStages:hasAll(navigation,expected.navigation),navigationReady:typeof RF.UI?.nav==='function'&&Array.isArray(RF.V1038?.items),
    presentationCanonical:canonical('ui.presentation',presentation),presentationStages:hasAll(presentation,expected.presentation),presentationReady:typeof RF.V1039?.scene==='function'&&typeof RF.V1039?.replaceScene==='function'&&!!RF.V1040&&!!RF.V1041&&!!RF.V1131,
    overlaysCanonical:canonical('ui.overlays',overlays),overlaysStages:hasAll(overlays,expected.overlays),overlaysReady:typeof RF.V1121?.sync==='function'&&typeof RF.V1123?.normaliseCloseButtons==='function',
    appShellCanonical:canonical('ui.appShell',appShell),appShellStages:hasAll(appShell,expected.appShell),appShellFragments:hasFrags(appShell,expected.appShellFragments),appShellReady:typeof RF.V101?.renderMainMenu==='function'&&typeof RF.UI?.options==='function'&&Array.isArray(RF.V95?.navItems),
    developerCanonical:canonical('ui.developer',developer),developerStages:hasAll(developer,expected.developer),developerFragments:hasFrags(developer,expected.developerFragments),developerReady:typeof RF.V1033?.checkRemoteBuild==='function'&&typeof RF.V1033?.playerAction==='function'&&typeof RF.V1033?.bindDev==='function'&&typeof RF.UI?.dev==='function',
    worldCanonical:canonical('systems.world',world),worldStages:hasAll(world,expected.world),worldFragments:hasFrags(world,expected.worldFragments),worldReady:typeof RF.worldPulse==='function'&&typeof RF.npcsHere==='function'&&typeof RF.refreshEncounters==='function',
    socialCanonical:canonical('systems.social',social),socialFragments:hasFrags(social,expected.socialFragments),socialReady:typeof RF.openDialogue==='function'&&typeof RF.resolveDialogue==='function'&&typeof RF.generateContracts==='function'&&typeof RF.passersHere==='function',
    encountersCanonical:canonical('systems.encounters',encounters),encounterFragments:hasFrags(encounters,expected.encounterFragments),encountersReady:typeof RF.v91OpenEnemy==='function'&&typeof RF.UI?.nearbyEnemies==='function',
    itemBrowserCanonical:canonical('ui.itemBrowser',itemBrowser),itemBrowserFragments:hasFrags(itemBrowser,expected.itemBrowserFragments),itemBrowserReady:typeof RF.v92Category==='function'&&typeof RF.v93Req==='function',
    presentationFragments:hasFrags(presentation,expected.presentationFragments),
    lifecycleCanonical:canonical('core.lifecycle',lifecycle),lifecycleBooted:lifecycle?.booted===true,
    platformShellBridge:typeof RF.Platform?.active?.copyText==='function'&&typeof RF.Platform?.active?.promptText==='function'&&typeof RF.Platform?.active?.alertMessage==='function'&&typeof RF.Platform?.active?.vibrate==='function'&&typeof RF.Platform?.active?.isVisible==='function'&&typeof RF.Platform?.active?.onResume==='function'&&typeof RF.Platform?.active?.fetchBuildInfo==='function'&&typeof RF.Platform?.active?.registerServiceWorker==='function'&&typeof RF.Platform?.active?.onBackNavigation==='function'&&typeof RF.Platform?.active?.pushHistoryState==='function'&&typeof RF.Platform?.active?.replaceHistoryState==='function',
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
/* Realmforge V11.22.0 production finalizer. */
(() => {
  'use strict';
  const RF=window.RF;
  RF.VERSION='11.22.0';
  RF.BUILD={version:'11.22.0',title:'Canonical Encounters & Interface Foundations',built:'19 Sep 2026 • 20:05 BST',buildId:'20260919-v1122-encounters-interface'};
  RF.PRODUCTION_FOUNDATION=RF.PRODUCTION_FOUNDATION||{};
  Object.assign(RF.PRODUCTION_FOUNDATION,{
    phase:16,architecture:'canonical-systems-v11',legacyBaseline:'11.5.3',compatibilityLayer:'js/legacy/compat_gameplay_world_social_trimmed_v1153.js',saveSchema:RF.Core.contract.saveSchema,
    persistenceOwner:'core.campaigns',migrationOwner:'core.migrations',contentOwner:'data.catalog',configOwner:'data.config',
    travelOwner:'systems.travel',questOwner:'systems.quests',wayfinderOwner:'systems.wayfinder',combatOwner:'systems.combat',equipmentOwner:'systems.equipment',inventoryOwner:'systems.inventory',
    researchOwner:'systems.research',craftingOwner:'systems.crafting',skillsOwner:'systems.skills',fieldcraftOwner:'systems.fieldcraft',
    gatheringOwner:'systems.gathering',huntingOwner:'systems.hunting',fishingOwner:'systems.fishing',cookingOwner:'systems.cooking',
    explorationOwner:'systems.exploration',locksOwner:'systems.locks',crimeOwner:'systems.crime',propertyOwner:'systems.property',timeEnergyOwner:'systems.timeEnergy',focusClockOwner:'ui.focusClock',databaseOwner:'ui.database',navigationOwner:'ui.navigation',presentationOwner:'ui.presentation',overlayOwner:'ui.overlays',appShellOwner:'ui.appShell',developerOwner:'ui.developer',platformOwner:'platform.browser',lifecycleOwner:'core.lifecycle',worldOwner:'systems.world',socialOwner:'systems.social',canonicalModules:RF.Modules.list().map(x=>x.name)
  });
  RF.Modules.register('core.finalize',RF.PRODUCTION_FOUNDATION,{owner:'core',status:'canonical'});
})();
