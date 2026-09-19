/* Realmforge V11.15.0 — Canonical Fishing API. */
(() => {
  'use strict'; const RF=window.RF;
  const api={start:key=>RF.startActionGame?.(key),cast:()=>RF.castLine?.(),reel:()=>RF.reelFish?.(),escape:text=>RF.fishEscapes?.(text),reset:()=>RF.endFishingFailure?.(),active:()=>RF.actionGame?.type==='fishing'?RF.actionGame:null,bestRod:s=>RF.bestTool?.(s,'fishing')||null};
  RF.Systems.Fishing=RF.Modules.register('systems.fishing',api,{owner:'systems',status:'canonical',foundation:'systems.fieldcraft',extractedIn:'11.15.0'});
})();
