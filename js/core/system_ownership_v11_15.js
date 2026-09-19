/* Realmforge V11.15.0 — canonical system ownership verification. */
(() => {
  'use strict';
  const RF=window.RF;
  const commerce=RF.Systems?.Commerce,dungeons=RF.Systems?.Dungeons,travel=RF.Systems?.Travel,quests=RF.Systems?.Quests,wayfinder=RF.Systems?.Wayfinder;
  const combat=RF.Systems?.Combat,equipment=RF.Systems?.Equipment,inventory=RF.Systems?.Inventory,research=RF.Systems?.Research,crafting=RF.Systems?.Crafting,skills=RF.Systems?.Skills;
  const fieldcraft=RF.Systems?.Fieldcraft,gathering=RF.Systems?.Gathering,hunting=RF.Systems?.Hunting,fishing=RF.Systems?.Fishing,cooking=RF.Systems?.Cooking;
  const expected={
    combat:["js/v8_1.js", "js/v10_35.js", "js/v10_36.js", "js/v10_57.js", "js/v10_58.js", "js/v10_59.js", "js/v10_60.js", "js/v11_3_2.js"],
    equipment:["js/v10_3.js", "js/v10_50.js", "js/v10_53.js", "js/v10_55.js", "js/v11_5.js"],
    inventory:["js/v10_42.js", "js/v10_43.js", "js/v10_44.js", "js/v10_45.js", "js/v10_46.js", "js/v10_47.js", "js/v10_51.js", "js/v10_52.js", "js/v10_56.js"],
    research:["js/v10_48.js", "js/v10_49.js", "js/v11_5_2.js", "js/v11_5_3.js"],crafting:["js/v10_15.js", "js/v10_18.js", "js/v10_19.js", "js/v10_28.js"],skills:["js/v10_37.js", "js/v11_2.js"],
    fieldcraft:["js/v5.js","js/v6.js","js/v10_24.js"],fieldcraftFragments:["v7-rare-skilling","v7-marsh-cooking","v7-camp-extras"]
  };
  const hasAll=(api,list)=>!!api&&list.every(x=>api.installedStages?.includes(x));
  const checks={
    commerceCanonical:!!commerce&&RF.Modules.info('systems.commerce')?.meta?.status==='canonical',commerceInstalled:!!commerce?.installed&&!!RF.V1054?.trade&&!!RF.openMarket,
    dungeonsCanonical:!!dungeons&&RF.Modules.info('systems.dungeons')?.meta?.status==='canonical',dungeonsInstalled:!!dungeons?.installed&&!!RF.V1062?.start&&!!RF.V1062?.DUNGEONS,
    travelCanonical:!!travel&&RF.Modules.info('systems.travel')?.meta?.status==='canonical',travelInstalled:Array.isArray(travel?.installedStages)&&travel.installedStages.includes('v9-routing')&&travel.installedStages.includes('js/v10_17.js')&&travel.installedStages.includes('js/v10_20.js')&&travel.installedStages.includes('js/v11_2_2.js'),
    questsCanonical:!!quests&&RF.Modules.info('systems.quests')?.meta?.status==='canonical',questsInstalled:quests?.installed===true&&typeof RF.v93AcceptQuest==='function'&&typeof RF.UI?.quests==='function',
    wayfinderCanonical:!!wayfinder&&RF.Modules.info('systems.wayfinder')?.meta?.status==='canonical',wayfinderInstalled:wayfinder?.installed===true&&typeof RF.V1151?.progressHint==='function',
    combatCanonical:!!combat&&RF.Modules.info('systems.combat')?.meta?.status==='canonical',combatStages:hasAll(combat,expected.combat),
    equipmentCanonical:!!equipment&&RF.Modules.info('systems.equipment')?.meta?.status==='canonical',equipmentStages:hasAll(equipment,expected.equipment),
    inventoryCanonical:!!inventory&&RF.Modules.info('systems.inventory')?.meta?.status==='canonical',inventoryStages:hasAll(inventory,expected.inventory),
    researchCanonical:!!research&&RF.Modules.info('systems.research')?.meta?.status==='canonical',researchStages:hasAll(research,expected.research),researchReady:typeof RF.researchEnemy==='function'&&typeof RF.refreshEncounters==='function'&&typeof RF.V1152?.profile==='function'&&typeof RF.V1153?.uniqueNearby==='function',
    craftingCanonical:!!crafting&&RF.Modules.info('systems.crafting')?.meta?.status==='canonical',craftingStages:hasAll(crafting,expected.crafting),craftingReady:typeof RF.v9StartCraftQty==='function'&&typeof RF.V1028?.craftAnalysis==='function'&&typeof RF.productionTap==='function'&&typeof RF.hammerForge==='function',
    skillsCanonical:!!skills&&RF.Modules.info('systems.skills')?.meta?.status==='canonical',skillsStages:hasAll(skills,expected.skills),skillsReady:typeof RF.effectiveSkillLevel==='function'&&typeof RF.meetsSkillRequirement==='function'&&typeof RF.normalizeSkillRequirements==='function'&&typeof RF.UI?.skills==='function',
    fieldcraftCanonical:!!fieldcraft&&RF.Modules.info('systems.fieldcraft')?.meta?.status==='canonical',fieldcraftStages:hasAll(fieldcraft,expected.fieldcraft),fieldcraftFragments:expected.fieldcraftFragments.every(x=>fieldcraft?.installedFragments?.includes(x)),
    gatheringCanonical:!!gathering&&RF.Modules.info('systems.gathering')?.meta?.status==='canonical',gatheringReady:typeof RF.resourceState==='function'&&typeof RF.resourcesHere==='function'&&typeof RF.startGather==='function'&&typeof RF.workTap==='function'&&typeof RF.finishActiveGather==='function',
    huntingCanonical:!!hunting&&RF.Modules.info('systems.hunting')?.meta?.status==='canonical',huntingReady:typeof RF.startHunt==='function'&&typeof RF.huntTrack==='function'&&typeof RF.huntStrike==='function'&&typeof RF.huntFail==='function',
    fishingCanonical:!!fishing&&RF.Modules.info('systems.fishing')?.meta?.status==='canonical',fishingReady:typeof RF.castLine==='function'&&typeof RF.reelFish==='function'&&typeof RF.fishEscapes==='function',
    cookingCanonical:!!cooking&&RF.Modules.info('systems.cooking')?.meta?.status==='canonical',cookingReady:typeof RF.cookAtFire==='function'&&typeof RF.turnCook==='function'&&typeof RF.V1024?.startHomeCook==='function'&&typeof RF.V1024?.hasIngredients==='function',
    marketCount:Object.keys(RF.V1054?.MARKETS||{}).length,dungeonCount:Object.keys(RF.V1062?.DUNGEONS||{}).length
  };
  checks.valid=Object.entries(checks).filter(([k])=>!['marketCount','dungeonCount'].includes(k)).every(([,v])=>!!v)&&checks.marketCount===10&&checks.dungeonCount===8;
  RF.PRODUCTION_FOUNDATION=RF.PRODUCTION_FOUNDATION||{};RF.PRODUCTION_FOUNDATION.systemOwnership=checks;RF.Modules.register('core.systemOwnership',checks,{owner:'core',status:'canonical'});
})();
