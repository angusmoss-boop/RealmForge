/* Realmforge V11.30.0 — canonical world configuration. */
(()=>{
  'use strict';
  const C=window.RF.Config;
  if(!C)throw new Error('RF.Config must load before world configuration.');
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
})();
