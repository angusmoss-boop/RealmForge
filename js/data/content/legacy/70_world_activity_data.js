/* Realmforge V11.30.0 — canonical legacy content definitions: world activity data. */
(()=>{
'use strict';
const RF=window.RF;
const define=RF.Content.defineLegacyBlock;
define("v5@L24",function(){
RF.DATA.resourceDefs = {
  copper: { name:'Copper Vein', icon:'🟤', skill:'mining', level:1, item:'copper_ore', xp:18, duration:9, yield:[1,2], max:8, regen:40, desc:'Common, forgiving ore.' },
  tin: { name:'Tin Vein', icon:'⚪', skill:'mining', level:1, item:'tin_ore', xp:19, duration:9, yield:[1,2], max:6, regen:45, desc:'Useful companion metal to copper.' },
  iron: { name:'Iron Seam', icon:'⛏️', skill:'mining', level:4, item:'iron_ore', xp:30, duration:12, yield:[1,2], max:6, regen:65, desc:'Harder rock, better metal.' },
  coal: { name:'Coal Face', icon:'⚫', skill:'mining', level:6, item:'coal', xp:34, duration:13, yield:[1,2], max:5, regen:75, desc:'Fuel for serious smithing.' },
  silver: { name:'Silver Thread', icon:'🌙', skill:'mining', level:12, item:'silver_ore', xp:54, duration:16, yield:[1,1], max:3, regen:120, desc:'Rare bright ore.' },
  ember: { name:'Emberglass Seam', icon:'🔸', skill:'mining', level:18, item:'ember_shard', xp:82, duration:20, yield:[1,1], max:2, regen:180, desc:'Volcanic crystal that hums faintly.' },
  oak: { name:'Oak', icon:'🌳', skill:'woodcutting', level:1, item:'logs', xp:20, duration:10, yield:[1,2], max:9, regen:50, desc:'Reliable timber.' },
  willow: { name:'Willow', icon:'🌿', skill:'woodcutting', level:5, item:'willow_logs', xp:31, duration:12, yield:[1,2], max:7, regen:65, desc:'Fast-growing river timber.' },
  yew: { name:'Ancient Yew', icon:'🌲', skill:'woodcutting', level:14, item:'yew_logs', xp:58, duration:16, yield:[1,1], max:3, regen:150, desc:'Slow-growing and valuable.' },
  riverfish: { name:'Riverfish Shoal', icon:'🐟', skill:'fishing', level:1, item:'fish', xp:20, duration:11, yield:[1,2], max:8, regen:45, desc:'Small common fish.' },
  trout: { name:'Trout Pool', icon:'🎣', skill:'fishing', level:5, item:'trout', xp:32, duration:13, yield:[1,1], max:6, regen:65, desc:'Clear-water trout.' },
  eel: { name:'Deep Eel Hole', icon:'〰️', skill:'fishing', level:11, item:'river_eel', xp:50, duration:16, yield:[1,1], max:3, regen:110, desc:'Best near dusk and dawn.' },
  herb: { name:'Greenleaf Patch', icon:'🌿', skill:'foraging', level:1, item:'herb', xp:14, duration:8, yield:[1,2], max:7, regen:40, desc:'Medicinal greenleaf.' },
  berries: { name:'Berry Thicket', icon:'🫐', skill:'foraging', level:2, item:'wild_berries', xp:17, duration:8, yield:[1,3], max:8, regen:35, desc:'Tart edible berries.' },
  mushroom: { name:'Cave Mushroom Cluster', icon:'🍄', skill:'foraging', level:7, item:'cave_mushroom', xp:30, duration:10, yield:[1,2], max:4, regen:80, desc:'Pale fungi from damp stone.' }
};
},{"patch": "js/v5.js", "line": 24, "bytes": 2622, "kind": "direct"});
define("v5@L42",function(){
RF.DATA.locationResources = {
  mine:['copper','tin','iron','coal'],
  deep_mine:['iron','coal','silver'],
  quarry:['iron','coal','silver'],
  ember_cave:['coal','ember'],
  forest:['oak','willow','yew','herb','berries'],
  river:['riverfish','trout','eel','willow','herb'],
  sunmeadow:['herb','berries','oak'],
  greenvale:['herb','berries'],
  ruins:['herb','mushroom'],
  crypt:['mushroom'],
  crossroads:['berries']
};
},{"patch": "js/v5.js", "line": 42, "bytes": 424, "kind": "direct"});
define("v7@L63",function(){
Object.assign(RF.DATA.resourceDefs,{
  bog_iron:{name:'Bog-Iron Nodule',icon:'🟫',skill:'mining',level:7,item:'bog_iron',xp:38,duration:13,yield:[1,2],max:6,regen:75,desc:'Rust-rich nodules just beneath black water.'},
  alder:{name:'Black Alder',icon:'🌳',skill:'woodcutting',level:7,item:'alder_logs',xp:37,duration:12,yield:[1,2],max:7,regen:70,desc:'Dense marsh timber.'},
  redroot:{name:'Redroot Patch',icon:'🫚',skill:'foraging',level:5,item:'redroot',xp:29,duration:10,yield:[1,2],max:6,regen:65,desc:'Bitter medicinal root.'},
  mooncap:{name:'Mooncap Ring',icon:'🍄',skill:'foraging',level:10,item:'mooncap',xp:48,duration:12,yield:[1,1],max:4,regen:105,desc:'Best found in dim, damp ground.'},
  ghost_orchid:{name:'Ghost Orchid',icon:'🌼',skill:'foraging',level:16,item:'ghost_orchid',xp:78,duration:16,yield:[1,1],max:2,regen:180,desc:'Rare white flowers among drowned stones.'},
  reed_pike:{name:'Reed Pike Pool',icon:'🐟',skill:'fishing',level:8,item:'reedfish',xp:43,duration:14,yield:[1,1],max:6,regen:75,desc:'Aggressive pike lurking beneath reeds.'},
  mire_pearl:{name:'Mire Mussel Bed',icon:'🫧',skill:'fishing',level:15,item:'mire_pearl',xp:68,duration:18,yield:[1,1],max:2,regen:160,desc:'Deep mussels sometimes hold valuable pearls.'}
});
},{"patch": "js/v7.js", "line": 63, "bytes": 1277, "kind": "resourceDefs"});
define("v7@L73",function(){
RF.DATA.locationResources.marshroad=['redroot','alder','bog_iron'];
},{"patch": "js/v7.js", "line": 73, "bytes": 67, "kind": "direct"});
define("v7@L74",function(){
RF.DATA.locationResources.reedmere=['redroot','mooncap','alder','reed_pike','riverfish'];
},{"patch": "js/v7.js", "line": 74, "bytes": 89, "kind": "direct"});
define("v7@L75",function(){
RF.DATA.locationResources.drowned_ruins=['mooncap','ghost_orchid','bog_iron','mire_pearl'];
},{"patch": "js/v7.js", "line": 75, "bytes": 91, "kind": "direct"});
define("v7@L76",function(){
RF.DATA.locationResources.mirewatch=['redroot','berries','reed_pike'];
},{"patch": "js/v7.js", "line": 76, "bytes": 70, "kind": "direct"});
define("v7@L216",function(){
RF.DATA.lockSites={
 ruins_chest:{name:'Collapsed Reliquary',location:'ruins',level:4,desc:'An iron-banded chest wedged beneath fallen stone.',rewards:[['old_bone_dice',1],['silver_ore',1],['gold',28]]},
 deep_cache:{name:'Miner’s Strongbox',location:'deep_mine',level:7,desc:'A sturdy box hidden behind rotten cribbing.',rewards:[['silver_ore',2],['fine_lockpick',1],['gold',55]]},
 fen_coffer:{name:'Drowned Stone Coffer',location:'drowned_ruins',level:10,desc:'A stone coffer with a surprisingly delicate bronze lock.',rewards:[['drowned_coin',2],['marsh_idol',1],['gold',75]]},
 ironridge_safe:{name:'Abandoned Pay Safe',location:'quarry',level:12,desc:'A rusting payroll safe dragged into a side hut.',rewards:[['silver_bar',1],['whetstone',2],['gold',110]]}
};
},{"patch": "js/v7.js", "line": 216, "bytes": 768, "kind": "direct"});
define("v7@L223",function(){
RF.DATA.excavationSites={
 ruins:{name:'Mossbound Dig',level:4,loot:[['old_bone_dice',3],['drowned_coin',2],['silver_ore',1]]},
 sunmeadow:{name:'Old Boundary Mound',level:5,loot:[['old_bone_dice',2],['lucky_charm',1],['traveller_token',2]]},
 drowned_ruins:{name:'Heron Basin Excavation',level:9,loot:[['drowned_coin',4],['marsh_idol',2],['royal_seal',1]]},
 quarry:{name:'Quarry Spoil Search',level:8,loot:[['silver_ore',3],['old_bone_dice',1],['field_manual',1]]}
};
},{"patch": "js/v7.js", "line": 223, "bytes": 469, "kind": "direct"});
define("v7@L230",function(){
RF.DATA.potionExperiments={
  'redroot|venom_sac':'antivenom',
  'herb|mooncap':'focus_draught',
  'cave_mushroom|ember_shard':'ember_tonic',
  'ghost_orchid|mooncap':'night_eye'
};
},{"patch": "js/v7.js", "line": 230, "bytes": 181, "kind": "direct"});
})();
