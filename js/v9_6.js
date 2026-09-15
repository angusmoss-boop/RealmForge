window.RF = window.RF || {};
RF.VERSION = '9.6.2';

/* Realmforge V9.6.2 — App Shell & Focus
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
// ---------- Android / installed-PWA Back behaviour ----------
/*
  V9.6.3 uses a fixed three-entry history ring instead of repeatedly pushing ad-hoc
  guard entries. Current entry is RF_TOP. Android Back traverses to RF_CATCH;
  popstate handles the in-game action, then history.forward() returns to RF_TOP.
  A second RF_BASE entry gives us another safety layer if the browser restores an
  incomplete history stack after a cold PWA launch.
*/
RF.VERSION='9.6.3';
RF.V96.historyReady=false;
RF.V96.historyRepairing=false;
RF.V96.exitConfirmed=false;
RF.V96.hasUserGesture=false;

RF.v963BuildHistory=function(force=false){
  if(RF.V96.exitConfirmed || RF.V96.historyRepairing)return;
  try{
    if(!force && history.state?.rfTop){RF.V96.historyReady=true;return;}
    RF.V96.historyRepairing=true;
    const baseUrl=location.pathname+location.search;
    history.replaceState({rfBase:true},'',baseUrl+'#realmforge');
    history.pushState({rfCatch:true},'',baseUrl+'#realmforge-catch');
    history.pushState({rfTop:true},'',baseUrl+'#realmforge-app');
    RF.V96.historyReady=true;
  }catch(e){
    console.warn('Realmforge back-stack setup failed',e);
  }finally{
    RF.V96.historyRepairing=false;
  }
};

RF.v96ShowExitConfirm=function(){
  RF.UI.modal={type:'exitV96'};
  RF.UI.render(RF.state);
};

RF.v96SaveBeforeExit=function(){
  try{
    if(RF.V95?.saveNow)RF.V95.saveNow();
    else if(RF.state)RF.save(RF.state);
  }catch(e){console.warn('Save before exit failed',e)}
};

RF.v96ExitApp=function(){
  RF.v96SaveBeforeExit();
  RF.UI.modal=null;
  RF.V96.exitConfirmed=true;
  try{
    history.go(-2);
  }catch(e){
    try{window.close()}catch(_){}
  }
};

RF.v96CloseTopInterface=function(){
  let s=RF.state;

  if(RF.UI.modal&&(RF.UI.modal.type==='v6Action'||RF.UI.modal.type==='v7Action')&&RF.actionGame){
    if(typeof RF.closeActionGame==='function'&&['work','fishing','hunt','firemaking','cooking','production'].includes(RF.actionGame.type))RF.closeActionGame();
    else if(typeof RF.v7Resume==='function')RF.v7Resume();
    else {RF.actionGame=null;RF.UI.modal=null;RF.UI.render(s)}
    return 'interface';
  }

  if(RF.UI.modal){
    RF.UI.modal=null;
    RF.UI.render(s);
    return 'interface';
  }

  let active=document.activeElement;
  if(active?.tagName==='SELECT'){
    active.blur();
    v96ReleaseSelect();
    return 'interface';
  }

  if(s&&RF.UI.tab!=='options'){
    RF.UI.tab='options';
    RF.UI.render(s);
    return 'options';
  }

  if(s&&RF.UI.tab==='options'){
    RF.v96ShowExitConfirm();
    return 'confirm';
  }

  return 'none';
};

const v963ModalBase=RF.UI.modalHtml.bind(RF.UI);
RF.UI.modalHtml=function(s){
  let m=this.modal;
  if(m?.type==='exitV96')return `<div class="modalBack"><div class="modal"><h2>Exit Realmforge?</h2><div class="sub">Your campaign will be saved before Realmforge closes.</div><div class="choices"><button class="choice dangerChoice" data-v96-exit><b>Exit Realmforge</b></button><button class="choice" data-v96-stay><b>Stay in Game</b></button></div></div></div>`;
  return v963ModalBase(s);
};

const v963BindBase=RF.UI.bind.bind(RF.UI);
RF.UI.bind=function(s){
  v963BindBase(s);
  document.querySelector('[data-v96-exit]')?.addEventListener('click',()=>RF.v96ExitApp());
  document.querySelector('[data-v96-stay]')?.addEventListener('click',()=>{
    RF.UI.modal=null;
    RF.UI.render(RF.state);
    RF.V96.exitConfirmed=false;
    setTimeout(()=>RF.v963BuildHistory(true),0);
  });
};

['pointerdown','keydown','touchstart'].forEach(type=>{
  window.addEventListener(type,()=>{
    RF.V96.hasUserGesture=true;
    if(!RF.V96.exitConfirmed)RF.v963BuildHistory(false);
  },{capture:true,once:false,passive:true});
});

window.addEventListener('popstate',(ev)=>{
  if(RF.V96.exitConfirmed)return;

  if(ev.state?.rfCatch){
    RF.v96CloseTopInterface();
    setTimeout(()=>{
      try{history.forward()}catch(_){RF.v963BuildHistory(true)}
    },0);
    return;
  }

  RF.v96CloseTopInterface();
  setTimeout(()=>RF.v963BuildHistory(true),0);
});

window.addEventListener('beforeunload',(e)=>{
  if(RF.V96.exitConfirmed || !RF.V96.hasUserGesture)return;
  RF.v96SaveBeforeExit();
  e.preventDefault();
  e.returnValue='';
});

function v963ResumeGuard(){
  if(RF.V96.exitConfirmed)return;
  setTimeout(()=>RF.v963BuildHistory(true),10);
}
window.addEventListener('pageshow',v963ResumeGuard);
window.addEventListener('focus',v963ResumeGuard);
document.addEventListener('visibilitychange',()=>{
  if(document.visibilityState==='visible')v963ResumeGuard();
});
window.addEventListener('resume',v963ResumeGuard);

RF.v963BuildHistory(true);
requestAnimationFrame(()=>RF.v963BuildHistory(true));
setTimeout(()=>RF.v963BuildHistory(true),80);
setTimeout(()=>RF.v963BuildHistory(true),400);

if(RF.state){
  RF.state.version='9.6.3';
  RF.log(RF.state,'V9.6.3: hardened Android Back stack and exit confirmation are active.','important');
  RF.save(RF.state);
  RF.UI.render(RF.state);
}
