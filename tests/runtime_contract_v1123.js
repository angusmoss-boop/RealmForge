(() => {
  const RF=window.RF, fail=[];
  const ok=(cond,msg)=>{if(!cond)fail.push(msg)};
  ok(RF.VERSION==='11.23.0','version');
  ok(RF.Core?.contract?.appVersion==='11.23.0','core app version');
  ok(RF.Core?.contract?.saveSchema==='11.5.3','save schema');
  ok(RF.PRODUCTION_FOUNDATION?.architecture==='canonical-systems-v11','architecture');
  ok(RF.PRODUCTION_FOUNDATION?.systemOwnership?.valid===true,'ownership contract');
  ok(RF.Modules?.info?.('systems.character')?.meta?.status==='canonical','character owner');
  ok(RF.Systems?.Character?.installedFragments?.length===6,'character fragment count');
  ok(typeof RF.perkRank==='function'&&typeof RF.buyPerk==='function'&&typeof RF.UI?.creator==='function','character progression implementation');
  ok(RF.Modules?.info?.('systems.world')?.meta?.status==='canonical','world owner');
  ok(RF.Systems?.World?.installedStages?.includes('js/v2.js'),'v2 world stage');
  ok(RF.Systems?.World?.installedFragments?.includes('v9_2-encounter-ecology'),'v9.2 ecology fragment');
  ok(RF.Modules?.info?.('systems.social')?.meta?.status==='canonical','social owner');
  ok(RF.Systems?.Social?.installedFragments?.length===6,'social fragment count');
  ok(RF.Views?.Presentation?.installedFragments?.includes('v9_1-weather-scene'),'presentation weather fragment');


  ok(RF.Modules?.info?.('systems.encounters')?.meta?.status==='canonical','encounters owner');
  ok(RF.Systems?.Encounters?.installedFragments?.includes('v9_1-inspect-ui')&&RF.Systems?.Encounters?.installedFragments?.includes('v9_1-inspect-bind'),'encounter fragments');
  ok(RF.Modules?.info?.('ui.itemBrowser')?.meta?.status==='canonical','item browser owner');
  ok(RF.Views?.ItemBrowser?.installedFragments?.length===7,'item browser fragments');
  ok(['v3-combat-techniques','v3-combat-win-perks','v3-combat-ui','v8_2-combat-feedback','v8_3-cadence-motion','v9_1-parry-focus','v9_2-defeat-xp','v10-battle-summary'].every(x=>RF.Systems?.Combat?.installedFragments?.includes(x)),'combat ancestry fragments');
  ok(['v3-trailwise-travel','v8_3-travel-repair'].every(x=>RF.Systems?.Travel?.installedFragments?.includes(x)),'travel ancestry fragments');
  ok(['v9_2-crime-modal-ui','v9_2-crime-bind-ui','v9_2-reedmere-crime-ui'].every(x=>RF.Systems?.Crime?.installedFragments?.includes(x)),'crime UI fragments');
  ok(['v9_3-developer-shell','v9_3-developer-actions-bind','v10-dev-energy'].every(x=>RF.Views?.Developer?.installedFragments?.includes(x)),'developer ancestry fragments');
  ok(typeof RF.v91OpenEnemy==='function'&&typeof RF.UI?.nearbyEnemies==='function','encounter inspect implementation');
  ok(typeof RF.v92Category==='function'&&typeof RF.v93Req==='function','item browser implementation');

  ok(RF.Modules?.info?.('ui.appShell')?.meta?.status==='canonical','app shell owner');
  ok(RF.Views?.AppShell?.installedStages?.includes('js/v9_5.js'),'v9.5 app shell stage');
  ok(RF.Views?.AppShell?.installedFragments?.includes('v10_1-app-shell'),'v10.1 front-door fragment');
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
  ok(['v8_2-pack-foundation','v8_2-pack-migration-intake-items','v8_2-bank-actions','v8_2-pack-bank-ui','v8_2-pack-bank-bind','v10_12-pack-ui','v10_12-bank-ui','v10_12-world-bank-stability'].every(x=>RF.Systems?.Inventory?.installedFragments?.includes(x)),'inventory ancestry fragments');
  ok(['v3-bulwark-armor','v3-equipment-ui','v8_2-equipment-foundation','v8_2-equipment-actions'].every(x=>RF.Systems?.Equipment?.installedFragments?.includes(x)),'equipment ancestry fragments');
  ok(['v8_2-mastery-work','v8_2-mastery-ui','v10-instant-harvest'].every(x=>RF.Systems?.Gathering?.installedFragments?.includes(x)),'gathering ancestry fragments');
  ok(['v10-skills-ui','v10_12-skills-crafting-ui'].every(x=>RF.Systems?.Skills?.installedFragments?.includes(x)),'skills ancestry fragments');

  const navIds=(RF.V1038?.items||[]).map(x=>x.id);
  ok(navIds.includes('equipment')&&navIds.includes('toolbelt')&&navIds.includes('magic'),'modern navigation entries');
  ok(!navIds.includes('shop'),'global Shop remains retired');
  ok((RF.V1061?.SECTORS||[]).length===8,'eight database sectors');
  ok(Object.keys(RF.V1062?.DUNGEONS||{}).length===8,'eight dungeons preserved');
  window.RF_TEST_V1123={pass:fail.length===0,fail};
})();
