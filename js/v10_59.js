window.RF=window.RF||{};
RF.VERSION='10.59.0';
RF.BUILD={
  version:'10.59.0',
  title:'Stable Battle Tabs',
  built:'17 Sep 2026 • 16:44 BST',
  buildId:'20260917-1644-bst'
};
RF.V1059=RF.V1059||{};

/* Realmforge V10.59 — Stable Battle Tabs
   - Category switching is now DOM-only: no combat/modal re-render, so there is no camera-style jolt.
   - All four action categories remain mounted and simply show/hide in place.
   - Enlarges category emojis and moves/lifts the action-count numbers closer to the labels.
   - Leaves combat turns, cooldowns, Equipment, Tool Belt, Pack and save data untouched.
*/

(()=>{
'use strict';
const V=RF.V1059;

V.migrate=function(s){
  if(!s)return s;
  s.version='10.59.0';
  s.v1059=s.v1059||{};
  return s;
};
const oldNew=RF.newGame;RF.newGame=function(...a){return V.migrate(oldNew(...a))};
const oldLoad=RF.load;RF.load=function(){return V.migrate(oldLoad())};
const oldImport=RF.importSave;RF.importSave=function(x){return V.migrate(oldImport(x))};
if(RF.V95){
  RF.V95.SCHEMA='10.59.0';
  const om=RF.V95.migrate.bind(RF.V95);
  RF.V95.migrate=s=>V.migrate(om(s));
}

// Override V10.57's category renderer so every category exists in the DOM at once.
// Switching category then becomes a class/display toggle instead of reconstructing the battle modal.
if(RF.V1057){
  RF.V1057.actionCategoryHtml=function(s,buttons){
    const C=RF.V1057.CATS||[];
    const active=C.some(([id])=>id===s?.v1057?.combatCategory)?s.v1057.combatCategory:'aggressive';
    const grouped={aggressive:[],defensive:[],abilities:[],magic:[]};
    (buttons||[]).forEach(b=>grouped[RF.V1057.categoryForButton(b)]?.push(b));
    const tabs=C.map(([id,icon,label])=>`<button type="button" class="v1057CombatCat ${active===id?'active':''}" data-v1057-combat-cat="${id}" aria-selected="${active===id?'true':'false'}"><span class="v1059CatIcon">${icon}</span><b>${label}</b><small class="v1059CatCount">${grouped[id].length}</small></button>`).join('');
    const groups=C.map(([id])=>{
      const body=grouped[id].length?grouped[id].join(''):`<div class="v1057EmptyCombatCat">${id==='magic'?'🔮 No combat magic is available yet.':'No actions are available in this category.'}</div>`;
      return `<div class="v1035ActionGrid v1057CategorisedGrid v1059CombatGroup ${active===id?'active':''}" data-v1059-combat-group="${id}" ${active===id?'':'hidden'}>${body}</div>`;
    }).join('');
    return `<div class="v1057CombatCats">${tabs}</div>${groups}`;
  };
}

V.switchCategory=function(s,id){
  if(!s?.combat||!RF.V1057?.CATS?.some(([cat])=>cat===id))return;
  s.v1057=s.v1057||{};
  s.v1057.combatCategory=id;
  RF.save?.(s);

  // No RF.UI.render here. Keeping the existing battle DOM in place is what eliminates
  // the camera/entrance-motion effect completely.
  document.querySelectorAll('[data-v1057-combat-cat]').forEach(btn=>{
    const on=btn.dataset.v1057CombatCat===id;
    btn.classList.toggle('active',on);
    btn.setAttribute('aria-selected',on?'true':'false');
  });
  document.querySelectorAll('[data-v1059-combat-group]').forEach(group=>{
    const on=group.dataset.v1059CombatGroup===id;
    group.hidden=!on;
    group.classList.toggle('active',on);
  });
};

const bindBase=RF.UI.bind.bind(RF.UI);
RF.UI.bind=function(s){
  bindBase(s);
  document.querySelectorAll('[data-v1057-combat-cat]').forEach(btn=>{
    btn.onclick=e=>{
      e.preventDefault();
      e.stopPropagation();
      V.switchCategory(s,btn.dataset.v1057CombatCat);
    };
  });
};

const oldStyle=document.getElementById('v1059-stable-battle-tabs-style');if(oldStyle)oldStyle.remove();
const st=document.createElement('style');st.id='v1059-stable-battle-tabs-style';st.textContent=`
/* Keep inactive action groups mounted but genuinely out of layout. */
.v1059CombatGroup[hidden]{display:none!important}
.v1059CombatGroup.active{display:grid!important}

/* Centre each category's icon/label/count as one compact cluster. This pulls the count
   inward from the far edge while giving both icon and count more presence. */
.v1057CombatCat{
  grid-template-columns:auto auto auto!important;
  justify-content:center!important;
  align-content:center!important;
  column-gap:4px!important;
}
.v1057CombatCat>.v1059CatIcon,.v1057CombatCat>span{
  font-size:15px!important;
  line-height:1!important;
  width:auto!important;
  min-width:0!important;
}
.v1057CombatCat>b{
  width:auto!important;
  min-width:0!important;
  font-size:7.7px!important;
}
.v1057CombatCat>.v1059CatCount,.v1057CombatCat>small{
  width:auto!important;
  min-width:0!important;
  margin-left:0!important;
  font-size:8px!important;
  line-height:1!important;
  font-weight:800!important;
  color:#bca476!important;
}
.v1057CombatCat.active>.v1059CatCount,.v1057CombatCat.active>small{color:#ffe0a5!important}

/* Category selection itself has no motion/transform feedback. */
.v1057CombatCat,.v1057CombatCat:active,.v1057CombatCat.active{transform:none!important;animation:none!important}

@media(max-width:390px){
  .v1057CombatCat{column-gap:3px!important}
  .v1057CombatCat>.v1059CatIcon,.v1057CombatCat>span{font-size:14px!important}
  .v1057CombatCat>b{font-size:7.2px!important}
  .v1057CombatCat>.v1059CatCount,.v1057CombatCat>small{font-size:7.5px!important}
}
`;
document.head.appendChild(st);

if(RF.state){V.migrate(RF.state);RF.save?.(RF.state);setTimeout(()=>{if(RF.state&&!RF.V101?.mainMenu)RF.UI.render(RF.state)},0)}
})();
