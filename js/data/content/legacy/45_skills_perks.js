/* Realmforge V11.30.0 — canonical legacy content definitions: skills perks. */
(()=>{
'use strict';
const RF=window.RF;
const define=RF.Content.defineLegacyBlock;
define("v3@L46",function(){
RF.DATA.perks={
  ironblood:{name:'Ironblood',icon:'🩸',tree:'Warrior',max:3,desc:'Increase maximum health by 8 per rank.'},
  brutal_training:{name:'Brutal Training',icon:'⚔️',tree:'Warrior',max:2,desc:'Power Strike deals more damage and costs less stamina.',requires:['ironblood']},
  bulwark:{name:'Bulwark',icon:'🛡️',tree:'Warrior',max:2,desc:'Gain +2 effective armour per rank.'},
  trailwise:{name:'Trailwise',icon:'🧭',tree:'Ranger',max:3,desc:'Travel is 5% faster per rank.'},
  scavenger:{name:'Scavenger',icon:'🎒',tree:'Ranger',max:3,desc:'Improves enemy drop chances and gathering bonuses.'},
  silver_tongue:{name:'Silver Tongue',icon:'🗣️',tree:'Influence',max:3,desc:'Better shop prices and selected event outcomes.'},
  guild_favour:{name:'Guild Favour',icon:'🤝',tree:'Influence',max:2,desc:'Positive reputation gains are increased.'},
  light_fingers:{name:'Light Fingers',icon:'🫳',tree:'Shadow',max:3,desc:'Improves theft success and reduces bounty gained.'},
  vanish:{name:'Vanish',icon:'💨',tree:'Shadow',max:1,desc:'Smoke Bombs guarantee escape from normal enemies.',requires:['light_fingers']},
  craftsman:{name:'Craftsman',icon:'🔨',tree:'Artisan',max:3,desc:'Gain 12% more production XP per rank.'},
  prospector:{name:'Prospector',icon:'💎',tree:'Artisan',max:2,desc:'Chance to find bonus valuable ore.'}
};
},{"patch": "js/v3.js", "line": 46, "bytes": 1365, "kind": "direct"});
define("v5@L6",function(){
Object.assign(RF.DATA.skills, {
  firemaking: { name: 'Firemaking', icon: '🔥' }
});
},{"patch": "js/v5.js", "line": 6, "bytes": 86, "kind": "skills"});
})();
