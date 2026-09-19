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
