/* Realmforge V11.30.0 — canonical legacy content definitions: quests events. */
(()=>{
'use strict';
const RF=window.RF;
const define=RF.Content.defineLegacyBlock;
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
define("v4@L134",function(){
RF.DATA.contractTemplates=[
 {id:'cull',name:'Cull the Wild',icon:'🐾',desc:'Reduce dangerous wildlife near the road.',targets:['wolf','meadow_boar','feral_hound'],count:[2,4],reward:[55,95]},
 {id:'venom',name:'Venom Samples',icon:'🐍',desc:'Bring back venom sacs for guild alchemists.',item:'venom_sac',count:[1,3],reward:[60,110]},
 {id:'road',name:'Road Survey',icon:'🗺️',desc:'Walk the roads and report what changed.',visits:['sunmeadow','crossroads','forest'],reward:[45,80]}
];
},{"patch": "js/v4.js", "line": 134, "bytes": 493, "kind": "direct"});
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
})();
