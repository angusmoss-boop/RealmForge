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
