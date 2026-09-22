(() => {
  const RF=window.RF, fail=[];
  const ok=(cond,msg)=>{if(!cond)fail.push(msg)};
  ok(RF.VERSION==='12.4.0','version');
  ok(RF.Core?.contract?.appVersion==='12.4.0','core app version');
  ok(RF.Core?.contract?.saveSchema==='11.5.3','save schema');
  ok(RF.PRODUCTION_FOUNDATION?.architecture==='canonical-systems-v12','architecture');
  ok(RF.PRODUCTION_FOUNDATION?.systemOwnership?.valid===true,'ownership contract');
  ok(RF.Modules?.info?.('systems.character')?.meta?.status==='canonical','character owner');
  ok(RF.Systems?.Character?.installedFragments?.length===9,'character fragment count');
  ok(typeof RF.perkRank==='function'&&typeof RF.buyPerk==='function'&&typeof RF.UI?.creator==='function','character progression implementation');

  ok(RF.Modules?.info?.('systems.collection')?.meta?.status==='canonical','collection owner');
  ok(['v4-collection-item-tracking','v4-collection-ui'].every(x=>RF.Systems?.Collection?.installedFragments?.includes(x)),'collection ancestry fragments');
  ok(typeof RF.UI?.collectionPanel==='function','collection presentation implementation');
  ok(RF.Systems?.Character?.installedFragments?.includes('v4-character-shell-ui'),'V4 character shell ancestry');
  ok(RF.Systems?.Property?.installedFragments?.includes('v4-buy-home'),'V4 home purchase ancestry');

  ok(RF.Modules?.info?.('systems.world')?.meta?.status==='canonical','world owner');
  ok(RF.Systems?.World?.installedStages?.includes('js/v2.js'),'v2 world stage');
  ok(['v9_2-encounter-ecology','v7-mirefen-encounter-tables','v7-mirefen-world-reveal'].every(x=>RF.Systems?.World?.installedFragments?.includes(x)),'v9.2 ecology fragment');
  ok(RF.Modules?.info?.('systems.social')?.meta?.status==='canonical','social owner');
  ok(RF.Systems?.Social?.installedFragments?.length===6,'social fragment count');
  ok(RF.Views?.Presentation?.installedFragments?.includes('v9_1-weather-scene'),'presentation weather fragment');


  ok(RF.Modules?.info?.('systems.encounters')?.meta?.status==='canonical','encounters owner');
  ok(RF.Systems?.Encounters?.installedFragments?.includes('v9_1-inspect-ui')&&RF.Systems?.Encounters?.installedFragments?.includes('v9_1-inspect-bind'),'encounter fragments');
  ok(RF.Modules?.info?.('ui.itemBrowser')?.meta?.status==='canonical','item browser owner');
  ok(RF.Views?.ItemBrowser?.installedFragments?.length===9,'item browser fragments');
  ok(['v3-combat-techniques','v3-combat-win-perks','v3-combat-ui','v8_2-combat-feedback','v8_3-cadence-motion','v9_1-parry-focus','v9_2-defeat-xp','v10-battle-summary','v7-research-combat','v9-combat-focus-core','v9-combat-focus-ui','v4-combat-move-pools','v4-tactical-combat-core','v4-tactical-combat-ui'].every(x=>RF.Systems?.Combat?.installedFragments?.includes(x)),'combat ancestry fragments');
  ok(['v3-trailwise-travel','v8_3-travel-repair','v7-mirefen-travel-gate','v7-marsh-sidequest-travel'].every(x=>RF.Systems?.Travel?.installedFragments?.includes(x)),'travel ancestry fragments');
  ok(['v9_2-crime-modal-ui','v9_2-crime-bind-ui','v9_2-reedmere-crime-ui','v7-pickpocket-timing','v9-dynamic-pickpocket','v9-pickpocket-resume','v10_1-pickpocket-repair'].every(x=>RF.Systems?.Crime?.installedFragments?.includes(x)),'crime UI fragments');
  ok(['v9_3-developer-shell','v9_3-developer-actions-bind','v10-dev-energy'].every(x=>RF.Views?.Developer?.installedFragments?.includes(x)),'developer ancestry fragments');
  ok(typeof RF.v91OpenEnemy==='function'&&typeof RF.UI?.nearbyEnemies==='function','encounter inspect implementation');
  ok(typeof RF.v92Category==='function'&&typeof RF.v93Req==='function','item browser implementation');

  ok(RF.Modules?.info?.('ui.appShell')?.meta?.status==='canonical','app shell owner');
  ok(RF.Views?.AppShell?.installedStages?.includes('js/v9_5.js'),'v9.5 app shell stage');
  ok(['v10_1-app-shell','v10_11-campaign-state-guard'].every(x=>RF.Views?.AppShell?.installedFragments?.includes(x)),'app shell fragments');
  ok(typeof RF.V101?.renderMainMenu==='function'&&typeof RF.UI?.options==='function','app shell implementation');

  ok(RF.Modules?.info?.('ui.developer')?.meta?.status==='canonical','developer owner');
  ok(RF.Views?.Developer?.installedStages?.includes('js/v10_33.js'),'v10.33 developer stage');
  ok(typeof RF.V1033?.checkRemoteBuild==='function'&&typeof RF.V1033?.playerAction==='function'&&typeof RF.UI?.dev==='function','developer implementation');
  ok(RF.V1033?.__v1119PlatformBuildProbe===true,'platform-backed build probe installed');
  ok(RF.Modules?.info?.('core.lifecycle')?.meta?.status==='canonical','lifecycle owner');
  ok(RF.Core?.Lifecycle?.booted===true,'lifecycle boot installed');

  const p=RF.Platform?.active;
  ['copyText','promptText','alertMessage','vibrate','isVisible','onResume','fetchBuildInfo','registerServiceWorker','onBackNavigation','pushHistoryState','replaceHistoryState'].forEach(k=>ok(typeof p?.[k]==='function','platform bridge '+k));

  ok(RF.Modules?.info?.('ui.database')?.meta?.status==='canonical','database owner preserved');
  ok(RF.Views?.Database?.modernVersion==='12.3.0'&&RF.PRODUCTION_FOUNDATION?.systemOwnership?.databaseModern===true,'V12.2 Living Codex final presentation owner');
  ok(RF.Modules?.info?.('ui.itemDetail')?.meta?.status==='canonical','pack item dossier owner');
  ok(RF.Views?.ItemDetail?.version==='12.4.0'&&typeof RF.Views?.ItemDetail?.detailHtml==='function','V12.4 Pack Dossier presentation owner');
  ok(RF.Modules?.info?.('ui.navigation')?.meta?.status==='canonical','navigation owner preserved');
  ok(RF.Modules?.info?.('ui.presentation')?.meta?.status==='canonical','presentation owner preserved');
  ok(RF.Modules?.info?.('ui.overlays')?.meta?.status==='canonical','overlay owner preserved');
  ok(RF.Modules?.info?.('ui.focusClock')?.meta?.status==='canonical','focus clock owner preserved');
  ok(RF.Modules?.info?.('systems.timeEnergy')?.meta?.status==='canonical','time/energy owner preserved');
  ok(RF.Systems?.Travel?.installedStages?.includes('js/v11_2_2.js'),'Clock Sentinel remains Travel');
  ok(RF.Modules?.info?.('systems.property')?.meta?.status==='canonical','property owner preserved');
  ok(RF.Modules?.info?.('systems.inventory')?.meta?.status==='canonical','inventory owner preserved');
  ok(RF.Modules?.info?.('systems.equipment')?.meta?.status==='canonical','equipment owner preserved');
  ok(RF.Systems?.Inventory?.installedStages?.includes('js/v10_10.js'),'V10.10 inventory stage');
  ok(['v8_2-pack-foundation','v8_2-pack-migration-intake-items','v8_2-bank-actions','v8_2-pack-bank-ui','v8_2-pack-bank-bind','v10_12-pack-ui','v10_12-bank-ui','v10_12-world-bank-stability','v7-antivenom','v10_9-split-vault'].every(x=>RF.Systems?.Inventory?.installedFragments?.includes(x)),'inventory ancestry fragments');
  ok(['v3-bulwark-armor','v3-equipment-ui','v8_2-equipment-foundation','v8_2-equipment-actions'].every(x=>RF.Systems?.Equipment?.installedFragments?.includes(x)),'equipment ancestry fragments');
  ok(['v8_2-mastery-work','v8_2-mastery-ui','v10-instant-harvest','v10_1-repaired-gathering'].every(x=>RF.Systems?.Gathering?.installedFragments?.includes(x)),'gathering ancestry fragments');
  ok(['v10-skills-ui','v10_12-skills-crafting-ui'].every(x=>RF.Systems?.Skills?.installedFragments?.includes(x)),'skills ancestry fragments');

  ok(RF.Modules?.info?.('systems.specialist')?.meta?.status==='canonical','specialist owner');
  ok(['v7-specialist-core','v7-potion-experiment'].every(x=>RF.Systems?.Specialist?.installedFragments?.includes(x)),'specialist fragments');
  ok(RF.Modules?.info?.('ui.worldActions')?.meta?.status==='canonical','world actions owner');
  ok(['v7-world-context-modal-ui','v7-action-bind-ui','v9-action-modal-ui','v9-action-bind-ui','v10_21-decision-reliability','v3-perk-crime-bind-bridge'].every(x=>RF.Views?.WorldActions?.installedFragments?.includes(x)),'world action fragments');
  ok(RF.Systems?.Locks?.installedFragments?.includes('v7-lockpicking'),'v7 locks ancestry');
  ok(['v7-smithing-heat','v9-batch-crafting'].every(x=>RF.Systems?.Crafting?.installedFragments?.includes(x)),'crafting action ancestry');
  ok(RF.Systems?.Research?.installedFragments?.includes('v7-bestiary-research'),'bestiary research ancestry');
  ok(RF.Systems?.Commerce?.installedFragments?.includes('v9-quantity-trade'),'quantity commerce ancestry');
  ok(RF.Views?.ItemBrowser?.installedFragments?.includes('v9-quantity-detail-ui'),'quantity detail ancestry');
  ok(typeof RF.v7Resume==='function'&&typeof RF.startPotionLab==='function'&&typeof RF.v7ContextPanel==='function','world action/specialist implementation');


  ok(RF.Systems?.Inventory?.installedFragments?.includes('v10_9-split-vault')&&typeof RF.V109==='object','split vault canonical bridge');
  ok(RF.Views?.WorldActions?.installedFragments?.includes('v10_21-decision-reliability')&&typeof RF.V1021==='object','decision reliability canonical bridge');
  ok(RF.Views?.Presentation?.installedFragments?.includes('v10_11-layout-style')&&RF.Views?.Presentation?.installedFragments?.includes('v10_2-skills-crime-style'),'presentation residual fragments');
  ok(RF.Views?.ItemBrowser?.installedFragments?.includes('v10_11-category-ordering')&&typeof RF.V1011?.organizeLists==='function','category ordering canonical bridge');
  ok(RF.Views?.Overlays?.installedFragments?.length===3&&['v10-modal-style','v10-milestone-modal-renderer','v10-modal-bindings'].every(x=>RF.Views?.Overlays?.installedFragments?.includes(x)),'overlay residual fragments');
  ok(RF.Systems?.Fieldcraft?.installedFragments?.includes('v10_2-campfire-duration'),'campfire duration canonical bridge');
  ok(RF.Systems?.Character?.installedFragments?.includes('v10_2-character-skills-grid'),'character skills grid canonical bridge');
  ok(RF.Systems?.Commerce?.installedFragments?.includes('v3-ironridge-market-ui'),'Ironridge market canonical bridge');
  ok(RF.Systems?.Dungeons?.installedFragments?.includes('v3-delve-action-bridge'),'Delve action canonical bridge');
  ok(typeof RF.workTap==='function'&&typeof RF.v9Vigilance==='function'&&typeof RF.startPickpocket==='function'&&typeof RF.lightFire==='function','residual runtime implementations');

  const navIds=(RF.V1038?.items||[]).map(x=>x.id);
  ok(navIds.includes('equipment')&&navIds.includes('toolbelt')&&navIds.includes('magic'),'modern navigation entries');
  ok(!navIds.includes('shop'),'global Shop remains retired');
  ok((RF.V1061?.SECTORS||[]).length===8,'eight database sectors');
  ok(Object.keys(RF.V1062?.DUNGEONS||{}).length===8,'eight dungeons preserved');
  ok(RF.Modules?.info?.('systems.cadence')?.meta?.status==='canonical','cadence owner');
  ok(['v8-runtime-config','v8-action-cadence'].every(x=>RF.Systems?.Cadence?.installedFragments?.includes(x)),'cadence fragments');
  ok(RF.Systems?.WorldEvents?.installedFragments?.includes('v8-road-interruptions'),'V8 road events canonical');
  ok(RF.Systems?.Travel?.installedFragments?.includes('v8-travel-activity-ui'),'V8 travel UI canonical');
  ok(['v8-cooldown-ui','v8-touch-render'].every(x=>RF.Views?.Presentation?.installedFragments?.includes(x)),'V8 presentation fragments');
  ok(RF.Systems?.TimeEnergy?.installedFragments?.includes('v8-speed-rebind'),'V8 speed rebind canonical');
  ok(RF.Views?.Presentation?.installedStages?.includes('js/v10_13.js'),'V10.13 presentation stage');
  ok(RF.Systems?.Inventory?.installedStages?.includes('js/v10_14.js'),'V10.14 inventory stage');
  ok(RF.Modules?.info?.('core.scopedRuntime')?.meta?.status==='canonical','scoped runtime owner');
  ok(RF.Core?.ScopedRuntime?.installedStages?.includes('js/v10_7.js'),'V10.7 scoped stage');
  ok(['v3','v4','v7','v8','v8_3','v9','v9_1','v9_2','v9_3','v10','v10_2'].every(x=>RF.Core?.Migrations?.installedDefinitions?.includes(x)),'migration definitions canonical');
  ok(RF.Modules?.info?.('data.authoring')?.meta?.status==='canonical','content authoring owner');
  ok(RF.Authoring?.report?.().valid===true,'content authoring validation');
  ok(RF.PRODUCTION_FOUNDATION?.contentCore?.authoringReady===true&&RF.PRODUCTION_FOUNDATION?.contentCore?.authoringValid===true,'content core authoring readiness');
  ok(RF.PRODUCTION_FOUNDATION?.configCore?.authoringValidator===true&&RF.PRODUCTION_FOUNDATION?.configCore?.valid===true,'config authoring validation');
  ok(RF.Modules?.info?.('core.compatibilityClassification')?.meta?.status==='canonical','compatibility classification owner');
  const classSummary=RF.Core?.CompatibilityClassification?.summary?.()||{};
  ok(classSummary.total===93&&classSummary.canonical_chronology_bridge===80&&classSummary.save_migration_bridge===12&&classSummary.mixed_historical_runtime===1&&classSummary.retireable_obsolete===0,'compatibility classification summary');
  ok(RF.Core?.CompatibilityClassification?.forPatch?.('js/v3.js')?.category==='mixed_historical_runtime','V3 mixed residual classification');
  ok(RF.Core?.CompatibilityClassification?.forPatch?.('js/v10_7.js')?.tags?.includes('scope-capsule'),'V10.7 scope capsule classification');
  ok(RF.Modules?.info?.('ui.saveManager')?.meta?.status==='canonical','save manager owner');
  ok(typeof RF.Core?.State?.packBackup==='function'&&typeof RF.Core?.State?.importText==='function','save transfer API');
  ok(typeof p?.saveTextFile==='function'&&typeof p?.pickTextFile==='function','platform file transfer seam');
  window.RF_TEST_V1240={pass:fail.length===0,fail};
})();
