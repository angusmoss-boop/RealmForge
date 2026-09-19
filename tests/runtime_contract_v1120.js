(() => {
  const RF=window.RF, fail=[];
  const ok=(cond,msg)=>{if(!cond)fail.push(msg)};
  ok(RF.VERSION==='11.20.0','version');
  ok(RF.Core?.contract?.appVersion==='11.20.0','core app version');
  ok(RF.Core?.contract?.saveSchema==='11.5.3','save schema');
  ok(RF.PRODUCTION_FOUNDATION?.architecture==='canonical-systems-v11','architecture');
  ok(RF.PRODUCTION_FOUNDATION?.systemOwnership?.valid===true,'ownership contract');

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

  const navIds=(RF.V1038?.items||[]).map(x=>x.id);
  ok(navIds.includes('equipment')&&navIds.includes('toolbelt')&&navIds.includes('magic'),'modern navigation entries');
  ok(!navIds.includes('shop'),'global Shop remains retired');
  ok((RF.V1061?.SECTORS||[]).length===8,'eight database sectors');
  ok(Object.keys(RF.V1062?.DUNGEONS||{}).length===8,'eight dungeons preserved');
  window.RF_TEST_V1120={pass:fail.length===0,fail};
})();
