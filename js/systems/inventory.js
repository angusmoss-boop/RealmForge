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
