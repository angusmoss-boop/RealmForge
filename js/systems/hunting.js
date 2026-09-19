/* Realmforge V11.15.0 — Canonical Hunting API. */
(() => {
  'use strict'; const RF=window.RF;
  const api={start:()=>RF.startHunt?.(),track:()=>RF.huntTrack?.(),strike:()=>RF.huntStrike?.(),fail:text=>RF.huntFail?.(text),active:()=>RF.actionGame?.type==='hunt'?RF.actionGame:null};
  RF.Systems.Hunting=RF.Modules.register('systems.hunting',api,{owner:'systems',status:'canonical',foundation:'systems.fieldcraft',extractedIn:'11.15.0'});
})();
