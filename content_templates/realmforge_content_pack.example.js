/* Realmforge content-pack example.
   Copy this file, replace the example IDs/content, then include your pack in the canonical Data bundle before data finalisation. */
(() => {
  'use strict';
  const A=window.RF?.Authoring;
  if(!A)throw new Error('RF.Authoring must load before content packs.');

  A.registerPack({
    items:{
      example_blade:{
        name:'Example Blade',icon:'⚔️',type:'weapon',value:100,damage:8,slot:'main',
        desc:'Example content. Replace or remove before shipping.'
      }
    },
    enemies:{
      example_bandit:{
        name:'Example Bandit',icon:'🥷',hp:60,damage:[5,10],armor:1,xp:50,gold:[2,8],level:4,
        drops:[['example_blade',0.05,1]]
      }
    },
    locations:{
      example_clearing:{
        name:'Example Clearing',icon:'🌲',region:'Example',desc:'Example location.',
        neighbors:{greenvale:12},actions:['explore']
      }
    },
    recipes:{
      example_blade_recipe:{
        name:'Forge Example Blade',skill:'smithing',level:1,time:5,
        inputs:{iron_ore:1},outputs:{example_blade:1},xp:10
      }
    },
    quests:{
      example_quest:{
        name:'Example Quest',desc:'Visit the example clearing.',
        objectives:[{type:'visit',target:'example_clearing',text:'Reach the clearing'}],
        reward:{gold:10,xp:10}
      }
    }
  });
})();
