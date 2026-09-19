/* Realmforge V11.15.0 — Canonical Cooking & Camp API. */
(() => {
  'use strict'; const RF=window.RF;
  const api={recipes:()=>RF.DATA?.campRecipes||{},fireActive:s=>!!RF.fireActive?.(s),canCamp:s=>!!RF.canCamp?.(s),open:()=>RF.openCookMenu?.(),cook:id=>RF.cookAtFire?.(id),turn:()=>RF.turnCook?.(),position:g=>RF.cookPosition?.(g),homeAvailable:s=>!!RF.V1024?.homeAvailable?.(s),startHome:id=>RF.V1024?.startHomeCook?.(id),recipeNeeds:r=>RF.V1024?.recipeNeeds?.(r)||{},hasIngredients:(s,r,source='camp')=>RF.V1024?.hasIngredients?.(s,r,source),lightFire:id=>RF.lightFire?.(id),spark:()=>RF.sparkFire?.(),restByFire:()=>RF.restByFire?.(),active:()=>RF.actionGame?.type==='cooking'?RF.actionGame:null};
  RF.Systems.Cooking=RF.Modules.register('systems.cooking',api,{owner:'systems',status:'canonical',foundation:'systems.fieldcraft',includesHistoricalHomeKitchen:true,extractedIn:'11.15.0'});
})();
