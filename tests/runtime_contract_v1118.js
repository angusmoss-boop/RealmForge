(() => {
  const RF=window.RF, fail=[];
  const ok=(cond,msg)=>{if(!cond)fail.push(msg)};
  ok(RF.VERSION==='11.18.0','version');
  ok(RF.Core?.contract?.appVersion==='11.18.0','core app version');
  ok(RF.Core?.contract?.saveSchema==='11.5.3','save schema');
  ok(RF.Core?.contract?.architecture==='canonical-systems-v11','core architecture');
  ok(RF.PRODUCTION_FOUNDATION?.architecture==='canonical-systems-v11','architecture');
  ok(RF.PRODUCTION_FOUNDATION?.systemOwnership?.valid===true,'ownership contract');

  ok(RF.Modules?.info?.('ui.database')?.meta?.status==='canonical','database owner');
  ['js/v9_4.js','js/v10_61.js','js/v11_1.js','js/v11_3.js'].forEach(x=>ok(RF.Views?.Database?.installedStages?.includes(x),'database stage '+x));
  ok(typeof RF.UI?.database==='function'&&typeof RF.v94DetailHtml==='function','database implementation');
  ok(typeof RF.V1061?.entries==='function'&&typeof RF.V111?.facilities==='function'&&typeof RF.V113?.dungeonEntries==='function','database enrichments');

  ok(RF.Modules?.info?.('ui.navigation')?.meta?.status==='canonical','navigation owner');
  ok(RF.Views?.Navigation?.installedStages?.includes('js/v10_38.js'),'navigation stage');
  ok(typeof RF.UI?.nav==='function'&&Array.isArray(RF.V1038?.items),'navigation implementation');

  ok(RF.Modules?.info?.('ui.presentation')?.meta?.status==='canonical','presentation owner');
  ['js/v10_39.js','js/v10_40.js','js/v10_41.js','js/v11_3_1.js'].forEach(x=>ok(RF.Views?.Presentation?.installedStages?.includes(x),'presentation stage '+x));
  ok(typeof RF.V1039?.scene==='function'&&typeof RF.V1039?.replaceScene==='function','vista implementation');
  ok(!!RF.V1040&&!!RF.V1041&&!!RF.V1131,'presentation enrichments');

  ok(RF.Modules?.info?.('ui.overlays')?.meta?.status==='canonical','overlay owner');
  ['js/v11_2_1.js','js/v11_2_3.js'].forEach(x=>ok(RF.Views?.Overlays?.installedStages?.includes(x),'overlay stage '+x));
  ok(typeof RF.V1121?.sync==='function'&&typeof RF.V1123?.normaliseCloseButtons==='function','overlay implementation');

  ok(RF.Modules?.info?.('systems.timeEnergy')?.meta?.status==='canonical','time/energy owner preserved');
  ok(RF.Systems?.Travel?.installedStages?.includes('js/v11_2_2.js'),'Clock Sentinel remains Travel');
  ok(RF.Modules?.info?.('systems.property')?.meta?.status==='canonical','property owner preserved');
  ok(RF.Modules?.info?.('systems.inventory')?.meta?.status==='canonical','inventory owner preserved');
  ok(RF.Modules?.info?.('systems.combat')?.meta?.status==='canonical','combat owner preserved');
  ok(RF.Modules?.info?.('systems.equipment')?.meta?.status==='canonical','equipment owner preserved');

  const navIds=(RF.V1038?.items||[]).map(x=>x.id);
  ok(navIds.includes('equipment')&&navIds.includes('toolbelt')&&navIds.includes('magic'),'modern navigation entries');
  ok(!navIds.includes('shop'),'global Shop remains retired');
  ok((RF.V1061?.SECTORS||[]).length===8,'eight database sectors');
  ok(Object.keys(RF.V1062?.DUNGEONS||{}).length===8,'eight dungeons preserved');
  window.RF_TEST_V1118={pass:fail.length===0,fail};
})();
