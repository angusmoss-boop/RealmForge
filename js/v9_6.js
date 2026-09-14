window.RF = window.RF || {};
RF.VERSION = '9.6.0';

/* Realmforge V9.6 — App Shell & Focus
   - Android/PWA Back unwinds interfaces instead of immediately leaving the app.
   - Informational modals pause simulated time and restore the prior speed when closed.
   - Native dropdowns pause while open, preventing tick renders from collapsing them.
*/

RF.V96 = RF.V96 || {
  modalPaused:false,
  modalResume:null,
  selectPaused:false,
  selectResume:null,
  modalWasOpen:false,
  lastNonZeroSpeed:1,
  backArmed:false,
  suppressPop:false
};

RF.v96CaptureClock=function(s){
  if(!s)return {speed:1,paused:false,boostRemaining:0};
  if(s.speed>0)RF.V96.lastNonZeroSpeed=s.speed;
  let speed=s.speed;
  // A handful of older popup openers set speed=0 without setting paused=true.
  // In that case, use the last deliberate running speed as the resume target.
  if(speed===0 && !s.paused) speed=RF.V96.lastNonZeroSpeed||1;
  return {
    speed,
    paused:!!s.paused,
    boostRemaining:(speed===2&&s.v8)?Math.max(0,(s.v8.boostUntil||0)-Date.now()):0
  };
};

RF.v96ApplyPause=function(s,kind){
  if(!s)return;
  let key=kind==='select'?'selectResume':'modalResume';
  let flag=kind==='select'?'selectPaused':'modalPaused';
  if(RF.V96[flag])return;
  RF.V96[key]=RF.v96CaptureClock(s);
  RF.V96[flag]=true;
  s.speed=0;
  s.paused=true;
  if(s.v8?.boostUntil)s.v8.boostUntil=0;
};

RF.v96RestoreClock=function(s,snap){
  if(!s||!snap)return;
  // Combat and hands-on action interfaces own their own time state.
  if(s.combat||RF.actionGame)return;
  let speed=snap.paused?0:(snap.speed||1);
  if(![0,1,2].includes(speed))speed=1;
  s.speed=speed;
  s.paused=speed===0;
  if(speed>0)RF.V96.lastNonZeroSpeed=speed;
  if(speed===2&&s.v8){
    // Resume the same remaining burst rather than consuming it while reading a popup.
    let left=Math.max(1000,snap.boostRemaining||RF.V8?.boostMs||30000);
    s.v8.boostUntil=Date.now()+left;
  }
};

RF.v96ReleasePause=function(s,kind){
  let key=kind==='select'?'selectResume':'modalResume';
  let flag=kind==='select'?'selectPaused':'modalPaused';
  if(!RF.V96[flag])return;
  let snap=RF.V96[key];
  RF.V96[flag]=false;RF.V96[key]=null;
  // Do not restore while the other UI pause is still active.
  if(RF.V96.modalPaused||RF.V96.selectPaused)return;
  RF.v96RestoreClock(s,snap);
};

RF.v96ModalNeedsAutoPause=function(){
  let m=RF.UI.modal;
  if(!m)return false;
  // These are active minigame interfaces. Their own systems already capture/restore speed.
  if(m.type==='v6Action'||m.type==='v7Action')return false;
  return true;
};

// Keep track of deliberate speed selections for older popup systems that zero speed directly.
const v96SetSpeedBase=RF.setSpeed;
RF.setSpeed=function(v){
  v=+v;
  if(v>0)RF.V96.lastNonZeroSpeed=v;
  // If an informational popup/dropdown is open, change what will resume, not the paused world itself.
  if((RF.V96.modalPaused||RF.V96.selectPaused)&&RF.state){
    let target=RF.V96.selectPaused?RF.V96.selectResume:RF.V96.modalResume;
    if(target){target.speed=v;target.paused=v===0;if(v===2)target.boostRemaining=RF.V8?.boostMs||30000;}
    RF.state.speed=0;RF.state.paused=true;RF.UI.render(RF.state);return;
  }
  return v96SetSpeedBase(v);
};

// Last wrapper in the chain: pause before drawing an informational popup, restore when it disappears.
const v96RenderBase=RF.UI.render.bind(RF.UI);
RF.UI.render=function(s){
  if(s){
    if(s.speed>0)RF.V96.lastNonZeroSpeed=s.speed;
    let open=RF.v96ModalNeedsAutoPause();
    if(open&&!RF.V96.modalWasOpen)RF.v96ApplyPause(s,'modal');
    if(!open&&RF.V96.modalWasOpen)RF.v96ReleasePause(s,'modal');
    RF.V96.modalWasOpen=open;
  }
  return v96RenderBase(s);
};

// Dropdowns were being destroyed by the frequent world render. Pause while a native select is open/focused.
document.addEventListener('focusin',e=>{
  if(e.target?.tagName==='SELECT'&&RF.state&&!RF.actionGame&&!RF.state.combat){
    RF.v96ApplyPause(RF.state,'select');
  }
},true);
document.addEventListener('pointerdown',e=>{
  if(e.target?.tagName==='SELECT'&&RF.state&&!RF.actionGame&&!RF.state.combat){
    RF.v96ApplyPause(RF.state,'select');
  }
},true);
function v96ReleaseSelect(){
  if(!RF.V96.selectPaused)return;
  // Let the select's own change handler finish any render first.
  setTimeout(()=>{if(RF.state){RF.v96ReleasePause(RF.state,'select');RF.UI.render(RF.state)}},0);
}
document.addEventListener('change',e=>{if(e.target?.tagName==='SELECT')v96ReleaseSelect()},true);
document.addEventListener('focusout',e=>{if(e.target?.tagName==='SELECT')v96ReleaseSelect()},true);

// ---------- Android / installed-PWA Back behaviour ----------
RF.v96ArmBack=function(){
  try{
    history.replaceState({...history.state,rfRealmforgeBase:true},'',location.href);
    history.pushState({rfRealmforgeGuard:true},'',location.href);
    RF.V96.backArmed=true;
  }catch{}
};

RF.v96CloseTopInterface=function(){
  let s=RF.state;
  // Hands-on activity popup: use the existing proper abandon/resume routine.
  if(RF.UI.modal&&(RF.UI.modal.type==='v6Action'||RF.UI.modal.type==='v7Action')&&RF.actionGame){
    if(typeof RF.closeActionGame==='function'&&['work','fishing','hunt','firemaking','cooking','production'].includes(RF.actionGame.type))RF.closeActionGame();
    else if(typeof RF.v7Resume==='function')RF.v7Resume();
    else {RF.actionGame=null;RF.UI.modal=null;RF.UI.render(s)}
    return true;
  }
  if(RF.UI.modal){RF.UI.modal=null;RF.UI.render(s);return true;}
  let active=document.activeElement;
  if(active?.tagName==='SELECT'){active.blur();v96ReleaseSelect();return true;}
  // Navigating away from a tab returns to World before leaving the app.
  if(s&&RF.UI.tab&&RF.UI.tab!=='world'){
    RF.UI.tab='world';RF.UI.render(s);return true;
  }
  return false;
};

window.addEventListener('popstate',()=>{
  if(RF.V96.suppressPop)return;
  const handled=RF.v96CloseTopInterface();
  // Always re-arm after consuming Back for an in-game interface. At the World root,
  // consume one back press as a safety catch rather than instantly terminating the PWA.
  if(handled){setTimeout(()=>history.pushState({rfRealmforgeGuard:true},'',location.href),0);return;}
  // Root safety catch: keep the app open. Android Home/Recents remain the normal exit routes.
  setTimeout(()=>history.pushState({rfRealmforgeGuard:true},'',location.href),0);
});

// Arm after the app scripts have finished their first render.
setTimeout(()=>RF.v96ArmBack(),50);

if(RF.state){
  RF.state.version='9.6.0';
  RF.log(RF.state,'V9.6: Back navigation and focus-paused interfaces are active.','important');
  RF.save(RF.state);
  RF.UI.render(RF.state);
}
