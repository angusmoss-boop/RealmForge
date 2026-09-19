(() => {
  const RF=window.RF,fail=[],check=(ok,msg)=>{if(!ok)fail.push(msg)};
  check(RF.Core?.contract?.appVersion==='11.15.0','app version');
  check(RF.Core?.contract?.saveSchema==='11.5.3','save schema');
  for(const name of ['fieldcraft','gathering','hunting','fishing','cooking'])check(RF.Modules?.info?.(`systems.${name}`)?.meta?.status==='canonical',`${name} ownership`);
  check(RF.Systems?.Fieldcraft?.installedStages?.length===3,'fieldcraft stages');
  check(RF.Systems?.Fieldcraft?.installedFragments?.length===3,'fieldcraft fragments');
  check(['js/v5.js','js/v6.js','js/v10_24.js'].every(x=>RF.Systems?.Fieldcraft?.installedStages?.includes(x)),'fieldcraft stage names');
  check(['v7-rare-skilling','v7-marsh-cooking','v7-camp-extras'].every(x=>RF.Systems?.Fieldcraft?.installedFragments?.includes(x)),'fieldcraft fragment names');
  check(typeof RF.resourceState==='function'&&typeof RF.resourcesHere==='function'&&typeof RF.startGather==='function'&&typeof RF.workTap==='function','gathering functions');
  check(typeof RF.startHunt==='function'&&typeof RF.huntTrack==='function'&&typeof RF.huntStrike==='function','hunting functions');
  check(typeof RF.castLine==='function'&&typeof RF.reelFish==='function'&&typeof RF.fishEscapes==='function','fishing functions');
  check(typeof RF.cookAtFire==='function'&&typeof RF.turnCook==='function'&&typeof RF.V1024?.startHomeCook==='function','cooking functions');
  check(RF.PRODUCTION_FOUNDATION?.systemOwnership?.valid===true,'ownership verifier');
  window.RF_TEST_V1115={pass:fail.length===0,fail};
})();
