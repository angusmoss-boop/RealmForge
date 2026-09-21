/* Realmforge V11.30.0 — canonical commerce configuration. */
(()=>{
  'use strict';
  const C=window.RF.Config;
  if(!C)throw new Error('RF.Config must load before commerce configuration.');
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
})();
