/* Realmforge V12.6.0 — Canonical Energy Scale.
   Expands character Energy capacity to a 1000-point baseline while preserving activity costs.
   The save migration preserves each existing character's percentage-full Energy state. */
(() => {
  'use strict';
  const RF=window.RF;
  const BASE=1000, PER_LEVEL=20;
  const maxEnergy=level=>{
    level=Math.max(1,Math.min(100,Number(level)||1));
    return BASE+(level-1)*PER_LEVEL;
  };
  function sync(s,preserveGain=true){
    if(!s?.player)return s;
    const next=maxEnergy(s.player.level);
    let oldMax=Math.max(1,Number(s.player.maxEnergy)||next);
    let cur=Number(s.player.energy);if(!Number.isFinite(cur))cur=oldMax;
    if(preserveGain&&next>oldMax)cur+=next-oldMax;
    s.player.maxEnergy=next;
    s.player.energy=Math.max(0,Math.min(next,cur));
    s.v126=s.v126||{};s.v126.energyScale=10;
    return s;
  }
  if(RF.V1022){
    RF.V1022.maxEnergy=maxEnergy;
    RF.V1022.syncEnergyCap=sync;
  }
  // Historical v10.22 normalization calls syncEnergyCap by reference, so replacing it
  // here prevents any future save/load normalization from shrinking V12.6 Energy back
  // to the old 100-point curve.
  const baseNewGame=RF.newGame;
  if(typeof baseNewGame==='function')RF.newGame=function(...args){
    const s=baseNewGame.apply(this,args);if(!s?.player)return s;
    const next=maxEnergy(s.player.level);
    // Fresh campaigns should always begin full. Imported/migrated states are handled by core migration.
    s.player.maxEnergy=next;s.player.energy=next;s.v126=s.v126||{};s.v126.energyScale=10;return s;
  };
  if(RF.state){
    const target=Number(RF.state.v126?.energyMigrationTarget);
    sync(RF.state,false);
    if(Number.isFinite(target))RF.state.player.energy=Math.max(0,Math.min(RF.state.player.maxEnergy,target));
    if(RF.state.v126)delete RF.state.v126.energyMigrationTarget;
  }
  const api={version:'12.6.0',base:BASE,perLevel:PER_LEVEL,maxEnergy,sync,costsPreserved:true};
  RF.Systems.EnergyScale=RF.Modules.register('systems.energyScale',api,{owner:'systems',status:'canonical',persistentScale:10});
})();
