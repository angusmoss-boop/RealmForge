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
