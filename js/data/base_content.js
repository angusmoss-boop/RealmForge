/* Realmforge V11.30.0 — canonical base-content source bootstrap.
   Source files in this directory are the human-editable truth.
   tools/build_content.js assembles them into js/data/base_content.js for the 9-file runtime. */
window.RF=window.RF||{};
window.RF_BASE_CONTENT_SOURCE=window.RF_BASE_CONTENT_SOURCE||{};

/* Realmforge V11.30.0 — base content: backgrounds. */
(()=>{
  'use strict';
  const RF=window.RF;
  const BASE=window.RF_BASE_CONTENT_SOURCE||(window.RF_BASE_CONTENT_SOURCE={});
  BASE['backgrounds']={
    farmer:{name:'Farmer',icon:'🌾',desc:'+Cooking, +Foraging, bread & herbs',gold:18,items:{bread:3,herb:2},skills:{cooking:2,foraging:2}},
    hunter:{name:'Hunter',icon:'🏹',desc:'+Archery, +Hunting, shortbow & arrows',gold:14,items:{shortbow:1,arrow:25,raw_meat:2},skills:{archery:2,hunting:2}},
    smith:{name:"Smith's Apprentice",icon:'⚒️',desc:'+Mining, +Smithing, iron ore',gold:12,items:{iron_ore:5,coal:2},skills:{mining:2,smithing:2}},
    urchin:{name:'Street Urchin',icon:'🗝️',desc:'+Thieving, +Speech, lockpicks',gold:26,items:{lockpick:3,bread:1},skills:{thieving:2,speech:2}},
    scholar:{name:'Scholar',icon:'📚',desc:'+Magic, +Herblore, mana tonic',gold:16,items:{mana_tonic:2,herb:3},skills:{magic:2,herblore:2}},
    traveller:{name:'Traveller',icon:'🧭',desc:'+Exploration, +Trading, extra gold',gold:34,items:{bread:2,torch:1},skills:{exploration:2,trading:2}}
  };
})();

/* Realmforge V11.30.0 — base content: items. */
(()=>{
  'use strict';
  const RF=window.RF;
  const BASE=window.RF_BASE_CONTENT_SOURCE||(window.RF_BASE_CONTENT_SOURCE={});
  BASE['items']={
    bread:{name:'Bread',icon:'🥖',type:'food',value:4,desc:'Restores 10 health.',heal:10},
    herb:{name:'Greenleaf Herb',icon:'🌿',type:'material',value:3,desc:'A common medicinal herb.'},
    raw_meat:{name:'Raw Meat',icon:'🥩',type:'material',value:5,desc:'Cook before eating.'},
    cooked_meat:{name:'Cooked Meat',icon:'🍖',type:'food',value:10,desc:'Restores 22 health.',heal:22},
    copper_ore:{name:'Copper Ore',icon:'🟤',type:'material',value:4,desc:'Basic smithing ore.'},
    iron_ore:{name:'Iron Ore',icon:'🪨',type:'material',value:8,desc:'Useful metal ore.'},
    coal:{name:'Coal',icon:'⚫',type:'material',value:7,desc:'Fuel for stronger metals.'},
    logs:{name:'Oak Logs',icon:'🪵',type:'material',value:5,desc:'Sturdy timber.'},
    fish:{name:'Riverfish',icon:'🐟',type:'material',value:6,desc:'Can be cooked.'},
    cooked_fish:{name:'Cooked Riverfish',icon:'🍣',type:'food',value:12,desc:'Restores 18 health.',heal:18},
    iron_bar:{name:'Iron Bar',icon:'▰',type:'material',value:20,desc:'Refined iron.'},
    potion:{name:'Minor Healing Potion',icon:'🧪',type:'food',value:28,desc:'Restores 35 health.',heal:35},
    mana_tonic:{name:'Mana Tonic',icon:'🔵',type:'food',value:20,desc:'Restores stamina.',stamina:30},
    torch:{name:'Torch',icon:'🔥',type:'utility',value:5,desc:'Useful in dark places.'},
    lockpick:{name:'Lockpick',icon:'🗝️',type:'utility',value:9,desc:'Useful for locks and certain events.'},
    arrow:{name:'Arrow',icon:'➶',type:'ammo',value:1,desc:'Ammunition for bows.'},
    rusty_sword:{name:'Rusty Sword',icon:'🗡️',type:'weapon',value:18,damage:3,slot:'main',desc:'+3 melee damage.'},
    iron_sword:{name:'Iron Sword',icon:'⚔️',type:'weapon',value:80,damage:8,slot:'main',desc:'+8 melee damage.'},
    shortbow:{name:'Shortbow',icon:'🏹',type:'weapon',value:45,damage:5,slot:'main',ranged:true,desc:'+5 ranged damage.'},
    leather_vest:{name:'Leather Vest',icon:'🥋',type:'armor',value:55,armor:3,slot:'chest',desc:'+3 armour.'},
    iron_helm:{name:'Iron Helm',icon:'⛑️',type:'armor',value:65,armor:4,slot:'head',desc:'+4 armour.'},
    wolf_pelt:{name:'Wolf Pelt',icon:'🐺',type:'material',value:15,desc:'Warm, coarse pelt.'},
    bandit_token:{name:'Bandit Token',icon:'🪙',type:'quest',value:0,desc:'Marked with a black thorn.'},
    old_map:{name:'Torn Map',icon:'🗺️',type:'quest',value:0,desc:'Part of a map leading somewhere east.'}
  };
})();

/* Realmforge V11.30.0 — base content: skills. */
(()=>{
  'use strict';
  const RF=window.RF;
  const BASE=window.RF_BASE_CONTENT_SOURCE||(window.RF_BASE_CONTENT_SOURCE={});
  BASE['skills']={
    attack:{name:'Attack',icon:'⚔️'},strength:{name:'Strength',icon:'💪'},defence:{name:'Defence',icon:'🛡️'},archery:{name:'Archery',icon:'🏹'},magic:{name:'Magic',icon:'✨'},vitality:{name:'Vitality',icon:'❤️'},
    mining:{name:'Mining',icon:'⛏️'},woodcutting:{name:'Woodcutting',icon:'🪓'},fishing:{name:'Fishing',icon:'🎣'},foraging:{name:'Foraging',icon:'🌿'},hunting:{name:'Hunting',icon:'🐾'},
    smithing:{name:'Smithing',icon:'⚒️'},cooking:{name:'Cooking',icon:'🍳'},crafting:{name:'Crafting',icon:'🧵'},herblore:{name:'Herblore',icon:'🧪'},
    thieving:{name:'Thieving',icon:'🗝️'},trading:{name:'Trading',icon:'💰'},exploration:{name:'Exploration',icon:'🧭'},speech:{name:'Speech',icon:'💬'}
  };
})();

/* Realmforge V11.30.0 — base content: locations. */
(()=>{
  'use strict';
  const RF=window.RF;
  const BASE=window.RF_BASE_CONTENT_SOURCE||(window.RF_BASE_CONTENT_SOURCE={});
  BASE['locations']={
    greenvale:{name:'Greenvale',icon:'🏘️',region:'Greenvale',desc:'A quiet farming village where every road seems to lead toward trouble.',neighbors:{forest:18,river:12,mine:20,crossroads:16},actions:['rest','forage','talk'],shop:true},
    forest:{name:'Whisperwood',icon:'🌲',region:'Greenvale',desc:'Old oak forest. Safe near the road, less so beneath the deeper canopy.',neighbors:{greenvale:18,crossroads:14,ruins:28},actions:['woodcut','hunt','forage']},
    river:{name:'Silverrun River',icon:'🌊',region:'Greenvale',desc:'A cold, clear river running south through the valley.',neighbors:{greenvale:12,crossroads:18},actions:['fish','forage']},
    mine:{name:'Old Greenvale Mine',icon:'⛏️',region:'Greenvale',desc:'A reopened mine with deeper passages still boarded shut.',neighbors:{greenvale:20,crossroads:20},actions:['mine','explore']},
    crossroads:{name:'Kingroad Crossroads',icon:'🪧',region:'Greenvale',desc:'Merchants, pilgrims and less reputable travellers all pass here.',neighbors:{greenvale:16,forest:14,river:18,mine:20,bandit_camp:32},actions:['wait','explore']},
    ruins:{name:'Mossbound Ruins',icon:'🏚️',region:'Greenvale',desc:'Collapsed stones swallowed by the forest. Something has scratched symbols into the doorway.',neighbors:{forest:28},actions:['explore'],lockedSkill:{exploration:4}},
    bandit_camp:{name:'Blackthorn Camp',icon:'⛺',region:'Greenvale',desc:'A crude camp hidden beyond the eastern ridge.',neighbors:{crossroads:32},actions:['explore'],lockedFlag:'banditCampKnown'}
  };
})();

/* Realmforge V11.30.0 — base content: enemies. */
(()=>{
  'use strict';
  const RF=window.RF;
  const BASE=window.RF_BASE_CONTENT_SOURCE||(window.RF_BASE_CONTENT_SOURCE={});
  BASE['enemies']={
    rat:{name:'Giant Rat',icon:'🐀',hp:24,damage:[2,6],armor:0,xp:22,gold:[1,5],drops:[['raw_meat',.35,1]],level:1},
    wolf:{name:'Grey Wolf',icon:'🐺',hp:42,damage:[4,9],armor:1,xp:45,gold:[0,2],drops:[['wolf_pelt',.55,1],['raw_meat',.5,1]],level:3},
    bandit:{name:'Blackthorn Bandit',icon:'🥷',hp:58,damage:[5,11],armor:2,xp:70,gold:[8,20],drops:[['bandit_token',.65,1],['bread',.25,1]],level:5},
    brute:{name:'Bandit Brute',icon:'🪓',hp:95,damage:[8,16],armor:4,xp:140,gold:[18,35],drops:[['bandit_token',1,1],['iron_sword',.12,1]],level:8}
  };
})();

/* Realmforge V11.30.0 — base content: recipes. */
(()=>{
  'use strict';
  const RF=window.RF;
  const BASE=window.RF_BASE_CONTENT_SOURCE||(window.RF_BASE_CONTENT_SOURCE={});
  BASE['recipes']={
    cooked_fish:{name:'Cook Riverfish',skill:'cooking',level:1,time:6,inputs:{fish:1},outputs:{cooked_fish:1},xp:16},
    cooked_meat:{name:'Cook Meat',skill:'cooking',level:1,time:7,inputs:{raw_meat:1},outputs:{cooked_meat:1},xp:18},
    iron_bar:{name:'Smelt Iron Bar',skill:'smithing',level:2,time:9,inputs:{iron_ore:2,coal:1},outputs:{iron_bar:1},xp:28},
    potion:{name:'Brew Healing Potion',skill:'herblore',level:2,time:10,inputs:{herb:3},outputs:{potion:1},xp:30},
    iron_sword:{name:'Smith Iron Sword',skill:'smithing',level:5,time:15,inputs:{iron_bar:3},outputs:{iron_sword:1},xp:65}
  };
})();

/* Realmforge V11.30.0 — base content: shopStock. */
(()=>{
  'use strict';
  const RF=window.RF;
  const BASE=window.RF_BASE_CONTENT_SOURCE||(window.RF_BASE_CONTENT_SOURCE={});
  BASE['shopStock']=['bread','torch','lockpick','arrow','rusty_sword','shortbow','leather_vest','potion'];
})();

/* Realmforge V11.30.0 — base content: quests. */
(()=>{
  'use strict';
  const RF=window.RF;
  const BASE=window.RF_BASE_CONTENT_SOURCE||(window.RF_BASE_CONTENT_SOURCE={});
  BASE['quests']={
    first_steps:{name:'First Steps',desc:'Get your bearings in Greenvale.',objectives:[{type:'visit',target:'forest',text:'Visit Whisperwood'},{type:'skill',target:'foraging',value:2,text:'Reach Foraging level 2'}],reward:{gold:25,xp:60},next:'missing_caravan'},
    missing_caravan:{name:'The Missing Caravan',desc:'A trader expected from the east never arrived.',objectives:[{type:'flag',target:'woundedMerchantResolved',text:'Learn what happened on the east road'},{type:'item',target:'bandit_token',value:1,text:'Obtain a Blackthorn token'}],reward:{gold:70,xp:120,item:'old_map'},next:'blackthorn'},
    blackthorn:{name:'Blackthorn',desc:'The token bears the mark of a local bandit gang.',objectives:[{type:'flag',target:'banditCampKnown',text:'Discover the Blackthorn camp'},{type:'kill',target:'bandit',value:3,text:'Defeat 3 Blackthorn bandits'}],reward:{gold:130,xp:220,item:'iron_helm'}}
  };
})();

/* Realmforge V11.30.0 — base content: events. */
(()=>{
  'use strict';
  const RF=window.RF;
  const BASE=window.RF_BASE_CONTENT_SOURCE||(window.RF_BASE_CONTENT_SOURCE={});
  BASE['events']=[
    {id:'wounded_merchant',title:'A Man Beside the Road',icon:'🩸',once:true,locations:['crossroads','forest'],weight:8,text:'A merchant lies against a milestone, clutching a blood-soaked sleeve. A shattered cart wheel rests nearby.',choices:[
      {text:'Help him',sub:'Spend 1 herb if available. Kindness may be remembered.',condition:s=>true,result:s=>{let used=RF.takeItem(s,'herb',1);s.flags.woundedMerchantResolved=true;s.flags.savedMerchant=true;s.gold+=8;RF.addXp(s,'herblore',used?18:5);return used?'You bind the wound with Greenleaf. He gives his name as Oren Vale and whispers about Blackthorn bandits.':'You do what you can. He survives, and whispers about Blackthorn bandits.';}},
      {text:'Search the wreckage',sub:'Potential loot, potential consequences.',result:s=>{s.flags.woundedMerchantResolved=true;s.flags.robbedMerchant=true;RF.addItem(s,'lockpick',1);s.gold+=19;return 'You pocket a lockpick and a purse before footsteps force you away.';}},
      {text:'Leave him',sub:'The road is not your problem.',result:s=>{s.flags.woundedMerchantResolved=true;s.flags.abandonedMerchant=true;return 'You continue down the road. His voice fades behind you.';}}
    ]},
    {id:'road_shrine',title:'Shrine Beneath the Ash Tree',icon:'🕯️',once:true,locations:['forest','crossroads'],weight:5,text:'A tiny stone shrine sits beneath an ancient ash. Three coins and a black feather lie before it.',choices:[
      {text:'Leave an offering (5g)',condition:s=>s.gold>=5,result:s=>{s.gold-=5;s.flags.shrineBlessing=true;s.luck+=1;return 'The candle flame bends toward you despite the still air. Luck +1.';}},
      {text:'Take the coins',result:s=>{s.gold+=11;s.flags.robbedShrine=true;return 'Eleven gold. Easy money. The candle snuffs itself out.';}},
      {text:'Walk away',result:s=>'You leave the shrine untouched.'}
    ]},
    {id:'travelling_smith',title:'Travelling Smith',icon:'🔨',once:false,locations:['greenvale','crossroads'],weight:4,text:'A soot-faced smith has set up a temporary stall from the back of a wagon.',choices:[
      {text:'Buy 2 iron ore (12g)',condition:s=>s.gold>=12,result:s=>{s.gold-=12;RF.addItem(s,'iron_ore',2);return 'A fair enough deal. Two iron ore added.';}},
      {text:'Ask for advice',result:s=>{RF.addXp(s,'smithing',14);return 'He talks you through heat, colour and the sound good metal makes under a hammer. Smithing XP gained.';}},
      {text:'Move on',result:s=>'You leave him to his work.'}
    ]},
    {id:'lost_child',title:'Crying in the Ferns',icon:'🧒',once:true,locations:['forest'],weight:4,text:'You hear a child crying somewhere beyond the path. Darkness is gathering.',choices:[
      {text:'Search for them',result:s=>{s.flags.savedChild=true;s.reputation.greenvale+=8;RF.addXp(s,'exploration',24);return 'You find the child tangled in brambles and escort them home. Greenvale will remember this.';}},
      {text:'Ignore it',result:s=>{s.flags.ignoredChild=true;s.reputation.greenvale-=3;return 'You convince yourself someone else will deal with it.';}}
    ]}
  ];
})();

/* Realmforge V11.30.0 — assemble canonical base content into RF.DATA. */
(()=>{
  'use strict';
  const source=window.RF_BASE_CONTENT_SOURCE||{};
  window.RF=window.RF||{};
  window.RF.DATA=source;
  try{delete window.RF_BASE_CONTENT_SOURCE;}catch(_){}
})();
