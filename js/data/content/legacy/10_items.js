/* Realmforge V11.30.0 — canonical legacy content definitions: items. */
(()=>{
'use strict';
const RF=window.RF;
const define=RF.Content.defineLegacyBlock;
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
define("v10_27@L21",function(){
RF.DATA.items.lockpick=Object.assign(RF.DATA.items.lockpick||{}, {
  name:'Lockpick',icon:'🗝️',type:'utility',value:9,
  desc:'A slender iron pick for locks. Stackable and consumed whenever a lockpicking attempt fails.'
});
},{"patch": "js/v10_27.js", "line": 21, "bytes": 228, "kind": "direct"});
})();
