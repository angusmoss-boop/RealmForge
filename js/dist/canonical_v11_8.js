/* Realmforge V11.8.0 — generated canonical post-compatibility bundle. Do not hand-edit. */

/* ===== SOURCE: js/core/save_boot.js ===== */
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


/* ===== SOURCE: js/data/catalog.js ===== */
/* Canonical data access layer. V12 content should register through this layer
   instead of scattering direct Object.assign calls across version patches. */
(() => {
  'use strict';
  const RF = window.RF;
  const table = name => (RF.DATA && RF.DATA[name]) || {};
  const api = {
    table,
    get(type, id) { return table(type)[id] || null; },
    entries(type) { return Object.entries(table(type)); },
    has(type, id) { return Object.prototype.hasOwnProperty.call(table(type), id); },
    register(type, id, value, { replace = false } = {}) {
      RF.DATA = RF.DATA || {};
      RF.DATA[type] = RF.DATA[type] || {};
      if (!replace && Object.prototype.hasOwnProperty.call(RF.DATA[type], id)) throw new Error(`${type}.${id} already exists.`);
      RF.DATA[type][id] = value;
      return value;
    },
    registerMany(type, records, options) {
      Object.entries(records || {}).forEach(([id, value]) => api.register(type, id, value, options));
      return table(type);
    },
    item: id => table('items')[id] || null,
    enemy: id => table('enemies')[id] || null,
    location: id => table('locations')[id] || null,
    skill: id => table('skills')[id] || null,
    quest: id => table('quests')[id] || null,
    recipe: id => table('recipes')[id] || null
  };
  RF.Catalog = RF.Modules.register('data.catalog', api, { owner: 'data', status: 'canonical' });
})();


/* ===== SOURCE: js/systems/inventory.js ===== */
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


/* ===== SOURCE: js/systems/equipment.js ===== */
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


/* ===== SOURCE: js/systems/travel.js ===== */
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


/* ===== SOURCE: js/systems/combat.js ===== */
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


/* ===== SOURCE: js/systems/research.js ===== */
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


/* ===== SOURCE: js/systems/quests.js ===== */
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


/* ===== SOURCE: js/systems/crafting.js ===== */
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


/* ===== SOURCE: js/systems/dungeons.js ===== */
(() => {
  'use strict';
  const RF = window.RF;
  const V = () => RF.V1062 || null;
  const api = {
    legacyNamespace: V,
    open: (...args) => V()?.open ? V().open(...args) : (V()?.openDungeon ? V().openDungeon(...args) : null),
    start: (...args) => V()?.start ? V().start(...args) : (V()?.startDungeon ? V().startDungeon(...args) : null),
    activeRun: state => state?.v1062?.active || null,
    records: state => state?.v1062?.records || {}
  };
  RF.Systems.Dungeons = RF.Modules.register('systems.dungeons', api, { owner: 'systems', status: 'canonical-facade', delegatesTo: 'legacy-v11.0-in-v1062' });
})();


/* ===== SOURCE: js/systems/commerce.js ===== */
(() => {
  'use strict';
  const RF = window.RF;
  const api = {
    openMarket: (...args) => RF.openMarket?.(...args),
    buy: (...args) => RF.buy?.(...args),
    sell: (...args) => RF.sell?.(...args),
    buyPrice: (...args) => RF.V1054?.buyPrice ? RF.V1054.buyPrice(...args) : null,
    ensureStock: (...args) => RF.V1054?.ensureStock ? RF.V1054.ensureStock(...args) : null,
    bankOpen: (...args) => RF.openBank?.(...args),
    bankDeposit: (...args) => RF.bankDeposit?.(...args),
    bankWithdraw: (...args) => RF.bankWithdraw?.(...args)
  };
  RF.Systems.Commerce = RF.Modules.register('systems.commerce', api, { owner: 'systems', status: 'canonical-facade', delegatesTo: 'legacy-v11.5.3' });
})();


/* ===== SOURCE: js/ui/shell.js ===== */
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


/* ===== SOURCE: js/core/finalize.js ===== */
/* Realmforge V11.8.0 production finalizer. */
(() => {
  'use strict';
  const RF=window.RF;
  RF.VERSION='11.8.0';
  RF.BUILD={version:'11.8.0',title:'Canonical Save Core',built:'19 Sep 2026 • 04:18 BST',buildId:'20260919-0418-bst'};
  RF.PRODUCTION_FOUNDATION=RF.PRODUCTION_FOUNDATION||{};
  Object.assign(RF.PRODUCTION_FOUNDATION,{
    phase:3,
    architecture:'canonical-save-core-v2',
    legacyBaseline:'11.5.3',
    compatibilityLayer:'js/legacy/compat_gameplay_v1153.js',
    saveSchema:RF.Core.contract.saveSchema,
    persistenceOwner:'core.campaigns',
    migrationOwner:'core.migrations',
    canonicalModules:RF.Modules.list().map(x=>x.name)
  });
  RF.Modules.register('core.finalize',RF.PRODUCTION_FOUNDATION,{owner:'core',status:'canonical'});
})();

