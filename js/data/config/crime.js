/* Realmforge V11.30.0 — canonical crime configuration. */
(()=>{
  'use strict';
  const C=window.RF.Config;
  if(!C)throw new Error('RF.Config must load before crime configuration.');
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
})();
