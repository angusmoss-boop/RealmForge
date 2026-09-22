/* Realmforge V12.1.0 — Forge & Fletch canonical content pack. */
(()=>{
  'use strict';
  const RF=window.RF,A=RF.Authoring;
  if(!A)throw new Error('Forge & Fletch requires RF.Authoring.');

  const items={
    // Raw materials and refined metals.
    cobalt_ore:{name:'Cobalt Ore',icon:'🔷',type:'material',value:32,rarity:'Uncommon',desc:'Dense blue-grey ore from deeper workings. Tougher than ordinary iron.'},
    cobalt_bar:{name:'Cobalt Bar',icon:'▰',type:'material',value:80,rarity:'Uncommon',desc:'A hard blue-grey bar used for advanced tools, weapons and armour.'},
    redstone_ore:{name:'Redstone Ore',icon:'🟥',type:'material',value:48,rarity:'Uncommon',desc:'Iron-rich crimson ore found in the deeper Redstone cuts.'},
    redsteel_bar:{name:'Redsteel Bar',icon:'▰',type:'material',value:122,rarity:'Rare',desc:'A heat-treated crimson alloy with excellent impact resistance.'},
    stariron_ore:{name:'Stariron Ore',icon:'🌠',type:'material',value:78,rarity:'Rare',desc:'Blue-black ore flecked with pale metallic stars, found only in the hottest deep rock.'},
    stariron_bar:{name:'Stariron Bar',icon:'▰',type:'material',value:192,rarity:'Rare',desc:'A dark, exceptionally resilient bar with a faint silver grain.'},
    emberglass_bar:{name:'Emberglass Bar',icon:'🔶',type:'material',value:150,rarity:'Rare',desc:'Steel-bound Emberglass worked into a stable glowing ingot.'},
    ash_logs:{name:'Ash Logs',icon:'🪵',type:'material',value:14,desc:'Straight-grained timber prized for weapon shafts and flexible bows.'},
    maple_logs:{name:'Maple Logs',icon:'🍁',type:'material',value:26,rarity:'Uncommon',desc:'Dense springy timber that holds a strong curve without splitting.'},
    ironwood_logs:{name:'Ironwood Logs',icon:'🌳',type:'material',value:48,rarity:'Rare',desc:'Extremely dense old-growth timber. Difficult to cut and excellent for heavy bows.'},

    // Mining and woodcutting tools.
    cobalt_pickaxe:{name:'Cobalt Pickaxe',icon:'⛏️',type:'tool',value:330,tool:'mining',tier:4,power:28,control:.06,rarity:'Uncommon',desc:'A stiff cobalt pick with enough bite for deep mineral seams.'},
    cobalt_axe:{name:'Cobalt Wood Axe',icon:'🪓',type:'tool',value:335,tool:'woodcutting',tier:4,power:29,control:.06,rarity:'Uncommon',desc:'A thin cobalt edge built for hard mature timber.'},
    redsteel_pickaxe:{name:'Redsteel Pickaxe',icon:'⛏️',type:'tool',value:525,tool:'mining',tier:5,power:35,control:.08,rarity:'Rare',desc:'A heavy redsteel pick that carries force cleanly through stubborn rock.'},
    redsteel_axe:{name:'Redsteel Wood Axe',icon:'🪓',type:'tool',value:530,tool:'woodcutting',tier:5,power:36,control:.08,rarity:'Rare',desc:'A redsteel axe balanced for controlled cuts through ancient trunks.'},
    stariron_pickaxe:{name:'Stariron Pickaxe',icon:'⛏️',type:'tool',value:770,tool:'mining',tier:6,power:43,control:.10,rarity:'Rare',desc:'A compact stariron mining pick that barely flexes under impact.'},
    stariron_axe:{name:'Stariron Wood Axe',icon:'🪓',type:'tool',value:780,tool:'woodcutting',tier:6,power:44,control:.10,rarity:'Rare',desc:'A stariron axe for timber that would turn lesser edges.'},

    // Bronze armour completion.
    bronze_helm:{name:'Bronze Helm',icon:'⛑️',type:'armor',value:50,armor:2,slot:'head',desc:'+2 armour. Simple hammered bronze protection.'},
    bronze_cuirass:{name:'Bronze Cuirass',icon:'🛡️',type:'armor',value:92,damage:1,armor:4,slot:'chest',desc:'+1 damage, +4 armour. Entry-level metal body armour.'},
    bronze_greaves:{name:'Bronze Greaves',icon:'🦵',type:'armor',value:74,damage:1,armor:3,slot:'legs',desc:'+1 damage, +3 armour. Bronze plates protecting the thighs and knees.'},
    bronze_boots:{name:'Bronze Boots',icon:'🥾',type:'armor',value:46,armor:2,slot:'boots',desc:'+2 armour. Reinforced bronze-toed boots.'},

    // Iron armour completion.
    iron_cuirass:{name:'Iron Cuirass',icon:'🛡️',type:'armor',value:162,damage:1,armor:7,slot:'chest',desc:'+1 damage, +7 armour. Dependable forged iron plate.'},
    iron_greaves:{name:'Iron Greaves',icon:'🦵',type:'armor',value:132,damage:1,armor:5,slot:'legs',desc:'+1 damage, +5 armour. Solid iron leg protection.'},
    iron_boots:{name:'Iron Boots',icon:'🥾',type:'armor',value:92,damage:1,armor:3,slot:'boots',desc:'+1 damage, +3 armour. Heavy boots capped and braced with iron.'},
    iron_kite_shield:{name:'Iron Kite Shield',icon:'🛡️',type:'armor',value:148,damage:2,armor:6,slot:'off',desc:'+2 damage, +6 armour. A broad iron shield with a reinforced boss.'},

    // Steel armour completion.
    steel_greaves:{name:'Steel Greaves',icon:'🦵',type:'armor',value:255,damage:2,armor:8,slot:'legs',rarity:'Uncommon',desc:'+2 damage, +8 armour. Proper articulated steel leg armour.'},
    steel_boots:{name:'Steel Sabatons',icon:'🥾',type:'armor',value:182,damage:1,armor:5,slot:'boots',rarity:'Uncommon',desc:'+1 damage, +5 armour. Steel foot armour made for long marches.'},
    steel_tower_shield:{name:'Steel Tower Shield',icon:'🛡️',type:'armor',value:315,damage:3,armor:9,slot:'off',rarity:'Uncommon',desc:'+3 damage, +9 armour. A tall shield of layered Ironridge steel.'},

    // Cobalt set.
    cobalt_helm:{name:'Cobalt Helm',icon:'⛑️',type:'armor',value:332,damage:2,armor:8,slot:'head',rarity:'Uncommon',desc:'+2 damage, +8 armour. Rigid cobalt plate with a narrow reinforced brow.'},
    cobalt_cuirass:{name:'Cobalt Cuirass',icon:'🛡️',type:'armor',value:525,damage:3,armor:12,slot:'chest',rarity:'Uncommon',desc:'+3 damage, +12 armour. Dense cobalt plate without the bulk of heavier steel.'},
    cobalt_greaves:{name:'Cobalt Greaves',icon:'🦵',type:'armor',value:425,damage:2,armor:9,slot:'legs',rarity:'Uncommon',desc:'+2 damage, +9 armour. Blue-grey articulated leg plates.'},
    cobalt_boots:{name:'Cobalt Boots',icon:'🥾',type:'armor',value:302,damage:2,armor:6,slot:'boots',rarity:'Uncommon',desc:'+2 damage, +6 armour. Hard-wearing cobalt sabatons.'},
    cobalt_kite_shield:{name:'Cobalt Kite Shield',icon:'🛡️',type:'armor',value:465,damage:3,armor:10,slot:'off',rarity:'Uncommon',desc:'+3 damage, +10 armour. A balanced shield of tempered cobalt.'},

    // Redsteel set.
    redsteel_helm:{name:'Redsteel Helm',icon:'⛑️',type:'armor',value:525,damage:3,armor:10,slot:'head',rarity:'Rare',desc:'+3 damage, +10 armour. Crimson plate built to turn heavy blows.'},
    redsteel_cuirass:{name:'Redsteel Cuirass',icon:'🛡️',type:'armor',value:785,damage:4,armor:14,slot:'chest',rarity:'Rare',desc:'+4 damage, +14 armour. Thick redsteel plate with excellent impact resistance.'},
    redsteel_greaves:{name:'Redsteel Greaves',icon:'🦵',type:'armor',value:655,damage:3,armor:11,slot:'legs',rarity:'Rare',desc:'+3 damage, +11 armour. Weighty crimson leg plates.'},
    redsteel_boots:{name:'Redsteel Boots',icon:'🥾',type:'armor',value:465,damage:3,armor:8,slot:'boots',rarity:'Rare',desc:'+3 damage, +8 armour. Reinforced boots for brutal ground fighting.'},
    redsteel_bulwark:{name:'Redsteel Bulwark',icon:'🛡️',type:'armor',value:705,damage:4,armor:12,slot:'off',rarity:'Rare',desc:'+4 damage, +12 armour. A deep-curved shield made to absorb crushing force.'},

    // Stariron set. Strong crafted gear, still below the best legendary dungeon armour.
    stariron_helm:{name:'Stariron Helm',icon:'⛑️',type:'armor',value:765,damage:4,armor:12,slot:'head',rarity:'Rare',desc:'+4 damage, +12 armour. Dark stariron plate traced by a pale metallic grain.'},
    stariron_cuirass:{name:'Stariron Cuirass',icon:'🛡️',type:'armor',value:1125,damage:5,armor:16,slot:'chest',rarity:'Rare',desc:'+5 damage, +16 armour. High-end crafted plate, lighter than its strength suggests.'},
    stariron_greaves:{name:'Stariron Greaves',icon:'🦵',type:'armor',value:935,damage:4,armor:13,slot:'legs',rarity:'Rare',desc:'+4 damage, +13 armour. Exceptionally rigid articulated leg armour.'},
    stariron_boots:{name:'Stariron Boots',icon:'🥾',type:'armor',value:685,damage:4,armor:10,slot:'boots',rarity:'Rare',desc:'+4 damage, +10 armour. Stariron sabatons that shrug off stone and steel alike.'},
    stariron_aegis:{name:'Stariron Aegis',icon:'🛡️',type:'armor',value:1055,damage:5,armor:14,slot:'off',rarity:'Rare',desc:'+5 damage, +14 armour. A masterwork shield below only the finest legendary relics.'},

    // Additional melee weapons.
    bronze_mace:{name:'Bronze Mace',icon:'🔨',type:'weapon',value:70,damage:7,armor:1,slot:'main',desc:'+7 damage, +1 armour. A simple weighted bronze striking weapon.'},
    iron_warhammer:{name:'Iron Warhammer',icon:'🔨',type:'weapon',value:138,damage:10,armor:2,slot:'main',desc:'+10 damage, +2 armour. Heavy iron head on an ash haft.'},
    steel_spear:{name:'Steel Spear',icon:'🔱',type:'weapon',value:242,damage:14,armor:3,slot:'main',rarity:'Uncommon',desc:'+14 damage, +3 armour. A steel spear with a straight ash shaft.'},
    cobalt_longblade:{name:'Cobalt Longblade',icon:'⚔️',type:'weapon',value:395,damage:17,armor:3,slot:'main',rarity:'Uncommon',desc:'+17 damage, +3 armour. Long cobalt blade with excellent edge retention.'},
    cobalt_warhammer:{name:'Cobalt Warhammer',icon:'🔨',type:'weapon',value:435,damage:18,armor:4,slot:'main',rarity:'Uncommon',desc:'+18 damage, +4 armour. Compact cobalt hammer made for armoured targets.'},
    emberglass_sabre:{name:'Emberglass Sabre',icon:'🗡️',type:'weapon',value:565,damage:20,armor:4,slot:'main',rarity:'Rare',desc:'+20 damage, +4 armour. A steel-backed blade with a glowing Emberglass cutting edge.'},
    redsteel_longblade:{name:'Redsteel Longblade',icon:'⚔️',type:'weapon',value:655,damage:21,armor:4,slot:'main',rarity:'Rare',desc:'+21 damage, +4 armour. A powerful but controlled crimson blade.'},
    redsteel_maul:{name:'Redsteel Maul',icon:'🔨',type:'weapon',value:745,damage:22,armor:5,slot:'main',rarity:'Rare',desc:'+22 damage, +5 armour. A devastating two-handed maul balanced around a dense ironwood haft.'},
    stariron_longblade:{name:'Stariron Longblade',icon:'⚔️',type:'weapon',value:925,damage:24,armor:5,slot:'main',rarity:'Rare',desc:'+24 damage, +5 armour. A dark masterwork blade with a pale star-grain.'},
    stariron_warhammer:{name:'Stariron Warhammer',icon:'🔨',type:'weapon',value:1010,damage:25,armor:6,slot:'main',rarity:'Rare',desc:'+25 damage, +6 armour. Near-legendary crafted striking power without eclipsing the finest relic weapons.'},

    // Craftable bow progression.
    willow_recurve:{name:'Willow Recurve Bow',icon:'🏹',type:'weapon',value:92,damage:8,slot:'main',ranged:true,desc:'+8 ranged damage. A light bow shaped from flexible willow.'},
    yew_longbow:{name:'Yew Longbow',icon:'🏹',type:'weapon',value:182,damage:11,armor:1,slot:'main',ranged:true,rarity:'Uncommon',desc:'+11 ranged damage, +1 armour. Dense yew stores substantially more energy than common timber.'},
    maple_warbow:{name:'Maple Warbow',icon:'🏹',type:'weapon',value:315,damage:15,armor:2,slot:'main',ranged:true,rarity:'Uncommon',desc:'+15 ranged damage, +2 armour. A strong recurved bow for experienced archers.'},
    ironwood_greatbow:{name:'Ironwood Greatbow',icon:'🏹',type:'weapon',value:565,damage:19,armor:3,slot:'main',ranged:true,rarity:'Rare',desc:'+19 ranged damage, +3 armour. A massive bow requiring exceptional timber and careful tillering.'}
  };

  const recipes={
    // Bars and alloys.
    cobalt_bar:{name:'Smelt Cobalt Bar',skill:'smithing',level:16,time:16,inputs:{cobalt_ore:2,coal:1},outputs:{cobalt_bar:1},xp:96},
    emberglass_bar:{name:'Bind Emberglass Bar',skill:'smithing',level:21,time:20,inputs:{ember_shard:2,steel_bar:1,charcoal:1},outputs:{emberglass_bar:1},xp:136},
    redsteel_bar:{name:'Smelt Redsteel Bar',skill:'smithing',level:24,time:21,inputs:{redstone_ore:2,coal:2},outputs:{redsteel_bar:1},xp:154},
    stariron_bar:{name:'Smelt Stariron Bar',skill:'smithing',level:32,time:25,inputs:{stariron_ore:2,charcoal:1,coal:1},outputs:{stariron_bar:1},xp:220},

    // Bronze armour and weapon completion.
    bronze_boots:{name:'Forge Bronze Boots',skill:'smithing',level:3,time:10,inputs:{bronze_bar:2},outputs:{bronze_boots:1},xp:38},
    bronze_helm:{name:'Forge Bronze Helm',skill:'smithing',level:4,time:11,inputs:{bronze_bar:2},outputs:{bronze_helm:1},xp:44},
    bronze_mace:{name:'Forge Bronze Mace',skill:'smithing',level:4,time:11,inputs:{bronze_bar:2},outputs:{bronze_mace:1},xp:46},
    bronze_cuirass:{name:'Forge Bronze Cuirass',skill:'smithing',level:5,time:15,inputs:{bronze_bar:4},outputs:{bronze_cuirass:1},xp:68},
    bronze_greaves:{name:'Forge Bronze Greaves',skill:'smithing',level:5,time:13,inputs:{bronze_bar:3},outputs:{bronze_greaves:1},xp:58},

    // Iron equipment.
    iron_helm_recipe:{name:'Forge Iron Helm',skill:'smithing',level:6,time:13,inputs:{iron_bar:2},outputs:{iron_helm:1},xp:72},
    iron_boots:{name:'Forge Iron Boots',skill:'smithing',level:6,time:12,inputs:{iron_bar:2},outputs:{iron_boots:1},xp:70},
    iron_greaves:{name:'Forge Iron Greaves',skill:'smithing',level:7,time:15,inputs:{iron_bar:3},outputs:{iron_greaves:1},xp:86},
    iron_warhammer:{name:'Forge Iron Warhammer',skill:'smithing',level:7,time:15,inputs:{iron_bar:3,ash_logs:1},outputs:{iron_warhammer:1},xp:90},
    iron_cuirass:{name:'Forge Iron Cuirass',skill:'smithing',level:8,time:18,inputs:{iron_bar:4},outputs:{iron_cuirass:1},xp:104},
    iron_kite_shield:{name:'Forge Iron Kite Shield',skill:'smithing',level:8,time:16,inputs:{iron_bar:3},outputs:{iron_kite_shield:1},xp:96},

    // Steel equipment.
    steel_boots:{name:'Forge Steel Sabatons',skill:'smithing',level:11,time:15,inputs:{steel_bar:2},outputs:{steel_boots:1},xp:122},
    steel_spear:{name:'Forge Steel Spear',skill:'smithing',level:11,time:17,inputs:{steel_bar:3,ash_logs:1},outputs:{steel_spear:1},xp:132},
    steel_greaves:{name:'Forge Steel Greaves',skill:'smithing',level:12,time:18,inputs:{steel_bar:3},outputs:{steel_greaves:1},xp:142},
    steel_tower_shield:{name:'Forge Steel Tower Shield',skill:'smithing',level:13,time:20,inputs:{steel_bar:4},outputs:{steel_tower_shield:1},xp:158},
    steel_cuirass_recipe:{name:'Forge Steel Cuirass',skill:'smithing',level:14,time:22,inputs:{steel_bar:5},outputs:{steel_cuirass:1},xp:178},

    // Cobalt equipment and tools.
    cobalt_boots:{name:'Forge Cobalt Boots',skill:'smithing',level:18,time:17,inputs:{cobalt_bar:2},outputs:{cobalt_boots:1},xp:162},
    cobalt_helm:{name:'Forge Cobalt Helm',skill:'smithing',level:19,time:18,inputs:{cobalt_bar:2},outputs:{cobalt_helm:1},xp:172},
    cobalt_pickaxe:{name:'Forge Cobalt Pickaxe',skill:'smithing',level:19,time:19,inputs:{cobalt_bar:3,ash_logs:1},outputs:{cobalt_pickaxe:1},xp:178},
    cobalt_greaves:{name:'Forge Cobalt Greaves',skill:'smithing',level:20,time:20,inputs:{cobalt_bar:3},outputs:{cobalt_greaves:1},xp:188},
    cobalt_longblade:{name:'Forge Cobalt Longblade',skill:'smithing',level:20,time:21,inputs:{cobalt_bar:4},outputs:{cobalt_longblade:1},xp:196},
    cobalt_axe:{name:'Forge Cobalt Wood Axe',skill:'smithing',level:20,time:19,inputs:{cobalt_bar:3,ash_logs:1},outputs:{cobalt_axe:1},xp:182},
    cobalt_cuirass:{name:'Forge Cobalt Cuirass',skill:'smithing',level:21,time:23,inputs:{cobalt_bar:5},outputs:{cobalt_cuirass:1},xp:212},
    cobalt_kite_shield:{name:'Forge Cobalt Kite Shield',skill:'smithing',level:22,time:21,inputs:{cobalt_bar:4},outputs:{cobalt_kite_shield:1},xp:218},
    cobalt_warhammer:{name:'Forge Cobalt Warhammer',skill:'smithing',level:22,time:22,inputs:{cobalt_bar:4,ash_logs:1},outputs:{cobalt_warhammer:1},xp:226},

    // Emberglass and Redsteel equipment/tools.
    emberglass_sabre:{name:'Forge Emberglass Sabre',skill:'smithing',level:24,time:24,inputs:{emberglass_bar:3,cobalt_bar:1},outputs:{emberglass_sabre:1},xp:246},
    redsteel_boots:{name:'Forge Redsteel Boots',skill:'smithing',level:25,time:19,inputs:{redsteel_bar:2},outputs:{redsteel_boots:1},xp:236},
    redsteel_helm:{name:'Forge Redsteel Helm',skill:'smithing',level:26,time:20,inputs:{redsteel_bar:2},outputs:{redsteel_helm:1},xp:248},
    redsteel_greaves:{name:'Forge Redsteel Greaves',skill:'smithing',level:27,time:22,inputs:{redsteel_bar:3},outputs:{redsteel_greaves:1},xp:266},
    redsteel_pickaxe:{name:'Forge Redsteel Pickaxe',skill:'smithing',level:27,time:23,inputs:{redsteel_bar:3,maple_logs:1},outputs:{redsteel_pickaxe:1},xp:270},
    redsteel_longblade:{name:'Forge Redsteel Longblade',skill:'smithing',level:27,time:24,inputs:{redsteel_bar:4},outputs:{redsteel_longblade:1},xp:278},
    redsteel_cuirass:{name:'Forge Redsteel Cuirass',skill:'smithing',level:28,time:26,inputs:{redsteel_bar:5},outputs:{redsteel_cuirass:1},xp:294},
    redsteel_axe:{name:'Forge Redsteel Wood Axe',skill:'smithing',level:28,time:23,inputs:{redsteel_bar:3,maple_logs:1},outputs:{redsteel_axe:1},xp:276},
    redsteel_bulwark:{name:'Forge Redsteel Bulwark',skill:'smithing',level:29,time:25,inputs:{redsteel_bar:4},outputs:{redsteel_bulwark:1},xp:302},
    redsteel_maul:{name:'Forge Redsteel Maul',skill:'smithing',level:30,time:26,inputs:{redsteel_bar:4,ironwood_logs:1},outputs:{redsteel_maul:1},xp:318},

    // Stariron equipment and tools.
    stariron_boots:{name:'Forge Stariron Boots',skill:'smithing',level:33,time:22,inputs:{stariron_bar:2},outputs:{stariron_boots:1},xp:326},
    stariron_helm:{name:'Forge Stariron Helm',skill:'smithing',level:34,time:23,inputs:{stariron_bar:2},outputs:{stariron_helm:1},xp:342},
    stariron_greaves:{name:'Forge Stariron Greaves',skill:'smithing',level:35,time:25,inputs:{stariron_bar:3},outputs:{stariron_greaves:1},xp:362},
    stariron_pickaxe:{name:'Forge Stariron Pickaxe',skill:'smithing',level:35,time:25,inputs:{stariron_bar:3,ironwood_logs:1},outputs:{stariron_pickaxe:1},xp:368},
    stariron_longblade:{name:'Forge Stariron Longblade',skill:'smithing',level:35,time:27,inputs:{stariron_bar:4},outputs:{stariron_longblade:1},xp:378},
    stariron_axe:{name:'Forge Stariron Wood Axe',skill:'smithing',level:36,time:25,inputs:{stariron_bar:3,ironwood_logs:1},outputs:{stariron_axe:1},xp:372},
    stariron_cuirass:{name:'Forge Stariron Cuirass',skill:'smithing',level:37,time:29,inputs:{stariron_bar:5},outputs:{stariron_cuirass:1},xp:402},
    stariron_aegis:{name:'Forge Stariron Aegis',skill:'smithing',level:38,time:28,inputs:{stariron_bar:4},outputs:{stariron_aegis:1},xp:416},
    stariron_warhammer:{name:'Forge Stariron Warhammer',skill:'smithing',level:38,time:29,inputs:{stariron_bar:4,ironwood_logs:1},outputs:{stariron_warhammer:1},xp:424},

    // Fletching lives under Crafting for now.
    shortbow_fletching:{name:'Fletch Oak Shortbow',skill:'crafting',level:2,time:10,inputs:{logs:2,waxed_thread:1},outputs:{shortbow:1},xp:34},
    bronze_arrows:{name:'Fletch Bronze Arrows',skill:'crafting',level:3,time:8,inputs:{bronze_bar:1,logs:1},outputs:{arrow:20},xp:36},
    willow_recurve:{name:'Fletch Willow Recurve Bow',skill:'crafting',level:6,time:12,inputs:{willow_logs:2,waxed_thread:1},outputs:{willow_recurve:1},xp:62},
    iron_arrows:{name:'Fletch Iron Arrows',skill:'crafting',level:7,time:9,inputs:{iron_bar:1,willow_logs:1},outputs:{arrow:30},xp:70},
    steel_arrows:{name:'Fletch Steel Arrows',skill:'crafting',level:12,time:11,inputs:{steel_bar:1,ash_logs:1},outputs:{arrow:40},xp:112},
    yew_longbow:{name:'Fletch Yew Longbow',skill:'crafting',level:14,time:16,inputs:{yew_logs:3,waxed_thread:2},outputs:{yew_longbow:1},xp:142},
    cobalt_arrows:{name:'Fletch Cobalt Arrows',skill:'crafting',level:19,time:13,inputs:{cobalt_bar:1,yew_logs:1},outputs:{arrow:55},xp:180},
    maple_warbow:{name:'Fletch Maple Warbow',skill:'crafting',level:22,time:19,inputs:{maple_logs:3,waxed_thread:2},outputs:{maple_warbow:1},xp:220},
    redsteel_arrows:{name:'Fletch Redsteel Arrows',skill:'crafting',level:27,time:15,inputs:{redsteel_bar:1,maple_logs:1},outputs:{arrow:75},xp:272},
    ironwood_greatbow:{name:'Fletch Ironwood Greatbow',skill:'crafting',level:30,time:23,inputs:{ironwood_logs:4,waxed_thread:3},outputs:{ironwood_greatbow:1},xp:318},
    stariron_arrows:{name:'Fletch Stariron Arrows',skill:'crafting',level:35,time:17,inputs:{stariron_bar:1,ironwood_logs:1},outputs:{arrow:100},xp:360}
  };

  const gathering={
    resourceDefs:{
      cobalt:{name:'Cobalt Seam',icon:'🔷',skill:'mining',level:16,item:'cobalt_ore',xp:70,duration:18,yield:[1,1],max:4,regen:140,desc:'Dense blue-grey ore in hard deep rock.'},
      redstone:{name:'Redstone Vein',icon:'🟥',skill:'mining',level:22,item:'redstone_ore',xp:104,duration:22,yield:[1,1],max:3,regen:180,desc:'Crimson iron-rich ore under enormous pressure.'},
      stariron:{name:'Stariron Vein',icon:'🌠',skill:'mining',level:30,item:'stariron_ore',xp:155,duration:26,yield:[1,1],max:2,regen:240,desc:'Rare blue-black ore formed in the hottest deep stone.'},
      ash:{name:'Ash Tree',icon:'🌳',skill:'woodcutting',level:9,item:'ash_logs',xp:44,duration:14,yield:[1,2],max:6,regen:85,desc:'Straight, resilient timber ideal for shafts and bows.'},
      maple:{name:'Maple Tree',icon:'🍁',skill:'woodcutting',level:18,item:'maple_logs',xp:76,duration:18,yield:[1,1],max:4,regen:140,desc:'Dense springy timber from mature woodland.'},
      ironwood:{name:'Ancient Ironwood',icon:'🌳',skill:'woodcutting',level:28,item:'ironwood_logs',xp:132,duration:24,yield:[1,1],max:2,regen:220,desc:'Exceptionally hard old-growth timber that punishes weak axes.'}
    },
    locationResources:{
      deep_mine:['cobalt'],
      quarry:['cobalt','redstone'],
      ember_cave:['stariron'],
      forest:['ash','maple','ironwood']
    }
  };

  A.registerPack({items,recipes,config:{'gathering.content.v12_1_forge_fletch':gathering}},{assertValid:false});
})();
