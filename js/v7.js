window.RF=window.RF||{};
RF.VERSION='7.0.0';

/* =========================================================
   REALMFORGE V7 — DEEP ROADS
   Specialist skill interactions + a major content expansion.
   ========================================================= */

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

['fine_lockpick','bait_grubs','whetstone','waxed_thread','bronze_sword','bronze_buckler'].forEach(id=>{if(!RF.DATA.shopStock.includes(id))RF.DATA.shopStock.push(id)});

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

Object.assign(RF.DATA.resourceDefs,{
  bog_iron:{name:'Bog-Iron Nodule',icon:'🟫',skill:'mining',level:7,item:'bog_iron',xp:38,duration:13,yield:[1,2],max:6,regen:75,desc:'Rust-rich nodules just beneath black water.'},
  alder:{name:'Black Alder',icon:'🌳',skill:'woodcutting',level:7,item:'alder_logs',xp:37,duration:12,yield:[1,2],max:7,regen:70,desc:'Dense marsh timber.'},
  redroot:{name:'Redroot Patch',icon:'🫚',skill:'foraging',level:5,item:'redroot',xp:29,duration:10,yield:[1,2],max:6,regen:65,desc:'Bitter medicinal root.'},
  mooncap:{name:'Mooncap Ring',icon:'🍄',skill:'foraging',level:10,item:'mooncap',xp:48,duration:12,yield:[1,1],max:4,regen:105,desc:'Best found in dim, damp ground.'},
  ghost_orchid:{name:'Ghost Orchid',icon:'🌼',skill:'foraging',level:16,item:'ghost_orchid',xp:78,duration:16,yield:[1,1],max:2,regen:180,desc:'Rare white flowers among drowned stones.'},
  reed_pike:{name:'Reed Pike Pool',icon:'🐟',skill:'fishing',level:8,item:'reedfish',xp:43,duration:14,yield:[1,1],max:6,regen:75,desc:'Aggressive pike lurking beneath reeds.'},
  mire_pearl:{name:'Mire Mussel Bed',icon:'🫧',skill:'fishing',level:15,item:'mire_pearl',xp:68,duration:18,yield:[1,1],max:2,regen:160,desc:'Deep mussels sometimes hold valuable pearls.'}
});

RF.DATA.locationResources.marshroad=['redroot','alder','bog_iron'];
RF.DATA.locationResources.reedmere=['redroot','mooncap','alder','reed_pike','riverfish'];
RF.DATA.locationResources.drowned_ruins=['mooncap','ghost_orchid','bog_iron','mire_pearl'];
RF.DATA.locationResources.mirewatch=['redroot','berries','reed_pike'];

Object.assign(RF.DATA.campRecipes,{
  cooked_pike:{name:'Char Reed Pike',icon:'🐟',level:8,input:'reedfish',output:'cooked_pike',xp:48,time:10,desc:'Firm marsh fish over hot coals.'},
  marsh_stew:{name:'Marsh Stew',icon:'🥣',level:12,input:'reedfish',qty:1,output:'marsh_stew',xp:76,time:14,desc:'A thick trail stew. Requires berries too.',extra:{wild_berries:2}}
});

Object.assign(RF.DATA.locations,{
  marshroad:{name:'Fenward Causeway',icon:'🪵',region:'Mirefen',desc:'A raised timber road running into silver reeds and black pools. Bells hang from posts every hundred paces.',neighbors:{river:24,reedmere:18,mirewatch:26},actions:['forage','woodcut','mine','hunt','explore'],wild:true},
  reedmere:{name:'Reedmere',icon:'🌫️',region:'Mirefen',desc:'A marsh settlement built on stilts, rope bridges and stubbornness.',neighbors:{marshroad:18,drowned_ruins:22,mirewatch:15},actions:['fish','forage','talk','rest'],shop:true,wild:true},
  drowned_ruins:{name:'Drowned Heron Ruins',icon:'🏛️',region:'Mirefen',desc:'Mudbrick foundations sink into a flooded basin. Stone herons stare from beneath the waterline.',neighbors:{reedmere:22},actions:['forage','fish','explore'],wild:true,lockedSkill:{exploration:8}},
  mirewatch:{name:'Mirewatch Lodge',icon:'🛖',region:'Mirefen',desc:'A ranger lodge where wet cloaks steam beside an iron stove and maps are pinned with fish bones.',neighbors:{marshroad:26,reedmere:15},actions:['talk','rest','hunt'],wild:true}
});
RF.DATA.locations.river.neighbors.marshroad=24;

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

Object.assign(RF.DATA.enemyMoves,{
  claw:{name:'Crushing Claw',power:1.05,accuracy:.9},mud_spray:{name:'Mud Spray',power:.55,accuracy:.94,status:{id:'weakened',chance:.6,turns:2}},
  mire_howl:{name:'Mire Howl',kind:'status',status:{id:'weakened',turns:2}},death_roll:{name:'Death Roll',power:1.45,accuracy:.76,status:{id:'bleed',chance:.55,turns:2}},
  wisp_burn:{name:'Lantern Flare',power:1.08,accuracy:.91,status:{id:'burn',chance:.5,turns:2}},rusted_cleave:{name:'Rusted Cleave',power:1.22,accuracy:.86,status:{id:'bleed',chance:.35,turns:2}},
  grasp:{name:'Drowned Grasp',power:.72,accuracy:.94,status:{id:'weakened',chance:.55,turns:2}},stone_beak:{name:'Stone Beak',power:1.38,accuracy:.83},
  flood_call:{name:'Flood Call',power:.8,accuracy:.95,status:{id:'weakened',chance:.75,turns:2}},royal_gaze:{name:'Royal Gaze',kind:'status',status:{id:'exposed',turns:3}},
  stone_bite:{name:'Stone Bite',power:1.3,accuracy:.84},tail_sweep:{name:'Tail Sweep',power:.9,accuracy:.88,status:{id:'stagger',chance:.4,turns:1}},cinder_bite:{name:'Cinder Bite',power:1.16,accuracy:.89,status:{id:'burn',chance:.42,turns:2}}
});

RF.fieldTables.marshroad=[['mudcrab',3],['bog_spider',3],['mire_wolf',2],['marsh_raider',1]];
RF.fieldTables.reedmere=[['mudcrab',3],['bog_spider',2],['fen_croc',1]];
RF.fieldTables.drowned_ruins=[['lantern_wisp',3],['drowned_sentinel',3],['fen_croc',1]];
RF.fieldTables.mirewatch=[['mire_wolf',3],['fen_croc',2],['rogue_stag',2]];
RF.fieldTables.quarry.push(['quarry_drake',1]);
RF.fieldTables.ember_cave.push(['ember_hound',2]);
RF.fieldTables.sunmeadow.push(['rogue_stag',1]);

Object.assign(RF.DATA.npcs,{
  nessa:{name:'Nessa Vale',icon:'🧪',job:'Marsh Apothecary',home:'reedmere',schedule:[['reedmere',7,13],['marshroad',13,16],['reedmere',16,23]],condition:s=>!!s.visited.marshroad,rumours:['Never trust a mushroom that looks pleased to see you.','Antivenom is cheaper before the bite. People consistently ignore this pricing advantage.']},
  torren:{name:'Torren Pike',icon:'🎣',job:'Reedmere Fisher',home:'reedmere',schedule:[['reedmere',5,8],['drowned_ruins',8,13],['reedmere',13,20]],condition:s=>!!s.visited.reedmere,rumours:['Pike bite hardest when the mist sits low.','There are bells underwater by the old ruins. I do not fish near bells.']},
  ysra:{name:'Ysra Fen',icon:'🪶',job:'Mirewatch Ranger',home:'mirewatch',schedule:[['mirewatch',6,10],['marshroad',10,16],['mirewatch',16,24]],condition:s=>!!s.visited.mirewatch,rumours:['Watch the reeds, not the water. Water lies flatter.','If a lantern light moves against the wind, do not follow it politely.']},
  cobb:{name:'Cobb Rill',icon:'🔐',job:'Locksmith & Recoverer',home:'reedmere',schedule:[['reedmere',9,18],['mirewatch',18,21]],condition:s=>!!s.visited.reedmere,rumours:['Locks are conversations conducted with very small pieces of metal.','A cheap lock tells you what the owner fears. A good lock tells you they can afford fear.']},
  maelin:{name:'Maelin Quill',icon:'📚',job:'Field Naturalist',home:'mirewatch',schedule:[['mirewatch',8,12],['reedmere',12,15],['marshroad',15,19],['mirewatch',19,23]],condition:s=>!!s.visited.mirewatch,rumours:['Everything leaves evidence. Most creatures simply lack lawyers.','The difference between research and being eaten is usually note-taking distance.']},
  dock:{name:'Dock Fenner',icon:'🧔',job:'Causeway Warden',home:'marshroad',schedule:[['marshroad',6,18],['reedmere',18,22]],condition:s=>!!s.visited.marshroad,rumours:['Keep to the planks after dark. Mud has ambition here.','Those bells are for fog. Mostly.']},
  ilse:{name:'Ilse Marr',icon:'🍲',job:'Innkeeper of the Crooked Heron',home:'reedmere',schedule:[['reedmere',6,24]],condition:s=>!!s.visited.reedmere,rumours:['Dry socks cost nothing upstairs if you stop dripping on my floor.','Torren says he saw a stone hand in the water. Torren also says pike understand insults.']}
});

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

// More lines for old faces.
RF.DATA.namedDialogues.mira.choices.push({text:'Ask if anything strange has passed through town.',reply:'“A cart of blue mushrooms, two wet scholars, and a man trying to sell a goose as a guard dog. So: Tuesday.”'});
RF.DATA.namedDialogues.brann.choices.push({text:'Ask what metal he actually likes working.',reply:'“Bronze behaves. Iron argues. Silver judges.”',xp:['smithing',8]});
RF.DATA.namedDialogues.elira.choices.push({text:'Ask about Mooncaps.',reply:'“Useful. Moody. Pick them after dusk and do not lick your fingers.”',xp:['foraging',10]});
RF.DATA.namedDialogues.tamsin.choices.push({text:'Ask for road gossip.',reply:'“Marsh road reopened. Apparently the planks only collapse under people who deserve character development.”'});
RF.DATA.namedDialogues.saela.choices.push({text:'Ask whether potions count as magic.',reply:'“Only to people who have never cleaned a cauldron.”'});

Object.assign(RF.DATA.passers,{
  scholar:{icons:['🧑‍🏫','👩‍🔬','🧔‍♀️'],jobs:['Travelling Naturalist','Ruins Scholar','Assistant Cartographer'],openers:['I have been bitten twice today, which means the expedition is producing data.','Do you know whether these ruins are cursed in a measurable way?','I need a local guide and, failing that, somebody difficult to frighten.'],wares:['scholar_notes','mooncap','whetstone'],gift:'scholar_notes'},
  fisher:{icons:['🎣','🧔','👩'],jobs:['Net Fisher','Eel Catcher','Barge Hand'],openers:['Water is high. Fish like it. Boots do not.','Caught a pike this morning with somebody else’s hook still in it. Felt accusatory.','If you hear bells under the water, row faster and ask theological questions later.'],wares:['bait_grubs','cooked_fish','cooked_pike'],gift:'bait_grubs'},
  locksmith:{icons:['🔐','🧑‍🔧'],jobs:['Itinerant Locksmith','Safe Mender'],openers:['Locks fail from rust, panic, and relatives. Usually in that order.','I fix doors. Occasionally I fix the assumption that doors are permanent.'],wares:['lockpick','fine_lockpick','waxed_thread']}
});
RF.DATA.passerNames.push('Aster','Bram','Cerys','Dain','Eska','Fenn','Gilda','Hollis','Isen','Juniper','Kest','Mara','Neris','Odo','Perrin','Sable','Tove','Una','Vale','Zerin');

RF.DATA.contractTemplates.push(
 {id:'marsh_cull',name:'Fenroad Teeth',icon:'🐊',desc:'Thin dangerous marsh predators near the causeway.',targets:['bog_spider','mire_wolf','fen_croc'],count:[2,4],reward:[95,160]},
 {id:'research',name:'Field Notes',icon:'📓',desc:'Record creature observations for guild naturalists.',item:'scholar_notes',count:[1,2],reward:[80,130]},
 {id:'reagents',name:'Apothecary Run',icon:'🧪',desc:'Gather useful marsh reagents.',item:'redroot',count:[2,4],reward:[75,120]}
);

RF.DATA.quests.marsh_lights={name:'Lights in the Reeds',desc:'Strange lights are drawing travellers off the Fenward Causeway.',objectives:[{type:'visit',target:'reedmere',text:'Reach Reedmere'},{type:'kill',target:'lantern_wisp',value:2,text:'Defeat 2 Lantern Wisps'},{type:'flag',target:'heron_rumour',text:'Learn what locals know about the drowned ruins'}],reward:{gold:220,xp:380,item:'marsh_charm'},next:'bell_below'};
RF.DATA.quests.bell_below={name:'The Bell Below',desc:'The drowned ruins hide a sealed chamber and a bell that rings beneath the water.',objectives:[{type:'visit',target:'drowned_ruins',text:'Explore the Drowned Heron Ruins'},{type:'flag',target:'heron_chamber_open',text:'Open the buried Heron chamber'},{type:'kill',target:'heron_keeper',value:1,text:'Defeat the Keeper Beneath the Heron'}],reward:{gold:650,xp:950,item:'mire_ring'}};

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

RF.DATA.lockSites={
 ruins_chest:{name:'Collapsed Reliquary',location:'ruins',level:4,desc:'An iron-banded chest wedged beneath fallen stone.',rewards:[['old_bone_dice',1],['silver_ore',1],['gold',28]]},
 deep_cache:{name:'Miner’s Strongbox',location:'deep_mine',level:7,desc:'A sturdy box hidden behind rotten cribbing.',rewards:[['silver_ore',2],['fine_lockpick',1],['gold',55]]},
 fen_coffer:{name:'Drowned Stone Coffer',location:'drowned_ruins',level:10,desc:'A stone coffer with a surprisingly delicate bronze lock.',rewards:[['drowned_coin',2],['marsh_idol',1],['gold',75]]},
 ironridge_safe:{name:'Abandoned Pay Safe',location:'quarry',level:12,desc:'A rusting payroll safe dragged into a side hut.',rewards:[['silver_bar',1],['whetstone',2],['gold',110]]}
};

RF.DATA.excavationSites={
 ruins:{name:'Mossbound Dig',level:4,loot:[['old_bone_dice',3],['drowned_coin',2],['silver_ore',1]]},
 sunmeadow:{name:'Old Boundary Mound',level:5,loot:[['old_bone_dice',2],['lucky_charm',1],['traveller_token',2]]},
 drowned_ruins:{name:'Heron Basin Excavation',level:9,loot:[['drowned_coin',4],['marsh_idol',2],['royal_seal',1]]},
 quarry:{name:'Quarry Spoil Search',level:8,loot:[['silver_ore',3],['old_bone_dice',1],['field_manual',1]]}
};

RF.DATA.potionExperiments={
  'redroot|venom_sac':'antivenom',
  'herb|mooncap':'focus_draught',
  'cave_mushroom|ember_shard':'ember_tonic',
  'ghost_orchid|mooncap':'night_eye'
};

RF.migrateV7=function(s){
  if(!s)return s;s.version='7.0.0';s.v7=s.v7||{};
  s.v7.locks=s.v7.locks||{};s.v7.excavated=s.v7.excavated||{};s.v7.formulas=s.v7.formulas||{};s.v7.research=s.v7.research||{};s.v7.pickpockets=s.v7.pickpockets||{};s.v7.rareFinds=s.v7.rareFinds||0;
  s.stats=s.stats||{};['locksPicked','pickpockets','researchActions','excavations','potionsDiscovered','rareSkillEvents'].forEach(k=>{if(s.stats[k]==null)s.stats[k]=0});
  if((s.player?.level||1)>=5||s.skills?.exploration?.level>=5)s.flags.marshKnown=true;
  if(s.quests?.marsh_lights?.done&&!s.quests.bell_below)s.quests.bell_below={active:true,done:false};
  return s;
};
const v7New=RF.newGame;RF.newGame=function(...a){return RF.migrateV7(v7New(...a))};
const v7Load=RF.load;RF.load=function(){return RF.migrateV7(v7Load())};
const v7Import=RF.importSave;RF.importSave=function(x){return RF.migrateV7(v7Import(x))};

RF.V7={timer:null};
RF.v7ClearTimer=function(){if(RF.V7.timer){clearInterval(RF.V7.timer);clearTimeout(RF.V7.timer);RF.V7.timer=null}};
RF.v7Resume=function(){let g=RF.actionGame;if(g?.resumeSpeed!=null&&RF.state&&!RF.state.combat)RF.state.speed=g.resumeSpeed;RF.actionGame=null;RF.UI.modal=null;RF.v7ClearTimer();RF.UI.render(RF.state)};
RF.v7Tool=function(s,skill){return RF.bestTool?RF.bestTool(s,skill):null};

// ---------- Lockpicking ----------
RF.lockState=function(s,id){let def=RF.DATA.lockSites[id];if(!def)return null;if(!s.v7.locks[id])s.v7.locks[id]={opened:false};return s.v7.locks[id]};
RF.startLockpick=function(id){let s=RF.state,def=RF.DATA.lockSites[id],st=RF.lockState(s,id);if(!def||st.opened||s.skills.thieving.level<def.level)return;let resume=s.speed;s.speed=0;RF.actionGame={type:'lockpick',id,pin:0,pins:Math.min(5,2+Math.floor(def.level/4)),targets:Array.from({length:5},()=>18+Math.random()*64),started:Date.now(),resumeSpeed:resume,message:'Feel for the first tumbler.'};RF.UI.modal={type:'v7Action'};RF.UI.render(s)};
RF.lockNeedle=function(g){return 50+44*Math.sin((Date.now()-g.started)/520)};
RF.setTumbler=function(){let s=RF.state,g=RF.actionGame;if(!g||g.type!=='lockpick')return;let def=RF.DATA.lockSites[g.id],tool=RF.v7Tool(s,'lockpicking'),needle=RF.lockNeedle(g),target=g.targets[g.pin],tol=11+(tool?.control||0)*65+Math.min(7,s.skills.thieving.level*.25),dist=Math.abs(needle-target);if(dist<=tol){g.pin++;g.started=Date.now();g.message=dist<tol*.3?'✨ Clean click.':`Click. ${g.pins-g.pin} tumbler${g.pins-g.pin===1?'':'s'} remain.`;RF.addXp(s,'thieving',5);if(g.pin>=g.pins)return RF.finishLockpick();}else{g.message='⚠️ The pick slips.';if(Math.random()<Math.max(.08,.28-(tool?.control||0)-s.skills.thieving.level*.008)){RF.takeItem(s,'lockpick',1);g.message='💥 A pick snaps inside the keyway.';if((s.inventory.lockpick||0)<1&&!RF.v7Tool(s,'lockpicking'))return RF.v7Resume();}}RF.save(s);RF.UI.render(s)};
RF.finishLockpick=function(){let s=RF.state,g=RF.actionGame,def=RF.DATA.lockSites[g.id],st=RF.lockState(s,g.id),before=RF.activitySnapshot(s);st.opened=true;s.stats.locksPicked++;RF.addXp(s,'thieving',35+def.level*6);for(let [id,q] of def.rewards){if(id==='gold'){s.gold+=q;continue}RF.addItem(s,id,q)}RF.advanceWorld(8+def.level);s.speed=g.resumeSpeed??s.speed;RF.actionGame=null;RF.save(s);RF.UI.modal=RF.makeResult(s,before,`${def.name} Opened`,'🔓')||{type:'message',title:'Unlocked',text:'The lock yields.'};RF.UI.render(s)};

// ---------- Pickpocket timing ----------
RF.startPickpocket=function(id,passer=false){let s=RF.state;if(s.combat||s.activity)return;let speaker=passer?RF.passersHere(s).find(x=>x.id===id):RF.DATA.npcs[id];if(!speaker)return;let resume=s.speed;s.speed=0;let skill=s.skills.thieving.level,target=22+Math.random()*56;RF.actionGame={type:'pickpocket',id,passer,speaker:{name:speaker.name,icon:speaker.icon||'🧑'},target,started:Date.now(),resumeSpeed:resume,message:'Wait for their attention to drift.'};RF.UI.modal={type:'v7Action'};RF.UI.render(s)};
RF.pickNeedle=function(g){return 50+46*Math.sin((Date.now()-g.started)/650)};
RF.liftPurse=function(){let s=RF.state,g=RF.actionGame;if(!g||g.type!=='pickpocket')return;let pos=RF.pickNeedle(g),skill=s.skills.thieving.level,tol=9+Math.min(14,skill*.45),dist=Math.abs(pos-g.target),before=RF.activitySnapshot(s);if(dist<=tol){let gold=5+Math.floor(Math.random()*(10+skill*2));s.gold+=gold;RF.addXp(s,'thieving',18+skill);s.stats.pickpockets++;if(Math.random()<.14)RF.addItem(s,['bread','lockpick','honey_cake','traveller_token'][Math.floor(Math.random()*4)],1);g.message='The purse changes ownership without ceremony.';}else{let bounty=12+Math.max(0,Math.round((tol-dist)*-1));s.crime=s.crime||{bounty:0,heat:0};s.crime.bounty+=bounty;s.crime.heat=Math.min(100,(s.crime.heat||0)+18);RF.addXp(s,'thieving',6);g.message=`Caught. Bounty +${bounty}g.`;if(!g.passer&&RF.changeRelation)RF.changeRelation(s,g.id,-3);}RF.advanceWorld(2);s.speed=g.resumeSpeed??s.speed;RF.actionGame=null;RF.save(s);RF.UI.modal=RF.makeResult(s,before,dist<=tol?'Clean Lift':'Pickpocket Failed',dist<=tol?'🪙':'🚨')||{type:'message',title:dist<=tol?'Clean Lift':'Caught',text:g.message};RF.UI.render(s)};

// ---------- Smithing heat control ----------
const v7CraftBase=RF.craft;
RF.craft=function(id){let r=RF.DATA.recipes[id];if(r?.skill==='smithing'&&RF.state&&!RF.state.combat&&!RF.state.activity&&RF.hasItems(RF.state,r.inputs)&&(RF.state.skills.smithing.level||1)>=r.level){let s=RF.state,resume=s.speed;s.speed=0;RF.actionGame={type:'forge',recipe:id,heat:18,progress:0,integrity:100,before:RF.activitySnapshot(s),resumeSpeed:resume,message:'Bring the metal to working heat.'};RF.UI.modal={type:'v7Action'};RF.UI.render(s);return}return v7CraftBase(id)};
RF.stokeForge=function(){let g=RF.actionGame;if(!g||g.type!=='forge')return;g.heat=Math.min(100,g.heat+18+Math.random()*10);g.message=g.heat>88?'🔥 The metal is close to burning.':'🔥 Heat climbs.';RF.UI.render(RF.state)};
RF.hammerForge=function(){let s=RF.state,g=RF.actionGame;if(!g||g.type!=='forge')return;let r=RF.DATA.recipes[g.recipe];if(!RF.hasItems(s,r.inputs))return RF.v7Resume();let ideal=g.heat>=48&&g.heat<=76,perfect=g.heat>=58&&g.heat<=68,power=9+Math.floor(s.skills.smithing.level/3);if(perfect){power*=2;g.message=`✨ PERFECT HEAT • +${power} progress`;RF.addXp(s,'smithing',3)}else if(ideal){g.message=`🔨 Clean strike • +${power} progress`}else{power=Math.max(3,Math.floor(power*.45));g.integrity-=g.heat>88?13:7;g.message=g.heat>88?'⚠️ Too hot. Scale flakes from the workpiece.':'⚠️ Too cold. The metal resists.'}g.progress=Math.min(100,g.progress+power);g.heat=Math.max(0,g.heat-(10+Math.random()*8));if(g.integrity<=0){let candidates=Object.keys(r.inputs).filter(id=>(s.inventory[id]||0)>0);if(candidates.length)RF.takeItem(s,candidates[0],1);g.integrity=45;g.progress=Math.max(0,g.progress-22);g.message='💥 The workpiece cracks. Material is lost.';s.stats.skillMishaps++;}if(g.progress>=100)return RF.finishForge();RF.save(s);RF.UI.render(s)};
RF.finishForge=function(){let s=RF.state,g=RF.actionGame,r=RF.DATA.recipes[g.recipe];if(!RF.hasItems(s,r.inputs))return RF.v7Resume();Object.entries(r.inputs).forEach(([id,q])=>RF.takeItem(s,id,q));Object.entries(r.outputs).forEach(([id,q])=>RF.addItem(s,id,q));let quality=g.integrity>=85?1.25:g.integrity>=60?1:0.8;RF.addXp(s,'smithing',Math.round(r.xp*quality));s.stats.itemsCrafted++;RF.advanceWorld(r.time);RF.questCheck(s);RF.save(s);let before=g.before;s.speed=g.resumeSpeed??s.speed;RF.actionGame=null;RF.UI.modal=RF.makeResult(s,before,g.integrity>=85?`Fine ${r.name}`:`${r.name} Complete`,'⚒️')||{type:'message',title:'Forged',text:r.name};RF.UI.render(s)};

// ---------- Potion experimentation ----------
RF.startPotionLab=function(){let s=RF.state,resume=s.speed;s.speed=0;RF.actionGame={type:'potionLab',ingredients:[],resumeSpeed:resume,message:'Choose two reagents. Known formulae are recorded after successful discoveries.'};RF.UI.modal={type:'v7Action'};RF.UI.render(s)};
RF.potionIngredient=function(id){let g=RF.actionGame,s=RF.state;if(!g||g.type!=='potionLab'||(s.inventory[id]||0)<1)return;if(g.ingredients.includes(id)){g.ingredients=g.ingredients.filter(x=>x!==id)}else if(g.ingredients.length<2)g.ingredients.push(id);RF.UI.render(s)};
RF.brewExperiment=function(){let s=RF.state,g=RF.actionGame;if(!g||g.type!=='potionLab'||g.ingredients.length!==2)return;let [a,b]=g.ingredients.sort(),key=`${a}|${b}`,result=RF.DATA.potionExperiments[key],before=RF.activitySnapshot(s);RF.takeItem(s,a,1);RF.takeItem(s,b,1);RF.advanceWorld(9);if(result){let discovered=!s.v7.formulas[key];s.v7.formulas[key]=result;RF.addItem(s,result,1);RF.addXp(s,'herblore',discovered?85:32);if(discovered)s.stats.potionsDiscovered++;g.message=discovered?`✨ New formula discovered: ${RF.DATA.items[result].name}`:`You reproduce ${RF.DATA.items[result].name}.`;}else{let success=Math.random()<.22+Math.min(.38,s.skills.herblore.level*.018);if(success){RF.addItem(s,'field_tonic',1);RF.addXp(s,'herblore',26);g.message='The mixture is not elegant, but it stabilises into a useful Field Tonic.';}else{RF.addXp(s,'herblore',8);g.message='💨 The mixture curdles into medicinal-smelling foam. Nothing usable remains.';}}RF.save(s);s.speed=g.resumeSpeed??s.speed;RF.actionGame=null;RF.UI.modal=RF.makeResult(s,before,result?'Experiment Successful':'Experiment Complete','🧪')||{type:'message',title:'Experiment Complete',text:g.message};RF.UI.render(s)};

// ---------- Excavation ----------
RF.startExcavation=function(loc=RF.state.location){let s=RF.state,site=RF.DATA.excavationSites[loc];if(!site||s.skills.exploration.level<site.level)return;let resume=s.speed;s.speed=0,secret=Math.floor(Math.random()*9);RF.actionGame={type:'excavate',location:loc,secret,digs:0,revealed:{},resumeSpeed:resume,before:RF.activitySnapshot(s),message:'Probe the ground. You have five careful digs.'};RF.UI.modal={type:'v7Action'};RF.UI.render(s)};
RF.excavateTile=function(i){let s=RF.state,g=RF.actionGame;if(!g||g.type!=='excavate'||g.revealed[i])return;g.revealed[i]=true;g.digs++;let dx=Math.abs((i%3)-(g.secret%3)),dy=Math.abs(Math.floor(i/3)-Math.floor(g.secret/3)),dist=dx+dy;if(i===g.secret){let site=RF.DATA.excavationSites[g.location],bag=[];site.loot.forEach(([id,w])=>{for(let n=0;n<w;n++)bag.push(id)});let id=bag[Math.floor(Math.random()*bag.length)];RF.addItem(s,id,1);RF.addXp(s,'exploration',55+site.level*4);s.stats.excavations++;s.v7.excavated[g.location]=(s.v7.excavated[g.location]||0)+1;RF.advanceWorld(18);RF.save(s);let before=g.before;s.speed=g.resumeSpeed??s.speed;RF.actionGame=null;RF.UI.modal=RF.makeResult(s,before,'Buried Find','🏺')||{type:'message',title:'Buried Find',text:`You uncover ${RF.DATA.items[id].name}.`};RF.UI.render(s);return}g.message=dist===1?'🔥 The soil here is disturbed. Very close.':dist===2?'Warm signs: broken pottery and compacted earth.':'Cold ground. Nothing but roots and old stones.';if(g.digs>=5){RF.addXp(s,'exploration',12);RF.advanceWorld(12);g.message='The light is going and your careful search comes up empty. The site can be tried again later.';RF.save(s);s.speed=g.resumeSpeed??s.speed;RF.actionGame=null;RF.UI.modal={type:'message',title:'Excavation Ends',text:g.message};RF.UI.render(s);return}RF.UI.render(s)};

// ---------- Bestiary research ----------
RF.researchEnemy=function(id){let s=RF.state,e=RF.DATA.enemies[id];if(!e)return;let r=s.v7.research[id]||{level:0,notes:0};let risk=Math.max(.04,.22-s.skills.exploration.level*.006);RF.advanceWorld(12);if(Math.random()<risk&&RF.fieldTables[s.location]?.some(([x])=>x===id)){RF.log(s,`Your observation of ${e.name} gets much too close. It attacks.`,'bad');RF.save(s);RF.startBattle(id,{forced:true});return}r.notes++;if(r.notes>=2+r.level){r.level=Math.min(3,r.level+1);r.notes=0;RF.addXp(s,'exploration',30+r.level*18);RF.addXp(s,'hunting',18+r.level*12)}s.v7.research[id]=r;s.stats.researchActions++;RF.save(s);RF.UI.modal={type:'message',title:`Research: ${e.name}`,text:r.level===0?'You record basic tracks, feeding signs and posture.':r.level===1?'You can now recognise its common tells and preferred ground.':r.level===2?'You understand several attack patterns and warning behaviours.':'Your field notes on this creature are unusually thorough.'};RF.UI.render(s)};

// Small combat benefit for researched targets.
const v7BattleAbilityBase=RF.battleAbility;
RF.battleAbility=function(id){let s=RF.state,c=s?.combat;if(c&&['attack','power','precision','bleeding_cut','crushing_blow','volley'].includes(id)){let rank=s.v7?.research?.[c.id]?.level||0;if(rank>0)c.__researchBonus=rank}return v7BattleAbilityBase(id)};
const v7WeaponDamageBase=RF.weaponDamage;
RF.weaponDamage=function(s){let d=v7WeaponDamageBase(s);if(s.combat?.__researchBonus)d+=s.combat.__researchBonus;return d};

// Antivenom special use.
const v7UseItemBase=RF.useItem;
RF.useItem=function(id){if(id==='antivenom'&&RF.state){let s=RF.state;if((s.inventory[id]||0)<1)return;RF.takeItem(s,id,1);s.player.hp=Math.min(s.player.maxHp,s.player.hp+8);if(s.combat?.playerStatuses)s.combat.playerStatuses=s.combat.playerStatuses.filter(x=>x.id!=='poison');RF.log(s,'Antivenom clears poison.','good');RF.save(s);RF.UI.render(s);return}return v7UseItemBase(id)};

// Rare skilling discoveries: tangible but not constant.
RF.v7RareSkillFind=function(s,skill){if(Math.random()>.055)return null;let pools={mining:['silver_ore','drowned_coin'],woodcutting:['lucky_charm','old_bone_dice'],fishing:['mire_pearl','traveller_token'],foraging:['ghost_orchid','mooncap'],hunting:['scholar_notes','lucky_charm'],smithing:['whetstone'],cooking:['honey_cake']};let pool=pools[skill];if(!pool)return null;let id=pool[Math.floor(Math.random()*pool.length)];RF.addItem(s,id,1);s.stats.rareSkillEvents++;s.v7.rareFinds++;RF.log(s,`Rare ${RF.DATA.skills[skill]?.name||skill} find: ${RF.DATA.items[id].name}.`,'important');return id};
const v7FinishGatherBase=RF.finishActiveGather;
RF.finishActiveGather=function(g){let skill=RF.DATA.resourceDefs[g?.key]?.skill;v7FinishGatherBase(g);if(skill&&RF.state&&!RF.state.combat){let id=RF.v7RareSkillFind(RF.state,skill);if(id&&RF.UI.modal?.type==='activityResult')RF.UI.modal.gains.unshift({icon:'✨',label:`Rare find: ${RF.DATA.items[id].name}`});RF.save(RF.state);RF.UI.render(RF.state)}};

// ---------- World visibility / locks / context ----------
RF.v7LocksHere=function(s){return Object.entries(RF.DATA.lockSites).filter(([id,d])=>d.location===s.location&&!RF.lockState(s,id).opened)};
RF.v7ContextPanel=function(s){
 let locks=RF.v7LocksHere(s),dig=RF.DATA.excavationSites[s.location],lab=['reedmere','greenvale','ironridge'].includes(s.location),research=(RF.refreshEncounters(s)||[]).slice(0,3),marshNotice=s.flags.marshKnown&&!s.visited.marshroad&&s.location==='river';
 let html='';
 if(marshNotice)html+=`<section class="card"><h3>🌫️ Fenward Causeway</h3><div class="sub">A reopened road leaves Silverrun and disappears into eastern reeds.</div><button class="action primary" data-travel="marshroad" style="width:100%;margin-top:8px"><b>Take the Fenward road</b><small>24 minutes</small></button></section>`;
 if(locks.length)html+=`<section class="card"><h3>🔐 Locked Finds</h3><div class="list">${locks.map(([id,d])=>`<div class="row"><div class="icon">🔒</div><div class="meta"><b>${d.name}</b><small>${d.desc}<br>Thieving Lv ${d.level}</small></div><button data-lockpick="${id}" ${s.skills.thieving.level<d.level?'disabled':''}>Pick</button></div>`).join('')}</div></section>`;
 if(dig)html+=`<section class="card"><h3>🏺 Excavation</h3><div class="sub">${dig.name} • Exploration Lv ${dig.level}</div><button class="action" data-excavate style="width:100%;margin-top:8px" ${s.skills.exploration.level<dig.level?'disabled':''}><b>Excavate Site</b><small>Probe a 3×3 dig grid for buried finds</small></button></section>`;
 if(lab)html+=`<section class="card"><h3>🧪 Experimental Brewing</h3><div class="sub">Combine two reagents and discover persistent formulae through experimentation.</div><button class="action" data-potion-lab style="width:100%;margin-top:8px"><b>Open Potion Bench</b><small>${Object.keys(s.v7.formulas).length} formulae discovered</small></button></section>`;
 if(research.length)html+=`<section class="card"><h3>📓 Field Research</h3><div class="sub">Observe nearby creatures instead of fighting. Research can improve your understanding, but getting too close carries risk.</div><div class="list" style="margin-top:8px">${research.map(x=>{let e=RF.DATA.enemies[x.id],r=s.v7.research[x.id]||{level:0,notes:0};return `<div class="row"><div class="icon">${e.icon}</div><div class="meta"><b>${e.name}</b><small>Research ${r.level}/3 • notes ${r.notes}</small></div><button data-research="${x.id}">Observe</button></div>`}).join('')}</div></section>`;
 return html;
};

const v7PeopleBase=RF.UI.peopleV4?.bind(RF.UI);
if(v7PeopleBase)RF.UI.peopleV4=function(s){let base=v7PeopleBase(s);if(!base)return base;return base.replace(/<button data-talk-npc="([^"]+)"/g,(m,id)=>`<button class="smallCrime" data-pickpocket-npc="${id}">🖐️</button><button data-talk-npc="${id}"`).replace(/<button data-talk-passer="([^"]+)"/g,(m,id)=>`<button class="smallCrime" data-pickpocket-passer="${id}">🖐️</button><button data-talk-passer="${id}"`)};

const v7WorldBase=RF.UI.world.bind(RF.UI);
RF.UI.world=function(s){let html=v7WorldBase(s);let panel=RF.v7ContextPanel(s);return html.replace('<section class="card"><h3>World Feed</h3>',panel+'<section class="card"><h3>World Feed</h3>')};

// Region map now includes Mirefen.
RF.UI.regionMap=function(s){let locs=Object.entries(RF.DATA.locations).filter(([id,l])=>s.visited[id]||(!l.lockedFlag||s.flags[l.lockedFlag])||(l.region==='Mirefen'&&s.flags.marshKnown)).filter(([id,l])=>['Greenvale','Ironridge','Mirefen'].includes(l.region));return `<section class="card"><h3>Regional Map</h3><div class="mapGrid">${locs.map(([id,l])=>{let conn=RF.DATA.locations[s.location]?.neighbors?.[id],locked=l.lockedSkill&&Object.entries(l.lockedSkill).some(([sk,n])=>s.skills[sk].level<n);return `<button class="mapNode ${s.location===id?'here':''} ${s.visited[id]?'seen':''}" ${(conn&&!locked)?'data-travel="'+id+'"':'disabled'}><span>${l.icon}</span><b>${l.name}</b><small>${l.region}${s.location===id?' • YOU ARE HERE':conn?' • Road connected':''}</small></button>`}).join('')}</div></section>`};

// ---------- V7 popup UI ----------
const v7ModalBase=RF.UI.modalHtml.bind(RF.UI);
RF.UI.modalHtml=function(s){let m=this.modal;if(m?.type==='v7Action')return this.v7ActionModal(s,RF.actionGame);return v7ModalBase(s)};
RF.UI.v7ActionModal=function(s,g){if(!g)return'';
 if(g.type==='lockpick'){let d=RF.DATA.lockSites[g.id],needle=RF.lockNeedle(g),target=g.targets[g.pin];return `<div class="modalBack actionBack"><div class="modal actionModal"><div class="actionHero">🔐</div><span class="eyebrow">LOCKPICKING • ${g.pin}/${g.pins} PINS</span><h2>${d.name}</h2><div class="timingTrack"><div class="timingTarget" style="left:${target-7}% ;width:14%"></div><div class="timingNeedle pulseNeedle" style="left:${needle}%"></div></div><button class="tapButton" data-set-tumbler>🗝️ SET TUMBLER</button><div class="actionFeedback">${g.message}</div><div class="tiny center">Better picks and higher Thieving widen the success window.</div><button class="quietClose" data-v7-abandon>Stop</button></div></div>`}
 if(g.type==='pickpocket'){let pos=RF.pickNeedle(g);return `<div class="modalBack actionBack"><div class="modal actionModal"><div class="actionHero">🖐️</div><span class="eyebrow">PICKPOCKET</span><h2>${g.speaker.icon} ${g.speaker.name}</h2><div class="timingTrack"><div class="timingTarget" style="left:${g.target-8}%;width:16%"></div><div class="timingNeedle pulseNeedle" style="left:${pos}%"></div></div><button class="tapButton" data-lift-purse>🪙 LIFT PURSE</button><div class="actionFeedback">${g.message}</div><button class="quietClose" data-v7-abandon>Think better of it</button></div></div>`}
 if(g.type==='forge'){let r=RF.DATA.recipes[g.recipe],ideal=g.heat>=48&&g.heat<=76;return `<div class="modalBack actionBack"><div class="modal actionModal"><div class="actionHero">⚒️</div><span class="eyebrow">SMITHING • LV ${s.skills.smithing.level}</span><h2>${r.name}</h2><div class="forgeStats"><span>Heat <b>${Math.round(g.heat)}%</b></span><span>Integrity <b>${Math.max(0,Math.round(g.integrity))}%</b></span></div><div class="heatTrack"><div class="heatIdeal"></div><div class="heatFill ${ideal?'ideal':''}" style="width:${g.heat}%"></div></div><div class="activeMeter"><div class="activeFill" style="width:${g.progress}%"></div></div><div class="grid2"><button class="action" data-stoke-forge><b>🔥 STOKE</b><small>Raise heat</small></button><button class="action primary" data-hammer-forge><b>🔨 HAMMER</b><small>Work the metal</small></button></div><div class="actionFeedback">${g.message}</div><div class="tiny center">Best working heat: 48–76%. The narrow centre gives exceptional strikes.</div><button class="quietClose" data-v7-abandon>Abandon work</button></div></div>`}
 if(g.type==='potionLab'){let ids=['herb','redroot','cave_mushroom','mooncap','ghost_orchid','venom_sac','ember_shard'].filter(id=>(s.inventory[id]||0)>0);return `<div class="modalBack actionBack"><div class="modal actionModal"><div class="actionHero">🧪</div><span class="eyebrow">HERBLORE EXPERIMENT</span><h2>Experimental Bench</h2><div class="ingredientGrid">${ids.map(id=>`<button class="ingredient ${g.ingredients.includes(id)?'chosen':''}" data-potion-ing="${id}">${RF.DATA.items[id].icon}<b>${RF.DATA.items[id].name}</b><small>×${s.inventory[id]}</small></button>`).join('')||'<div class="sub">You have no useful reagents.</div>'}</div><div class="actionFeedback">${g.message}</div><button class="tapButton" data-brew-experiment ${g.ingredients.length!==2?'disabled':''}>⚗️ BREW MIXTURE</button><div class="tiny center">Selected: ${g.ingredients.map(id=>RF.DATA.items[id].name).join(' + ')||'none'} • Known formulae ${Object.keys(s.v7.formulas).length}</div><button class="quietClose" data-v7-abandon>Close bench</button></div></div>`}
 if(g.type==='excavate'){return `<div class="modalBack actionBack"><div class="modal actionModal"><div class="actionHero">🏺</div><span class="eyebrow">EXCAVATION • DIG ${g.digs}/5</span><h2>${RF.DATA.excavationSites[g.location].name}</h2><div class="digGrid">${Array.from({length:9},(_,i)=>`<button data-dig-tile="${i}" class="digTile ${g.revealed[i]?'dug':''}" ${g.revealed[i]?'disabled':''}>${g.revealed[i]?'🕳️':'▦'}</button>`).join('')}</div><div class="actionFeedback">${g.message}</div><button class="quietClose" data-v7-abandon>Pack up</button></div></div>`}
 return RF.UI.v6ActionModal?RF.UI.v6ActionModal(s,g):'';
};

// Add a V7 depth panel to character/collection.
const v7CharBase=RF.UI.character.bind(RF.UI);
RF.UI.character=function(s){let h=v7CharBase(s);let researched=Object.values(s.v7.research).filter(x=>x.level>0).length;return h+`<section class="card"><h3>📚 Deep Roads Records</h3><div class="statsGrid"><div class="statbox"><span>Locks picked</span><b>${s.stats.locksPicked}</b></div><div class="statbox"><span>Pickpockets</span><b>${s.stats.pickpockets}</b></div><div class="statbox"><span>Creatures researched</span><b>${researched}</b></div><div class="statbox"><span>Excavations</span><b>${s.stats.excavations}</b></div><div class="statbox"><span>Potion formulae</span><b>${Object.keys(s.v7.formulas).length}</b></div><div class="statbox"><span>Rare skill finds</span><b>${s.v7.rareFinds}</b></div></div></section>`};

const v7BindBase=RF.UI.bind.bind(RF.UI);
RF.UI.bind=function(s){v7BindBase(s);
 document.querySelectorAll('[data-lockpick]').forEach(b=>b.onclick=()=>RF.startLockpick(b.dataset.lockpick));
 document.querySelectorAll('[data-set-tumbler]').forEach(b=>b.onclick=()=>RF.setTumbler());
 document.querySelectorAll('[data-pickpocket-npc]').forEach(b=>b.onclick=e=>{e.stopPropagation();RF.startPickpocket(b.dataset.pickpocketNpc,false)});
 document.querySelectorAll('[data-pickpocket-passer]').forEach(b=>b.onclick=e=>{e.stopPropagation();RF.startPickpocket(b.dataset.pickpocketPasser,true)});
 document.querySelectorAll('[data-lift-purse]').forEach(b=>b.onclick=()=>RF.liftPurse());
 document.querySelectorAll('[data-stoke-forge]').forEach(b=>b.onclick=()=>RF.stokeForge());
 document.querySelectorAll('[data-hammer-forge]').forEach(b=>b.onclick=()=>RF.hammerForge());
 document.querySelectorAll('[data-potion-lab]').forEach(b=>b.onclick=()=>RF.startPotionLab());
 document.querySelectorAll('[data-potion-ing]').forEach(b=>b.onclick=()=>RF.potionIngredient(b.dataset.potionIng));
 document.querySelectorAll('[data-brew-experiment]').forEach(b=>b.onclick=()=>RF.brewExperiment());
 document.querySelectorAll('[data-excavate]').forEach(b=>b.onclick=()=>RF.startExcavation());
 document.querySelectorAll('[data-dig-tile]').forEach(b=>b.onclick=()=>RF.excavateTile(+b.dataset.digTile));
 document.querySelectorAll('[data-research]').forEach(b=>b.onclick=()=>RF.researchEnemy(b.dataset.research));
 document.querySelectorAll('[data-v7-abandon]').forEach(b=>b.onclick=()=>RF.v7Resume());
};

// Make Mirefen travel hidden until discovered but usable once known.
const v7TravelBase=RF.travel;
RF.travel=function(id){if(['marshroad','reedmere','drowned_ruins','mirewatch'].includes(id)&&!RF.state.flags.marshKnown)return;return v7TravelBase(id)};

// Marsh stew needs berries too when cooking at camp.
const v7StartCookingBase=RF.startCooking;
if(v7StartCookingBase)RF.startCooking=function(id){if(id==='marsh_stew'&&(RF.state.inventory.wild_berries||0)<2){RF.UI.modal={type:'message',title:'Missing Ingredients',text:'Marsh Stew also needs 2 Wild Berries.'};RF.UI.render(RF.state);return}return v7StartCookingBase(id)};
const v7FinishCookingBase=RF.finishCooking;
if(v7FinishCookingBase)RF.finishCooking=function(){let g=RF.actionGame;if(g?.type==='cooking'&&g.recipe==='marsh_stew'&&(RF.state.inventory.wild_berries||0)>=2)RF.takeItem(RF.state,'wild_berries',2);return v7FinishCookingBase()};

// Initial road reveal and side quest safety checks during world ticks.
const v7AdvanceBase=RF.advanceWorld;
RF.advanceWorld=function(min){let out=v7AdvanceBase(min),s=RF.state;if(s){if((s.player.level>=5||s.skills.exploration.level>=5)&&!s.flags.marshKnown)s.flags.marshKnown=true;if(s.quests.marsh_lights?.done&&!s.quests.bell_below)s.quests.bell_below={active:true,done:false};if(s.flags.heron_rumour&&s.visited.drowned_ruins&&!s.flags.heron_chamber_open&&s.skills.exploration.level>=10&&Math.random()<.06){s.flags.heron_chamber_open=true;RF.log(s,'You locate a submerged stair beneath the stone heron. Something ancient waits below.','important')}}return out};

// Once the chamber is open, surface the boss in the drowned ruins.
const v7NearbyBase=RF.refreshEncounters;
RF.refreshEncounters=function(s,loc=s.location,force=false){let arr=v7NearbyBase(s,loc,force);if(loc==='drowned_ruins'&&s.flags.heron_chamber_open&&!s.kills.heron_keeper){if(!arr.some(x=>x.id==='heron_keeper'))arr.push({uid:`keeper_${s.day}`,id:'heron_keeper',level:RF.DATA.enemies.heron_keeper.level,hostile:false})}return arr};

// Boot migration for already-loaded state.
if(RF.state)RF.migrateV7(RF.state);

/* V7.0.1 integration patches */
RF.DATA.events.push({id:'heron_stair',title:'The Heron That Faces Down',icon:'🪶',once:true,locations:['drowned_ruins'],weight:12,condition:s=>s.flags.heron_rumour&&!s.flags.heron_chamber_open,text:'At low water you notice one stone heron faces the flooded courtyard rather than the horizon. Its pedestal is scored by old tool marks.',choices:[
 {text:'Study the pedestal.',condition:s=>s.skills.exploration.level>=8,result:s=>{s.flags.heron_chamber_open=true;RF.addXp(s,'exploration',55);return 'A concealed catch releases. Black water drains from a stair descending beneath the courtyard.';}},
 {text:'Try the old lock with a pick.',condition:s=>(s.inventory.lockpick||0)>0&&s.skills.thieving.level>=7,result:s=>{RF.takeItem(s,'lockpick',1);s.flags.heron_chamber_open=true;RF.addXp(s,'thieving',45);return 'The bronze mechanism clicks after several careful minutes. A submerged stair slowly clears.';}},
 {text:'Leave the monument alone.',result:s=>'The heron continues staring into the water.'}
]});

// Start the Mirefen side quest naturally when the player commits to the road.
const v701Travel=RF.travel;
RF.travel=function(id){let s=RF.state;if(id==='marshroad'&&s.flags.marshKnown&&!s.quests.marsh_lights)s.quests.marsh_lights={active:true,done:false};return v701Travel(id)};

// Camp-recipe support for optional extra ingredients.
const v701CookAtFire=RF.cookAtFire;
RF.cookAtFire=function(id){let r=RF.DATA.campRecipes[id],s=RF.state;if(r?.extra){for(let [x,q] of Object.entries(r.extra))if((s.inventory[x]||0)<q){RF.UI.modal={type:'message',title:'Missing Ingredients',text:`${r.name} also needs ${q} × ${RF.DATA.items[x]?.name||x}.`};RF.UI.render(s);return}}return v701CookAtFire(id)};
const v701TurnCook=RF.turnCook;
RF.turnCook=function(){let g=RF.actionGame;if(g?.type==='cooking'){let r=RF.DATA.campRecipes[g.recipe];if(r?.extra)Object.entries(r.extra).forEach(([id,q])=>RF.takeItem(RF.state,id,q))}return v701TurnCook()};
