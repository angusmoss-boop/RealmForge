/* Realmforge V11.30.0 — canonical legacy content definitions: locations. */
(()=>{
'use strict';
const RF=window.RF;
const define=RF.Content.defineLegacyBlock;
define("v2@L11",function(){
Object.assign(RF.DATA.locations,{
  mill:{name:'Greenvale Mill',icon:'🌾',region:'Greenvale',desc:'The valley granary, mill and livestock market. Busy by day, eerily still after dusk.',neighbors:{greenvale:9,river:13},actions:['forage','talk'],shop:false},
  watchtower:{name:'Eastwatch Tower',icon:'🗼',region:'Greenvale',desc:'A timber watchtower overlooking the eastern road. Guards track smoke and movement beyond the ridge.',neighbors:{crossroads:18,bandit_camp:24},actions:['talk','explore'],lockedFlag:'eastwatchOpen'},
  deep_mine:{name:'The Deep Galleries',icon:'🕳️',region:'Greenvale',desc:'Old workings beneath Greenvale. Timber groans overhead and cold air rises from shafts no map records.',neighbors:{mine:8},actions:['mine','explore'],lockedFlag:'deepMineFound'}
});
},{"patch": "js/v2.js", "line": 11, "bytes": 790, "kind": "locations"});
define("v2@L16",function(){
RF.DATA.locations.greenvale.neighbors.mill=9;
},{"patch": "js/v2.js", "line": 16, "bytes": 45, "kind": "direct"});
define("v2@L17",function(){
RF.DATA.locations.crossroads.neighbors.watchtower=18;
},{"patch": "js/v2.js", "line": 17, "bytes": 53, "kind": "direct"});
define("v2@L18",function(){
RF.DATA.locations.mine.neighbors.deep_mine=8;
},{"patch": "js/v2.js", "line": 18, "bytes": 45, "kind": "direct"});
define("v3@L23",function(){
Object.assign(RF.DATA.locations,{
  crypt:{name:'Forgotten Crypt',icon:'🪦',region:'Greenvale',desc:'Stone stairs descend beneath the Mossbound Ruins. Cold air carries the smell of wet iron.',neighbors:{ruins:4},actions:['delve','explore'],lockedFlag:'cryptOpened'},
  northroad:{name:'Northwatch Road',icon:'🛤️',region:'The Marches',desc:'The old kingroad climbs beyond Greenvale toward harsher country and darker stone.',neighbors:{watchtower:28,ironridge:42},actions:['wait','explore'],lockedFlag:'northRoadOpen'},
  ironridge:{name:'Ironridge',icon:'🏰',region:'Ironridge',desc:'A fortified mining town cut into black hills. Forges burn through the night.',neighbors:{northroad:42,quarry:16,ember_cave:31},actions:['rest','talk','explore'],shop:true,lockedFlag:'northRoadOpen'},
  quarry:{name:'Redstone Quarry',icon:'🧱',region:'Ironridge',desc:'Terraced stone pits echo with hammers, shouted orders and the occasional landslide.',neighbors:{ironridge:16},actions:['mine','explore'],lockedFlag:'northRoadOpen'},
  ember_cave:{name:'Emberdeep',icon:'🌋',region:'Ironridge',desc:'A volcanic cavern where the rock sweats heat and orange crystal burns in the walls.',neighbors:{ironridge:31},actions:['delve','mine'],lockedFlag:'emberdeepKnown'}
});
},{"patch": "js/v3.js", "line": 23, "bytes": 1263, "kind": "locations"});
define("v3@L30",function(){
RF.DATA.locations.ruins.neighbors.crypt=4;
},{"patch": "js/v3.js", "line": 30, "bytes": 42, "kind": "direct"});
define("v3@L31",function(){
RF.DATA.locations.watchtower.neighbors.northroad=28;
},{"patch": "js/v3.js", "line": 31, "bytes": 52, "kind": "direct"});
define("v4@L22",function(){
Object.assign(RF.DATA.locations,{
  sunmeadow:{name:'Sunmeadow Fields',icon:'🌾',region:'Greenvale',desc:'Long grass, broken drystone walls and old cart tracks. Peaceful at a glance; full of teeth when the wind changes.',neighbors:{greenvale:13,mill:11,crossroads:17},actions:['forage','hunt','explore'],wild:true},
  guildhall:{name:'Wayfarer Hall',icon:'🧭',region:'Greenvale',desc:'A timber guildhall plastered with maps, contracts and trophies from journeys that improved in the telling.',neighbors:{greenvale:6},actions:['talk'],lockedFlag:'wayfarerHallOpen'}
});
},{"patch": "js/v4.js", "line": 22, "bytes": 572, "kind": "locations"});
define("v4@L26",function(){
RF.DATA.locations.greenvale.neighbors.sunmeadow=13;
},{"patch": "js/v4.js", "line": 26, "bytes": 51, "kind": "direct"});
define("v4@L27",function(){
RF.DATA.locations.greenvale.neighbors.guildhall=6;
},{"patch": "js/v4.js", "line": 27, "bytes": 50, "kind": "direct"});
define("v4@L28",function(){
RF.DATA.locations.mill.neighbors.sunmeadow=11;
},{"patch": "js/v4.js", "line": 28, "bytes": 46, "kind": "direct"});
define("v4@L29",function(){
RF.DATA.locations.crossroads.neighbors.sunmeadow=17;
},{"patch": "js/v4.js", "line": 29, "bytes": 52, "kind": "direct"});
define("v7@L83",function(){
Object.assign(RF.DATA.locations,{
  marshroad:{name:'Fenward Causeway',icon:'🪵',region:'Mirefen',desc:'A raised timber road running into silver reeds and black pools. Bells hang from posts every hundred paces.',neighbors:{river:24,reedmere:18,mirewatch:26},actions:['forage','woodcut','mine','hunt','explore'],wild:true},
  reedmere:{name:'Reedmere',icon:'🌫️',region:'Mirefen',desc:'A marsh settlement built on stilts, rope bridges and stubbornness.',neighbors:{marshroad:18,drowned_ruins:22,mirewatch:15},actions:['fish','forage','talk','rest'],shop:true,wild:true},
  drowned_ruins:{name:'Drowned Heron Ruins',icon:'🏛️',region:'Mirefen',desc:'Mudbrick foundations sink into a flooded basin. Stone herons stare from beneath the waterline.',neighbors:{reedmere:22},actions:['forage','fish','explore'],wild:true,lockedSkill:{exploration:8}},
  mirewatch:{name:'Mirewatch Lodge',icon:'🛖',region:'Mirefen',desc:'A ranger lodge where wet cloaks steam beside an iron stove and maps are pinned with fish bones.',neighbors:{marshroad:26,reedmere:15},actions:['talk','rest','hunt'],wild:true}
});
},{"patch": "js/v7.js", "line": 83, "bytes": 1104, "kind": "locations"});
define("v7@L89",function(){
RF.DATA.locations.river.neighbors.marshroad=24;
},{"patch": "js/v7.js", "line": 89, "bytes": 47, "kind": "direct"});
})();
