window.RF=window.RF||{};
RF.VERSION='11.2.1';
RF.BUILD={
  version:'11.2.1',
  title:'Modal Scroll Lock',
  built:'17 Sep 2026 • 21:08 BST',
  buildId:'20260917-2108-bst'
};
RF.V1121=RF.V1121||{};

/* Realmforge V11.2.1 — Modal Scroll Lock
   - Locks the underlying Realmforge page whenever a popup/overlay is open.
   - Scrollable popup content remains scrollable, but scroll no longer chains into the page behind it.
   - Restores the exact previous page position when the final overlay closes.
   - Covers standard modals, navigation picker, combat, travel and standalone item-info overlays.
*/

(()=>{
'use strict';
const V=RF.V1121;
V.version='11.2.1';
V.locked=false;
V.scrollY=0;
V.scrollX=0;
V.syncQueued=false;

V.migrate=function(s){
  if(!s)return s;
  s.version='11.2.1';
  s.v1121=s.v1121||{};
  return s;
};
const oldNew=RF.newGame;RF.newGame=function(...a){return V.migrate(oldNew(...a))};
const oldLoad=RF.load;RF.load=function(){return V.migrate(oldLoad())};
const oldImport=RF.importSave;RF.importSave=function(x){return V.migrate(oldImport(x))};
if(RF.V95){
  RF.V95.SCHEMA='11.2.1';
  const om=RF.V95.migrate.bind(RF.V95);
  RF.V95.migrate=s=>V.migrate(om(s));
}

// Anything in this list visually takes control of the interface and must own scrolling.
V.overlaySelector=[
  '.modalBack',
  '.v1017TravelBack',
  '.v1036InfoBack',
  '.v1042BankInfoBack',
  '.v1042QtyBack',
  '.v1054DetailBack'
].join(',');

V.hasOverlay=function(){
  try{return !!document.querySelector(V.overlaySelector)}catch(_){return false}
};

V.lock=function(){
  if(V.locked)return;
  V.locked=true;
  V.scrollX=window.scrollX||window.pageXOffset||0;
  V.scrollY=window.scrollY||window.pageYOffset||0;
  const body=document.body,html=document.documentElement;
  if(!body||!html)return;
  html.classList.add('v1121OverlayOpen');
  body.classList.add('v1121ScrollLocked');
  body.style.top=`-${V.scrollY}px`;
  body.style.left=`-${V.scrollX}px`;
};

V.unlock=function(){
  if(!V.locked)return;
  V.locked=false;
  const x=V.scrollX,y=V.scrollY;
  const body=document.body,html=document.documentElement;
  if(body){
    body.classList.remove('v1121ScrollLocked');
    body.style.top='';
    body.style.left='';
  }
  html?.classList.remove('v1121OverlayOpen');
  // Restore after layout has been returned to the normal document flow.
  requestAnimationFrame(()=>window.scrollTo(x,y));
};

V.sync=function(){
  V.syncQueued=false;
  if(V.hasOverlay())V.lock();
  else V.unlock();
};
V.queueSync=function(){
  if(V.syncQueued)return;
  V.syncQueued=true;
  queueMicrotask(V.sync);
};

// Last render wrapper: catches every ordinary RF.UI modal immediately after it is drawn/closed.
const renderBase=RF.UI.render.bind(RF.UI);
RF.UI.render=function(s){
  const out=renderBase(s);
  V.sync();
  return out;
};

// Standalone long-press/detail overlays are inserted directly into document.body rather than
// through RF.UI.render, so observe DOM changes too. This also future-proofs new overlay types
// that use one of the standard Realmforge backdrop classes above.
V.observer=new MutationObserver(()=>V.queueSync());
V.observer.observe(document.body,{childList:true,subtree:true});

const oldStyle=document.getElementById('v1121-scroll-lock-style');
if(oldStyle)oldStyle.remove();
const st=document.createElement('style');
st.id='v1121-scroll-lock-style';
st.textContent=`
html.v1121OverlayOpen{overscroll-behavior:none!important}
body.v1121ScrollLocked{
  position:fixed!important;
  right:0!important;
  width:100%!important;
  overflow:hidden!important;
  overscroll-behavior:none!important;
}
/* The backdrop never hands a finished swipe to the document underneath. */
.modalBack,.v1017TravelBack,.v1036InfoBack,.v1042BankInfoBack,.v1042QtyBack,.v1054DetailBack{
  overscroll-behavior:none!important;
}
/* Scrolling belongs to the open panel. At either edge it stops here instead of chaining. */
.modal,.v1017TravelModal,.v1036InfoModal,.v1042BankInfoModal,.v1042QtyModal,.v1054DetailModal{
  overscroll-behavior:contain!important;
  -webkit-overflow-scrolling:touch;
}
`;
document.head.appendChild(st);

if(RF.state){
  V.migrate(RF.state);
  RF.save?.(RF.state);
  setTimeout(()=>V.sync(),0);
}
})();
