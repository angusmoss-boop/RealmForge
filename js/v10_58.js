window.RF=window.RF||{};
RF.VERSION='10.58.0';
RF.BUILD={
  version:'10.58.0',
  title:'Battle Tabs',
  built:'17 Sep 2026 • 16:12 BST',
  buildId:'20260917-1612-bst'
};
RF.V1058=RF.V1058||{};

/* Realmforge V10.58 — Battle Tabs
   - Restyles V10.57 combat categories as one full-width gold segmented tab bar.
   - Visually separates category navigation from the action tiles below it.
   - Suppresses the battle-modal entrance animation when switching categories so tab changes no longer jolt the screen.
   - Leaves combat state, Equipment, Tool Belt, Pack and Bank data untouched.
*/

(()=>{
'use strict';
const V=RF.V1058;

V.migrate=function(s){
  if(!s)return s;
  s.version='10.58.0';
  s.v1058=s.v1058||{};
  return s;
};
const oldNew=RF.newGame;RF.newGame=function(...a){return V.migrate(oldNew(...a))};
const oldLoad=RF.load;RF.load=function(){return V.migrate(oldLoad())};
const oldImport=RF.importSave;RF.importSave=function(x){return V.migrate(oldImport(x))};
if(RF.V95){
  RF.V95.SCHEMA='10.58.0';
  const om=RF.V95.migrate.bind(RF.V95);
  RF.V95.migrate=s=>V.migrate(om(s));
}

V.switchCategory=function(s,id){
  if(!s?.combat||!RF.V1057?.CATS?.some(([cat])=>cat===id))return;
  s.v1057=s.v1057||{};
  s.v1057.combatCategory=id;
  RF.save?.(s);

  // RF.UI.render recreates the battle modal. The legacy .battleModal entrance animation
  // is desirable when a fight first opens, but looked like an impact shake when merely
  // switching action categories. Disable it for exactly this render cycle.
  document.documentElement.classList.add('v1058CategorySwitch');
  RF.UI.render(s);
  requestAnimationFrame(()=>requestAnimationFrame(()=>document.documentElement.classList.remove('v1058CategorySwitch')));
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

const oldStyle=document.getElementById('v1058-battle-tabs-style');if(oldStyle)oldStyle.remove();
const st=document.createElement('style');st.id='v1058-battle-tabs-style';st.textContent=`
/* One continuous segmented control instead of four action-looking tiles. */
.v1057CombatCats{
  display:grid!important;
  grid-template-columns:repeat(4,minmax(0,1fr))!important;
  gap:0!important;
  width:100%;
  margin:5px 0 10px!important;
  padding:3px!important;
  border:1px solid rgba(210,164,83,.58)!important;
  border-radius:12px!important;
  background:linear-gradient(180deg,rgba(116,78,31,.92),rgba(66,43,21,.96))!important;
  box-shadow:inset 0 1px rgba(255,239,189,.16),0 5px 15px rgba(0,0,0,.24)!important;
  overflow:hidden;
}
.v1057CombatCat{
  min-width:0!important;
  min-height:35px!important;
  margin:0!important;
  padding:4px 3px!important;
  border:0!important;
  border-right:1px solid rgba(244,211,145,.16)!important;
  border-radius:8px!important;
  background:transparent!important;
  color:#d7c29a!important;
  box-shadow:none!important;
  display:grid!important;
  grid-template-columns:auto minmax(0,1fr) auto!important;
  align-items:center!important;
  gap:3px!important;
  transform:none!important;
}
.v1057CombatCat:last-child{border-right:0!important}
.v1057CombatCat>span{font-size:12px!important;filter:saturate(.85)}
.v1057CombatCat>b{font-size:7.5px!important;font-weight:800!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;color:inherit!important}
.v1057CombatCat>small{font-size:6.5px!important;color:#a99168!important}
.v1057CombatCat.active{
  color:#fff0c8!important;
  background:linear-gradient(180deg,rgba(220,170,80,.38),rgba(137,91,35,.55))!important;
  box-shadow:inset 0 0 0 1px rgba(255,218,142,.28),inset 0 1px rgba(255,244,213,.14),0 2px 7px rgba(0,0,0,.22)!important;
}
.v1057CombatCat.active small{color:#f2d59f!important}
.v1057CombatCat:active{transform:none!important;filter:brightness(1.08)}

/* Give the actual action grid a clean visual break below navigation. */
.v1057CategorisedGrid{margin-top:0!important;padding-top:0!important}
.v1036ActionHead{margin-bottom:2px!important}

/* Category switches are UI navigation, not combat impacts. */
.v1058CategorySwitch .battleModal{animation:none!important}

@media(max-width:390px){
  .v1057CombatCats{margin-bottom:8px!important;padding:3px!important}
  .v1057CombatCat{min-height:33px!important;padding:3px 2px!important}
  .v1057CombatCat>b{font-size:7px!important}
  .v1057CombatCat>span{font-size:11px!important}
  .v1057CombatCat>small{font-size:6px!important}
}
`;
document.head.appendChild(st);

if(RF.state){V.migrate(RF.state);RF.save?.(RF.state);setTimeout(()=>{if(RF.state&&!RF.V101?.mainMenu)RF.UI.render(RF.state)},0)}
})();
