window.RF=window.RF||{};
RF.VERSION='10.60.0';
RF.BUILD={
  version:'10.60.0',
  title:'Full Battle Frame',
  built:'17 Sep 2026 • 19:38 BST',
  buildId:'20260917-1938-bst'
};
RF.V1060=RF.V1060||{};

/* Realmforge V10.60 — Full Battle Frame
   - Fixes Tactical Battle to a stable full-height viewport frame.
   - Category changes no longer alter the popup's outer height.
   - Longer battle content scrolls inside the fixed battle frame.
   - Leaves combat state, Equipment, Tool Belt, Pack, Bank and progression untouched.
*/

(()=>{
'use strict';
const V=RF.V1060;

V.migrate=function(s){
  if(!s)return s;
  s.version='10.60.0';
  s.v1060=s.v1060||{};
  return s;
};
const oldNew=RF.newGame;RF.newGame=function(...a){return V.migrate(oldNew(...a))};
const oldLoad=RF.load;RF.load=function(){return V.migrate(oldLoad())};
const oldImport=RF.importSave;RF.importSave=function(x){return V.migrate(oldImport(x))};
if(RF.V95){
  RF.V95.SCHEMA='10.60.0';
  const om=RF.V95.migrate.bind(RF.V95);
  RF.V95.migrate=s=>V.migrate(om(s));
}

const oldStyle=document.getElementById('v1060-full-battle-frame-style');if(oldStyle)oldStyle.remove();
const st=document.createElement('style');st.id='v1060-full-battle-frame-style';st.textContent=`
/* The battle shell now owns a fixed viewport-sized frame. Category groups can become
   shorter or longer without resizing/recentring the modal itself. */
.v1035BattleBack{
  align-items:center!important;
  padding:6px!important;
  overflow:hidden!important;
}
.v1035BattleModal{
  height:calc(100dvh - 12px)!important;
  min-height:calc(100dvh - 12px)!important;
  max-height:calc(100dvh - 12px)!important;
  overflow-y:auto!important;
  overflow-x:hidden!important;
  overscroll-behavior:contain!important;
  -webkit-overflow-scrolling:touch!important;
  box-sizing:border-box!important;
  scrollbar-gutter:stable;
}

/* Keep the frame stable even on browsers that only expose legacy vh. */
@supports not (height:100dvh){
  .v1035BattleModal{
    height:calc(100vh - 12px)!important;
    min-height:calc(100vh - 12px)!important;
    max-height:calc(100vh - 12px)!important;
  }
}

@media(min-width:900px){
  .v1035BattleModal{
    height:min(calc(100dvh - 20px),900px)!important;
    min-height:min(calc(100dvh - 20px),900px)!important;
    max-height:min(calc(100dvh - 20px),900px)!important;
  }
}
`;
document.head.appendChild(st);

if(RF.state){V.migrate(RF.state);RF.save?.(RF.state);setTimeout(()=>{if(RF.state&&!RF.V101?.mainMenu)RF.UI.render(RF.state)},0)}
})();
