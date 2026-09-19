/* Realmforge V11.14.0 — Canonical Data & Config Core */

/* ===== js/data/catalog.js ===== */
/* Realmforge V11.10.0 — canonical content catalog. Future V12 content registers here. */
(() => {
  'use strict';
  const RF=window.RF;
  const table=name => (RF.DATA && RF.DATA[name]) || {};
  const hasOwn=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
  const api={
    table,
    get(type,id){return table(type)[id]??null;},
    entries(type){return Object.entries(table(type));},
    values(type){return Object.values(table(type));},
    ids(type){return Object.keys(table(type));},
    count(type){const v=table(type);return Array.isArray(v)?v.length:Object.keys(v).length;},
    has(type,id){return hasOwn(table(type),id);},
    register(type,id,value,{replace=false}={}){
      RF.DATA=RF.DATA||{}; RF.DATA[type]=RF.DATA[type]||{};
      if(Array.isArray(RF.DATA[type])) throw new Error(`Use append() for array catalog ${type}.`);
      if(!replace&&hasOwn(RF.DATA[type],id))throw new Error(`${type}.${id} already exists.`);
      RF.DATA[type][id]=value; return value;
    },
    registerMany(type,records,options){Object.entries(records||{}).forEach(([id,v])=>api.register(type,id,v,options));return table(type);},
    append(type,...records){RF.DATA=RF.DATA||{};RF.DATA[type]=RF.DATA[type]||[];if(!Array.isArray(RF.DATA[type]))throw new Error(`${type} is not an array catalog.`);RF.DATA[type].push(...records);return RF.DATA[type];},
    item:id=>table('items')[id]||null, enemy:id=>table('enemies')[id]||null, location:id=>table('locations')[id]||null,
    skill:id=>table('skills')[id]||null, quest:id=>table('quests')[id]||null, recipe:id=>table('recipes')[id]||null,
    summary(){const out={};for(const k of Object.keys(RF.DATA||{})){const v=RF.DATA[k];out[k]=Array.isArray(v)?v.length:(v&&typeof v==='object'?Object.keys(v).length:0);}return out;},
    validate(){
      const issues=[]; const items=table('items'),locs=table('locations'),enemies=table('enemies'),recipes=table('recipes');
      for(const [id,e] of Object.entries(enemies))for(const d of (e.drops||[])){if(d?.[0]&&!items[d[0]])issues.push(`enemy ${id} drops missing item ${d[0]}`);}
      for(const [id,r] of Object.entries(recipes)){for(const x of Object.keys(r.inputs||{}))if(!items[x])issues.push(`recipe ${id} needs missing item ${x}`);for(const x of Object.keys(r.outputs||{}))if(!items[x])issues.push(`recipe ${id} outputs missing item ${x}`);}
      for(const [id,l] of Object.entries(locs))for(const n of Object.keys(l.neighbors||{}))if(!locs[n])issues.push(`location ${id} links missing location ${n}`);
      return issues;
    }
  };
  RF.Catalog=RF.Modules.register('data.catalog',api,{owner:'data',status:'canonical'});
})();

/* ===== js/data/content_blocks_v11_9.js ===== */
/* Realmforge V11.9.0 — Canonical historical content definitions.
   Extracted from the old patch runtime. Definitions are invoked at their original
   execution points by the trimmed compatibility layer, preserving ordering while
   moving content ownership into js/data. */
window.RF=window.RF||{};
(()=>{
'use strict';
const RF=window.RF;
RF.Content=RF.Content||{};
const blocks=new Map();
const applied=[];
const define=(id,fn,meta)=>{if(blocks.has(id))throw new Error(`Duplicate content block: ${id}`);blocks.set(id,{fn,meta});};
const api=RF.Content;
api.defineLegacyBlock=define;
api.applyLegacyBlock=function(id){const b=blocks.get(id);if(!b)throw new Error(`Missing canonical content block: ${id}`);b.fn();applied.push(id);return true;};
api.legacyBlocks=()=>Array.from(blocks.entries()).map(([id,b])=>({id,...b.meta}));
api.appliedLegacyBlocks=()=>applied.slice();
api.expectedLegacyBlocks=87;
define("v2@L3",function(){
Object.assign(RF.DATA.items,{
  silver_ore:{name:'Silver Ore',icon:'◻️',type:'material',value:18,desc:'Bright ore prized by smiths and occultists.'},
  wolf_fang:{name:'Wolf Fang',icon:'🦷',type:'material',value:11,desc:'Used by hunters and charm-makers.'},
  venison_stew:{name:'Venison Stew',icon:'🥘',type:'food',value:24,desc:'Restores 42 health.',heal:42},
  blackthorn_blade:{name:'Blackthorn Blade',icon:'🗡️',type:'weapon',value:190,damage:13,slot:'main',desc:'+13 melee damage. A cruel, well-balanced sword.'},
  ranger_cloak:{name:'Ranger Cloak',icon:'🧥',type:'armor',value:145,armor:5,slot:'chest',desc:'+5 armour. Weathered but remarkably light.'},
  strange_key:{name:'Black Iron Key',icon:'🔑',type:'quest',value:0,desc:'Warm to the touch despite the cold metal.'}
});
},{"patch": "js/v2.js", "line": 3, "bytes": 799, "kind": "items"});
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
define("v2@L19",function(){
Object.assign(RF.DATA.enemies,{
  cave_spider:{name:'Cave Spider',icon:'🕷️',hp:65,damage:[5,12],armor:1,xp:78,gold:[0,4],drops:[['herb',.25,1],['silver_ore',.18,1]],level:6},
  blackthorn_scout:{name:'Blackthorn Scout',icon:'🏹',hp:72,damage:[6,13],armor:2,xp:92,gold:[10,24],drops:[['arrow',.8,8],['bandit_token',.7,1],['ranger_cloak',.04,1]],level:7},
  captain_voss:{name:'Captain Voss',icon:'👹',hp:175,damage:[10,20],armor:6,xp:360,gold:[65,110],drops:[['blackthorn_blade',1,1],['strange_key',1,1]],level:12}
});
},{"patch": "js/v2.js", "line": 19, "bytes": 526, "kind": "enemies"});
define("v2@L24",function(){
Object.assign(RF.DATA.recipes,{
  venison_stew:{name:'Cook Venison Stew',skill:'cooking',level:4,time:13,inputs:{raw_meat:2,herb:1},outputs:{venison_stew:1},xp:52}
});
},{"patch": "js/v2.js", "line": 24, "bytes": 167, "kind": "recipes"});
define("v2@L27",function(){
RF.DATA.npcs={
  oren:{name:'Oren Vale',icon:'🧔',job:'Merchant',home:'greenvale',schedule:[['greenvale',6,9],['crossroads',9,16],['greenvale',16,24]],condition:s=>s.flags.savedMerchant&&!s.flags.orenMissing,rumours:['Road trade is recovering, slowly.','Blackthorn men have started asking about a map.']},
  mira:{name:'Mira Fen',icon:'👩‍🌾',job:'Miller',home:'mill',schedule:[['mill',5,18],['greenvale',18,21],['mill',21,24]],rumours:['Flour prices jump whenever the east road closes.','Something keeps worrying the sheep after midnight.']},
  halden:{name:'Sergeant Halden',icon:'🛡️',job:'Watch Sergeant',home:'greenvale',schedule:[['watchtower',6,18],['greenvale',18,24]],condition:s=>s.flags.eastwatchOpen,rumours:['Voss is no common roadside thief.','The watch pays for reliable information, not tavern smoke.']},
  elira:{name:'Elira Moss',icon:'🧙‍♀️',job:'Herbalist',home:'greenvale',schedule:[['forest',7,12],['greenvale',12,19],['greenvale',19,24]],rumours:['Fog changes what grows in Whisperwood.','Never brew silver dust with Greenleaf unless you enjoy seeing tomorrow twice.']},
  brann:{name:'Brann Coalhand',icon:'👨‍🏭',job:'Miner',home:'greenvale',schedule:[['mine',6,17],['greenvale',17,22],['greenvale',22,24]],rumours:['There are fresh scratches below the old third gallery.','The deepest tunnels were sealed before my grandfather was born.']}
};
},{"patch": "js/v2.js", "line": 27, "bytes": 1394, "kind": "direct"});
define("v2@L34",function(){
RF.DATA.factions={greenvale:{name:'Greenvale',icon:'🌿'},watch:{name:'Eastwatch',icon:'🛡️'},blackthorn:{name:'Blackthorn',icon:'🗡️'},merchants:{name:'Vale Traders',icon:'🪙'}};
},{"patch": "js/v2.js", "line": 34, "bytes": 190, "kind": "direct"});
define("v2@L35",function(){
RF.DATA.v2events=[
 {id:'grain_shortage',title:'The Empty Grain Carts',icon:'🌾',once:true,locations:['greenvale','mill'],weight:5,text:'Mira Fen argues with two farmers beside half-empty grain carts. A bridge on the southern road has washed out, and Greenvale may be short of flour for days.',choices:[
   {text:'Help organise rationing',sub:'Speech 3 helps.',result:s=>{s.world.market.food=(s.world.market.food||1)+.22;s.reputation.greenvale=(s.reputation.greenvale||0)+4;RF.addXp(s,'speech',26);s.flags.grainRationing=true;return 'You spend an hour turning panic into lists and promises. Food prices rise, but Greenvale avoids a stampede at the store.';}},
   {text:'Buy grain before everyone else',condition:s=>s.gold>=20,result:s=>{s.gold-=20;RF.addItem(s,'bread',6);s.world.market.food=(s.world.market.food||1)+.35;s.reputation.greenvale=(s.reputation.greenvale||0)-2;s.flags.hoardedGrain=true;return 'You secure a sack before the shelves empty. People notice.';}},
   {text:'Ignore it',result:s=>{s.world.market.food=(s.world.market.food||1)+.4;return 'By evening, bread has become noticeably more expensive.';}}
 ]},
 {id:'night_howl',title:'Howls Beyond the Mill',icon:'🌕',once:true,locations:['mill','greenvale'],weight:5,condition:s=>RF.hour(s)>=20||RF.hour(s)<5,text:'A shepherd bursts into the road shouting that something has scattered the flock near the mill.',choices:[
   {text:'Go with the shepherd',result:s=>{s.flags.nightHuntStarted=true;RF.UI.modal={type:'chain',title:'Tracks in the Mud',icon:'🐾',text:'Beyond the fence you find wolf tracks, and among them a boot print wrapped in black cloth.',choices:[{text:'Follow the wolf tracks',result:ss=>{RF.addXp(ss,'hunting',35);setTimeout(()=>RF.spawnEnemy('wolf'),50);return 'You follow the tracks into the dark. A grey shape lunges from the hedge.';}},{text:'Follow the boot print',result:ss=>{ss.flags.blackthornMillClue=true;ss.flags.eastwatchOpen=true;RF.addXp(ss,'exploration',30);return 'The trail leads east. Someone from Blackthorn has been deliberately cutting fences.';}}]};return null;}},
   {text:'Stay out of it',result:s=>'You hear distant barking until well after midnight.'}
 ]},
 {id:'tax_collector',title:'The Royal Collector',icon:'📜',once:true,locations:['greenvale'],weight:4,text:'A royal tax collector has arrived with two guards and a ledger thick enough to stop an arrow. Local traders are furious.',choices:[
   {text:'Support the traders',result:s=>{s.reputation.merchants=(s.reputation.merchants||0)+5;s.reputation.watch=(s.reputation.watch||0)-1;s.world.market.general=(s.world.market.general||1)-.06;return 'You lend your voice to the traders. The collector trims several fees rather than risk a market strike.';}},
   {text:'Help the collector audit stalls',result:s=>{s.gold+=28;s.reputation.merchants=(s.reputation.merchants||0)-5;s.reputation.watch=(s.reputation.watch||0)+3;RF.addXp(s,'trading',24);return 'Several merchants receive fines. The crown pays you 28 gold for your useful eyes.';}},
   {text:'Pickpocket the collector',condition:s=>s.skills.thieving.level>=2,result:s=>{if(Math.random()<.65){s.gold+=45;RF.addXp(s,'thieving',40);return 'Forty-five royal coins vanish into your pocket.';}s.reputation.watch=(s.reputation.watch||0)-6;s.flags.wanted=true;return 'A guard catches your wrist. You escape the square, but Eastwatch now has your description.';}}
 ]},
 {id:'deep_knocking',title:'Knocking Below',icon:'⛏️',once:true,locations:['deep_mine'],weight:9,text:'Three slow knocks sound from behind a collapsed gallery wall. Then three more. The miners insist nobody is working beyond it.',choices:[
   {text:'Dig toward the sound',result:s=>{s.flags.deepKnockingOpened=true;RF.addXp(s,'mining',65);RF.addItem(s,'silver_ore',2);return 'You widen a gap just enough to see worked stone beyond the natural rock. Something metallic glints in the dust.';}},
   {text:'Mark the wall and leave',result:s=>{s.flags.deepKnockingMarked=true;RF.addXp(s,'exploration',30);return 'You scratch a warning into the support beam. The knocking stops immediately.';}}
 ]}
];
},{"patch": "js/v2.js", "line": 35, "bytes": 4085, "kind": "direct"});
define("v2@L55",function(){
RF.DATA.events.push(...RF.DATA.v2events);
},{"patch": "js/v2.js", "line": 55, "bytes": 41, "kind": "direct"});
define("v2@L56",function(){
RF.DATA.quests.blackthorn.next='eastwatch_rising';
},{"patch": "js/v2.js", "line": 56, "bytes": 50, "kind": "direct"});
define("v2@L57",function(){
RF.DATA.quests.eastwatch_rising={name:'Eastwatch Rising',desc:'Blackthorn is more organised than Greenvale believed. Find who commands them.',objectives:[{type:'flag',target:'eastwatchOpen',text:'Gain access to Eastwatch Tower'},{type:'flag',target:'vossRevealed',text:'Learn the name of the Blackthorn commander'},{type:'kill',target:'captain_voss',value:1,text:'Defeat Captain Voss'}],reward:{gold:320,xp:520,item:'blackthorn_blade'}};
},{"patch": "js/v2.js", "line": 57, "bytes": 437, "kind": "direct"});
define("v3@L4",function(){
Object.assign(RF.DATA.items,{
  steel_bar:{name:'Steel Bar',icon:'▰',type:'material',value:38,rarity:'Uncommon',desc:'A hard carbon-rich bar for serious equipment.'},
  steel_sword:{name:'Steel Longsword',icon:'🗡️',type:'weapon',value:210,damage:15,slot:'main',rarity:'Uncommon',desc:'+15 melee damage. Reliable Ironridge steel.'},
  steel_helm:{name:'Steel Sallet',icon:'🪖',type:'armor',value:175,armor:7,slot:'head',rarity:'Uncommon',desc:'+7 armour.'},
  steel_cuirass:{name:'Steel Cuirass',icon:'🛡️',type:'armor',value:290,armor:11,slot:'chest',rarity:'Rare',desc:'+11 armour. Heavy, dependable plate.'},
  ash_ring:{name:'Ashglass Ring',icon:'💍',type:'armor',value:360,armor:2,slot:'ring1',rarity:'Epic',desc:'+2 armour and an uncanny warmth.'},
  warden_blade:{name:'Gravewarden Blade',icon:'⚔️',type:'weapon',value:520,damage:20,slot:'main',rarity:'Epic',desc:'+20 melee damage. Pale runes wake near the dead.'},
  crypt_sigil:{name:'Crypt Sigil',icon:'🔘',type:'quest',value:0,rarity:'Rare',desc:'A stone seal engraved with a crown split in two.'},
  ember_shard:{name:'Ember Shard',icon:'🔶',type:'material',value:42,rarity:'Rare',desc:'A hot mineral fragment from beneath Ironridge.'},
  smoke_bomb:{name:'Smoke Bomb',icon:'💨',type:'utility',value:55,rarity:'Uncommon',desc:'Useful for criminals and tactical retreats.'},
  master_lockpick:{name:'Fine Lockpick',icon:'🗝️',type:'utility',value:38,rarity:'Uncommon',desc:'A finely sprung pick. Improves risky theft attempts.'}
});
},{"patch": "js/v3.js", "line": 4, "bytes": 1522, "kind": "items"});
define("v3@L16",function(){
RF.DATA.shopStock.push('steel_sword');
},{"patch": "js/v3.js", "line": 16, "bytes": 38, "kind": "direct"});
define("v3@L17",function(){
Object.assign(RF.DATA.recipes,{
  steel_bar:{name:'Smelt Steel Bar',skill:'smithing',level:7,time:12,inputs:{iron_ore:2,coal:2},outputs:{steel_bar:1},xp:58},
  steel_sword:{name:'Forge Steel Longsword',skill:'smithing',level:9,time:19,inputs:{steel_bar:3},outputs:{steel_sword:1},xp:115},
  steel_helm:{name:'Forge Steel Sallet',skill:'smithing',level:10,time:18,inputs:{steel_bar:3},outputs:{steel_helm:1},xp:125},
  smoke_bomb:{name:'Craft Smoke Bomb',skill:'crafting',level:6,time:10,inputs:{coal:1,herb:1},outputs:{smoke_bomb:1},xp:54}
});
},{"patch": "js/v3.js", "line": 17, "bytes": 543, "kind": "recipes"});
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
define("v3@L32",function(){
Object.assign(RF.DATA.enemies,{
  skeleton:{name:'Crypt Skeleton',icon:'💀',hp:82,damage:[7,14],armor:3,xp:105,gold:[4,12],drops:[['crypt_sigil',.08,1],['silver_ore',.14,1]],level:8},
  crypt_guard:{name:'Hollow Knight',icon:'🛡️',hp:128,damage:[9,18],armor:7,xp:190,gold:[16,35],drops:[['steel_bar',.24,1],['crypt_sigil',.22,1]],level:11},
  gravewarden:{name:'The Gravewarden',icon:'👑',hp:260,damage:[13,24],armor:9,xp:620,gold:[90,145],drops:[['warden_blade',1,1],['ash_ring',.4,1],['crypt_sigil',1,1]],level:16},
  ridge_raider:{name:'Ridge Raider',icon:'🪓',hp:104,damage:[9,17],armor:5,xp:145,gold:[18,38],drops:[['steel_bar',.12,1],['bread',.25,1]],level:10},
  magma_crawler:{name:'Magma Crawler',icon:'🦎',hp:150,damage:[11,21],armor:6,xp:215,gold:[2,8],drops:[['ember_shard',.62,1]],level:13}
});
},{"patch": "js/v3.js", "line": 32, "bytes": 819, "kind": "enemies"});
define("v3@L39",function(){
RF.DATA.factions.ironridge={name:'Ironridge',icon:'⛰️'};
},{"patch": "js/v3.js", "line": 39, "bytes": 60, "kind": "direct"});
define("v3@L40",function(){
RF.DATA.factions.underworld={name:'Underworld',icon:'🕶️'};
},{"patch": "js/v3.js", "line": 40, "bytes": 63, "kind": "direct"});
define("v3@L41",function(){
Object.assign(RF.DATA.npcs,{
  kael:{name:'Kael Marr',icon:'🧔‍♂️',job:'Forge Marshal',home:'ironridge',schedule:[['ironridge',5,20],['ironridge',20,24]],condition:s=>s.flags.northRoadOpen,rumours:['Steel is easy. Good steel is a lifelong argument with fire.','Emberdeep is closed for a reason, which naturally means fools keep entering it.']},
  nyra:{name:'Nyra Quickhand',icon:'🕶️',job:'Fixer',home:'ironridge',schedule:[['ironridge',18,24],['ironridge',0,3]],condition:s=>s.flags.northRoadOpen,rumours:['A clean reputation is just a criminal record nobody has found yet.','Eastwatch pays poorly. Other people pay creatively.']}
});
},{"patch": "js/v3.js", "line": 41, "bytes": 648, "kind": "npcs"});
define("v3@L46",function(){
RF.DATA.perks={
  ironblood:{name:'Ironblood',icon:'🩸',tree:'Warrior',max:3,desc:'Increase maximum health by 8 per rank.'},
  brutal_training:{name:'Brutal Training',icon:'⚔️',tree:'Warrior',max:2,desc:'Power Strike deals more damage and costs less stamina.',requires:['ironblood']},
  bulwark:{name:'Bulwark',icon:'🛡️',tree:'Warrior',max:2,desc:'Gain +2 effective armour per rank.'},
  trailwise:{name:'Trailwise',icon:'🧭',tree:'Ranger',max:3,desc:'Travel is 5% faster per rank.'},
  scavenger:{name:'Scavenger',icon:'🎒',tree:'Ranger',max:3,desc:'Improves enemy drop chances and gathering bonuses.'},
  silver_tongue:{name:'Silver Tongue',icon:'🗣️',tree:'Influence',max:3,desc:'Better shop prices and selected event outcomes.'},
  guild_favour:{name:'Guild Favour',icon:'🤝',tree:'Influence',max:2,desc:'Positive reputation gains are increased.'},
  light_fingers:{name:'Light Fingers',icon:'🫳',tree:'Shadow',max:3,desc:'Improves theft success and reduces bounty gained.'},
  vanish:{name:'Vanish',icon:'💨',tree:'Shadow',max:1,desc:'Smoke Bombs guarantee escape from normal enemies.',requires:['light_fingers']},
  craftsman:{name:'Craftsman',icon:'🔨',tree:'Artisan',max:3,desc:'Gain 12% more production XP per rank.'},
  prospector:{name:'Prospector',icon:'💎',tree:'Artisan',max:2,desc:'Chance to find bonus valuable ore.'}
};
},{"patch": "js/v3.js", "line": 46, "bytes": 1365, "kind": "direct"});
define("v3@L60",function(){
RF.DATA.quests.eastwatch_rising.next='road_to_ironridge';
},{"patch": "js/v3.js", "line": 60, "bytes": 57, "kind": "direct"});
define("v3@L61",function(){
RF.DATA.quests.road_to_ironridge={name:'Road to Ironridge',desc:'Blackthorn has fractured, but Voss carried orders bearing a northern seal.',objectives:[{type:'flag',target:'northRoadOpen',text:'Secure passage along Northwatch Road'},{type:'visit',target:'ironridge',text:'Reach Ironridge'}],reward:{gold:180,xp:360},next:'the_split_crown'};
},{"patch": "js/v3.js", "line": 61, "bytes": 341, "kind": "direct"});
define("v3@L62",function(){
RF.DATA.quests.the_split_crown={name:'The Split Crown',desc:'A buried crypt beneath Greenvale bears the same broken-crown seal found in Voss’s papers.',objectives:[{type:'flag',target:'cryptOpened',text:'Open the Forgotten Crypt'},{type:'kill',target:'gravewarden',value:1,text:'Defeat the Gravewarden'},{type:'item',target:'crypt_sigil',value:1,text:'Recover a Crypt Sigil'}],reward:{gold:450,xp:800,item:'ash_ring'}};
},{"patch": "js/v3.js", "line": 62, "bytes": 421, "kind": "direct"});
define("v3@L64",function(){
RF.DATA.events.push(
 {id:'crypt_whisper',title:'The Stone That Breathes',icon:'🪦',once:true,locations:['ruins'],weight:9,condition:s=>s.flags.vossDefeated||s.skills.exploration.level>=6,text:'A slab beneath the ruins exhales a thread of winter-cold air. Scratched into its edge is a crown split vertically in two.',choices:[
   {text:'Clear the rubble',result:s=>{s.flags.cryptOpened=true;RF.addXp(s,'exploration',70);return 'Hours of dirt and roots reveal steps descending beneath the ruin. Something below knocks once.';}},
   {text:'Leave it sealed',result:s=>{s.flags.cryptMarked=true;return 'You mark the stone on your map. Some doors have survived centuries for good reasons.';}}
 ]},
 {id:'north_charter',title:'The Northern Charter',icon:'📜',once:true,locations:['watchtower'],weight:10,condition:s=>s.flags.vossDefeated,text:'Sergeant Halden lays Voss’s captured papers across a table. Several orders came from beyond the valley.',choices:[
   {text:'Take the road north',result:s=>{s.flags.northRoadOpen=true;s.reputation.watch+=3;return 'Halden stamps a travel charter. “Ironridge first. Then find out who was paying Voss.” The northern gate opens.';}},
   {text:'Demand payment first',condition:s=>(s.skills.speech.level>=4||((s.perks?.silver_tongue||0)>0)),result:s=>{s.gold+=65;s.flags.northRoadOpen=true;s.reputation.watch+=1;return 'Halden mutters, pays 65 gold, then stamps the charter with considerably less enthusiasm.';}}
 ]},
 {id:'ironridge_offer',title:'A Job Without Questions',icon:'🕶️',once:true,locations:['ironridge'],weight:6,condition:s=>RF.hour(s)>=18,text:'Nyra Quickhand sits alone beneath a forge awning, rolling a silver coin across her knuckles. “You look useful. More importantly, you look deniable.”',choices:[
   {text:'Hear her out',result:s=>{s.flags.metUnderworld=true;s.reputation.underworld+=4;RF.addItem(s,'master_lockpick',1);return 'She gives you a fine lockpick and a name scratched onto bone. The underworld now knows yours.';}},
   {text:'Report her to the marshal',result:s=>{s.reputation.ironridge+=5;s.reputation.underworld-=5;s.gold+=30;return 'Kael Marr takes the information seriously. Nyra is gone before the guards arrive.';}},
   {text:'Walk away',result:s=>'The coin keeps turning behind you.'}
 ]},
 {id:'ember_rumour',title:'The Sealed Furnace Road',icon:'🔥',once:true,locations:['ironridge','quarry'],weight:5,condition:s=>s.skills.mining.level>=7,text:'Quarry workers whisper that the old Emberdeep tunnel is glowing again. The foreman has nailed boards across the entrance.',choices:[
   {text:'Ask for the route',result:s=>{s.flags.emberdeepKnown=true;RF.addXp(s,'mining',45);return 'A miner sketches the forbidden route on the back of a wage chit.';}},
   {text:'Leave volcanic holes alone',result:s=>'For once, common sense wins.'}
 ]}
);
},{"patch": "js/v3.js", "line": 64, "bytes": 2831, "kind": "direct"});
define("v4@L10",function(){
Object.assign(RF.DATA.items,{
  field_tonic:{name:'Field Tonic',icon:'🧴',type:'food',value:42,rarity:'Uncommon',desc:'Combat medicine. Restores 28 HP and clears Bleeding.',heal:28},
  honey_cake:{name:'Honey Cake',icon:'🍯',type:'food',value:18,desc:'A travelling luxury. Restores 16 HP.',heal:16},
  lucky_charm:{name:'Carved Hare Charm',icon:'🐇',type:'trinket',value:75,rarity:'Rare',desc:'A tiny hare carved from rowan. Someone gave this to you for a reason.'},
  sunmeadow_hide:{name:'Sunmeadow Hide',icon:'🦬',type:'material',value:24,desc:'Thick hide from the broad-backed beasts of the meadow.'},
  venom_sac:{name:'Venom Sac',icon:'🟢',type:'material',value:28,desc:'Dangerous alchemical material.'},
  traveller_token:{name:'Traveller Token',icon:'🎟️',type:'trinket',value:20,desc:'A stamped brass token accepted by several road merchants.'},
  warding_salt:{name:'Warding Salt',icon:'🧂',type:'utility',value:35,desc:'Used by hedge mages to disrupt hostile magic.'},
  guild_badge:{name:'Wayfarer Guild Badge',icon:'🧭',type:'quest',value:0,rarity:'Uncommon',desc:'Marks you as a sworn member of the Wayfarers.'},
  field_manual:{name:'Field Manual',icon:'📕',type:'trinket',value:95,rarity:'Rare',desc:'Notes on tells, feints and monster behaviour.'}
});
},{"patch": "js/v4.js", "line": 10, "bytes": 1288, "kind": "items"});
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
define("v4@L31",function(){
Object.assign(RF.DATA.enemies,{
  meadow_boar:{name:'Razorback Boar',icon:'🐗',hp:68,damage:[6,13],armor:3,xp:82,gold:[0,4],drops:[['raw_meat',.8,1],['sunmeadow_hide',.42,1]],level:5,temperament:'territorial',moves:['gore','hoof_feint','brace']},
  thorn_adder:{name:'Thorn Adder',icon:'🐍',hp:46,damage:[4,10],armor:0,xp:75,gold:[0,2],drops:[['venom_sac',.48,1],['herb',.2,1]],level:5,temperament:'aggressive',moves:['bite','venom_bite','coil']},
  feral_hound:{name:'Feral Hound',icon:'🐕',hp:74,damage:[7,14],armor:1,xp:94,gold:[0,3],drops:[['raw_meat',.3,1],['wolf_fang',.4,1]],level:7,temperament:'aggressive',moves:['snap','hamstring','circle']},
  hill_troll:{name:'Young Hill Troll',icon:'🧌',hp:155,damage:[10,21],armor:6,xp:240,gold:[8,22],drops:[['iron_ore',.6,2],['field_manual',.05,1]],level:11,temperament:'territorial',moves:['club','boulder','roar','brace']},
  ash_wisp:{name:'Ash Wisp',icon:'👻',hp:88,damage:[8,16],armor:2,xp:145,gold:[3,12],drops:[['warding_salt',.22,1],['ember_shard',.16,1]],level:9,temperament:'aggressive',moves:['cinder_touch','hex','drift']}
});
},{"patch": "js/v4.js", "line": 31, "bytes": 1098, "kind": "enemies"});
define("v4@L49",function(){
RF.DATA.abilities={
  attack:{name:'Strike',icon:'⚔️',level:1,desc:'Reliable weapon attack.',cost:0,cooldown:0,kind:'attack',power:1,accuracy:.94},
  guard:{name:'Guard',icon:'🛡️',level:1,desc:'Reduce incoming damage until your next turn.',cost:0,cooldown:0,kind:'guard'},
  power:{name:'Power Strike',icon:'💥',level:3,skill:'strength',desc:'Heavy hit with a chance to stagger.',cost:18,cooldown:1,kind:'attack',power:1.55,accuracy:.78,status:{id:'stagger',chance:.25,turns:1}},
  precision:{name:'Precise Strike',icon:'🎯',level:4,skill:'attack',desc:'Highly accurate hit with increased critical chance.',cost:13,cooldown:1,kind:'attack',power:1.16,accuracy:1,crit:.28},
  bleeding_cut:{name:'Bleeding Cut',icon:'🩸',level:7,skill:'attack',desc:'Lower initial damage, inflicts Bleeding.',cost:15,cooldown:2,kind:'attack',power:.88,accuracy:.91,status:{id:'bleed',chance:.8,turns:3}},
  hunters_mark:{name:"Hunter's Mark",icon:'🐾',level:6,skill:'hunting',desc:'Expose the enemy, increasing damage it takes.',cost:11,cooldown:3,kind:'status',targetStatus:{id:'exposed',turns:3}},
  arcane_spark:{name:'Arcane Spark',icon:'✨',level:3,skill:'magic',desc:'Magic damage partly ignores armour.',cost:16,cooldown:1,kind:'magic',power:1.25,accuracy:.95},
  second_wind:{name:'Second Wind',icon:'❤️‍🔥',level:5,skill:'vitality',desc:'Recover health. Stronger when badly wounded.',cost:22,cooldown:4,kind:'heal'},
  riposte:{name:'Riposte',icon:'↩️',level:8,skill:'defence',desc:'Guard and prepare a counterattack.',cost:14,cooldown:3,kind:'riposte'},
  crushing_blow:{name:'Crushing Blow',icon:'🔨',level:10,skill:'strength',desc:'Slow, brutal attack that breaks armour temporarily.',cost:26,cooldown:3,kind:'attack',power:1.9,accuracy:.69,status:{id:'broken_armor',chance:.75,turns:2}},
  volley:{name:'Quick Volley',icon:'🏹',level:8,skill:'archery',desc:'Two rapid hits when wielding a bow.',cost:20,cooldown:2,kind:'volley',requiresBow:true}
};
},{"patch": "js/v4.js", "line": 49, "bytes": 1976, "kind": "direct"});
define("v4@L63",function(){
RF.DATA.enemyMoves={
 bite:{name:'Bite',power:1,accuracy:.92},scrabble:{name:'Scrabble',power:.75,accuracy:.96},snap:{name:'Snap',power:1,accuracy:.93},
 slash:{name:'Slash',power:1.05,accuracy:.9},club:{name:'Crushing Swing',power:1.32,accuracy:.76},quickshot:{name:'Quick Shot',power:.9,accuracy:.95},
 gore:{name:'Gore',power:1.2,accuracy:.86},hoof_feint:{name:'Hoof Feint',power:.7,accuracy:.95,status:{id:'exposed',chance:.45,turns:2}},
 brace:{name:'Brace',kind:'guard'},coil:{name:'Coil',kind:'guard'},circle:{name:'Circle',kind:'buff',status:{id:'focused',turns:2}},
 venom_bite:{name:'Venom Bite',power:.82,accuracy:.87,status:{id:'poison',chance:.55,turns:3}},hamstring:{name:'Hamstring',power:.85,accuracy:.9,status:{id:'bleed',chance:.35,turns:2}},
 dirty_trick:{name:'Dirty Trick',power:.7,accuracy:.88,status:{id:'weakened',chance:.65,turns:2}},commanding_strike:{name:'Commanding Strike',power:1.42,accuracy:.82},
 web:{name:'Web',power:.35,accuracy:.94,status:{id:'weakened',chance:.8,turns:2}},marked_shot:{name:'Marked Shot',power:1.15,accuracy:.88,status:{id:'exposed',chance:.55,turns:2}},
 evade:{name:'Evade',kind:'guard'},boulder:{name:'Hurl Boulder',power:1.38,accuracy:.72},roar:{name:'Roar',kind:'status',status:{id:'weakened',turns:2}},
 cinder_touch:{name:'Cinder Touch',power:1.08,accuracy:.9,status:{id:'burn',chance:.5,turns:3}},hex:{name:'Hex',kind:'status',status:{id:'weakened',turns:3}},drift:{name:'Drift',kind:'guard'},
 grave_cut:{name:'Grave Cut',power:1.25,accuracy:.88,status:{id:'bleed',chance:.4,turns:2}},soul_drain:{name:'Soul Drain',power:.78,accuracy:.9,drain:true}
};
},{"patch": "js/v4.js", "line": 63, "bytes": 1615, "kind": "direct"});
define("v4@L76",function(){
Object.assign(RF.DATA.npcs,{
  tamsin:{name:'Tamsin Reed',icon:'🧭',job:'Wayfarer Scout',home:'guildhall',schedule:[['guildhall',6,10],['sunmeadow',10,16],['crossroads',16,19],['guildhall',19,24]],condition:s=>s.flags.wayfarerHallOpen,rumours:['A map is only a list of places where somebody got lost first.','Boars give you a warning. Adders mostly outsource the warning to venom.']},
  vell:{name:'Master Vell',icon:'🧓',job:'Wayfarer Guildmaster',home:'guildhall',schedule:[['guildhall',7,22]],condition:s=>s.flags.wayfarerHallOpen,rumours:['Contracts pay because certainty is expensive.','A useful traveller notices what everyone else calls scenery.']},
  saela:{name:'Saela Emberglass',icon:'🔮',job:'Hedge Mage',home:'ironridge',schedule:[['ironridge',9,15],['quarry',15,18],['ironridge',18,23]],condition:s=>!!RF.DATA.locations.ironridge&&!!s.visited.ironridge,rumours:['Magic is mostly convincing reality that it misremembered the rules.','Ash wisps hate salt, bells, and being observed too confidently.']}
});
},{"patch": "js/v4.js", "line": 76, "bytes": 1023, "kind": "npcs"});
define("v4@L82",function(){
RF.DATA.passers={
  farmer:{icons:['👨‍🌾','👩‍🌾'],jobs:['Shepherd','Turnip Farmer','Drover'],openers:['Fine weather for pretending the fence will mend itself.','You travelling far, or just avoiding somewhere nearby?','Lost a boot in this mud last year. Still think about it.'],gift:'bread'},
  trader:{icons:['🧔','👩‍💼','🧑‍💼'],jobs:['Road Trader','Peddler','Cloth Merchant'],openers:['You have the look of someone who checks prices twice. Sensible.','Road is dearer every mile north. Somehow the potholes remain free.','I trade in necessities, luxuries, and objects people later claim were necessities.'],wares:['honey_cake','field_tonic','lockpick','traveller_token']},
  pilgrim:{icons:['🧕','🧙','🧓'],jobs:['Pilgrim','Shrine Walker','Lay Brother'],openers:['A road walked slowly reveals twice as much and charges no extra.','Have you ever noticed crows always look as if they know the ending?','I have three prayers for rain and none for stopping it. Poor planning.'],gift:'lucky_charm'},
  mercenary:{icons:['🧔‍♂️','🥷','🧑'],jobs:['Sellsword','Caravan Guard','Retired Spear'],openers:['Your stance says you have fought. Your shoulders say you paid for it.','Never trust an opponent who smiles before drawing steel. After is fine.','A good shield is a door you carry into arguments.'],wares:['field_tonic','warding_salt']},
  wanderer:{icons:['🧑','👩','🧔'],jobs:['Wanderer','Tinker','Map Seller'],openers:['Morning. Or afternoon. I stopped asking the sun for paperwork.','There is a village west of here where every dog is named Bramble. No idea why.','Best part of travelling is becoming a stranger professionally.'],wares:['traveller_token','honey_cake']}
};
},{"patch": "js/v4.js", "line": 82, "bytes": 1724, "kind": "direct"});
define("v4@L89",function(){
RF.DATA.passerNames=['Alden','Bess','Corin','Della','Ewan','Fara','Garrick','Hett','Ivo','Jessa','Kell','Lena','Merek','Nell','Orso','Pella','Quin','Rhea','Soren','Tilda','Ulric','Veya','Wren','Yara'];
},{"patch": "js/v4.js", "line": 89, "bytes": 201, "kind": "direct"});
define("v4@L91",function(){
RF.DATA.namedDialogues={
  mira:{greeting:s=>s.flags.grainRationing?'Mira wipes flour from her forearms. “Still standing. So is the mill. I call that a successful policy.”':'Mira leans against a sack of grain. “If you’re here to complain about flour prices, take a number. If you’re here to help, skip the queue.”',choices:[
    {text:'How is the valley doing?',reply:'“Better when the roads behave. Worse when men with swords decide they understand economics.”',rep:['greenvale',1]},
    {text:'Tell me something completely unimportant.',reply:'“Brann snores loud enough to shake flour from the rafters. There. Valuable intelligence.”'},
    {text:'Offer to carry sacks for a while.',reply:'“Now that is a language I speak.” You spend a while helping. Mira presses warm bread into your hands afterward.',gift:'bread',xp:['strength',10],relation:2}
  ]},
  brann:{greeting:'Brann rubs mine dust from his beard and succeeds mainly in relocating it. “You look too clean. Suspicious.”',choices:[
    {text:'Ask about the deep galleries.',reply:'“Stone down there sounds wrong. Not hollow. Listening.”',flag:'brann_deep_warning'},
    {text:'Tell him he looks worse.',reply:'Brann studies you solemnly. “Good. Means the mine lost.”',relation:1},
    {text:'Buy him a drink (4g).',cost:4,reply:'The drink disappears at alarming speed. Brann gives you two pieces of coal “for whatever questionable project you’ve got brewing.”',giveItem:['coal',2],relation:3}
  ]},
  elira:{greeting:'Elira turns a leaf over between two fingers. “Plants are easier than people. They poison you with much clearer signalling.”',choices:[
    {text:'Ask for herbal advice.',reply:'“Bruised Greenleaf smells like wet pepper. If it smells sweet, put it down and apologise to your liver.”',xp:['herblore',18]},
    {text:'Ask how her day is going.',reply:'“A fox stole my lunch. I respect the technique, object to the target.”',relation:1},
    {text:'Purchase a field tonic (35g).',cost:35,reply:'Elira hands you a corked bottle. “Drink it. Do not admire it. Medicine resents an audience.”',giveItem:['field_tonic',1]}
  ]},
  oren:{greeting:s=>s.flags.robbedMerchant?'Oren’s smile reaches precisely nowhere. “Funny thing about roadside disasters. You remember the hands that were nearby.”':'Oren grins. “There’s my favourite argument for not dying beside a milestone.”',choices:[
    {text:'Ask about trade.',reply:'“Buy where people have plenty, sell where they complain loudly. Entire profession, really.”',xp:['trading',16]},
    {text:'Ask if he needs anything.',reply:'“Not today. Which is merchant speech for: ask again after the next catastrophe.”',relation:1},
    {text:'See what he has tucked away.',reply:'Oren opens a narrow travelling case.',shop:['honey_cake','field_tonic','traveller_token','lockpick']}
  ]},
  halden:{greeting:s=>s.crime?.bounty>0?'Halden folds his arms. “You have considerable confidence approaching a watch sergeant with your face currently on paper.”':'Halden nods once. “Wanderer.”',choices:[
    {text:'Ask about threats on the road.',reply:'“Blackthorn splinters, feral packs, opportunists. Peace is mostly danger waiting for poor scheduling.”',xp:['exploration',12]},
    {text:'Ask what he does for fun.',reply:'Halden stares. “Paperwork with smaller margins.”'},
    {text:'Volunteer for patrol work.',reply:'“Wayfarer Hall posts the work we cannot spare uniforms for. Speak to Vell.”',flag:'wayfarerHallOpen',relation:2}
  ]},
  tamsin:{greeting:'Tamsin rolls a coin across her knuckles, catches it, and nearly drops it. “That was more impressive in my head.”',choices:[
    {text:'Ask about scouting.',reply:'“See first. Fight second. Run third. Anyone who says running is cowardice has never been chased by a troll.”',xp:['exploration',20],relation:1},
    {text:'Ask about joining the Wayfarers.',reply:'“Talk to Vell. If he likes you, welcome aboard. If he doesn’t, wait ten minutes. He forgets efficiently.”',flag:'wayfarerHallOpen'},
    {text:'Invite her to travel with you.',condition:s=>(s.social?.relations?.tamsin||0)>=5&&s.guild?.rank>=1,reply:'“About time. I was getting tired of saving all my excellent commentary for myself.”',companion:'tamsin'}
  ]},
  vell:{greeting:'Master Vell peers over a map. “If you are about to ask whether the red marks are dangerous, yes. If you are about to ask whether they pay, also yes.”',choices:[
    {text:'Join the Wayfarers.',condition:s=>!s.guild?.joined,reply:'Vell stamps a badge with unnecessary violence. “Welcome. Try not to become one of the red marks.”',joinGuild:true},
    {text:'Ask for work.',reply:'“Board is to your right. Anything still pinned up has not killed the previous volunteer yet.”'},
    {text:'Ask why he founded the guild.',reply:'“I didn’t. I inherited it after the founder vanished. That answer usually stops the follow-up questions.”',relation:1}
  ]},
  saela:{greeting:'Saela’s fingertips glow faintly orange. “Before you ask, yes, it is magic. No, it does not help with washing dishes.”',choices:[
    {text:'Ask to learn practical magic.',reply:'“Start with Arcane Spark. Less dramatic than fireballs, substantially better for eyebrows.”',xp:['magic',35],flag:'arcane_tutored'},
    {text:'Ask about ash wisps.',reply:'“They are what happens when a bad memory discovers mobility. Salt helps.”'},
    {text:'Buy warding salt (28g).',cost:28,reply:'Saela wraps the salt twice. “Keep it dry. And do not season dinner with it unless dinner is haunted.”',giveItem:['warding_salt',1]}
  ]}
};
},{"patch": "js/v4.js", "line": 91, "bytes": 5643, "kind": "direct"});
define("v4@L134",function(){
RF.DATA.contractTemplates=[
 {id:'cull',name:'Cull the Wild',icon:'🐾',desc:'Reduce dangerous wildlife near the road.',targets:['wolf','meadow_boar','feral_hound'],count:[2,4],reward:[55,95]},
 {id:'venom',name:'Venom Samples',icon:'🐍',desc:'Bring back venom sacs for guild alchemists.',item:'venom_sac',count:[1,3],reward:[60,110]},
 {id:'road',name:'Road Survey',icon:'🗺️',desc:'Walk the roads and report what changed.',visits:['sunmeadow','crossroads','forest'],reward:[45,80]}
];
},{"patch": "js/v4.js", "line": 134, "bytes": 493, "kind": "direct"});
define("v5@L6",function(){
Object.assign(RF.DATA.skills, {
  firemaking: { name: 'Firemaking', icon: '🔥' }
});
},{"patch": "js/v5.js", "line": 6, "bytes": 86, "kind": "skills"});
define("v5@L10",function(){
Object.assign(RF.DATA.items, {
  tin_ore: { name:'Tin Ore', icon:'⚪', type:'material', value:5, desc:'Soft pale ore used in bronze work.' },
  willow_logs: { name:'Willow Logs', icon:'🌿', type:'material', value:8, desc:'Light flexible timber.' },
  yew_logs: { name:'Yew Logs', icon:'🌲', type:'material', value:18, rarity:'Uncommon', desc:'Dense timber from ancient yews.' },
  wild_berries: { name:'Wild Berries', icon:'🫐', type:'food', value:5, desc:'Tart berries. Restores 6 health.', heal:6 },
  cave_mushroom: { name:'Cave Mushroom', icon:'🍄', type:'material', value:9, desc:'Pale edible fungus.' },
  trout: { name:'Silverrun Trout', icon:'🐟', type:'material', value:11, desc:'A healthy river trout.' },
  river_eel: { name:'River Eel', icon:'〰️', type:'material', value:17, rarity:'Uncommon', desc:'Rich river eel.' },
  cooked_trout: { name:'Fire-roasted Trout', icon:'🍽️', type:'food', value:24, desc:'Restores 30 health.', heal:30 },
  smoked_eel: { name:'Smoked River Eel', icon:'🥘', type:'food', value:34, rarity:'Uncommon', desc:'Restores 38 health.', heal:38 },
  berry_skewer: { name:'Warm Berry Skewer', icon:'🍡', type:'food', value:12, desc:'Restores 14 health.', heal:14 },
  charcoal: { name:'Charcoal', icon:'◼️', type:'material', value:9, desc:'Concentrated fuel.' }
});
},{"patch": "js/v5.js", "line": 10, "bytes": 1327, "kind": "items"});
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
define("v6@L8",function(){
Object.assign(RF.DATA.items, {
  crude_pickaxe:{name:'Crude Pickaxe',icon:'⛏️',type:'tool',value:18,tool:'mining',tier:1,power:10,control:0,desc:'A chipped starter pick. Slow, but dependable enough.'},
  iron_pickaxe:{name:'Iron Pickaxe',icon:'⛏️',type:'tool',value:78,tool:'mining',tier:2,power:15,control:.02,desc:'A properly weighted mining pick. Noticeably faster.'},
  steel_pickaxe:{name:'Steel Pickaxe',icon:'⛏️',type:'tool',value:190,tool:'mining',tier:3,power:21,control:.04,desc:'A balanced steel pick for serious seams.'},
  crude_axe:{name:'Crude Wood Axe',icon:'🪓',type:'tool',value:18,tool:'woodcutting',tier:1,power:10,control:0,desc:'A rough camp axe.'},
  iron_axe:{name:'Iron Wood Axe',icon:'🪓',type:'tool',value:82,tool:'woodcutting',tier:2,power:16,control:.02,desc:'An iron axe with a keen edge.'},
  steel_axe:{name:'Steel Wood Axe',icon:'🪓',type:'tool',value:205,tool:'woodcutting',tier:3,power:22,control:.04,desc:'Fast, controlled and hard to blunt.'},
  reed_rod:{name:'Reed Fishing Rod',icon:'🎣',type:'tool',value:22,tool:'fishing',tier:1,power:1,control:0,desc:'Simple tackle with a forgiving float.'},
  river_rod:{name:'River Fishing Rod',icon:'🎣',type:'tool',value:95,tool:'fishing',tier:2,power:1,control:.05,desc:'A responsive rod with stronger line.'},
  angler_rod:{name:'Angler’s Rod',icon:'🎣',type:'tool',value:235,tool:'fishing',tier:3,power:1,control:.1,desc:'Fine tackle that gives you more time to react.'},
  flint_kit:{name:'Flint & Steel',icon:'🔥',type:'tool',value:16,tool:'firemaking',tier:1,power:13,control:.01,desc:'A basic spark kit.'},
  tinderbox:{name:'Wayfarer Tinderbox',icon:'🔥',type:'tool',value:72,tool:'firemaking',tier:2,power:20,control:.04,desc:'Dry tinder and a spring-steel striker.'}
});
},{"patch": "js/v6.js", "line": 8, "bytes": 1790, "kind": "items"});
define("v7@L9",function(){
Object.assign(RF.DATA.items,{
  bronze_bar:{name:'Bronze Bar',icon:'▰',type:'material',value:13,desc:'Copper and tin alloy. Easy to work.'},
  silver_ore:{name:'Silver Ore',icon:'🌙',type:'material',value:24,rarity:'Uncommon',desc:'Bright ore threaded through old stone.'},
  silver_bar:{name:'Silver Bar',icon:'▱',type:'material',value:58,rarity:'Uncommon',desc:'Refined silver with alchemical uses.'},
  bog_iron:{name:'Bog Iron',icon:'🟫',type:'material',value:15,desc:'Rust-red nodules gathered from marsh pools.'},
  alder_logs:{name:'Alder Logs',icon:'🪵',type:'material',value:12,desc:'Marsh timber that burns hot when properly dried.'},
  mooncap:{name:'Mooncap Mushroom',icon:'🍄',type:'material',value:22,rarity:'Uncommon',desc:'A blue-grey mushroom that opens after dusk.'},
  ghost_orchid:{name:'Ghost Orchid',icon:'🌼',type:'material',value:38,rarity:'Rare',desc:'A pale marsh flower used in precise tonics.'},
  redroot:{name:'Redroot',icon:'🫚',type:'material',value:14,desc:'A bitter crimson root prized by field medics.'},
  reedfish:{name:'Reed Pike',icon:'🐟',type:'material',value:21,desc:'A sharp-toothed marsh fish.'},
  cooked_pike:{name:'Charred Reed Pike',icon:'🍽️',type:'food',value:40,heal:42,desc:'Restores 42 health.'},
  marsh_stew:{name:'Marsh Stew',icon:'🥣',type:'food',value:55,heal:55,desc:'Dense stew. Restores 55 health and steadies the stomach.'},
  antivenom:{name:'Antivenom',icon:'🧪',type:'food',value:52,rarity:'Uncommon',heal:8,desc:'Clears Poison and restores 8 health.'},
  focus_draught:{name:'Focus Draught',icon:'🧿',type:'food',value:64,rarity:'Rare',stamina:42,desc:'Restores 42 stamina and sharpens concentration.'},
  ember_tonic:{name:'Ember Tonic',icon:'🔥',type:'food',value:88,rarity:'Rare',heal:24,stamina:24,desc:'Hot alchemical tonic restoring health and stamina.'},
  night_eye:{name:'Night-Eye Elixir',icon:'👁️',type:'food',value:92,rarity:'Rare',desc:'A strange violet draught used by scouts.'},
  bog_silk:{name:'Bog Silk',icon:'🕸️',type:'material',value:26,desc:'Strong damp-resistant fibre spun by marsh spiders.'},
  croc_hide:{name:'Fen Croc Hide',icon:'🐊',type:'material',value:34,desc:'Heavy plated hide.'},
  mire_pearl:{name:'Mire Pearl',icon:'🫧',type:'material',value:70,rarity:'Rare',desc:'Milky pearl formed in deep marsh mussels.'},
  drowned_coin:{name:'Drowned Coin',icon:'🪙',type:'treasure',value:46,rarity:'Uncommon',desc:'Green with age. Bears an unfamiliar crowned heron.'},
  marsh_idol:{name:'Marsh Idol',icon:'🗿',type:'treasure',value:130,rarity:'Rare',desc:'A thumb-sized stone figure recovered from buried mudbrick.'},
  royal_seal:{name:'Weathered Royal Seal',icon:'🔏',type:'treasure',value:240,rarity:'Epic',desc:'A bronze seal from a dynasty no modern scholar recognises.'},
  old_bone_dice:{name:'Old Bone Dice',icon:'🎲',type:'treasure',value:38,desc:'Perfectly balanced and probably dishonest.'},
  lockbox_key:{name:'Bent Lockbox Key',icon:'🗝️',type:'utility',value:24,desc:'A bent key from a roadside cache.'},
  fine_lockpick:{name:'Fine Lockpick Set',icon:'🗝️',type:'tool',tool:'lockpicking',tier:2,power:1,control:.08,value:95,rarity:'Uncommon',desc:'Flexible picks that forgive small mistakes.'},
  master_picks:{name:'Masterwork Picks',icon:'🔐',type:'tool',tool:'lockpicking',tier:3,power:1,control:.16,value:270,rarity:'Rare',desc:'A beautiful set for opening things whose owners disagree.'},
  bronze_sword:{name:'Bronze Sword',icon:'🗡️',type:'weapon',value:52,damage:6,slot:'main',desc:'+6 melee damage.'},
  silvered_blade:{name:'Silvered Blade',icon:'⚔️',type:'weapon',value:245,damage:14,slot:'main',rarity:'Rare',desc:'+14 melee damage. Favoured against restless dead.'},
  marshbow:{name:'Reedwood Longbow',icon:'🏹',type:'weapon',value:190,damage:12,slot:'main',ranged:true,rarity:'Uncommon',desc:'+12 ranged damage.'},
  fen_leathers:{name:'Fenwalker Leathers',icon:'🥋',type:'armor',value:205,armor:8,slot:'chest',rarity:'Uncommon',desc:'+8 armour. Waxed against marsh rain.'},
  mire_ring:{name:'Mireglass Ring',icon:'💍',type:'trinket',value:320,rarity:'Epic',desc:'Cloudy green glass that grows cold near poison.'},
  scholar_notes:{name:'Field Research Notes',icon:'📓',type:'treasure',value:30,desc:'Observations useful to monster researchers.'},
  bait_grubs:{name:'Bait Grubs',icon:'🪱',type:'utility',value:7,desc:'Reliable bait for larger freshwater fish.'},
  whetstone:{name:'Whetstone',icon:'🪨',type:'utility',value:22,desc:'A compact stone used to maintain blades.'},
  waxed_thread:{name:'Waxed Thread',icon:'🧵',type:'material',value:16,desc:'Strong thread for field repairs.'},
  bronze_buckler:{name:'Bronze Buckler',icon:'🛡️',type:'armor',value:72,armor:3,slot:'off',desc:'+3 armour.'},
  marsh_charm:{name:'Heron Charm',icon:'🪶',type:'trinket',value:145,rarity:'Rare',desc:'A marshfolk charm said to keep travellers from walking in circles.'}
});
},{"patch": "js/v7.js", "line": 9, "bytes": 4979, "kind": "items"});
define("v7@L50",function(){
Object.assign(RF.DATA.recipes,{
  bronze_bar:{name:'Smelt Bronze Bar',skill:'smithing',level:2,time:8,inputs:{copper_ore:1,tin_ore:1},outputs:{bronze_bar:1},xp:24},
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
define("v7@L78",function(){
Object.assign(RF.DATA.campRecipes,{
  cooked_pike:{name:'Char Reed Pike',icon:'🐟',level:8,input:'reedfish',output:'cooked_pike',xp:48,time:10,desc:'Firm marsh fish over hot coals.'},
  marsh_stew:{name:'Marsh Stew',icon:'🥣',level:12,input:'reedfish',qty:1,output:'marsh_stew',xp:76,time:14,desc:'A thick trail stew. Requires berries too.',extra:{wild_berries:2}}
});
},{"patch": "js/v7.js", "line": 78, "bytes": 372, "kind": "campRecipes"});
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
define("v7@L91",function(){
Object.assign(RF.DATA.enemies,{
  mudcrab:{name:'Mudplate Crab',icon:'🦀',hp:62,damage:[5,11],armor:5,xp:78,gold:[0,3],drops:[['raw_meat',.4,1],['bog_iron',.12,1]],level:5,temperament:'territorial',moves:['claw','brace','mud_spray']},
  bog_spider:{name:'Reedweb Spider',icon:'🕷️',hp:70,damage:[6,13],armor:1,xp:105,gold:[0,4],drops:[['bog_silk',.62,1],['venom_sac',.33,1]],level:7,temperament:'aggressive',moves:['bite','web','venom_bite']},
  mire_wolf:{name:'Mire Wolf',icon:'🐺',hp:96,damage:[8,16],armor:2,xp:132,gold:[0,5],drops:[['wolf_pelt',.65,1],['raw_meat',.6,1]],level:9,temperament:'aggressive',moves:['snap','hamstring','mire_howl']},
  fen_croc:{name:'Fen Crocodile',icon:'🐊',hp:146,damage:[10,21],armor:6,xp:210,gold:[1,7],drops:[['croc_hide',.72,1],['raw_meat',.8,2]],level:12,temperament:'territorial',moves:['death_roll','snap','brace']},
  lantern_wisp:{name:'Lantern Wisp',icon:'🟡',hp:90,damage:[8,17],armor:1,xp:162,gold:[4,14],drops:[['mooncap',.22,1],['ghost_orchid',.08,1]],level:11,temperament:'aggressive',moves:['wisp_burn','hex','drift']},
  drowned_sentinel:{name:'Drowned Sentinel',icon:'🧟',hp:170,damage:[11,22],armor:7,xp:255,gold:[12,30],drops:[['drowned_coin',.7,1],['silver_ore',.25,1]],level:14,temperament:'aggressive',moves:['rusted_cleave','grasp','brace']},
  marsh_raider:{name:'Fenroad Raider',icon:'🥷',hp:118,damage:[9,19],armor:4,xp:175,gold:[15,36],drops:[['lockpick',.4,1],['honey_cake',.15,1]],level:11,temperament:'aggressive',moves:['slash','dirty_trick','marked_shot']},
  heron_keeper:{name:'Keeper Beneath the Heron',icon:'🗿',hp:280,damage:[14,27],armor:10,xp:620,gold:[65,110],drops:[['royal_seal',1,1],['mire_ring',.18,1],['silver_bar',.35,1]],level:19,temperament:'boss',moves:['stone_beak','flood_call','brace','royal_gaze']},
  rogue_stag:{name:'Briar Stag',icon:'🦌',hp:105,damage:[8,18],armor:3,xp:142,gold:[0,3],drops:[['raw_meat',.75,2],['lucky_charm',.04,1]],level:9,temperament:'territorial',moves:['gore','hoof_feint','circle']},
  quarry_drake:{name:'Stoneback Drake',icon:'🦎',hp:205,damage:[13,24],armor:9,xp:355,gold:[8,24],drops:[['iron_ore',.75,2],['silver_ore',.18,1]],level:16,temperament:'territorial',moves:['stone_bite','tail_sweep','brace']},
  ember_hound:{name:'Ember Hound',icon:'🐕‍🦺',hp:138,damage:[11,22],armor:4,xp:240,gold:[2,12],drops:[['ember_shard',.36,1],['raw_meat',.3,1]],level:14,temperament:'aggressive',moves:['cinder_bite','circle','roar']}
});
},{"patch": "js/v7.js", "line": 91, "bytes": 2474, "kind": "enemies"});
define("v7@L105",function(){
Object.assign(RF.DATA.enemyMoves,{
  claw:{name:'Crushing Claw',power:1.05,accuracy:.9},mud_spray:{name:'Mud Spray',power:.55,accuracy:.94,status:{id:'weakened',chance:.6,turns:2}},
  mire_howl:{name:'Mire Howl',kind:'status',status:{id:'weakened',turns:2}},death_roll:{name:'Death Roll',power:1.45,accuracy:.76,status:{id:'bleed',chance:.55,turns:2}},
  wisp_burn:{name:'Lantern Flare',power:1.08,accuracy:.91,status:{id:'burn',chance:.5,turns:2}},rusted_cleave:{name:'Rusted Cleave',power:1.22,accuracy:.86,status:{id:'bleed',chance:.35,turns:2}},
  grasp:{name:'Drowned Grasp',power:.72,accuracy:.94,status:{id:'weakened',chance:.55,turns:2}},stone_beak:{name:'Stone Beak',power:1.38,accuracy:.83},
  flood_call:{name:'Flood Call',power:.8,accuracy:.95,status:{id:'weakened',chance:.75,turns:2}},royal_gaze:{name:'Royal Gaze',kind:'status',status:{id:'exposed',turns:3}},
  stone_bite:{name:'Stone Bite',power:1.3,accuracy:.84},tail_sweep:{name:'Tail Sweep',power:.9,accuracy:.88,status:{id:'stagger',chance:.4,turns:1}},cinder_bite:{name:'Cinder Bite',power:1.16,accuracy:.89,status:{id:'burn',chance:.42,turns:2}}
});
},{"patch": "js/v7.js", "line": 105, "bytes": 1122, "kind": "enemyMoves"});
define("v7@L122",function(){
Object.assign(RF.DATA.npcs,{
  nessa:{name:'Nessa Vale',icon:'🧪',job:'Marsh Apothecary',home:'reedmere',schedule:[['reedmere',7,13],['marshroad',13,16],['reedmere',16,23]],condition:s=>!!s.visited.marshroad,rumours:['Never trust a mushroom that looks pleased to see you.','Antivenom is cheaper before the bite. People consistently ignore this pricing advantage.']},
  torren:{name:'Torren Pike',icon:'🎣',job:'Reedmere Fisher',home:'reedmere',schedule:[['reedmere',5,8],['drowned_ruins',8,13],['reedmere',13,20]],condition:s=>!!s.visited.reedmere,rumours:['Pike bite hardest when the mist sits low.','There are bells underwater by the old ruins. I do not fish near bells.']},
  ysra:{name:'Ysra Fen',icon:'🪶',job:'Mirewatch Ranger',home:'mirewatch',schedule:[['mirewatch',6,10],['marshroad',10,16],['mirewatch',16,24]],condition:s=>!!s.visited.mirewatch,rumours:['Watch the reeds, not the water. Water lies flatter.','If a lantern light moves against the wind, do not follow it politely.']},
  cobb:{name:'Cobb Rill',icon:'🔐',job:'Locksmith & Recoverer',home:'reedmere',schedule:[['reedmere',9,18],['mirewatch',18,21]],condition:s=>!!s.visited.reedmere,rumours:['Locks are conversations conducted with very small pieces of metal.','A cheap lock tells you what the owner fears. A good lock tells you they can afford fear.']},
  maelin:{name:'Maelin Quill',icon:'📚',job:'Field Naturalist',home:'mirewatch',schedule:[['mirewatch',8,12],['reedmere',12,15],['marshroad',15,19],['mirewatch',19,23]],condition:s=>!!s.visited.mirewatch,rumours:['Everything leaves evidence. Most creatures simply lack lawyers.','The difference between research and being eaten is usually note-taking distance.']},
  dock:{name:'Dock Fenner',icon:'🧔',job:'Causeway Warden',home:'marshroad',schedule:[['marshroad',6,18],['reedmere',18,22]],condition:s=>!!s.visited.marshroad,rumours:['Keep to the planks after dark. Mud has ambition here.','Those bells are for fog. Mostly.']},
  ilse:{name:'Ilse Marr',icon:'🍲',job:'Innkeeper of the Crooked Heron',home:'reedmere',schedule:[['reedmere',6,24]],condition:s=>!!s.visited.reedmere,rumours:['Dry socks cost nothing upstairs if you stop dripping on my floor.','Torren says he saw a stone hand in the water. Torren also says pike understand insults.']}
});
},{"patch": "js/v7.js", "line": 122, "bytes": 2293, "kind": "npcs"});
define("v7@L132",function(){
Object.assign(RF.DATA.namedDialogues,{
  nessa:{greeting:'Nessa holds a vial to the light. “If it turns green, useful. If it turns black, educational.”',choices:[
    {text:'Ask about potion experimentation.',reply:'“Two reagents tell you more than a recipe book ever will. Sometimes what they tell you is ‘open a window’.”',xp:['herblore',18]},
    {text:'Ask about marsh poison.',reply:'“Fen crocs are infection. Spiders are venom. Lantern wisps are a philosophical problem.”',relation:1},
    {text:'See her travelling stock.',reply:'Nessa unlocks a lacquered medicine case.',shop:['antivenom','field_tonic','redroot','mooncap','focus_draught']}
  ]},
  torren:{greeting:'Torren is repairing a hook with hands that look capable of repairing the river itself. “Fish?”',choices:[
    {text:'Ask what is biting.',reply:'“Pike. Eels. Occasionally my patience.”',xp:['fishing',18]},
    {text:'Ask about the drowned ruins.',reply:'Torren stops working. “Stone herons. Bells below the water. A light that follows boats home. I fish elsewhere.”',flag:'heron_rumour',relation:1},
    {text:'Tell him fishing is just waiting.',reply:'“Correct. But with consequences.” Torren nods approvingly.',relation:2}
  ]},
  ysra:{greeting:'Ysra studies the marsh behind you before looking at you. “Good. Nothing followed.”',choices:[
    {text:'Ask for ranger advice.',reply:'“Mudcrabs bluff. Crocs do not. Wisps want you moving. Refuse all three invitations.”',xp:['hunting',22]},
    {text:'Offer to patrol the causeway.',reply:'“Walk it after dusk and bring me what tries to make that difficult.”',flag:'fen_patrol',relation:2},
    {text:'Ask about the heron ruins.',reply:'“Older than Reedmere. Older than the causeway. We do not know who drowned them.”',flag:'heron_rumour'}
  ]},
  cobb:{greeting:'Cobb smiles at your belt, specifically the pocket where lockpicks might be. “Professional curiosity.”',choices:[
    {text:'Ask for lockpicking advice.',reply:'“Do not fight the pin. Pressure is a question. The click is the answer.”',xp:['thieving',20]},
    {text:'Buy better picks.',reply:'Cobb lays out several tools on black felt.',shop:['fine_lockpick','master_picks','lockpick']},
    {text:'Ask whether he is a locksmith or a thief.',reply:'“Invoice decides.”',relation:1}
  ]},
  maelin:{greeting:'Maelin writes three words, watches a beetle, crosses out two of them. “Science.”',choices:[
    {text:'Ask how to research creatures.',reply:'“Observe before fighting. Tracks, posture, feeding, how they react when threatened. Then survive long enough to write it down.”',xp:['exploration',18]},
    {text:'Show interest in the collection.',reply:'“Bring notes. Bring unusual remains. Bring yourself back alive, preferably in that order.”',giveItem:['scholar_notes',1],relation:2},
    {text:'Ask her favourite creature.',reply:'“Mudcrab. Honest architecture. Awful temperament.”'}
  ]},
  dock:{greeting:'Dock leans on a hooked pole. “If you fall off the causeway, shout once. Twice means croc.”',choices:[
    {text:'Ask about the bells.',reply:'“Fog markers. Except the old bronze ones. Those ring when there is no wind.”',flag:'bell_rumour'},
    {text:'Ask about raiders.',reply:'“Use the reeds as walls. Clever until the reeds start moving back.”',xp:['exploration',12]},
    {text:'Compliment the causeway.',reply:'Dock looks genuinely touched. “Nobody compliments infrastructure.”',relation:3}
  ]},
  ilse:{greeting:'Ilse slides a bowl away from a sleeping patron before his forehead reaches it. “Welcome to Reedmere.”',choices:[
    {text:'Ask for local gossip.',reply:'“Nessa nearly fumigated her own roof. Torren is arguing with a pike. Cobb says neither event is technically illegal.”'},
    {text:'Buy marsh stew (42g).',cost:42,reply:'Ilse hands over a steaming bowl wrapped for travel. “Eat it before it becomes a building material.”',giveItem:['marsh_stew',1]},
    {text:'Ask about strangers.',reply:'“Three scholars went toward the drowned stones. Two came back. Both insist there were only two when they left.”',flag:'heron_rumour'}
  ]}
});
},{"patch": "js/v7.js", "line": 132, "bytes": 4163, "kind": "namedDialogues"});
define("v7@L171",function(){
RF.DATA.namedDialogues.mira.choices.push({text:'Ask if anything strange has passed through town.',reply:'“A cart of blue mushrooms, two wet scholars, and a man trying to sell a goose as a guard dog. So: Tuesday.”'});
},{"patch": "js/v7.js", "line": 171, "bytes": 220, "kind": "direct"});
define("v7@L172",function(){
RF.DATA.namedDialogues.brann.choices.push({text:'Ask what metal he actually likes working.',reply:'“Bronze behaves. Iron argues. Silver judges.”',xp:['smithing',8]});
},{"patch": "js/v7.js", "line": 172, "bytes": 170, "kind": "direct"});
define("v7@L173",function(){
RF.DATA.namedDialogues.elira.choices.push({text:'Ask about Mooncaps.',reply:'“Useful. Moody. Pick them after dusk and do not lick your fingers.”',xp:['foraging',10]});
},{"patch": "js/v7.js", "line": 173, "bytes": 171, "kind": "direct"});
define("v7@L174",function(){
RF.DATA.namedDialogues.tamsin.choices.push({text:'Ask for road gossip.',reply:'“Marsh road reopened. Apparently the planks only collapse under people who deserve character development.”'});
},{"patch": "js/v7.js", "line": 174, "bytes": 193, "kind": "direct"});
define("v7@L175",function(){
RF.DATA.namedDialogues.saela.choices.push({text:'Ask whether potions count as magic.',reply:'“Only to people who have never cleaned a cauldron.”'});
},{"patch": "js/v7.js", "line": 175, "bytes": 152, "kind": "direct"});
define("v7@L177",function(){
Object.assign(RF.DATA.passers,{
  scholar:{icons:['🧑‍🏫','👩‍🔬','🧔‍♀️'],jobs:['Travelling Naturalist','Ruins Scholar','Assistant Cartographer'],openers:['I have been bitten twice today, which means the expedition is producing data.','Do you know whether these ruins are cursed in a measurable way?','I need a local guide and, failing that, somebody difficult to frighten.'],wares:['scholar_notes','mooncap','whetstone'],gift:'scholar_notes'},
  fisher:{icons:['🎣','🧔','👩'],jobs:['Net Fisher','Eel Catcher','Barge Hand'],openers:['Water is high. Fish like it. Boots do not.','Caught a pike this morning with somebody else’s hook still in it. Felt accusatory.','If you hear bells under the water, row faster and ask theological questions later.'],wares:['bait_grubs','cooked_fish','cooked_pike'],gift:'bait_grubs'},
  locksmith:{icons:['🔐','🧑‍🔧'],jobs:['Itinerant Locksmith','Safe Mender'],openers:['Locks fail from rust, panic, and relatives. Usually in that order.','I fix doors. Occasionally I fix the assumption that doors are permanent.'],wares:['lockpick','fine_lockpick','waxed_thread']}
});
},{"patch": "js/v7.js", "line": 177, "bytes": 1141, "kind": "passers"});
define("v7@L182",function(){
RF.DATA.passerNames.push('Aster','Bram','Cerys','Dain','Eska','Fenn','Gilda','Hollis','Isen','Juniper','Kest','Mara','Neris','Odo','Perrin','Sable','Tove','Una','Vale','Zerin');
},{"patch": "js/v7.js", "line": 182, "bytes": 177, "kind": "direct"});
define("v7@L184",function(){
RF.DATA.contractTemplates.push(
 {id:'marsh_cull',name:'Fenroad Teeth',icon:'🐊',desc:'Thin dangerous marsh predators near the causeway.',targets:['bog_spider','mire_wolf','fen_croc'],count:[2,4],reward:[95,160]},
 {id:'research',name:'Field Notes',icon:'📓',desc:'Record creature observations for guild naturalists.',item:'scholar_notes',count:[1,2],reward:[80,130]},
 {id:'reagents',name:'Apothecary Run',icon:'🧪',desc:'Gather useful marsh reagents.',item:'redroot',count:[2,4],reward:[75,120]}
);
},{"patch": "js/v7.js", "line": 184, "bytes": 506, "kind": "direct"});
define("v7@L190",function(){
RF.DATA.quests.marsh_lights={name:'Lights in the Reeds',desc:'Strange lights are drawing travellers off the Fenward Causeway.',objectives:[{type:'visit',target:'reedmere',text:'Reach Reedmere'},{type:'kill',target:'lantern_wisp',value:2,text:'Defeat 2 Lantern Wisps'},{type:'flag',target:'heron_rumour',text:'Learn what locals know about the drowned ruins'}],reward:{gold:220,xp:380,item:'marsh_charm'},next:'bell_below'};
},{"patch": "js/v7.js", "line": 190, "bytes": 422, "kind": "direct"});
define("v7@L191",function(){
RF.DATA.quests.bell_below={name:'The Bell Below',desc:'The drowned ruins hide a sealed chamber and a bell that rings beneath the water.',objectives:[{type:'visit',target:'drowned_ruins',text:'Explore the Drowned Heron Ruins'},{type:'flag',target:'heron_chamber_open',text:'Open the buried Heron chamber'},{type:'kill',target:'heron_keeper',value:1,text:'Defeat the Keeper Beneath the Heron'}],reward:{gold:650,xp:950,item:'mire_ring'}};
},{"patch": "js/v7.js", "line": 191, "bytes": 436, "kind": "direct"});
define("v7@L193",function(){
RF.DATA.events.push(
 {id:'fenward_invitation',title:'The Road Through the Reeds',icon:'🌫️',once:true,locations:['river','greenvale'],weight:10,condition:s=>(s.player.level>=5||s.skills.exploration.level>=5)&&!s.visited.marshroad,text:'A reed-covered wagon creaks into view. Its driver says the old Fenward Causeway has reopened after repairs.',choices:[
   {text:'Ask for directions.',result:s=>{s.flags.marshKnown=true;s.quests.marsh_lights=s.quests.marsh_lights||{active:true,done:false};return 'The driver marks a turn beyond Silverrun. “Keep to the planks. If you hear bells in fog, keep moving.”';}},
   {text:'Buy a marsh map (12g).',condition:s=>s.gold>=12,result:s=>{s.gold-=12;s.flags.marshKnown=true;s.quests.marsh_lights=s.quests.marsh_lights||{active:true,done:false};RF.addXp(s,'exploration',24);return 'The map is mostly waterproof and only slightly inaccurate.';}},
   {text:'Not yet.',result:s=>'The wagon continues east, trailing wet reeds.'}
 ]},
 {id:'reedmere_argument',title:'A Fish With Legal Representation',icon:'🐟',once:false,locations:['reedmere'],weight:4,text:'Torren and Cobb are arguing over whether a pike can technically steal a fishing hook.',choices:[
   {text:'Side with Torren.',result:s=>{RF.changeRelation(s,'torren',1);return '“Exactly!” Torren says. Cobb looks betrayed by jurisprudence.';}},
   {text:'Side with Cobb.',result:s=>{RF.changeRelation(s,'cobb',1);RF.addXp(s,'speech',5);return 'Cobb nods. “Possession requires intent.” Torren tells both of you to leave.';}},
   {text:'Suggest arresting the pike.',result:s=>{RF.addXp(s,'speech',8);return 'There is a long silence. Ilse laughs from inside the inn.';}}
 ]},
 {id:'sunken_lockbox',title:'Half a Lockbox',icon:'📦',once:true,locations:['marshroad','drowned_ruins'],weight:6,text:'Something square protrudes from the mud. A corroded lock remains stubbornly intact.',choices:[
   {text:'Mark it for later.',result:s=>{s.v7.locks.sunken_box={level:4,opened:false,reward:'drowned_coin',qty:2};return 'You clear enough mud to find the keyway and mark the spot.';}},
   {text:'Pry it open with brute force.',result:s=>{if(s.skills.strength.level>=8){RF.addItem(s,'drowned_coin',1);return 'The lock tears free. Most of the contents are ruined, but one old coin survives.';}s.player.hp=Math.max(1,s.player.hp-5);return 'The lid wins. Your knuckles do not.';}},
   {text:'Leave it.',result:s=>'The marsh keeps its box.'}
 ]},
 {id:'naturalist_down',title:'Notebook in the Reeds',icon:'📓',once:true,locations:['marshroad'],weight:5,text:'A field notebook lies open beside a flattened patch of reeds. Fresh tracks lead toward deep water.',choices:[
   {text:'Follow the tracks.',result:s=>{s.flags.maelin_rescue=true;RF.addItem(s,'scholar_notes',1);return 'The tracks belong to a frightened assistant hiding on a willow trunk. You guide them back toward Mirewatch.';}},
   {text:'Take the notebook.',result:s=>{RF.addItem(s,'scholar_notes',2);s.flags.stole_field_notes=true;return 'Excellent notes. Questionable acquisition.';}},
   {text:'Call out and move on.',result:s=>'Something splashes far away. Nobody answers.'}
 ]}
);
},{"patch": "js/v7.js", "line": 193, "bytes": 3143, "kind": "direct"});
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
define("v7@L375",function(){
RF.DATA.events.push({id:'heron_stair',title:'The Heron That Faces Down',icon:'🪶',once:true,locations:['drowned_ruins'],weight:12,condition:s=>s.flags.heron_rumour&&!s.flags.heron_chamber_open,text:'At low water you notice one stone heron faces the flooded courtyard rather than the horizon. Its pedestal is scored by old tool marks.',choices:[
 {text:'Study the pedestal.',condition:s=>s.skills.exploration.level>=8,result:s=>{s.flags.heron_chamber_open=true;RF.addXp(s,'exploration',55);return 'A concealed catch releases. Black water drains from a stair descending beneath the courtyard.';}},
 {text:'Try the old lock with a pick.',condition:s=>(s.inventory.lockpick||0)>0&&s.skills.thieving.level>=7,result:s=>{RF.takeItem(s,'lockpick',1);s.flags.heron_chamber_open=true;RF.addXp(s,'thieving',45);return 'The bronze mechanism clicks after several careful minutes. A submerged stair slowly clears.';}},
 {text:'Leave the monument alone.',result:s=>'The heron continues staring into the water.'}
]});
},{"patch": "js/v7.js", "line": 375, "bytes": 1004, "kind": "direct"});
define("v8@L64",function(){
RF.DATA.roadEvents=[
 {id:'broken_cart',icon:'🛞',title:'A Wheel in the Ditch',text:'A merchant is wrestling with a snapped cart wheel while a mule watches with the calm superiority of a creature not expected to understand carpentry.',choices:[
   {text:'Help lift the cart.',result:s=>{RF.addXp(s,'strength',18);RF.addXp(s,'speech',8);if(Math.random()<.55){RF.addItem(s,'bread',1);s.gold+=6;return 'Together you lever the cart free. The merchant presses bread and a few coins into your hand.'}return 'You get the wheel seated again. The merchant thanks you sincerely before rattling away.';}},
   {text:'Offer to sell them a spare tool.',condition:s=>(s.inventory.crude_axe||0)>1,result:s=>{RF.takeItem(s,'crude_axe',1);s.gold+=28;RF.addXp(s,'trading',20);return 'They overpay rather gratefully for the crude axe and improvise a brace from its handle.';}},
   {text:'Wish them luck and continue.',result:s=>'You leave them arguing with the wheel. The mule appears vindicated.'}
 ]},
 {id:'roadside_cache',icon:'🧺',title:'Something Under the Hedge',text:'A scrap of waxed cloth protrudes beneath the roots beside the road. It could be dropped cargo. It could also be bait.',choices:[
   {text:'Search carefully.',result:s=>{let good=Math.random()<.7+s.skills.perception?.level*.005;if(good){let id=Math.random()<.45?'lockpick':'field_tonic';RF.addItem(s,id,1);RF.addXp(s,'exploration',20);return `You uncover a small forgotten cache containing ${RF.DATA.items[id].name}.`}s.crime.heat=Math.min(100,(s.crime.heat||0)+4);return 'The bundle is empty except for a chalk mark used by roadside thieves. You move on before its owner returns.';}},
   {text:'Leave it.',result:s=>'Not every suspicious bundle needs to become part of your biography.'}
 ]},
 {id:'sudden_storm',icon:'⛈️',title:'Rain Like Thrown Gravel',text:'The sky closes almost at once. Wind drives cold rain across the road and visibility collapses.',choices:[
   {text:'Shelter and wait it out.',result:s=>{if(s.activity?.type==='travel')s.activity.duration+=12;RF.advanceWorld(12);RF.addXp(s,'survival',14);return 'You crouch beneath cover until the worst passes. The delay costs time, but little else.';}},
   {text:'Push through.',result:s=>{let ok=Math.random()<.55+s.skills.survival.level*.018;if(ok){RF.addXp(s,'survival',24);return 'You keep your footing and make surprisingly good time through the downpour.'}s.player.stamina=Math.max(0,s.player.stamina-18);if(s.activity?.type==='travel')s.activity.duration+=5;return 'Mud drags at every step. You emerge soaked, tired and several minutes behind.';}}
 ]},
 {id:'passing_company',icon:'🔥',title:'Smoke Beside the Road',text:'Three travellers have made a tiny roadside fire and wave as you approach. Their kettle smells considerably better than the weather.',choices:[
   {text:'Share the fire for a few minutes.',result:s=>{RF.advanceWorld(8);s.player.stamina=Math.min(s.player.maxStamina,s.player.stamina+16);RF.addXp(s,'speech',10);return 'You trade small stories and worse jokes. Nothing world-changing happens, which is rather pleasant.';}},
   {text:'Ask if they have anything to trade.',result:s=>{s.gold=Math.max(0,s.gold-0);RF.addXp(s,'trading',6);RF.addItem(s,'wild_berries',1);return 'They have little to spare, but one traveller hands you a wrapped portion of berries for the road.';}},
   {text:'Keep moving.',result:s=>'You exchange waves and carry on.'}
 ]},
 {id:'forked_tracks',icon:'👣',title:'Fresh Tracks Across the Road',text:'Tracks leave the road toward rough ground. Heavy boots, hurried pace, at least two people.',choices:[
   {text:'Follow them.',result:s=>{RF.addXp(s,'hunting',16);RF.addXp(s,'exploration',16);if(Math.random()<.48){setTimeout(()=>RF.startBattle(s.location==='marshroad'?'fenroad_raider':'bandit',{forced:true}),100);return 'The trail bends behind cover. Someone was waiting.'}s.gold+=9;return 'The trail ends at an abandoned pack. You salvage 9 gold from a torn purse.';}},
   {text:'Mark the trail and continue.',result:s=>{RF.addXp(s,'exploration',8);return 'You make a note of the sign and keep to the road.';}}
 ]},
 {id:'animal_crossing',icon:'🦌',title:'Movement Ahead',text:'Something large moves through the brush beside the road, close enough that you hear branches flex.',choices:[
   {text:'Stop and observe.',result:s=>{RF.addXp(s,'hunting',14);RF.addXp(s,'exploration',10);return 'You wait quietly until a wary animal crosses the road and vanishes into cover. Useful tracks remain behind.';}},
   {text:'Make noise and move on.',result:s=>'Whatever it was chooses distance over curiosity.'}
 ]}
];
},{"patch": "js/v8.js", "line": 64, "bytes": 4590, "kind": "direct"});
define("v8_1@L39",function(){
Object.assign(RF.DATA.abilities,{
  feint:{name:'Feint',icon:'🌀',level:2,skill:'attack',desc:'A deceptive opening that Exposes the enemy for 2 turns.',cost:7,cooldown:2,kind:'status',targetStatus:{id:'exposed',turns:2}},
  brace:{name:'Brace',icon:'🛡️',level:2,skill:'defence',desc:'Set your feet, guard the next blow and recover a little stamina.',cost:0,cooldown:1,kind:'guard',v81Stamina:8},
  cleave:{name:'Cleave',icon:'🪓',level:5,skill:'strength',desc:'A broad, forceful cut. Stronger than Strike but less accurate.',cost:12,cooldown:1,kind:'attack',power:1.38,accuracy:.84},
  shield_bash:{name:'Shield Bash',icon:'💢',level:6,skill:'defence',desc:'A compact defensive strike with a good chance to Stagger.',cost:12,cooldown:2,kind:'attack',power:.92,accuracy:.94,status:{id:'stagger',chance:.48,turns:1}},
  sunder:{name:'Sundering Swing',icon:'⚒️',level:8,skill:'strength',desc:'Drive through armour and leave it Broken.',cost:20,cooldown:3,kind:'attack',power:1.48,accuracy:.80,status:{id:'broken_armor',chance:.82,turns:3}},
  tactical_cut:{name:'Tactical Cut',icon:'♟️',level:9,skill:'attack',desc:'A controlled hit that can Weaken an enemy’s next attacks.',cost:15,cooldown:2,kind:'attack',power:1.15,accuracy:.97,status:{id:'weakened',chance:.62,turns:2}},
  iron_wall:{name:'Iron Wall',icon:'🧱',level:10,skill:'defence',desc:'Guard while forcing the enemy into a weakened attack.',cost:15,cooldown:4,kind:'guard',v81WeakenEnemy:true},
  executioner:{name:'Executioner',icon:'⚔️',level:12,skill:'attack',desc:'A precise finishing strike that becomes brutal against wounded enemies.',cost:22,cooldown:3,kind:'attack',power:1.34,accuracy:.92,v81Execute:true},
  reckless:{name:'Reckless Blow',icon:'☄️',level:13,skill:'strength',desc:'Enormous force, poor accuracy. A hit can Stagger; a miss wastes the opening.',cost:27,cooldown:3,kind:'attack',power:2.15,accuracy:.62,status:{id:'stagger',chance:.5,turns:1}},
  adrenaline_break:{name:'Adrenaline Break',icon:'🌟',level:4,desc:'SPECIAL • Once per battle. A committed attack scaling from Attack and Strength.',cost:0,cooldown:99,kind:'attack',power:2.28,accuracy:.94,crit:.22,oncePerBattle:true,special:true}
});
},{"patch": "js/v8_1.js", "line": 39, "bytes": 2213, "kind": "abilities"});
define("v8_1@L105",function(){
Object.assign(RF.DATA.enemyMoves,{
  lunge:{name:'Lunge',power:1.18,accuracy:.84},
  rend:{name:'Rend',power:.96,accuracy:.88,status:{id:'bleed',chance:.58,turns:3}},
  headbutt:{name:'Headbutt',power:.94,accuracy:.9,status:{id:'stagger',chance:.38,turns:1}},
  maul:{name:'Maul',power:1.48,accuracy:.7},
  feint:{name:'Feint',power:.55,accuracy:.97,status:{id:'exposed',chance:.72,turns:2}},
  war_cry:{name:'War Cry',kind:'buff',status:{id:'focused',turns:2}},
  shield_rush:{name:'Shield Rush',power:.82,accuracy:.9,status:{id:'stagger',chance:.42,turns:1}},
  tail_sweep:{name:'Tail Sweep',power:.9,accuracy:.91,status:{id:'weakened',chance:.5,turns:2}},
  crushing_bite:{name:'Crushing Bite',power:1.32,accuracy:.82,status:{id:'bleed',chance:.32,turns:2}},
  acid_spit:{name:'Acid Spit',power:.78,accuracy:.9,status:{id:'broken_armor',chance:.48,turns:2}},
  ember_breath:{name:'Ember Breath',power:1.03,accuracy:.86,status:{id:'burn',chance:.68,turns:3}},
  flame_pounce:{name:'Flame Pounce',power:1.28,accuracy:.82,status:{id:'burn',chance:.38,turns:2}},
  undertow:{name:'Undertow',power:.82,accuracy:.9,status:{id:'weakened',chance:.7,turns:2}},
  drowned_grip:{name:'Drowned Grip',power:1.08,accuracy:.88,status:{id:'stagger',chance:.35,turns:1}},
  stone_guard:{name:'Stone Guard',kind:'guard'},
  horn_charge:{name:'Horn Charge',power:1.45,accuracy:.74,status:{id:'stagger',chance:.4,turns:1}},
  skitter:{name:'Skitter',kind:'buff',status:{id:'focused',turns:2}},
  pincer:{name:'Pincer Crush',power:1.22,accuracy:.84},
  venom_spray:{name:'Venom Spray',power:.58,accuracy:.91,status:{id:'poison',chance:.7,turns:3}},
  royal_gaze:{name:'Royal Gaze',kind:'status',status:{id:'weakened',turns:3}},
  flood_call:{name:'Flood Call',power:.92,accuracy:.93,status:{id:'exposed',chance:.7,turns:2}},
  stone_beak:{name:'Stone Beak',power:1.52,accuracy:.79,status:{id:'broken_armor',chance:.5,turns:2}}
});
},{"patch": "js/v8_1.js", "line": 105, "bytes": 1912, "kind": "enemyMoves"});
define("v9_2@L15",function(){
Object.assign(RF.DATA.items,{
  boar_tusk:{name:'Razorback Tusk',icon:'🦷',type:'material',value:19,desc:'A thick tusk prized by carvers and charm-makers.'},
  adder_scale:{name:'Thorn Adder Scale',icon:'🐍',type:'material',value:17,desc:'A patterned scale with a faint herbal scent.'},
  crow_feather:{name:'Blackroad Feather',icon:'🪶',type:'material',value:11,desc:'Oil-dark feather from a road crow.'},
  cave_chitin:{name:'Cave Chitin',icon:'🪲',type:'material',value:24,desc:'Hard shell plate from deep-dwelling vermin.'},
  troll_tooth:{name:'Troll Tooth',icon:'🦷',type:'treasure',value:58,rarity:'Uncommon',desc:'Too large to be comfortable evidence of anything.'},
  drake_scale:{name:'Stoneback Scale',icon:'🦎',type:'material',value:68,rarity:'Rare',desc:'A dense mineralised scale that rings when struck.'},
  wisp_core:{name:'Wisp Core',icon:'🔵',type:'material',value:74,rarity:'Rare',desc:'A cold knot of light that refuses to go fully dark.'},
  raider_token:{name:'Raider Token',icon:'🪙',type:'treasure',value:44,desc:'A stamped token used among road gangs.'},
  croc_tooth:{name:'Fen Croc Tooth',icon:'🦷',type:'material',value:31,desc:'A serrated tooth from a mature fen crocodile.'},
  mire_amber:{name:'Mire Amber',icon:'🟠',type:'treasure',value:92,rarity:'Rare',desc:'Dark amber containing a tiny marsh fly and several bad centuries.'}
});
},{"patch": "js/v9_2.js", "line": 15, "bytes": 1384, "kind": "items"});
define("v9_2@L27",function(){
Object.assign(RF.DATA.enemyMoves,{
  peck:{name:'Raking Peck',power:.76,accuracy:.96},
  wing_flurry:{name:'Wing Flurry',power:.92,accuracy:.9,status:{id:'exposed',chance:.25,turns:1}},
  tusk_rush:{name:'Tusk Rush',power:1.24,accuracy:.84},
  burrow_snap:{name:'Burrow Snap',power:1.04,accuracy:.91},
  shell_guard:{name:'Shell Guard',kind:'guard'},
  mire_spit:{name:'Mire Spit',power:.72,accuracy:.9,status:{id:'weakened',chance:.42,turns:2}}
});
},{"patch": "js/v9_2.js", "line": 27, "bytes": 449, "kind": "enemyMoves"});
define("v9_2@L35",function(){
Object.assign(RF.DATA.enemies,{
  road_crow:{name:'Blackroad Crow',icon:'🐦‍⬛',hp:34,damage:[3,7],armor:0,xp:38,gold:[0,2],drops:[['crow_feather',.75,1],['drowned_coin',.015,1]],level:2,temperament:'skittish',moves:['peck','wing_flurry']},
  razorback:{name:'Razorback Boar',icon:'🐗',hp:88,damage:[7,15],armor:3,xp:118,gold:[0,3],drops:[['raw_meat',.82,2],['boar_tusk',.55,1]],level:7,temperament:'territorial',moves:['gore','tusk_rush','brace']},
  tunnel_beetle:{name:'Ironback Beetle',icon:'🪲',hp:76,damage:[5,12],armor:7,xp:112,gold:[0,2],drops:[['cave_chitin',.68,1],['coal',.14,1]],level:7,temperament:'territorial',moves:['burrow_snap','shell_guard','scrabble']},
  ridge_brute:{name:'Ridge Brute',icon:'🧌',hp:168,damage:[12,23],armor:5,xp:238,gold:[8,21],drops:[['troll_tooth',.48,1],['raw_meat',.35,1]],level:14,temperament:'aggressive',moves:['club','headbutt','roar']},
  marsh_lurker:{name:'Marsh Lurker',icon:'🦎',hp:102,damage:[8,17],armor:4,xp:154,gold:[0,5],drops:[['croc_tooth',.28,1],['redroot',.12,1]],level:10,temperament:'territorial',moves:['snap','mire_spit','coil']},
  grave_moth:{name:'Grave Moth',icon:'🦋',hp:82,damage:[7,15],armor:1,xp:146,gold:[2,8],drops:[['wisp_core',.16,1],['mooncap',.15,1]],level:10,temperament:'aggressive',moves:['wing_flurry','hex','drift']}
});
},{"patch": "js/v9_2.js", "line": 35, "bytes": 1319, "kind": "enemies"});
define("v9_3@L16",function(){
Object.assign(RF.DATA.quests,{
  greenvale_teeth:{name:'Teeth at the Hedgerows',desc:'Something is worrying livestock around Sunmeadow after dusk. Thin the predators before the farmers start losing animals.',objectives:[{type:'kill',target:'wolf',value:4,text:'Defeat 4 Grey Wolves'},{type:'kill',target:'razorback',value:2,text:'Defeat 2 Razorbacks'}],reward:{gold:95,xp:140,item:'cooked_meat'}},
  river_provisions:{name:'River Provisions',desc:'The Crooked Ladle needs fresh river food before the next caravan arrives.',objectives:[{type:'item',target:'fish',value:5,text:'Carry 5 Riverfish'},{type:'skill',target:'fishing',value:3,text:'Reach Fishing level 3'}],reward:{gold:75,xp:105,item:'bread'}},
  miners_due:{name:"A Miner's Due",desc:'Brann needs replacement iron stock after a support collapse swallowed half the good tools.',objectives:[{type:'item',target:'iron_ore',value:8,text:'Carry 8 Iron Ore'},{type:'skill',target:'mining',value:5,text:'Reach Mining level 5'}],reward:{gold:125,xp:165,item:'iron_bar'}},
  woodland_ledger:{name:'The Woodland Ledger',desc:'Elira wants a proper survey of Whisperwood rather than tavern stories and claw-mark arithmetic.',objectives:[{type:'visit',target:'forest',text:'Visit Whisperwood'},{type:'skill',target:'woodcutting',value:6,text:'Reach Woodcutting level 6'},{type:'kill',target:'rogue_stag',value:1,text:'Defeat a Briar Stag'}],reward:{gold:115,xp:175,item:'herb'}},
  ironridge_contract:{name:'Stone and Scale',desc:'Ironridge smiths are paying for proof that the quarry drakes are nesting closer to the work crews.',objectives:[{type:'visit',target:'quarry',text:'Reach Redstone Quarry'},{type:'kill',target:'quarry_drake',value:2,text:'Defeat 2 Stoneback Drakes'}],reward:{gold:260,xp:340,item:'steel_bar'}},
  marsh_medicine:{name:'Bitter Medicine',desc:'Nessa Vale needs ingredients gathered from the fen before another fever runs through Reedmere.',objectives:[{type:'item',target:'redroot',value:4,text:'Carry 4 Redroot'},{type:'item',target:'mooncap',value:2,text:'Carry 2 Mooncaps'},{type:'skill',target:'herblore',value:5,text:'Reach Herblore level 5'}],reward:{gold:180,xp:260,item:'antivenom'}},
  field_notes:{name:'Field Notes: Dangerous Neighbours',desc:'Maelin Quill is compiling practical observations on creatures that object to being observed.',objectives:[{type:'kill',target:'fen_croc',value:2,text:'Defeat 2 Fen Crocodiles'},{type:'kill',target:'lantern_wisp',value:2,text:'Defeat 2 Lantern Wisps'}],reward:{gold:210,xp:300,item:'marsh_charm'}},
  locksmiths_errand:{name:"The Locksmith's Errand",desc:'Cobb Rill insists a respectable locksmith occasionally needs other people to open things for him.',objectives:[{type:'skill',target:'thieving',value:5,text:'Reach Thieving level 5'},{type:'item',target:'lockpick',value:3,text:'Carry 3 Lockpicks'}],reward:{gold:145,xp:220}}
});
},{"patch": "js/v9_3.js", "line": 16, "bytes": 2863, "kind": "quests"});
define("v10_27@L21",function(){
RF.DATA.items.lockpick=Object.assign(RF.DATA.items.lockpick||{}, {
  name:'Lockpick',icon:'🗝️',type:'utility',value:9,
  desc:'A slender iron pick for locks. Stackable and consumed whenever a lockpicking attempt fails.'
});
},{"patch": "js/v10_27.js", "line": 21, "bytes": 228, "kind": "direct"});
define("v10_27@L29",function(){
RF.DATA.recipes=RF.DATA.recipes||{};
},{"patch": "js/v10_27.js", "line": 29, "bytes": 36, "kind": "direct"});
define("v10_27@L30",function(){
RF.DATA.recipes.iron_lockpicks={name:'Forge Lockpicks',skill:'smithing',level:4,time:10,inputs:{iron_bar:1},outputs:{lockpick:3},xp:44};
},{"patch": "js/v10_27.js", "line": 30, "bytes": 136, "kind": "direct"});
if(RF.Modules?.register)RF.Modules.register('data.legacyContentBlocks',api,{owner:'data',status:'canonical',blocks:blocks.size});
})();

/* ===== js/data/config_registry.js ===== */
/* Realmforge V11.10.0 — canonical static configuration registry. */
(() => {
  'use strict';
  const RF=window.RF;
  const defs=new Map();
  const cloneValue=v=>{
    if(Array.isArray(v))return v.map(cloneValue);
    if(v&&typeof v==='object'){const o={};for(const [k,x] of Object.entries(v))o[k]=cloneValue(x);return o;}
    return v;
  };
  const deepFreeze=v=>{
    if(!v||typeof v!=='object'||Object.isFrozen(v))return v;
    Object.freeze(v);for(const x of Object.values(v))deepFreeze(x);return v;
  };
  const api={
    define(name,value,meta={}){if(defs.has(name))throw new Error(`Duplicate Realmforge config: ${name}`);defs.set(name,{value:deepFreeze(value),meta:{...meta}});return value;},
    get(name){return defs.get(name)?.value??null;},
    clone(name){const d=defs.get(name);if(!d)throw new Error(`Missing Realmforge config: ${name}`);return cloneValue(d.value);},
    has:name=>defs.has(name),
    keys:()=>Array.from(defs.keys()),
    entries:()=>Array.from(defs.entries()).map(([name,d])=>({name,...d.meta})),
    size:()=>defs.size
  };
  RF.Config=RF.Modules.register('data.config',api,{owner:'data',status:'canonical'});
})();

/* ===== js/data/world_config_v11_10.js ===== */
/* Realmforge V11.10.0 — canonical gameplay/world configuration payloads.
   Static tables extracted from the historical compatibility runtime.
   Gameplay code receives mutable clones so mature behaviour remains unchanged. */
(() => {
  'use strict';
  const C=window.RF.Config;
  if(!C)throw new Error('RF.Config must load before world configuration.');
  C.define("exploration.chests",{
  low:{key:'low',name:'Weathered Chest',icon:'🧰',label:'TIER I',level:3,color:'#b99362',desc:'A small road-worn chest with an ordinary pin lock.'},
  medium:{key:'medium',name:'Ironbound Chest',icon:'🗃️',label:'TIER II',level:8,color:'#b7bec8',desc:'Iron straps reinforce a heavier chest. The lock is much less forgiving.'},
  rare:{key:'rare',name:'Gilded Strongbox',icon:'✨',label:'TIER III',level:15,color:'#e1bd63',desc:'An unusually fine strongbox, hidden well enough that somebody cared about its contents.'}
},{"source": "js/v10_25.js", "bytes": 528});
  C.define("exploration.extraEnemies",{
  greenvale:[['rat',4],['road_crow',1]],
  mill:[['rat',4],['road_crow',2]],
  guildhall:[['rat',1]],
  watchtower:[['wolf',2],['bandit',1],['road_crow',2]],
  ruins:[['grave_moth',3],['skeleton',1],['rat',1]],
  bandit_camp:[['bandit',5],['feral_hound',2]],
  ironridge:[['tunnel_beetle',2],['ridge_raider',1]]
},{"source": "js/v10_27.js", "bytes": 315});
  C.define("exploration.localExtras",{
  greenvale:['herb','wild_berries','bread'],mill:['bread','herb','logs'],guildhall:['field_tonic','bread','traveller_token'],
  watchtower:['arrow','field_tonic','bread','crow_feather'],ruins:['cave_mushroom','old_bone_dice','warding_salt'],
  crypt:['cave_mushroom','old_bone_dice','warding_salt'],crossroads:['wild_berries','bread','crow_feather'],
  bandit_camp:['arrow','bandit_token','smoke_bomb','lockpick'],northroad:['crow_feather','wolf_pelt','raider_token','herb'],
  ironridge:['iron_ore','coal','iron_bar','whetstone']
},{"source": "js/v10_27.js", "bytes": 534});
  C.define("exploration.gearPools",{
    Greenvale:{low:['rusty_sword','bronze_sword','bronze_buckler','leather_vest','shortbow'],medium:['iron_sword','iron_helm','ranger_cloak','bronze_buckler'],rare:['steel_sword','steel_helm','ranger_cloak']},
    Ironridge:{low:['bronze_sword','bronze_buckler','iron_helm','iron_sword'],medium:['iron_sword','steel_sword','steel_helm'],rare:['steel_sword','steel_helm','steel_cuirass','silvered_blade']},
    Mirefen:{low:['leather_vest','shortbow','bronze_buckler'],medium:['fen_leathers','marshbow','iron_sword'],rare:['fen_leathers','marshbow','mire_ring','silvered_blade']},
    'The Marches':{low:['iron_sword','iron_helm','shortbow'],medium:['steel_sword','steel_helm','ranger_cloak'],rare:['steel_sword','steel_cuirass','silvered_blade']}
  },{"source": "js/v10_27.js", "bytes": 752});
  C.define("crime.greenvaleBurglarySites",[
  {id:'baker',name:'Baker’s Back Room',icon:'🥖',difficulty:16,difficultyLabel:'Easy',loot:[4,10],items:['bread','honey_cake','wild_berries'],itemChance:.22,quickRolls:1,deepRolls:1,entryBounty:12,caughtBounty:18,lockBounty:14,desc:'A cheap latch behind a busy bakery. Mostly food, loose change and little worth fencing.'},
  {id:'chandler',name:'Chandler’s Shed',icon:'🕯️',difficulty:28,difficultyLabel:'Light',loot:[8,18],items:['torch','waxed_thread','herb'],itemChance:.30,quickRolls:1,deepRolls:1,entryBounty:22,caughtBounty:32,lockBounty:24,desc:'Wax, lamp oil and workshop odds and ends. Better secured than it looks, but still small-time.'},
  {id:'clothier',name:'Clothier’s Loft',icon:'🧵',difficulty:42,difficultyLabel:'Tricky',loot:[14,30],items:['waxed_thread','traveller_token','leather_vest'],itemChance:.38,quickRolls:1,deepRolls:2,entryBounty:35,caughtBounty:50,lockBounty:38,desc:'Bolts of cloth, travelling goods and a locked till above the shop floor.'},
  {id:'merchant_counting',name:'Merchant’s Counting Room',icon:'🧾',difficulty:56,difficultyLabel:'Guarded',loot:[25,48],items:['traveller_token','field_tonic','silver_ore','lucky_charm'],itemChance:.46,quickRolls:1,deepRolls:2,entryBounty:55,caughtBounty:78,lockBounty:60,desc:'Ledgers, coin drawers and stock samples. The merchant pays for decent locks and alert neighbours.'},
  {id:'quartermaster',name:'Wayfarer Quartermaster’s Annex',icon:'🛡️',difficulty:68,difficultyLabel:'Severe',loot:[40,75],items:['whetstone','bronze_bar','iron_helm','iron_sword','bronze_buckler'],itemChance:.54,quickRolls:1,deepRolls:2,entryBounty:80,caughtBounty:110,lockBounty:85,desc:'A supply annex holding coin, repair materials and field equipment. Guild eyes are rarely far away.'},
  {id:'magistrate_house',name:'Magistrate’s Townhouse',icon:'⚖️',difficulty:82,difficultyLabel:'Brutal',loot:[65,110],items:['silver_bar','steel_bar','lucky_charm','ranger_cloak'],itemChance:.64,quickRolls:1,deepRolls:2,entryBounty:115,caughtBounty:155,lockBounty:120,desc:'Private wealth behind serious locks, with watch patrols close enough to make every creak expensive.'},
  {id:'gilded_manor',name:'Gilded Manor',icon:'🏛️',difficulty:96,difficultyLabel:'Nearly Impossible',loot:[100,175],items:['silver_bar','steel_bar','ranger_cloak','steel_sword','steel_helm','silvered_blade'],itemChance:.76,quickRolls:1,deepRolls:2,entryBounty:165,caughtBounty:220,lockBounty:170,desc:'Greenvale old money. Reinforced locks, servants, watch connections and valuables worth the insanity.'}
],{"source": "js/v10_30.js", "bytes": 2568});
  C.define("crime.greenvaleBurglaryBalance",{
  baker:{loot:[2,5],itemChance:.08,quickRolls:1,deepRolls:1,entryBounty:15,lockBounty:18,caughtBounty:24,recommended:1,lockWindow:68,lockRev:1.90,lockStroke:10,label:'Easy'},
  chandler:{loot:[4,9],itemChance:.12,quickRolls:1,deepRolls:1,entryBounty:25,lockBounty:30,caughtBounty:40,recommended:3,lockWindow:58,lockRev:1.70,lockStroke:9,label:'Light'},
  clothier:{loot:[7,15],itemChance:.18,quickRolls:1,deepRolls:1,entryBounty:40,lockBounty:48,caughtBounty:65,recommended:6,lockWindow:50,lockRev:1.50,lockStroke:8,label:'Tricky'},
  merchant_counting:{loot:[12,24],itemChance:.24,quickRolls:1,deepRolls:2,entryBounty:65,lockBounty:75,caughtBounty:100,recommended:9,lockWindow:42,lockRev:1.34,lockStroke:7,label:'Guarded'},
  quartermaster:{loot:[18,34],itemChance:.30,quickRolls:1,deepRolls:2,entryBounty:95,lockBounty:110,caughtBounty:145,recommended:13,lockWindow:34,lockRev:1.20,lockStroke:6,label:'Severe'},
  magistrate_house:{loot:[28,50],itemChance:.36,quickRolls:1,deepRolls:2,entryBounty:140,lockBounty:160,caughtBounty:210,recommended:18,lockWindow:28,lockRev:1.08,lockStroke:5.5,label:'Brutal'},
  gilded_manor:{loot:[45,80],itemChance:.42,quickRolls:1,deepRolls:2,entryBounty:210,lockBounty:240,caughtBounty:300,recommended:25,lockWindow:24,lockRev:.98,lockStroke:5,label:'Nearly Impossible'}
},{"source": "js/v10_31.js", "bytes": 1310});
  C.define("services.banks",{
  greenvale:{name:'Greenvale Bank',icon:'🏦'},
  ironridge:{name:'Ironridge Bank',icon:'🏦'},
  reedmere:{name:'Reedmere Bank',icon:'🏦'}
},{"source": "js/v10_47.js", "bytes": 147});
  C.define("commerce.markets",{
  greenvale:{name:'Greenvale Market',icon:'🏪',tier:1,buy:1.00,sell:1.00,demand:{consumables:1.00,materials:1.00,tools:.95,weapons:.95,armour:.95,treasure:.90,other:.90},stock:[
    ['bread',8,16,.92],['honey_cake',2,5,1.00],['potion',3,7,1.00],['herb',4,8,.95],['torch',4,8,.95],['lockpick',3,6,1.02],['arrow',16,30,.95],['rusty_sword',1,2,.90],['shortbow',1,2,1.00],['leather_vest',1,2,.95],['bronze_sword',1,2,1.05],['bronze_buckler',1,2,1.05],['greenvale_jerkin',1,2,1.00]
  ]},
  mill:{name:'Greenvale Mill Exchange',icon:'🌾',tier:1,buy:.94,sell:1.00,demand:{consumables:1.10,materials:1.08,tools:.88,weapons:.80,armour:.80,treasure:.80,other:.90},stock:[
    ['bread',12,24,.78],['millers_pie',5,10,.90],['raw_meat',5,10,.90],['cooked_meat',3,6,.95],['logs',5,10,.88],['herb',3,7,.95],['waxed_thread',2,5,1.00],['honey_cake',2,4,1.00]
  ]},
  crossroads:{name:'Kingroad Caravan Market',icon:'🛒',tier:2,buy:1.08,sell:1.03,demand:{consumables:1.00,materials:.95,tools:1.05,weapons:1.02,armour:1.02,treasure:1.08,other:1.05},stock:[
    ['bread',4,8,1.05],['field_tonic',1,3,1.10],['traveller_token',2,5,1.05],['lockpick',2,5,1.05],['fine_lockpick',1,2,1.15],['arrow',12,24,1.05],['whetstone',2,4,1.00],['smoke_bomb',1,3,1.15],['crossroads_cutlass',1,2,1.00],['ranger_cloak',1,2,1.12]
  ]},
  guildhall:{name:'Wayfarer Quartermaster',icon:'🧭',tier:2,buy:1.06,sell:1.02,demand:{consumables:.96,materials:.92,tools:1.08,weapons:1.02,armour:1.05,treasure:1.06,other:1.00},stock:[
    ['field_tonic',2,5,.98],['honey_cake',2,4,1.00],['traveller_token',3,6,.95],['field_manual',1,2,1.00],['wayfarer_coat',1,2,1.00],['tinderbox',1,2,1.00],['whetstone',2,5,.95],['arrow',12,20,1.00],['ranger_cloak',1,2,1.00]
  ]},
  watchtower:{name:'Eastwatch Quartermaster',icon:'🛡️',tier:2,buy:1.08,sell:1.02,demand:{consumables:1.00,materials:.90,tools:1.00,weapons:1.10,armour:1.10,treasure:.85,other:1.02},stock:[
    ['bread',4,8,1.00],['field_tonic',2,4,1.00],['arrow',20,40,.88],['whetstone',3,6,.90],['warding_salt',1,3,1.05],['bronze_buckler',1,2,.98],['ranger_cloak',1,2,1.00],['watch_spear',1,2,.95]
  ]},
  mine:{name:"Miners' Supply Cage",icon:'⛏️',tier:2,buy:1.02,sell:1.02,demand:{consumables:.95,materials:1.10,tools:1.10,weapons:.88,armour:1.02,treasure:.84,other:.92},stock:[
    ['bread',3,6,1.05],['torch',5,10,.85],['crude_pickaxe',2,4,.85],['iron_pickaxe',1,2,.95],['miners_helm',1,2,1.00],['coal',6,14,.90],['copper_ore',4,9,.95],['field_tonic',1,3,1.10],['whetstone',2,4,.95]
  ]},
  ironridge:{name:'Ironridge Forge Market',icon:'⚒️',tier:3,buy:.96,sell:1.04,demand:{consumables:.90,materials:1.12,tools:1.10,weapons:1.06,armour:1.06,treasure:.92,other:.90},stock:[
    ['bread',4,8,1.15],['coal',8,18,.78],['iron_ore',6,14,.82],['steel_bar',3,7,.88],['iron_pickaxe',2,4,.88],['steel_pickaxe',1,2,.92],['iron_axe',2,3,.95],['steel_axe',1,2,.96],['steel_sword',1,3,.90],['steel_helm',1,3,.90],['steel_cuirass',1,2,.95],['whetstone',4,8,.80],['ironridge_warhammer',1,1,.95],['ironridge_kite_shield',1,1,.95]
  ]},
  quarry:{name:'Redstone Commissary',icon:'🧱',tier:3,buy:1.03,sell:1.04,demand:{consumables:1.00,materials:1.14,tools:1.12,weapons:1.00,armour:.94,treasure:.86,other:.90},stock:[
    ['bread',4,8,1.10],['field_tonic',2,4,1.05],['whetstone',3,6,.85],['iron_pickaxe',1,3,.90],['steel_pickaxe',1,2,.95],['iron_ore',5,10,.85],['coal',5,10,.90],['steel_bar',1,4,.95],['quarry_maul',1,2,1.00]
  ]},
  reedmere:{name:'Reedmere Stilt Market',icon:'🛶',tier:3,buy:1.02,sell:1.04,demand:{consumables:1.10,materials:1.10,tools:1.04,weapons:.98,armour:1.02,treasure:1.04,other:1.00},stock:[
    ['bread',4,8,1.10],['bait_grubs',10,20,.75],['river_rod',1,3,.90],['fine_lockpick',1,3,1.00],['redroot',5,10,.82],['mooncap',2,5,.95],['antivenom',2,5,.90],['focus_draught',1,3,1.00],['waxed_thread',3,6,.88],['marshbow',1,2,.95],['fen_leathers',1,2,.95],['reedmere_spear',1,2,1.00]
  ]},
  mirewatch:{name:'Mirewatch Outfitters',icon:'🏹',tier:4,buy:1.08,sell:1.05,demand:{consumables:1.08,materials:1.08,tools:1.06,weapons:1.08,armour:1.08,treasure:1.06,other:1.00},stock:[
    ['bread',3,6,1.15],['field_tonic',2,4,1.00],['antivenom',2,4,.90],['focus_draught',1,3,.95],['night_eye',1,2,1.05],['arrow',16,30,.95],['bait_grubs',6,12,.90],['whetstone',2,5,.95],['ranger_cloak',1,2,1.00],['marsh_charm',1,2,1.05],['mirewatch_bow',1,2,1.00],['mirewatch_hood',1,2,1.00]
  ]}
},{"source": "js/v10_54.js", "bytes": 4407});
  C.define("equipment.statBalance",{
  rusty_sword:          {damage:3, armor:0},
  bronze_sword:         {damage:6, armor:1},
  shortbow:             {damage:5, armor:0},
  iron_sword:           {damage:8, armor:2},
  crossroads_cutlass:   {damage:9, armor:2},
  watch_spear:          {damage:12,armor:2},
  blackthorn_blade:     {damage:13,armor:2},
  marshbow:             {damage:12,armor:1},
  reedmere_spear:       {damage:13,armor:2},
  silvered_blade:       {damage:14,armor:3},
  quarry_maul:          {damage:14,armor:2},
  steel_sword:          {damage:15,armor:3},
  mirewatch_bow:        {damage:16,armor:2},
  ironridge_warhammer:  {damage:18,armor:4},
  warden_blade:         {damage:20,armor:4},

  leather_vest:         {damage:1, armor:3},
  greenvale_jerkin:     {damage:1, armor:4},
  iron_helm:            {damage:1, armor:4},
  ranger_cloak:         {damage:2, armor:5},
  miners_helm:          {damage:1, armor:5},
  wayfarer_coat:        {damage:1, armor:6},
  steel_helm:           {damage:2, armor:7},
  mirewatch_hood:       {damage:2, armor:7},
  fen_leathers:         {damage:2, armor:8},
  bronze_buckler:       {damage:2, armor:3},
  ironridge_kite_shield:{damage:3, armor:9},
  steel_cuirass:        {damage:2, armor:11},
  ash_ring:             {damage:2, armor:2}
},{"source": "js/v10_55.js", "bytes": 1264});
  C.define("dungeons.base",{
  crypt:{
    name:'Forgotten Crypt',icon:'🪦',level:8,boss:'ossuary_regent',region:'Greenvale',
    desc:'Eight sealed chambers descend toward an ossuary throne. Every chamber must be cleared in one run.',
    pool:[['skeleton',5],['crypt_guard',3],['grave_moth',2],['cave_spider',2]],
    rewards:['regent_falchion','bonewall_buckler','ossuary_coif','tombwarden_greaves'],
    bonusGold:220,bonusXp:450,materials:[['crypt_sigil',1],['silver_ore',2]],flag:'cryptDungeonCleared'
  },
  ember_cave:{
    name:'Emberdeep Descent',icon:'🌋',level:13,boss:'cindermaw_tyrant',region:'Ironridge',
    desc:'A chain of furnace caverns drops toward a living magma nest. Eight chambers stand between you and its ruler.',
    pool:[['ash_wisp',4],['magma_crawler',4],['ember_hound',3],['tunnel_beetle',2],['quarry_drake',1]],
    rewards:['cindermaw_blade','emberplate_cuirass','magma_guard','cinderstep_boots'],
    bonusGold:360,bonusXp:700,materials:[['ember_shard',3],['steel_bar',2]],flag:'emberDungeonCleared'
  }
},{"source": "js/v11.js", "bytes": 1017});
  C.define("services.innLocations",['greenvale','ironridge','reedmere'],{"source": "js/v11_1.js", "bytes": 36});
  C.define("services.specialFacilities",{
  greenvale:[['🛠️','Village Workshop'],['🍳','Cottage Kitchen']],
  guildhall:[['📜','Wayfarer Contracts']],
  mirewatch:[['🛏️','Lodge Rest']]
},{"source": "js/v11_1.js", "bytes": 160});
  C.define("dungeons.v114EntitySpecs",[
['dusk_fox',{name:'Dusk Fox',icon:'🦊',level:4,armor:1,moves:['snap','circle','evade'],drops:[['raw_meat',.45,1],['lucky_charm',.025,1]],desc:'A lean fox made bold by roads and unattended packs.'}],
['briar_sprite',{name:'Briar Sprite',icon:'🧚',level:6,armor:1,moves:['cinder_touch','hex','drift'],drops:[['herb',.48,1],['ghost_orchid',.018,1]],desc:'A thorn-bright forest spirit with a malicious sense of territory.'}],
['river_leech',{name:'Silverrun Leech',icon:'🪱',level:3,armor:0,moves:['bite','grasp'],drops:[['herb',.22,1]],desc:'A hand-long river leech that strikes from reed shadows.'}],
['silver_crab',{name:'Silverbank Crab',icon:'🦀',level:4,armor:3,moves:['claw','brace'],drops:[['raw_meat',.46,1],['silver_ore',.025,1]],desc:'A bright-shelled crab from the colder gravel bars.'}],
['water_snake',{name:'Silverrun Water Snake',icon:'🐍',level:6,armor:1,moves:['bite','venom_bite','coil'],drops:[['adder_scale',.5,1],['venom_sac',.28,1]],desc:'A river snake whose bite numbs the limb before it starts to hurt.'}],
['river_stalker',{name:'Riverbank Stalker',icon:'🦎',level:8,armor:3,moves:['stone_bite','tail_sweep','circle'],drops:[['raw_meat',.55,1],['cave_chitin',.12,1]],desc:'A low-slung reptile that waits motionless beneath muddy ledges.'}],
['cave_bat',{name:'Cave Bat',icon:'🦇',level:2,armor:0,moves:['bite','wing_flurry','evade'],drops:[['raw_meat',.22,1]],desc:'A startled cave bat with absolutely no respect for personal space.'}],
['dust_rat',{name:'Dust Rat',icon:'🐀',level:3,armor:0,moves:['bite','scrabble'],drops:[['raw_meat',.38,1],['coal',.08,1]],desc:'A mine rat grey with stone dust and bad decisions.'}],
['stone_centipede',{name:'Stone Centipede',icon:'🐛',level:4,armor:2,moves:['bite','venom_bite','coil'],drops:[['cave_chitin',.58,1]],desc:'A plated centipede that nests between warm seams of rock.'}],
['tunnel_scavenger',{name:'Tunnel Scavenger',icon:'👺',level:5,armor:2,moves:['slash','dirty_trick','evade'],drops:[['iron_ore',.32,1],['bread',.08,1]],desc:'A feral tunnel-dweller that has learned the value of a dropped pick.'}],
['rock_worm',{name:'Rock Worm',icon:'🪱',level:8,armor:5,moves:['bite','stone_bite','brace'],drops:[['iron_ore',.58,2],['silver_ore',.12,1]],desc:'A thick mineral-feeding worm whose hide has hardened like shale.'}],
['pale_lurker',{name:'Pale Lurker',icon:'👹',level:8,armor:3,moves:['slash','grasp','evade'],drops:[['silver_ore',.22,1]],desc:'Something humanoid that learned to live without sunlight.'}],
['stone_ghoul',{name:'Stone Ghoul',icon:'🧟',level:9,armor:5,moves:['grasp','rend','brace'],drops:[['iron_ore',.5,1],['crypt_sigil',.025,1]],desc:'A corpse-like thing fused with mineral crust.'}],
['deepcrawler',{name:'Deep Crawler',icon:'🕷️',level:10,armor:4,moves:['bite','web','venom_bite'],drops:[['cave_chitin',.7,1],['venom_sac',.3,1]],desc:'A broad cave predator that hunts by vibration rather than sight.'}],
['deep_worm',{name:'Blackvein Worm',icon:'🪱',level:12,armor:7,moves:['stone_bite','tail_sweep','brace'],drops:[['silver_ore',.45,1],['steel_bar',.1,1]],desc:'A deep-burrowing worm whose hide carries black metallic veins.'}],
['cutpurse',{name:'Kingroad Cutpurse',icon:'🥷',level:4,armor:1,moves:['slash','dirty_trick','evade'],drops:[['lockpick',.25,1],['bandit_token',.18,1]],desc:'A petty road thief who prefers distraction to a fair fight.'}],
['road_viper',{name:'Kingroad Viper',icon:'🐍',level:5,armor:1,moves:['bite','venom_bite','coil'],drops:[['adder_scale',.55,1],['venom_sac',.22,1]],desc:'A warm-stone viper common around abandoned milestones.'}],
['highwayman',{name:'Blackroad Highwayman',icon:'🗡️',level:6,armor:3,moves:['slash','marked_shot','dirty_trick'],drops:[['bandit_token',.42,1],['bread',.2,1]],desc:'A road robber with enough equipment to be dangerous and enough confidence to be worse.'}],
['frost_crow',{name:'Northwatch Crow',icon:'🐦‍⬛',level:6,armor:1,moves:['peck','wing_flurry','evade'],drops:[['crow_feather',.8,1],['silver_ore',.02,1]],desc:'A large black crow that follows travellers into the colder hills.'}],
['mountain_goat',{name:'Ironhorn Goat',icon:'🐐',level:8,armor:4,moves:['gore','hoof_feint','brace'],drops:[['raw_meat',.7,2],['troll_tooth',.015,1]],desc:'A territorial mountain goat with horns polished by stone.'}],
['road_warg',{name:'March Warg',icon:'🐺',level:9,armor:3,moves:['snap','hamstring','roar'],drops:[['wolf_pelt',.72,1],['wolf_fang',.5,1]],desc:'A heavy northern wolf bred by weather rather than kindness.'}],
['cliff_harrier',{name:'Cliff Harrier',icon:'🦅',level:12,armor:2,moves:['peck','marked_shot','evade'],drops:[['crow_feather',.42,2],['lucky_charm',.035,1]],desc:'A huge hill raptor that attacks from blind angles.'}],
['dust_asp',{name:'Redstone Asp',icon:'🐍',level:8,armor:2,moves:['bite','venom_bite','coil'],drops:[['adder_scale',.62,1],['venom_sac',.3,1]],desc:'A quarry snake almost perfectly coloured like red spoil.'}],
['stone_tick',{name:'Stone Tick',icon:'🪲',level:9,armor:7,moves:['bite','brace','grasp'],drops:[['cave_chitin',.75,1],['iron_ore',.22,1]],desc:'A fist-sized tick whose shell has absorbed mineral grit.'}],
['quarry_hound',{name:'Quarry Hound',icon:'🐕',level:10,armor:4,moves:['snap','hamstring','circle'],drops:[['raw_meat',.4,1],['wolf_fang',.35,1]],desc:'A half-feral work hound descended from animals left in the pits.'}],
['slate_golem',{name:'Slate Golem',icon:'🗿',level:13,armor:10,moves:['stone_guard','club','brace'],drops:[['iron_ore',.7,2],['silver_ore',.18,1]],desc:'A walking slab of quarry stone animated by old marks under the dust.'}],
['cinder_bat',{name:'Cinder Bat',icon:'🦇',level:10,armor:1,moves:['cinder_touch','wing_flurry','evade'],drops:[['ember_shard',.18,1]],desc:'A soot-black bat whose wing edges glow when angered.'}],
['lava_tick',{name:'Lava Tick',icon:'🪲',level:11,armor:7,moves:['cinder_bite','brace','grasp'],drops:[['ember_shard',.28,1],['cave_chitin',.55,1]],desc:'A heatproof parasite that feeds near magma vents.'}],
['slag_golem',{name:'Slag Golem',icon:'🗿',level:15,armor:12,moves:['stone_guard','club','ember_breath'],drops:[['ember_shard',.55,2],['steel_bar',.22,1]],desc:'A lump of furnace slag dragged upright by something inside it.'}],
['bone_rat',{name:'Bone Rat',icon:'🐀',level:6,armor:2,moves:['bite','scrabble','grasp'],drops:[['crypt_sigil',.025,1]],desc:'A crypt rat armoured in fragments it should not have learned to wear.'}],
['tomb_wisp',{name:'Tomb Wisp',icon:'👻',level:7,armor:1,moves:['wisp_burn','hex','drift'],drops:[['warding_salt',.35,1]],desc:'A cold mote that circles sealed graves and extinguishes lamps.'}],
['restless_knight',{name:'Restless Knight',icon:'🛡️',level:12,armor:8,moves:['rusted_cleave','brace','royal_gaze'],drops:[['steel_bar',.24,1],['crypt_sigil',.16,1]],desc:'An armoured corpse still standing watch after its oath lost meaning.'}],
['sepulcher_hound',{name:'Sepulcher Hound',icon:'🐕‍🦺',level:13,armor:5,moves:['snap','hamstring','hex'],drops:[['wolf_fang',.38,1],['crypt_sigil',.12,1]],desc:'A grave-fed hound that moves without making a sound.'}],
['reed_serpent',{name:'Reed Serpent',icon:'🐍',level:6,armor:1,moves:['bite','venom_bite','coil'],drops:[['venom_sac',.34,1],['redroot',.12,1]],desc:'A marsh snake whose striped hide disappears between reeds.'}],
['fen_boar',{name:'Fen Boar',icon:'🐗',level:8,armor:4,moves:['gore','circle','brace'],drops:[['raw_meat',.78,2]],desc:'A mud-caked boar that treats raised walkways as a personal insult.'}],
['reed_rat',{name:'Reed Rat',icon:'🐀',level:4,armor:1,moves:['bite','scrabble'],drops:[['raw_meat',.35,1],['drowned_coin',.018,1]],desc:'A marsh rat large enough to make fishermen reconsider bare feet.'}],
['bog_adder',{name:'Bog Adder',icon:'🐍',level:6,armor:1,moves:['bite','venom_bite','coil'],drops:[['venom_sac',.38,1],['adder_scale',.5,1]],desc:'A dark marsh adder with a venomous bite and terrible manners.'}],
['stilt_thief',{name:'Stiltway Thief',icon:'🥷',level:8,armor:3,moves:['slash','dirty_trick','evade'],drops:[['lockpick',.3,1],['drowned_coin',.12,1]],desc:'A thief who knows which rope bridge creaks and which does not.'}],
['drowned_rat',{name:'Drowned Rat',icon:'🐀',level:8,armor:2,moves:['bite','grasp','scrabble'],drops:[['drowned_coin',.12,1]],desc:'A waterlogged rat that refuses to stay properly dead.'}],
['silt_specter',{name:'Silt Specter',icon:'👻',level:9,armor:1,moves:['wisp_burn','hex','drift'],drops:[['drowned_coin',.22,1],['ghost_orchid',.035,1]],desc:'A drowned shape that rises when mud is disturbed.'}],
['ruin_croc',{name:'Ruin Crocodile',icon:'🐊',level:13,armor:7,moves:['death_roll','snap','brace'],drops:[['croc_hide',.78,1],['drowned_coin',.14,1]],desc:'An old crocodile that nests among flooded masonry.'}],
['heron_shade',{name:'Heron Shade',icon:'🐦',level:17,armor:5,moves:['peck','royal_gaze','drift'],drops:[['drowned_coin',.42,1],['royal_seal',.018,1]],desc:'A long-legged shadow wearing the outline of a stone heron.'}],
['reed_viper',{name:'Mirewatch Viper',icon:'🐍',level:8,armor:1,moves:['bite','venom_bite','coil'],drops:[['venom_sac',.42,1]],desc:'A quick marsh viper that basks beneath the lodge boardwalk.'}],
['fen_lynx',{name:'Fen Lynx',icon:'🐈',level:10,armor:2,moves:['slash','circle','evade'],drops:[['raw_meat',.35,1],['lucky_charm',.025,1]],desc:'A marsh cat that hunts from low willow branches.'}],
['marsh_harrier',{name:'Marsh Harrier',icon:'🦅',level:11,armor:2,moves:['peck','marked_shot','evade'],drops:[['crow_feather',.55,2]],desc:'A broad-winged raptor that patrols open fen.'}],
['mire_bear',{name:'Mire Bear',icon:'🐻',level:13,armor:6,moves:['club','roar','brace'],drops:[['raw_meat',.8,2],['wolf_pelt',.18,1]],desc:'A huge dark bear accustomed to wading through waist-deep marsh.'}]],{"source": "js/v11_4.js", "bytes": 9829});
  C.define("world.ecosystems",{
  sunmeadow:[['road_crow',3],['wolf',2],['dusk_fox',2],['meadow_boar',4],['thorn_adder',3],['feral_hound',2],['razorback',2],['rogue_stag',1]],
  forest:[['road_crow',2],['wolf',4],['dusk_fox',3],['meadow_boar',2],['thorn_adder',2],['briar_sprite',2],['feral_hound',3],['rogue_stag',1]],
  river:[['rat',2],['road_crow',2],['river_leech',3],['silver_crab',3],['thorn_adder',2],['water_snake',2],['feral_hound',1],['river_stalker',1]],
  mine:[['rat',4],['cave_bat',4],['dust_rat',3],['stone_centipede',3],['tunnel_scavenger',2],['cave_spider',3],['tunnel_beetle',3],['rock_worm',1]],
  deep_mine:[['cave_bat',3],['cave_spider',3],['tunnel_beetle',3],['pale_lurker',2],['stone_ghoul',2],['deepcrawler',2],['crypt_guard',1],['deep_worm',1]],
  crossroads:[['road_crow',3],['wolf',2],['cutpurse',2],['bandit',3],['road_viper',2],['highwayman',2],['feral_hound',2],['brute',1]],
  northroad:[['wolf',2],['frost_crow',3],['mountain_goat',2],['road_warg',2],['ridge_raider',3],['hill_troll',2],['cliff_harrier',1],['ridge_brute',1]],
  quarry:[['dust_asp',2],['stone_tick',3],['ridge_raider',2],['quarry_hound',2],['hill_troll',2],['slate_golem',1],['ridge_brute',1],['quarry_drake',1]],
  ember_cave:[['tunnel_beetle',2],['ash_wisp',3],['cinder_bat',3],['lava_tick',2],['magma_crawler',3],['ember_hound',3],['slag_golem',1],['quarry_drake',1]],
  crypt:[['bone_rat',3],['tomb_wisp',3],['skeleton',3],['grave_moth',2],['crypt_guard',2],['restless_knight',1],['sepulcher_hound',1],['gravewarden',1]],
  marshroad:[['road_crow',2],['mudcrab',3],['reed_serpent',3],['bog_spider',3],['fen_boar',2],['mire_wolf',2],['marsh_lurker',2],['marsh_raider',1]],
  reedmere:[['reed_rat',3],['mudcrab',4],['bog_adder',3],['bog_spider',3],['stilt_thief',2],['mire_wolf',2],['marsh_lurker',2],['fen_croc',1]],
  drowned_ruins:[['drowned_rat',3],['silt_specter',3],['grave_moth',2],['lantern_wisp',3],['fen_croc',2],['ruin_croc',2],['drowned_sentinel',2],['heron_shade',1]],
  mirewatch:[['bog_spider',2],['reed_viper',3],['mire_wolf',3],['rogue_stag',2],['fen_lynx',2],['marsh_harrier',2],['fen_croc',2],['mire_bear',1]]
},{"source": "js/v11_4.js", "bytes": 2102});
  C.define("dungeons.v114GearSpecs",[
// Shattered Shaft — Uncommon
['veinmaw_pick',{name:'Veinmaw War Pick',icon:'⛏️',slot:'main',value:155,damage:8,armor:1,rarity:'Uncommon'}],
['prospector_buckler',{name:'Prospector Buckler',icon:'🛡️',slot:'off',value:142,damage:1,armor:5,rarity:'Uncommon'}],
['shaft_helm',{name:'Shaftwarden Helm',icon:'⛑️',slot:'head',value:136,damage:1,armor:4,rarity:'Uncommon'}],
['dustcoat',{name:'Dustbound Coat',icon:'🥋',slot:'chest',value:165,damage:1,armor:5,rarity:'Uncommon'}],
['pit_boots',{name:'Pitwalker Boots',icon:'🥾',slot:'boots',value:128,damage:1,armor:4,rarity:'Uncommon'}],
// Hollowroot — Uncommon/Rare
['hollowroot_blade',{name:'Hollowroot Blade',icon:'🗡️',slot:'main',value:235,damage:11,armor:2,rarity:'Rare'}],
['rootguard',{name:'Rootguard Shield',icon:'🛡️',slot:'off',value:220,damage:2,armor:6,rarity:'Rare'}],
['thorncap',{name:'Thorncap Helm',icon:'🌿',slot:'head',value:192,damage:2,armor:5,rarity:'Uncommon'}],
['barkhide_vest',{name:'Barkhide Vest',icon:'🥋',slot:'chest',value:230,damage:2,armor:6,rarity:'Rare'}],
['briarstep_boots',{name:'Briarstep Boots',icon:'🥾',slot:'boots',value:205,damage:2,armor:5,rarity:'Rare'}],
// Buried Galleries — Rare
['buried_edge',{name:'Buried Edge',icon:'⚔️',slot:'main',value:335,damage:14,armor:3,rarity:'Rare'}],
['deepguard',{name:'Deepguard',icon:'🛡️',slot:'off',value:315,damage:2,armor:8,rarity:'Rare'}],
['blacklamp_coif',{name:'Blacklamp Coif',icon:'🪖',slot:'head',value:285,damage:2,armor:7,rarity:'Rare'}],
['gallery_mail',{name:'Gallery Mail',icon:'🛡️',slot:'chest',value:360,damage:3,armor:9,rarity:'Rare'}],
['understep_boots',{name:'Understep Boots',icon:'🥾',slot:'boots',value:295,damage:2,armor:7,rarity:'Rare'}],
// Forgotten Crypt additions — Epic
['regent_crown',{name:'Regent Crown',icon:'👑',slot:'head',value:540,damage:3,armor:10,rarity:'Epic'}],
['cryptlord_mace',{name:'Cryptlord Mace',icon:'🔨',slot:'main',value:585,damage:18,armor:4,rarity:'Epic'}],
// Crownwatch Barrow — Rare/Epic
['barrow_sabre',{name:'Barrow Sabre',icon:'🗡️',slot:'main',value:565,damage:19,armor:4,rarity:'Epic'}],
['warlord_roundshield',{name:'Warlord Roundshield',icon:'🛡️',slot:'off',value:520,damage:3,armor:10,rarity:'Rare'}],
['crownwatch_helm',{name:'Crownwatch Helm',icon:'🪖',slot:'head',value:505,damage:3,armor:9,rarity:'Rare'}],
['marcher_plate',{name:'Marcher Plate',icon:'🛡️',slot:'chest',value:620,damage:4,armor:12,rarity:'Epic'}],
['kingroad_greaves',{name:'Kingroad Greaves',icon:'👖',slot:'legs',value:530,damage:3,armor:10,rarity:'Rare'}],
// Redstone Underworks — Epic
['redstone_maul',{name:'Redstone Maul',icon:'🔨',slot:'main',value:720,damage:22,armor:5,rarity:'Epic'}],
['quarry_wall',{name:'Quarry Wall',icon:'🛡️',slot:'off',value:675,damage:4,armor:12,rarity:'Epic'}],
['colossus_helm',{name:'Colossus Helm',icon:'🪖',slot:'head',value:640,damage:4,armor:11,rarity:'Epic'}],
['redstone_plate',{name:'Redstone Plate',icon:'🛡️',slot:'chest',value:790,damage:5,armor:14,rarity:'Epic'}],
['scree_boots',{name:'Scree Boots',icon:'🥾',slot:'boots',value:610,damage:4,armor:10,rarity:'Epic'}],
// Emberdeep additions — Legendary
['tyrant_crown',{name:'Cindermaw Crown',icon:'👑',slot:'head',value:980,damage:5,armor:14,rarity:'Legendary'}],
['heartforge_greatblade',{name:'Heartforge Greatblade',icon:'🔥',slot:'main',value:1100,damage:26,armor:6,rarity:'Legendary'}],
// Sunken Heron Vault — Legendary
['heron_spear',{name:'Sovereign Heron Spear',icon:'🔱',slot:'main',value:1450,damage:29,armor:7,rarity:'Legendary'}],
['tidewall_shield',{name:'Tidewall Shield',icon:'🛡️',slot:'off',value:1340,damage:6,armor:16,rarity:'Legendary'}],
['drowned_crown',{name:'Drowned Crown',icon:'👑',slot:'head',value:1280,damage:5,armor:15,rarity:'Legendary'}],
['heron_scale_mail',{name:'Heron Scale Mail',icon:'🛡️',slot:'chest',value:1560,damage:6,armor:18,rarity:'Legendary'}],
['undertow_greaves',{name:'Undertow Greaves',icon:'👖',slot:'legs',value:1360,damage:5,armor:16,rarity:'Legendary'}]
],{"source": "js/v11_4.js", "bytes": 4097});
  C.define("dungeons.v114Additions",{
  mine:{name:'Shattered Shaft',icon:'⛏️',level:3,difficulty:'Novice',boss:'ironmaw_broodmother',region:'Greenvale',desc:'The reopened mine hides a collapsed lower circuit. Eight local threats stand between the lift cage and the brood chamber.',rewards:['veinmaw_pick','prospector_buckler','shaft_helm','dustcoat','pit_boots'],bonusGold:95,bonusXp:180,materials:[['iron_ore',3],['coal',2]],flag:'shatteredShaftCleared'},
  forest:{name:'Hollowroot Warren',icon:'🌲',level:5,difficulty:'Low',boss:'hollowroot_hart',region:'Greenvale',desc:'A root-choked hollow beneath Whisperwood funnels every local predator toward an ancient heart-tree chamber.',rewards:['hollowroot_blade','rootguard','thorncap','barkhide_vest','briarstep_boots'],bonusGold:130,bonusXp:260,materials:[['wolf_pelt',2],['herb',3]],flag:'hollowrootCleared'},
  deep_mine:{name:'Buried Galleries',icon:'🕳️',level:7,difficulty:'Moderate',boss:'buried_foreman',region:'Greenvale',desc:'The oldest workings form a descending chain of sealed galleries. Every creature from the deep ecosystem must be passed in order.',rewards:['buried_edge','deepguard','blacklamp_coif','gallery_mail','understep_boots'],bonusGold:185,bonusXp:360,materials:[['silver_ore',2],['steel_bar',1]],flag:'buriedGalleriesCleared'},
  northroad:{name:'Crownwatch Barrow',icon:'⚔️',level:10,difficulty:'Hard',boss:'crownwatch_warlord',region:'The Marches',desc:'A burial road beneath the kingroad has opened. Eight northern threats guard the warlord chamber beyond.',rewards:['barrow_sabre','warlord_roundshield','crownwatch_helm','marcher_plate','kingroad_greaves'],bonusGold:300,bonusXp:580,materials:[['steel_bar',2],['troll_tooth',1]],flag:'crownwatchBarrowCleared'},
  quarry:{name:'Redstone Underworks',icon:'🧱',level:12,difficulty:'Severe',boss:'redstone_colossus',region:'Ironridge',desc:'Old quarry cuts continue beneath the active pits into chambers nobody remembers excavating.',rewards:['redstone_maul','quarry_wall','colossus_helm','redstone_plate','scree_boots'],bonusGold:390,bonusXp:760,materials:[['iron_ore',4],['silver_ore',2]],flag:'redstoneUnderworksCleared'},
  drowned_ruins:{name:'Sunken Heron Vault',icon:'🏛️',level:17,difficulty:'Mythic',boss:'drowned_heron_sovereign',region:'Mirefen',desc:'A drowned ceremonial route descends beneath the Heron ruins. The local dead and predators guard a royal chamber below the waterline.',rewards:['heron_spear','tidewall_shield','drowned_crown','heron_scale_mail','undertow_greaves'],bonusGold:610,bonusXp:1180,materials:[['drowned_coin',4],['ghost_orchid',1]],flag:'sunkenHeronVaultCleared'}
},{"source": "js/v11_4.js", "bytes": 2617});
  C.define("dungeons.cryptOverride",{level:9,difficulty:'Challenging',rewards:['regent_falchion','bonewall_buckler','ossuary_coif','tombwarden_greaves','regent_crown','cryptlord_mace'],bonusGold:250,bonusXp:500},{"source": "js/v11_4.js", "bytes": 175});
  C.define("dungeons.emberOverride",{level:14,difficulty:'Elite',rewards:['cindermaw_blade','emberplate_cuirass','magma_guard','cinderstep_boots','tyrant_crown','heartforge_greatblade'],bonusGold:430,bonusXp:850},{"source": "js/v11_4.js", "bytes": 176});
  C.define("dungeons.bossHomes",{
    ironmaw_broodmother:['mine'],hollowroot_hart:['forest'],buried_foreman:['deep_mine'],
    ossuary_regent:['crypt'],crownwatch_warlord:['northroad'],redstone_colossus:['quarry'],
    cindermaw_tyrant:['ember_cave'],drowned_heron_sovereign:['drowned_ruins']
  },{"source": "js/v11_4.js", "bytes": 265});
})();
