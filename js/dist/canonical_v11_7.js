/* Realmforge V11.7.0 — generated canonical production bundle.
   Source modules remain individually readable under js/core, js/platform, js/data, js/systems and js/ui.
   Do not hand-edit this generated file. */

/* ===== SOURCE: js/core/bootstrap.js ===== */
/* Realmforge V11.7.0 — canonical production bootstrap.
   This file owns only architecture namespaces and module registration.
   Gameplay remains supplied by the frozen V11.5.3 compatibility layer until
   individual systems are deliberately migrated behind these contracts. */
window.RF = window.RF || {};
(() => {
  'use strict';
  const RF = window.RF;
  RF.Core = RF.Core || {};
  RF.Systems = RF.Systems || {};
  RF.Platform = RF.Platform || {};
  RF.Catalog = RF.Catalog || {};
  RF.Views = RF.Views || {};
  RF.Assets = RF.Assets || {};
  RF.Modules = RF.Modules || {};

  const registry = RF.Modules.registry instanceof Map ? RF.Modules.registry : new Map();
  RF.Modules.registry = registry;
  RF.Modules.register = function(name, api, meta = {}) {
    if (!name || typeof name !== 'string') throw new Error('Realmforge module name is required.');
    registry.set(name, { name, api, meta: { canonical: true, ...meta } });
    return api;
  };
  RF.Modules.get = name => registry.get(name)?.api;
  RF.Modules.info = name => registry.get(name) || null;
  RF.Modules.list = () => Array.from(registry.values()).map(x => ({ name: x.name, ...x.meta }));

  RF.Core.contract = Object.freeze({
    appVersion: '11.7.0',
    saveSchema: '11.5.3',
    architecture: 'canonical-boundary-v1',
    legacyBaseline: '11.5.3'
  });
  RF.Modules.register('core.bootstrap', RF.Core.contract, { owner: 'core', status: 'canonical' });
})();


/* ===== SOURCE: js/platform/browser.js ===== */
/* Browser/PWA platform adapter. New production code should use RF.Platform
   rather than calling browser globals directly. The legacy compatibility layer
   is intentionally not rewritten in V11.7.0. */
(() => {
  'use strict';
  const RF = window.RF;
  const safeStorage = {
    get(key) { try { return localStorage.getItem(key); } catch { return null; } },
    set(key, value) { try { localStorage.setItem(key, value); return true; } catch { return false; } },
    remove(key) { try { localStorage.removeItem(key); return true; } catch { return false; } }
  };
  const api = {
    kind: 'browser',
    storage: safeStorage,
    now: () => Date.now(),
    online: () => typeof navigator === 'undefined' ? true : navigator.onLine !== false,
    copyText: async text => {
      if (navigator?.clipboard?.writeText) { await navigator.clipboard.writeText(String(text)); return true; }
      return false;
    },
    onVisibilityChange(handler) {
      if (typeof document === 'undefined') return () => {};
      const fn = () => handler(document.visibilityState);
      document.addEventListener('visibilitychange', fn);
      return () => document.removeEventListener('visibilitychange', fn);
    },
    registerServiceWorker(path = './sw.js') {
      if (!('serviceWorker' in navigator) || !location.protocol.startsWith('http')) return Promise.resolve(null);
      return navigator.serviceWorker.register(path);
    }
  };
  RF.Platform.Browser = RF.Modules.register('platform.browser', api, { owner: 'platform', status: 'canonical' });
  RF.Platform.active = RF.Platform.Browser;
})();


/* ===== SOURCE: js/core/state.js ===== */
/* Canonical state/save facade.
   Calls are deliberately late-bound to RF.* so the current stable V11.5.3
   implementations remain authoritative while callers gain one clean API. */
(() => {
  'use strict';
  const RF = window.RF;
  const api = {
    current: () => RF.state || null,
    replace(state) { RF.state = state; return state; },
    newGame: (...args) => RF.newGame(...args),
    save: state => RF.save(state || RF.state),
    load: () => RF.load(),
    export: state => RF.exportSave(state || RF.state),
    import: payload => RF.importSave(payload),
    schema: () => RF.V95?.SCHEMA || RF.Core.contract.saveSchema,
    appVersion: () => RF.VERSION,
    snapshot(state = RF.state) {
      if (!state) return null;
      return JSON.parse(JSON.stringify(state));
    }
  };
  RF.Core.State = RF.Modules.register('core.state', api, { owner: 'core', status: 'canonical-facade', delegatesTo: 'legacy-v11.5.3' });
})();


/* ===== SOURCE: js/core/migrations.js ===== */
/* Canonical migration registry for V12+.
   Historical migration wrappers remain frozen in the compatibility baseline.
   New schema changes should be registered here rather than adding another
   version-patch wrapper around RF.load/newGame/importSave. */
(() => {
  'use strict';
  const RF = window.RF;
  const steps = new Map();
  const api = {
    currentSchema: () => RF.V95?.SCHEMA || RF.Core.contract.saveSchema,
    register(from, to, migrate) {
      if (!from || !to || typeof migrate !== 'function') throw new Error('Invalid migration registration.');
      const key = `${from}->${to}`;
      if (steps.has(key)) throw new Error(`Migration already registered: ${key}`);
      steps.set(key, { from, to, migrate });
      return key;
    },
    list: () => Array.from(steps.values()).map(({ from, to }) => ({ from, to })),
    run(state, from, to) {
      if (!state || from === to) return state;
      let current = from;
      let guard = 0;
      while (current !== to && guard++ < 100) {
        const step = Array.from(steps.values()).find(x => x.from === current);
        if (!step) throw new Error(`No canonical migration path from ${current} to ${to}.`);
        state = step.migrate(state) || state;
        current = step.to;
      }
      if (current !== to) throw new Error(`Migration did not reach ${to}.`);
      return state;
    }
  };
  RF.Core.Migrations = RF.Modules.register('core.migrations', api, { owner: 'core', status: 'canonical', baselineSchema: RF.Core.contract.saveSchema });
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
/* Production Foundation II finalizer. No save-schema migration occurs here. */
(() => {
  'use strict';
  const RF = window.RF;
  RF.VERSION = '11.7.0';
  RF.BUILD = {
    version: '11.7.0',
    title: 'Canonical Architecture',
    built: '19 Sep 2026 • 03:28 BST',
    buildId: '20260919-0328-bst'
  };
  RF.PRODUCTION_FOUNDATION = RF.PRODUCTION_FOUNDATION || {};
  Object.assign(RF.PRODUCTION_FOUNDATION, {
    phase: 2,
    architecture: 'canonical-boundary-v1',
    legacyBaseline: '11.5.3',
    compatibilityLayer: 'js/legacy/compat_v1153.js',
    saveSchema: RF.V95?.SCHEMA || '11.5.3',
    canonicalModules: RF.Modules.list().map(x => x.name)
  });
  RF.Modules.register('core.finalize', RF.PRODUCTION_FOUNDATION, { owner: 'core', status: 'canonical' });
})();

