(() => {
  const RF=window.RF,fail=[],check=(ok,msg)=>{if(!ok)fail.push(msg)};
  check(RF.Core?.contract?.appVersion==='11.13.0','app version');
  check(RF.Core?.contract?.saveSchema==='11.5.3','save schema');
  for(const name of ['combat','equipment','inventory'])check(RF.Modules?.info?.(`systems.${name}`)?.meta?.status==='canonical',`${name} ownership`);
  check(RF.Systems?.Combat?.installedStages?.length===8,'combat stages');
  check(RF.Systems?.Equipment?.installedStages?.length===5,'equipment stages');
  check(RF.Systems?.Inventory?.installedStages?.length===9,'inventory stages');
  check(typeof RF.startBattle==='function'&&typeof RF.battleAbility==='function','combat functions');
  check(typeof RF.equipToSlot==='function'&&typeof RF.unequipSlot==='function','loadout slot functions');
  check(typeof RF.V1056?.isOver==='function'&&typeof RF.packCapacity==='function','encumbrance functions');
  check(RF.PRODUCTION_FOUNDATION?.systemOwnership?.valid===true,'ownership verifier');
  window.RF_TEST_V1113={pass:fail.length===0,fail};
})();
