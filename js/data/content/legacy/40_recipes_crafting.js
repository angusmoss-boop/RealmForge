/* Realmforge V11.30.0 — canonical legacy content definitions: recipes crafting. */
(()=>{
'use strict';
const RF=window.RF;
const define=RF.Content.defineLegacyBlock;
define("v2@L24",function(){
Object.assign(RF.DATA.recipes,{
  venison_stew:{name:'Cook Venison Stew',skill:'cooking',level:4,time:13,inputs:{raw_meat:2,herb:1},outputs:{venison_stew:1},xp:52}
});
},{"patch": "js/v2.js", "line": 24, "bytes": 167, "kind": "recipes"});
define("v3@L17",function(){
Object.assign(RF.DATA.recipes,{
  steel_bar:{name:'Smelt Steel Bar',skill:'smithing',level:7,time:12,inputs:{iron_ore:2,coal:2},outputs:{steel_bar:1},xp:58},
  steel_sword:{name:'Forge Steel Longsword',skill:'smithing',level:9,time:19,inputs:{steel_bar:3},outputs:{steel_sword:1},xp:115},
  steel_helm:{name:'Forge Steel Sallet',skill:'smithing',level:10,time:18,inputs:{steel_bar:3},outputs:{steel_helm:1},xp:125},
  smoke_bomb:{name:'Craft Smoke Bomb',skill:'crafting',level:6,time:10,inputs:{coal:1,herb:1},outputs:{smoke_bomb:1},xp:54}
});
},{"patch": "js/v3.js", "line": 17, "bytes": 543, "kind": "recipes"});
define("v5@L56",function(){
RF.DATA.campRecipes = {
  cooked_fish:{ name:'Cook Riverfish', icon:'🍣', level:1, input:'fish', output:'cooked_fish', xp:18, time:7, desc:'Simple hot food.' },
  cooked_meat:{ name:'Roast Meat', icon:'🍖', level:1, input:'raw_meat', output:'cooked_meat', xp:20, time:8, desc:'A proper trail meal.' },
  berry_skewer:{ name:'Warm Berry Skewer', icon:'🍡', level:2, input:'wild_berries', qty:2, output:'berry_skewer', xp:22, time:6, desc:'Quick food over coals.' },
  cooked_trout:{ name:'Roast Trout', icon:'🐟', level:5, input:'trout', output:'cooked_trout', xp:34, time:9, desc:'Restorative river food.' },
  smoked_eel:{ name:'Smoke River Eel', icon:'🥘', level:10, input:'river_eel', output:'smoked_eel', xp:52, time:12, desc:'Rich food with a long trail-life.' },
  charcoal:{ name:'Burn Charcoal', icon:'◼️', level:8, input:'logs', qty:2, output:'charcoal', xp:38, time:12, skill:'firemaking', desc:'Turn timber into concentrated fuel.' }
};
},{"patch": "js/v5.js", "line": 56, "bytes": 961, "kind": "direct"});
define("v7@L50",function(){
Object.assign(RF.DATA.recipes,{
  bronze_bar:{name:'Smelt Bronze Bar',skill:'smithing',level:1,time:8,inputs:{copper_ore:1,tin_ore:1},outputs:{bronze_bar:1},xp:24},
  bronze_sword:{name:'Forge Bronze Sword',skill:'smithing',level:3,time:12,inputs:{bronze_bar:3},outputs:{bronze_sword:1},xp:46},
  bronze_buckler:{name:'Forge Bronze Buckler',skill:'smithing',level:4,time:12,inputs:{bronze_bar:3},outputs:{bronze_buckler:1},xp:50},
  silver_bar:{name:'Refine Silver Bar',skill:'smithing',level:12,time:15,inputs:{silver_ore:2,charcoal:1},outputs:{silver_bar:1},xp:72},
  silvered_blade:{name:'Forge Silvered Blade',skill:'smithing',level:15,time:22,inputs:{steel_bar:2,silver_bar:2,charcoal:1},outputs:{silvered_blade:1},xp:150},
  fen_leathers:{name:'Stitch Fenwalker Leathers',skill:'crafting',level:10,time:18,inputs:{croc_hide:2,waxed_thread:2},outputs:{fen_leathers:1},xp:105},
  marshbow:{name:'Shape Reedwood Longbow',skill:'crafting',level:12,time:19,inputs:{alder_logs:3,waxed_thread:2},outputs:{marshbow:1},xp:125},
  antivenom:{name:'Brew Antivenom',skill:'herblore',level:6,time:12,inputs:{redroot:1,venom_sac:1,herb:1},outputs:{antivenom:1},xp:70},
  focus_draught:{name:'Brew Focus Draught',skill:'herblore',level:10,time:14,inputs:{mooncap:1,herb:2},outputs:{focus_draught:1},xp:95},
  ember_tonic:{name:'Brew Ember Tonic',skill:'herblore',level:16,time:18,inputs:{redroot:1,ember_shard:1,cave_mushroom:1},outputs:{ember_tonic:1},xp:145}
});
},{"patch": "js/v7.js", "line": 50, "bytes": 1455, "kind": "recipes"});
define("v7@L78",function(){
Object.assign(RF.DATA.campRecipes,{
  cooked_pike:{name:'Char Reed Pike',icon:'🐟',level:8,input:'reedfish',output:'cooked_pike',xp:48,time:10,desc:'Firm marsh fish over hot coals.'},
  marsh_stew:{name:'Marsh Stew',icon:'🥣',level:12,input:'reedfish',qty:1,output:'marsh_stew',xp:76,time:14,desc:'A thick trail stew. Requires berries too.',extra:{wild_berries:2}}
});
},{"patch": "js/v7.js", "line": 78, "bytes": 372, "kind": "campRecipes"});
define("v10_27@L29",function(){
RF.DATA.recipes=RF.DATA.recipes||{};
},{"patch": "js/v10_27.js", "line": 29, "bytes": 36, "kind": "direct"});
define("v10_27@L30",function(){
RF.DATA.recipes.iron_lockpicks={name:'Forge Lockpicks',skill:'smithing',level:4,time:10,inputs:{iron_bar:1},outputs:{lockpick:3},xp:44};
},{"patch": "js/v10_27.js", "line": 30, "bytes": 136, "kind": "direct"});
})();
