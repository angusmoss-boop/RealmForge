/* Realmforge V11.11.0 — Canonical Runtime Facades + Verification */

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

//# sourceURL=realmforge:///js/core/save_boot.js

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

//# sourceURL=realmforge:///js/data/finalize.js

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

//# sourceURL=realmforge:///js/data/config_finalize.js

/* ===== js/systems/inventory.js ===== */
(() => {
  'use strict';
  const RF = window.RF;
  const api = {
    quantity: (state, id) => Math.max(0, Number(state?.inventory?.[id]) || 0),
    add: (state, id, qty = 1) => RF.addItem(state, id, qty),
    take: (state, id, qty = 1) => RF.takeItem(state, id, qty),
    has: (state, req) => RF.hasItems(state, req),
    capacity: state => typeof RF.packCapacity === 'function' ? RF.packCapacity(state) : Infinity,
    free: state => typeof RF.packFree === 'function' ? RF.packFree(state) : Infinity,
    drop: (id, all = false) => typeof RF.dropItem === 'function' ? RF.dropItem(id, all) : false,
    use: id => RF.useItem(id),
    openItem: id => typeof RF.openItem === 'function' ? RF.openItem(id) : null
  };
  RF.Systems.Inventory = RF.Modules.register('systems.inventory', api, { owner: 'systems', status: 'canonical-facade', delegatesTo: 'legacy-v11.5.3' });
})();

//# sourceURL=realmforge:///js/systems/inventory.js

/* ===== js/systems/equipment.js ===== */
(() => {
  'use strict';
  const RF = window.RF;
  const api = {
    damageOutput: state => RF.weaponDamage(state),
    armour: state => RF.armor(state),
    canEquip: (state, id) => typeof RF.canEquipItem === 'function' ? RF.canEquipItem(state, id) : true,
    equip: id => RF.equip(id),
    equipToSlot: (id, slot) => typeof RF.equipToSlot === 'function' ? RF.equipToSlot(id, slot) : RF.equip(id),
    unequipSlot: slot => typeof RF.unequipSlot === 'function' ? RF.unequipSlot(slot) : false,
    equipTool: id => typeof RF.equipTool === 'function' ? RF.equipTool(id) : false,
    unequipTool: type => typeof RF.unequipToolSlot === 'function' ? RF.unequipToolSlot(type) : (typeof RF.unequipTool === 'function' ? RF.unequipTool(type) : false),
    slotsFor: item => typeof RF.equipmentSlotsForItem === 'function' ? RF.equipmentSlotsForItem(item) : (item?.slot ? [item.slot] : [])
  };
  RF.Systems.Equipment = RF.Modules.register('systems.equipment', api, { owner: 'systems', status: 'canonical-facade', delegatesTo: 'legacy-v11.5.3' });
})();

//# sourceURL=realmforge:///js/systems/equipment.js

/* ===== js/systems/travel.js ===== */
(() => {
  'use strict';
  const RF = window.RF;
  const api = {
    start: id => RF.travel(id),
    finish: activity => RF.finishTravel(activity),
    setSpeed: speed => typeof RF.setSpeed === 'function' ? RF.setSpeed(speed) : null,
    repair: state => typeof RF.repairTravelIfStalled === 'function' ? RF.repairTravelIfStalled(state) : state,
    route: (state, from, to) => RF.V1020?.route ? RF.V1020.route(state, from, to) : null,
    preview: id => RF.V1020?.openRoutePreview ? RF.V1020.openRoutePreview(id) : null,
    beginRoute: (...args) => RF.V1020?.beginRoute ? RF.V1020.beginRoute(...args) : null,
    clearPlan: state => RF.V1020?.clearPlan ? RF.V1020.clearPlan(state) : null
  };
  RF.Systems.Travel = RF.Modules.register('systems.travel', api, { owner: 'systems', status: 'canonical-facade', delegatesTo: 'legacy-v11.5.3' });
})();

//# sourceURL=realmforge:///js/systems/travel.js

/* ===== js/systems/combat.js ===== */
(() => {
  'use strict';
  const RF = window.RF;
  const api = {
    start: (...args) => typeof RF.startBattle === 'function' ? RF.startBattle(...args) : RF.spawnEnemy(...args),
    spawn: id => RF.spawnEnemy(id),
    action: action => RF.combatAction(action),
    ability: (...args) => typeof RF.battleAbility === 'function' ? RF.battleAbility(...args) : null,
    enemyTurn: () => RF.enemyBattleTurn ? RF.enemyBattleTurn() : RF.enemyTurn(),
    win: () => RF.winCombat(),
    flee: () => typeof RF.fleeV4 === 'function' ? RF.fleeV4() : RF.combatAction('flee'),
    useItem: id => typeof RF.useBattleItem === 'function' ? RF.useBattleItem(id) : RF.useItem(id),
    damageOutput: state => RF.weaponDamage(state),
    armour: state => RF.armor(state)
  };
  RF.Systems.Combat = RF.Modules.register('systems.combat', api, { owner: 'systems', status: 'canonical-facade', delegatesTo: 'legacy-v11.5.3' });
})();

//# sourceURL=realmforge:///js/systems/combat.js

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

//# sourceURL=realmforge:///js/systems/research.js

/* ===== js/systems/quests.js ===== */
(() => {
  'use strict';
  const RF = window.RF;
  const api = {
    check: state => RF.questCheck(state),
    accept: id => typeof RF.v93AcceptQuest === 'function' ? RF.v93AcceptQuest(id) : null,
    abandon: id => typeof RF.v93AbandonQuest === 'function' ? RF.v93AbandonQuest(id) : null,
    visible: (state, id) => typeof RF.v93OfferVisible === 'function' ? RF.v93OfferVisible(state, id) : true,
    requirementText: (...args) => typeof RF.v93Req === 'function' ? RF.v93Req(...args) : '',
    wayfinderHint: (state, id) => RF.V1151?.progressHint ? RF.V1151.progressHint(state, id) : null
  };
  RF.Systems.Quests = RF.Modules.register('systems.quests', api, { owner: 'systems', status: 'canonical-facade', delegatesTo: 'legacy-v11.5.3' });
})();

//# sourceURL=realmforge:///js/systems/quests.js

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

//# sourceURL=realmforge:///js/systems/crafting.js

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

//# sourceURL=realmforge:///js/ui/shell.js

/* ===== js/core/system_ownership_v11_11.js ===== */
/* Realmforge V11.11.0 — canonical system ownership verification. */
(() => {
  'use strict';
  const RF=window.RF;
  const commerce=RF.Systems?.Commerce,dungeons=RF.Systems?.Dungeons;
  const checks={
    commerceCanonical:!!commerce&&RF.Modules.info('systems.commerce')?.meta?.status==='canonical',
    commerceInstalled:!!commerce?.installed&&!!RF.V1054?.trade&&!!RF.openMarket,
    dungeonsCanonical:!!dungeons&&RF.Modules.info('systems.dungeons')?.meta?.status==='canonical',
    dungeonsInstalled:!!dungeons?.installed&&!!RF.V1062?.start&&!!RF.V1062?.DUNGEONS,
    marketCount:Object.keys(RF.V1054?.MARKETS||{}).length,
    dungeonCount:Object.keys(RF.V1062?.DUNGEONS||{}).length
  };
  checks.valid=checks.commerceCanonical&&checks.commerceInstalled&&checks.dungeonsCanonical&&checks.dungeonsInstalled&&checks.marketCount===10&&checks.dungeonCount===8;
  RF.PRODUCTION_FOUNDATION=RF.PRODUCTION_FOUNDATION||{};
  RF.PRODUCTION_FOUNDATION.systemOwnership=checks;
  RF.Modules.register('core.systemOwnership',checks,{owner:'core',status:'canonical'});
})();

//# sourceURL=realmforge:///js/core/system_ownership_v11_11.js

/* ===== js/core/finalize.js ===== */
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

//# sourceURL=realmforge:///js/core/finalize.js
