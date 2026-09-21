/* Realmforge V11.30.0 — canonical dungeons configuration. */
(()=>{
  'use strict';
  const C=window.RF.Config;
  if(!C)throw new Error('RF.Config must load before dungeons configuration.');
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
