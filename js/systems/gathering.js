/* Realmforge V11.15.0 — Canonical Gathering API. */
(() => {
  'use strict'; const RF=window.RF;
  const api={definitions:()=>RF.DATA?.resourceDefs||{},locations:()=>RF.DATA?.locationResources||{},state:(s,key)=>RF.resourceState?.(s,key)||null,here:s=>RF.resourcesHere?.(s)||[],open:skill=>RF.openResourceMenu?.(skill),start:key=>RF.startGather?.(key),tap:()=>RF.workTap?.(),finish:g=>RF.finishActiveGather?.(g),bestTool:(s,skill)=>RF.bestTool?.(s,skill)||null,rareFind:(s,skill)=>RF.v7RareSkillFind?.(s,skill)||null,active:()=>RF.actionGame?.type==='work'?RF.actionGame:null};
  RF.Systems.Gathering=RF.Modules.register('systems.gathering',api,{owner:'systems',status:'canonical',foundation:'systems.fieldcraft',extractedIn:'11.15.0'});
})();
