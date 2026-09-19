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
