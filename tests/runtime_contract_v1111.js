(() => {
  const RF=window.RF;
  const fail=[];
  const check=(ok,msg)=>{if(!ok)fail.push(msg);};
  check(RF.Core?.contract?.appVersion==='11.11.0','app version');
  check(RF.Core?.contract?.saveSchema==='11.5.3','save schema');
  check(RF.Modules?.info?.('systems.commerce')?.meta?.status==='canonical','commerce ownership');
  check(RF.Modules?.info?.('systems.dungeons')?.meta?.status==='canonical','dungeon ownership');
  check(RF.Systems?.Commerce?.installed===true,'commerce installed');
  check(RF.Systems?.Dungeons?.installed===true,'dungeons installed');
  check(Object.keys(RF.V1054?.MARKETS||{}).length===10,'10 markets');
  check(Object.keys(RF.V1062?.DUNGEONS||{}).length===8,'8 dungeons');
  check(typeof RF.V1054?.trade==='function','market trade');
  check(typeof RF.V1062?.start==='function','dungeon start');
  check(RF.PRODUCTION_FOUNDATION?.systemOwnership?.valid===true,'ownership verifier');
  window.RF_TEST_V1111={pass:fail.length===0,fail};
})();
