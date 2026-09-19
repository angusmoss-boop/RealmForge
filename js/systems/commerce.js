(() => {
  'use strict';
  const RF = window.RF;
  const api = {
    openMarket: (...args) => RF.openMarket?.(...args),
    buy: (...args) => RF.buy?.(...args),
    sell: (...args) => RF.sell?.(...args),
    marketDefinition: id => RF.Config?.get('commerce.markets')?.[id] || null,
    marketDefinitions: () => RF.Config?.clone('commerce.markets') || {},
    buyPrice: (...args) => RF.V1054?.buyPrice ? RF.V1054.buyPrice(...args) : null,
    ensureStock: (...args) => RF.V1054?.ensureStock ? RF.V1054.ensureStock(...args) : null,
    bankDefinition: id => RF.Config?.get('services.banks')?.[id] || null,
    bankOpen: (...args) => RF.openBank?.(...args),
    bankDeposit: (...args) => RF.bankDeposit?.(...args),
    bankWithdraw: (...args) => RF.bankWithdraw?.(...args)
  };
  RF.Systems.Commerce = RF.Modules.register('systems.commerce', api, { owner: 'systems', status: 'canonical-facade', delegatesTo: 'legacy-v11.5.3', configOwner:'data.config' });
})();
