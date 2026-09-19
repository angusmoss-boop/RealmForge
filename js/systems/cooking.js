/* Realmforge V11.16.0 — Canonical Cooking & Camp API. Home-kitchen calls delegate to systems.property. */
(() => {
  'use strict'; const RF=window.RF;
  const api={recipes:()=>RF.DATA?.campRecipes||{},fireActive:s=>!!RF.fireActive?.(s),canCamp:s=>!!RF.canCamp?.(s),open:()=>RF.openCookMenu?.(),cook:id=>RF.cookAtFire?.(id),turn:()=>RF.turnCook?.(),position:g=>RF.cookPosition?.(g),homeAvailable:s=>!!RF.Systems?.Property?.homeAvailable?.(s),startHome:id=>RF.Systems?.Property?.startHomeCooking?.(id),recipeNeeds:r=>RF.Systems?.Property?.recipeNeeds?.(r)||{},hasIngredients:(s,r,source='camp')=>RF.Systems?.Property?.hasIngredients?.(s,r,source),lightFire:id=>RF.lightFire?.(id),spark:()=>RF.sparkFire?.(),restByFire:()=>RF.restByFire?.(),active:()=>RF.actionGame?.type==='cooking'?RF.actionGame:null};
  RF.Systems.Cooking=RF.Modules.register('systems.cooking',api,{owner:'systems',status:'canonical',foundation:'systems.fieldcraft',homeKitchenOwner:'systems.property',extractedIn:'11.15.0',propertySplitIn:'11.16.0'});
})();
