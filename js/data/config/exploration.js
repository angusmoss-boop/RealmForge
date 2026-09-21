/* Realmforge V11.30.0 — canonical exploration configuration. */
(()=>{
  'use strict';
  const C=window.RF.Config;
  if(!C)throw new Error('RF.Config must load before exploration configuration.');
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
})();
