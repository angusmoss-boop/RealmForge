window.RF=window.RF||{};
RF.VERSION='10.16.0';
RF.V1016=RF.V1016||{lastTickError:'',lastTickErrorAt:0};

/* Realmforge V10.16 — Travel Recovery
   - Harden the world tick so one subsystem error cannot kill the RAF loop.
   - Travel/activity progress advances independently of world-pulse/event errors.
   - Repair malformed/stalled saved travel state on campaign load.
   - Developer Teleport always cancels an active journey first.
   - Turn Back saves immediately and clears travel pause debris.
   - Invisible/unsupported stale modals can no longer freeze the world clock.
*/

RF.V1016.resetUIPause=function(s){
  if(!s)return;
  if(RF.V96){
    RF.V96.modalPaused=false;RF.V96.modalResume=null;RF.V96.selectPaused=false;RF.V96.selectResume=null;RF.V96.modalWasOpen=false;
  }
  if(s.v83)s.v83.manualPause=false;
};

RF.V1016.modalMarkup=function(s){
  if(!RF.UI?.modal)return '';
  try{return String(RF.UI.modalHtml?.(s)||'').trim()}catch(e){return '__ERROR__'}
};
RF.V1016.clearGhostModal=function(s){
  const m=RF.UI?.modal;if(!m)return false;
  // Active minigame shells without an action object are stale and must be discarded.
  if((m.type==='v6Action'||m.type==='v7Action')&&!RF.actionGame){
    RF.UI.modal=null;RF.V1016.resetUIPause(s);return true;
  }
  const html=RF.V1016.modalMarkup(s);
  if(html===''){
    RF.UI.modal=null;RF.V1016.resetUIPause(s);return true;
  }
  return false;
};

RF.V1016.sanitiseTravel=function(s,{resume=true}={}){
  if(!s?.activity||s.activity.type!=='travel')return false;
  const a=s.activity;
  let dirty=false;
  const dur=Number(a.duration),prog=Number(a.progress);
  if(!Number.isFinite(dur)||dur<=0){a.duration=1;dirty=true}else if(a.duration!==dur){a.duration=dur;dirty=true}
  if(!Number.isFinite(prog)||prog<0){a.progress=0;dirty=true}else if(a.progress!==prog){a.progress=prog;dirty=true}
  if(a.progress>a.duration){a.progress=a.duration;dirty=true}
  if(!a.from||!RF.DATA.locations?.[a.from]){a.from=s.location;dirty=true}
  if(!a.target||!RF.DATA.locations?.[a.target]){
    RF.log?.(s,'A corrupted journey was cancelled safely.','bad');
    s.activity=null;dirty=true;
  }
  if(resume&&s.activity?.type==='travel'){
    // Campaign loading is an explicit resume action. Do not preserve an accidental UI pause.
    if(![1,2].includes(+s.speed)){s.speed=1;dirty=true}
    if(s.paused){s.paused=false;dirty=true}
    if(s.v83?.manualPause){s.v83.manualPause=false;dirty=true}
    RF.V1016.resetUIPause(s);
  }
  return dirty;
};

RF.V1016.repairCampaign=function(s){
  if(!s)return s;
  s.version='10.16.0';
  RF.V1016.clearGhostModal(s);
  if(RF.V1016.sanitiseTravel(s,{resume:true})){
    try{RF.save?.(s)}catch(_){}
  }
  return s;
};

// Ensure multi-slot loads and migrations repair an already-stuck journey immediately.
if(RF.V95){
  RF.V95.SCHEMA='10.16.0';
  const v1016MigBase=RF.V95.migrate.bind(RF.V95);
  RF.V95.migrate=function(s){return RF.V1016.repairCampaign(v1016MigBase(s))};
  const v1016LoadSlotBase=RF.V95.loadSlot.bind(RF.V95);
  RF.V95.loadSlot=function(id){
    const ok=v1016LoadSlotBase(id);
    if(ok&&RF.state){
      RF.V1016.repairCampaign(RF.state);
      RF.state.speed=1;RF.state.paused=false;
      RF.V1016.resetUIPause(RF.state);
      RF.save?.(RF.state);RF.UI.render(RF.state);
    }
    return ok;
  };
}

RF.V1016.reportTickError=function(err,where='world tick'){
  const msg=`${where}: ${err?.message||err||'unknown error'}`;
  const now=Date.now();
  if(msg!==RF.V1016.lastTickError||now-RF.V1016.lastTickErrorAt>10000){
    RF.V1016.lastTickError=msg;RF.V1016.lastTickErrorAt=now;
    console.warn('[Realmforge travel recovery]',msg,err);
    const s=RF.state;
    if(s){
      // Keep this to one compact log entry rather than spamming every animation frame.
      RF.log?.(s,'The world simulation stumbled, but Realmforge recovered without stopping your journey.','bad');
      try{RF.save?.(s)}catch(_){}
    }
  }
};

// Hardened master ticker. Crucially, requestAnimationFrame is scheduled in finally,
// so an exception in world events/NPC pulses can never permanently kill time/travel.
RF.tick=function(now){
  try{
    const s=RF.state;
    if(!s){RF.lastTick=now;return}
    let dt=(now-(RF.lastTick||now))/1000;
    if(!Number.isFinite(dt)||dt<0)dt=0;
    dt=Math.min(.25,dt);RF.lastTick=now;

    RF.V1016.clearGhostModal(s);
    const blocked=!!RF.UI.modal;
    if(s.speed>0&&!blocked){
      const gameSec=dt*s.speed;

      // Advance active timers FIRST. If a later simulation hook throws, the road still moves.
      if(s.activity){
        const a=s.activity;
        let p=Number(a.progress),d=Number(a.duration);
        if(!Number.isFinite(p)||p<0)p=0;
        if(!Number.isFinite(d)||d<=0)d=1;
        a.progress=Math.min(d,p+gameSec);a.duration=d;
      }

      // World clock, NPC pulses, road-event checks etc. are allowed to fail safely.
      try{
        RF.advanceWorld(gameSec*(RF.V102?.worldMinutesPerSecond??.32));
      }catch(err){RF.V1016.reportTickError(err,'world simulation')}

      // A road event may have opened a modal during advanceWorld. Resolve completion only
      // when the player is not currently answering that interruption.
      if(s.activity&&s.activity.progress>=s.activity.duration&&!RF.UI.modal){
        const a=s.activity;
        try{
          if(a.type==='travel')RF.finishTravel(a);
          else if(a.type==='craft')RF.finishCraft(a);
          else RF.finishActivity(a);
        }catch(err){
          RF.V1016.reportTickError(err,`${a.type||'activity'} completion`);
          // Never leave a completed activity blocking the campaign forever.
          if(RF.state?.activity===a)RF.state.activity=null;
        }
      }

      RF.autoSave=(RF.autoSave||0)+dt;RF.renderAcc=(RF.renderAcc||0)+dt;
      if(RF.autoSave>8){try{RF.save(s)}catch(err){console.warn(err)}RF.autoSave=0}
      if(RF.renderAcc>.18){try{RF.UI.render(s)}catch(err){RF.V1016.reportTickError(err,'UI render')}RF.renderAcc=0}
    }
  }catch(err){RF.V1016.reportTickError(err,'master tick')}
  finally{requestAnimationFrame(RF.tick)}
};

// Turn Back must actually persist, and it also clears stale pause state.
const v1016CancelBase=RF.cancelActivity;
RF.cancelActivity=function(){
  const s=RF.state,a=s?.activity;
  if(a?.type!=='travel')return v1016CancelBase?.apply(RF,arguments);
  s.activity=null;
  if(a.from&&RF.DATA.locations?.[a.from])s.location=a.from;
  s.speed=1;s.paused=false;RF.V1016.resetUIPause(s);
  RF.log?.(s,`You turn back${a.from&&RF.DATA.locations[a.from]?` to ${RF.DATA.locations[a.from].name}`:''}.`);
  RF.save?.(s);RF.UI.render(s);
};

RF.V1016.forceTeleport=function(id){
  const s=RF.state;if(!s||!RF.DATA.locations?.[id])return false;
  try{RF.clearActionTimer?.()}catch(_){}
  RF.actionGame=null;s.activity=null;s.combat=null;RF.UI.modal=null;
  RF.V1016.resetUIPause(s);
  s.location=id;s.visited=s.visited||{};s.visited[id]=true;s.speed=1;s.paused=false;
  RF.log?.(s,`DEV emergency teleport: ${RF.DATA.locations[id].name}.`,'important');
  RF.save?.(s);RF.UI.render(s);return true;
};

// Developer escape hatch: override the old teleport binder after all earlier handlers run.
const v1016BindBase=RF.UI.bind.bind(RF.UI);
RF.UI.bind=function(s){
  v1016BindBase(s);
  const tp=document.querySelector('[data-dev="teleport"]');
  if(tp)tp.onclick=()=>{
    const id=document.querySelector('[data-dev-location]')?.value;
    if(id)RF.V1016.forceTeleport(id);
  };
  document.querySelector('[data-v1016-recover-travel]')?.addEventListener('click',()=>{
    const ss=RF.state;if(!ss)return;
    if(ss.activity?.type==='travel')RF.cancelActivity();
    else {RF.V1016.resetUIPause(ss);ss.speed=1;ss.paused=false;RF.save?.(ss);RF.UI.render(ss)}
  });
};

// Add a visible rescue button to Developer utilities.
const v1016DevBase=RF.UI.dev?.bind(RF.UI);
if(v1016DevBase)RF.UI.dev=function(s){
  let h=v1016DevBase(s);
  const btn=`<button data-v1016-recover-travel>${s.activity?.type==='travel'?'Cancel / Recover Current Journey':'Reset Travel / Clock State'}</button>`;
  if(h.includes('Utilities</h3><div class="devGrid">'))h=h.replace('Utilities</h3><div class="devGrid">',`Utilities</h3><div class="devGrid">${btn}`);
  else h=h.replace('</section>',`<h3>Travel Recovery</h3><div class="devGrid">${btn}</div></section>`);
  return h;
};

// Lightweight watchdog for impossible pause debris. It does not advance travel itself;
// the hardened ticker remains the single source of progress.
RF.V1016.watchdog=setInterval(()=>{
  const s=RF.state;if(!s||RF.V101?.mainMenu)return;
  let dirty=RF.V1016.clearGhostModal(s);
  if(s.activity?.type==='travel'){
    dirty=RF.V1016.sanitiseTravel(s,{resume:false})||dirty;
    if(s.speed===0&&!s.paused&&!RF.UI.modal&&!s.combat&&!RF.actionGame){s.speed=1;dirty=true}
  }
  if(dirty){try{RF.save?.(s)}catch(_){};try{RF.UI.render(s)}catch(_){}}
},1000);

if(RF.state){RF.V1016.repairCampaign(RF.state);try{RF.save?.(RF.state)}catch(_){}}
