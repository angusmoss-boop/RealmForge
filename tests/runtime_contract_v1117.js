(() => {
  const RF=window.RF, fail=[];
  const ok=(cond,msg)=>{if(!cond)fail.push(msg)};
  ok(RF.VERSION==='11.17.0','version');
  ok(RF.Core?.contract?.appVersion==='11.17.0','core app version');
  ok(RF.Core?.contract?.saveSchema==='11.5.3','save schema');
  ok(RF.Core?.contract?.architecture==='canonical-systems-v11','core architecture');
  ok(RF.PRODUCTION_FOUNDATION?.architecture==='canonical-systems-v11','architecture');
  ok(RF.PRODUCTION_FOUNDATION?.systemOwnership?.valid===true,'ownership contract');

  ok(RF.Modules?.info?.('systems.timeEnergy')?.meta?.status==='canonical','time/energy owner');
  ok(RF.Systems?.TimeEnergy?.installedStages?.length===2,'time/energy stages');
  ['js/v10_22.js','js/v10_23.js'].forEach(x=>ok(RF.Systems?.TimeEnergy?.installedStages?.includes(x),'time/energy stage '+x));
  ['v8-time-controls','v8_3-manual-pause','v10-energy-core','v10_2-world-clock','v10_26-combat-clock'].forEach(x=>ok(RF.Systems?.TimeEnergy?.installedFragments?.includes(x),'time/energy fragment '+x));
  ok(typeof RF.v10SpendEnergy==='function','energy spending implementation');
  ok(RF.V1023?.minutesPerEnergy===3,'energy recovery cadence');
  ok(typeof RF.setSpeed==='function'&&typeof RF.advanceWorld==='function','clock implementation');
  ok(typeof RF.V1026?.captureClock==='function'&&typeof RF.V1026?.restoreClock==='function','combat clock bridge');

  ok(RF.Modules?.info?.('ui.focusClock')?.meta?.status==='canonical','focus clock owner');
  ok(RF.Views?.FocusClock?.installedStages?.includes('js/v9_6.js'),'V9.6 focus-clock stage');
  ok(typeof RF.v96CaptureClock==='function'&&typeof RF.v96ApplyPause==='function'&&typeof RF.v96ReleasePause==='function','modal/select clock implementation');

  ok(RF.Modules?.info?.('systems.gathering')?.meta?.status==='canonical','gathering owner');
  ok(RF.Systems?.Gathering?.installedFragments?.includes('v10_22-continuous-gathering'),'gathering V10.22 fragment');
  ok(RF.Modules?.info?.('systems.crime')?.meta?.status==='canonical','crime owner');
  ok(RF.Systems?.Crime?.installedFragments?.includes('v10_2-pickpocket-feedback'),'crime feedback fragment');
  ok(RF.Systems?.Crime?.installedFragments?.includes('v10_2-pickpocket-ui'),'crime feedback UI fragment');
  ok(typeof RF.v10InnHere==='function','property inn-location helper');

  ok(RF.Modules?.info?.('systems.exploration')?.meta?.status==='canonical','exploration owner');
  ok(RF.Systems?.Exploration?.installedStages?.length===3,'exploration stages preserved');
  ok(RF.Systems?.Exploration?.installedFragments?.includes('v7-excavation'),'excavation fragment preserved');
  ok(typeof RF.V1025?.finishExplore==='function','explore implementation');
  ok(typeof RF.startExcavation==='function'&&typeof RF.excavateTile==='function','excavation implementation');

  ok(RF.Modules?.info?.('systems.travel')?.meta?.status==='canonical','travel owner');
  ok(RF.Systems?.Travel?.installedStages?.includes('js/v11_2_2.js'),'Clock Sentinel remains Travel');
  ok(typeof RF.V1122?.trueBlocker==='function','Clock Sentinel implementation');
  ok(RF.Modules?.info?.('systems.property')?.meta?.status==='canonical','property owner');
  ok(RF.Systems?.Property?.installedStages?.includes('js/v10_24.js'),'property V10.24 preserved');
  ok(typeof RF.restAtHome==='function'&&typeof RF.v10RestUntil==='function','property resting implementation');
  ok(RF.Modules?.info?.('systems.inventory')?.meta?.status==='canonical','inventory owner');
  ok(typeof RF.V1056?.isOver==='function','over-encumbrance owner preserved');
  window.RF_TEST_V1117={pass:fail.length===0,fail};
})();
