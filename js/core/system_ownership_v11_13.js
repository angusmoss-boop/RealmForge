/* Realmforge V11.13.0 — canonical system ownership verification. */
(() => {
  'use strict';
  const RF=window.RF;
  const commerce=RF.Systems?.Commerce,dungeons=RF.Systems?.Dungeons,travel=RF.Systems?.Travel,quests=RF.Systems?.Quests,wayfinder=RF.Systems?.Wayfinder;
  const combat=RF.Systems?.Combat,equipment=RF.Systems?.Equipment,inventory=RF.Systems?.Inventory;
  const combatExpected=['js/v8_1.js','js/v10_35.js','js/v10_36.js','js/v10_57.js','js/v10_58.js','js/v10_59.js','js/v10_60.js','js/v11_3_2.js'];
  const equipmentExpected=['js/v10_3.js','js/v10_50.js','js/v10_53.js','js/v10_55.js','js/v11_5.js'];
  const inventoryExpected=['js/v10_42.js','js/v10_43.js','js/v10_44.js','js/v10_45.js','js/v10_46.js','js/v10_47.js','js/v10_51.js','js/v10_52.js','js/v10_56.js'];
  const hasAll=(api,list)=>!!api&&list.every(x=>api.installedStages?.includes(x));
  const checks={
    commerceCanonical:!!commerce&&RF.Modules.info('systems.commerce')?.meta?.status==='canonical',
    commerceInstalled:!!commerce?.installed&&!!RF.V1054?.trade&&!!RF.openMarket,
    dungeonsCanonical:!!dungeons&&RF.Modules.info('systems.dungeons')?.meta?.status==='canonical',
    dungeonsInstalled:!!dungeons?.installed&&!!RF.V1062?.start&&!!RF.V1062?.DUNGEONS,
    travelCanonical:!!travel&&RF.Modules.info('systems.travel')?.meta?.status==='canonical',
    travelInstalled:Array.isArray(travel?.installedStages)&&travel.installedStages.includes('v9-routing')&&travel.installedStages.includes('js/v10_17.js')&&travel.installedStages.includes('js/v10_20.js')&&travel.installedStages.includes('js/v11_2_2.js'),
    routeReady:typeof RF.v9Route==='function'&&typeof RF.V1020?.openRoutePreview==='function'&&typeof RF.V1017?.overlayHtml==='function',
    questsCanonical:!!quests&&RF.Modules.info('systems.quests')?.meta?.status==='canonical',
    questsInstalled:quests?.installed===true&&typeof RF.v93AcceptQuest==='function'&&typeof RF.UI?.quests==='function',
    wayfinderCanonical:!!wayfinder&&RF.Modules.info('systems.wayfinder')?.meta?.status==='canonical',
    wayfinderInstalled:wayfinder?.installed===true&&typeof RF.V1151?.progressHint==='function',
    combatCanonical:!!combat&&RF.Modules.info('systems.combat')?.meta?.status==='canonical',
    combatStages:hasAll(combat,combatExpected),
    combatReady:typeof RF.startBattle==='function'&&typeof RF.battleAbility==='function'&&typeof RF.UI?.combatPopup==='function'&&typeof RF.V1057?.actionCategoryHtml==='function',
    equipmentCanonical:!!equipment&&RF.Modules.info('systems.equipment')?.meta?.status==='canonical',
    equipmentStages:hasAll(equipment,equipmentExpected),
    equipmentReady:typeof RF.equipToSlot==='function'&&typeof RF.unequipSlot==='function'&&typeof RF.equipTool==='function'&&typeof RF.weaponDamage==='function'&&typeof RF.armor==='function',
    inventoryCanonical:!!inventory&&RF.Modules.info('systems.inventory')?.meta?.status==='canonical',
    inventoryStages:hasAll(inventory,inventoryExpected),
    inventoryReady:typeof RF.addItem==='function'&&typeof RF.packCapacity==='function'&&typeof RF.UI?.inventory==='function'&&typeof RF.V1056?.isOver==='function',
    marketCount:Object.keys(RF.V1054?.MARKETS||{}).length,
    dungeonCount:Object.keys(RF.V1062?.DUNGEONS||{}).length
  };
  checks.valid=Object.entries(checks).filter(([k])=>!['marketCount','dungeonCount'].includes(k)).every(([,v])=>!!v)&&checks.marketCount===10&&checks.dungeonCount===8;
  RF.PRODUCTION_FOUNDATION=RF.PRODUCTION_FOUNDATION||{};
  RF.PRODUCTION_FOUNDATION.systemOwnership=checks;
  RF.Modules.register('core.systemOwnership',checks,{owner:'core',status:'canonical'});
})();
