(() => {
  const RF=window.RF,fail=[],check=(ok,msg)=>{if(!ok)fail.push(msg)};
  check(RF.Core?.contract?.appVersion==='11.14.0','app version');
  check(RF.Core?.contract?.saveSchema==='11.5.3','save schema');
  for(const name of ['research','crafting','skills'])check(RF.Modules?.info?.(`systems.${name}`)?.meta?.status==='canonical',`${name} ownership`);
  check(RF.Systems?.Research?.installedStages?.length===4,'research stages');
  check(RF.Systems?.Crafting?.installedStages?.length===4,'crafting stages');
  check(RF.Systems?.Skills?.installedStages?.length===2,'skills stages');
  check(typeof RF.researchEnemy==='function'&&typeof RF.refreshEncounters==='function','research functions');
  check(typeof RF.V1028?.craftAnalysis==='function'&&typeof RF.v9StartCraftQty==='function','crafting functions');
  check(typeof RF.effectiveSkillLevel==='function'&&typeof RF.meetsSkillRequirement==='function','skills functions');
  check(RF.PRODUCTION_FOUNDATION?.systemOwnership?.valid===true,'ownership verifier');
  window.RF_TEST_V1114={pass:fail.length===0,fail};
})();
