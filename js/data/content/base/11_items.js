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
