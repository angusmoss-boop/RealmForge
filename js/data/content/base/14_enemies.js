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
