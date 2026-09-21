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
