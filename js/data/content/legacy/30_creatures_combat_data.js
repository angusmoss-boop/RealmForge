/* Realmforge V11.30.0 — canonical legacy content definitions: creatures combat data. */
(()=>{
'use strict';
const RF=window.RF;
const define=RF.Content.defineLegacyBlock;
define("v2@L19",function(){
Object.assign(RF.DATA.enemies,{
  cave_spider:{name:'Cave Spider',icon:'🕷️',hp:65,damage:[5,12],armor:1,xp:78,gold:[0,4],drops:[['herb',.25,1],['silver_ore',.18,1]],level:6},
  blackthorn_scout:{name:'Blackthorn Scout',icon:'🏹',hp:72,damage:[6,13],armor:2,xp:92,gold:[10,24],drops:[['arrow',.8,8],['bandit_token',.7,1],['ranger_cloak',.04,1]],level:7},
  captain_voss:{name:'Captain Voss',icon:'👹',hp:175,damage:[10,20],armor:6,xp:360,gold:[65,110],drops:[['blackthorn_blade',1,1],['strange_key',1,1]],level:12}
});
},{"patch": "js/v2.js", "line": 19, "bytes": 526, "kind": "enemies"});
define("v3@L32",function(){
Object.assign(RF.DATA.enemies,{
  skeleton:{name:'Crypt Skeleton',icon:'💀',hp:82,damage:[7,14],armor:3,xp:105,gold:[4,12],drops:[['crypt_sigil',.08,1],['silver_ore',.14,1]],level:8},
  crypt_guard:{name:'Hollow Knight',icon:'🛡️',hp:128,damage:[9,18],armor:7,xp:190,gold:[16,35],drops:[['steel_bar',.24,1],['crypt_sigil',.22,1]],level:11},
  gravewarden:{name:'The Gravewarden',icon:'👑',hp:260,damage:[13,24],armor:9,xp:620,gold:[90,145],drops:[['warden_blade',1,1],['ash_ring',.4,1],['crypt_sigil',1,1]],level:16},
  ridge_raider:{name:'Ridge Raider',icon:'🪓',hp:104,damage:[9,17],armor:5,xp:145,gold:[18,38],drops:[['steel_bar',.12,1],['bread',.25,1]],level:10},
  magma_crawler:{name:'Magma Crawler',icon:'🦎',hp:150,damage:[11,21],armor:6,xp:215,gold:[2,8],drops:[['ember_shard',.62,1]],level:13}
});
},{"patch": "js/v3.js", "line": 32, "bytes": 819, "kind": "enemies"});
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
})();
