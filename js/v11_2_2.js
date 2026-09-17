window.RF=window.RF||{};
RF.VERSION='11.2.2';
RF.BUILD={
  version:'11.2.2',
  title:'Clock Sentinel',
  built:'17 Sep 2026 • 21:20 BST',
  buildId:'20260917-2120-bst'
};
RF.V1122=RF.V1122||{};

/* Realmforge V11.2.2 — Clock Sentinel
   - Replaces the single-point-of-failure world RAF loop with a guarded scheduler.
   - Adds an independent visible-page watchdog that takes over if RAF progression stalls.
   - Repairs stale travel/popup pause debris without overriding a deliberate manual Pause.
   - Repairs already-stuck journeys on load and keeps progress/completion lossless.
   - Keeps over-encumbrance, combat, action games and genuine modal pauses authoritative.
*/

(()=>{
'use strict';
const V=RF.V1122;
V.version='11.2.2';
V.rafId=0;
V.lastFrameStamp=0;
V.lastRafWall=Date.now();
V.lastProgressWall=Date.now();
V.lastFallbackWall=0;
V.fallbackActive=false;
V.recoveryNoticeAt=0;
V.WATCH_MS=500;
V.STALL_MS=1600;

V.nowPerf=()=>typeof performance!=='undefined'&&performance.now?performance.now():Date.now();
V.visible=()=>typeof document==='undefined'||document.visibilityState!=='hidden';
V.over=s=>!!RF.isOverEncumbered?.(s);
V.selectOpen=()=>typeof document!=='undefined'&&document.activeElement?.tagName==='SELECT';

V.trueBlocker=function(s){
  if(!s)return 'no-state';
  if(V.over(s))return 'over-encumbered';
  if(RF.UI?.modal)return 'modal';
  if(s.combat)return 'combat';
  if(RF.actionGame)return 'action';
  if((+s.speed||0)<=0)return 'paused';
  return '';
};
V.shouldRun=s=>V.visible()&&!V.trueBlocker(s);

V.markProgress=function(){V.lastProgressWall=Date.now()};
V.noteRecovery=function(s,reason){
  if(!s)return;
  s.v1122=s.v1122||{};
  s.v1122.recoveries=(s.v1122.recoveries||0)+1;
  s.v1122.lastRecovery=Date.now();
  const now=Date.now();
  if(now-V.recoveryNoticeAt>10000){
    V.recoveryNoticeAt=now;
    RF.log?.(s,`Clock Sentinel recovered a stalled ${reason||'world clock'} without losing progress.`,'good');
  }
};

V.resetPauseDebris=function(s){
  if(!s)return false;
  let dirty=false;
  try{if(RF.V1016?.clearGhostModal?.(s))dirty=true}catch(_){ }

  // V9.6 stores temporary pause snapshots for actual popups/selects. If no such interface exists,
  // these flags are stale and must never be allowed to survive as a hidden time lock.
  if(!RF.UI?.modal&&!V.selectOpen()&&RF.V96){
    if(RF.V96.modalPaused||RF.V96.modalResume||RF.V96.selectPaused||RF.V96.selectResume||RF.V96.modalWasOpen){
      RF.V96.modalPaused=false;RF.V96.modalResume=null;
      RF.V96.selectPaused=false;RF.V96.selectResume=null;
      RF.V96.modalWasOpen=false;dirty=true;
    }
  }

  if(s.activity?.type==='travel'){
    try{if(RF.V1016?.sanitiseTravel?.(s,{resume:false}))dirty=true}catch(_){ }
    s.v83=s.v83||{};
    // A positive speed is an explicit running state. `paused=true` beside it is contradictory.
    if((+s.speed||0)>0){
      if(s.paused){s.paused=false;dirty=true}
      if(s.v83.manualPause){s.v83.manualPause=false;dirty=true}
    }
    // Conversely, an old accidental zero-speed journey with no deliberate Pause should resume.
    if((+s.speed||0)===0&&!s.v83.manualPause&&!RF.UI?.modal&&!s.combat&&!RF.actionGame&&!V.over(s)){
      s.speed=1;s.paused=false;dirty=true;
    }
  }
  return dirty;
};

V.finishReadyActivity=function(s){
  const a=s?.activity;if(!a)return false;
  const p=Number(a.progress)||0,d=Math.max(.001,Number(a.duration)||1);
  if(p+1e-6<d||RF.UI?.modal)return false;
  try{
    if(a.type==='travel')RF.finishTravel(a);
    else if(a.type==='craft')RF.finishCraft(a);
    else RF.finishActivity(a);
  }catch(err){
    RF.V1016?.reportTickError?.(err,`${a.type||'activity'} completion`);
    if(RF.state?.activity===a)RF.state.activity=null;
  }
  return true;
};

V.step=function(s,dt,{fallback=false}={}){
  if(!s||!Number.isFinite(dt)||dt<=0)return false;
  if(!V.shouldRun(s))return false;
  dt=Math.max(.001,Math.min(fallback?1.0:.25,dt));
  const speed=Math.max(0,+s.speed||0);if(speed<=0)return false;
  const gameSec=dt*speed;
  const beforeMinute=Number(s.minute)||0;
  const beforeProgress=Number(s.activity?.progress)||0;

  // Activity timers first, exactly as the hardened V10.16 clock intended.
  if(s.activity){
    const a=s.activity;
    let p=Number(a.progress),d=Number(a.duration);
    if(!Number.isFinite(p)||p<0)p=0;
    if(!Number.isFinite(d)||d<=0)d=1;
    a.duration=d;a.progress=Math.min(d,p+gameSec);
  }

  try{RF.advanceWorld(gameSec*(RF.V102?.worldMinutesPerSecond??.32))}
  catch(err){RF.V1016?.reportTickError?.(err,'world simulation')}

  V.finishReadyActivity(s);

  const afterMinute=Number(s.minute)||0;
  const afterProgress=Number(s.activity?.progress)||0;
  if(afterMinute!==beforeMinute||afterProgress!==beforeProgress)V.markProgress();

  RF.autoSave=(RF.autoSave||0)+dt;
  RF.renderAcc=(RF.renderAcc||0)+dt;
  if(RF.autoSave>8){try{RF.save?.(s)}catch(err){console.warn(err)}RF.autoSave=0}
  if(fallback||RF.renderAcc>.18){
    try{RF.UI.render(s)}catch(err){RF.V1016?.reportTickError?.(err,'UI render')}
    RF.renderAcc=0;
  }
  return true;
};

V.schedule=function(){
  if(!V.visible()||V.rafId)return;
  V.rafId=requestAnimationFrame(ts=>{V.rafId=0;RF.tick(ts)});
};

// One guarded master tick. Any older already-queued callback hands off to this function on its
// next schedule. Near-simultaneous duplicate callbacks collapse back to one managed RAF chain.
RF.tick=function(now){
  now=Number.isFinite(now)?now:V.nowPerf();
  const wall=Date.now();
  V.lastRafWall=wall;
  if(V.lastFrameStamp&&Math.abs(now-V.lastFrameStamp)<5){V.schedule();return}
  V.lastFrameStamp=now;
  try{
    const s=RF.state;
    if(!s){RF.lastTick=now;return}
    V.resetPauseDebris(s);
    let prev=Number(RF.lastTick);if(!Number.isFinite(prev)||prev<=0)prev=now;
    let dt=(now-prev)/1000;if(!Number.isFinite(dt)||dt<0)dt=0;
    RF.lastTick=now;
    V.step(s,dt);
  }catch(err){RF.V1016?.reportTickError?.(err,'Clock Sentinel RAF')}
  finally{V.schedule()}
};

V.recoverIfStalled=function(){
  const s=RF.state;if(!s||!V.visible())return false;
  const dirty=V.resetPauseDebris(s);
  if(dirty){try{RF.save?.(s)}catch(_){}}
  if(!V.shouldRun(s)){V.fallbackActive=false;V.lastFallbackWall=0;return dirty}

  const now=Date.now();
  const rafStalled=now-V.lastRafWall>V.STALL_MS;
  const progressStalled=now-V.lastProgressWall>V.STALL_MS;
  if(!rafStalled&&!progressStalled){V.fallbackActive=false;V.lastFallbackWall=0;return dirty}

  // A running clock that has not changed for >1.6s is impossible in normal play. Switch to a
  // temporary interval-backed pulse, preserve the exact journey/activity, then try to re-arm RAF.
  if(!V.fallbackActive){
    V.fallbackActive=true;V.lastFallbackWall=now;
    V.noteRecovery(s,s.activity?.type==='travel'?'journey':'world clock');
  }
  const elapsed=V.lastFallbackWall?Math.max(.12,Math.min(1,(now-V.lastFallbackWall)/1000)):.25;
  V.lastFallbackWall=now;
  try{V.step(s,elapsed,{fallback:true})}catch(err){RF.V1016?.reportTickError?.(err,'Clock Sentinel fallback')}
  V.schedule();
  try{RF.save?.(s)}catch(_){ }
  return true;
};

V.repairOnResume=function(){
  const s=RF.state;if(!s)return;
  const dirty=V.resetPauseDebris(s);
  RF.lastTick=V.nowPerf();
  V.lastRafWall=Date.now();V.lastProgressWall=Date.now();V.lastFallbackWall=0;V.fallbackActive=false;
  if(dirty)try{RF.save?.(s)}catch(_){ }
  V.finishReadyActivity(s);
  try{RF.UI.render(s)}catch(_){ }
  V.schedule();
};

V.migrate=function(s){
  if(!s)return s;
  s.v1122=s.v1122||{};
  // Never alter valid Pack/Bank/Equipment/Tool Belt contents here. This repair is clock-only.
  V.resetPauseDebris(s);
  if(s.activity?.type==='travel'){
    try{RF.V1016?.sanitiseTravel?.(s,{resume:false})}catch(_){ }
    if((+s.speed||0)>0)s.paused=false;
    if((+s.speed||0)===0&&!s.v83?.manualPause&&!V.over(s)&&!RF.UI?.modal&&!s.combat&&!RF.actionGame){s.speed=1;s.paused=false}
  }
  s.version='11.2.2';
  return s;
};
const oldNew=RF.newGame;RF.newGame=function(...a){return V.migrate(oldNew(...a))};
const oldLoad=RF.load;RF.load=function(){return V.migrate(oldLoad())};
const oldImport=RF.importSave;RF.importSave=function(x){return V.migrate(oldImport(x))};
if(RF.V95){
  RF.V95.SCHEMA='11.2.2';
  const om=RF.V95.migrate.bind(RF.V95);RF.V95.migrate=s=>V.migrate(om(s));
  if(RF.V95.loadSlot){
    const loadBase=RF.V95.loadSlot.bind(RF.V95);
    RF.V95.loadSlot=function(id){const ok=loadBase(id);if(ok&&RF.state){V.migrate(RF.state);V.repairOnResume();RF.save?.(RF.state)}return ok};
  }
}

// Independent watchdog: unlike the visual RAF loop, this can detect a dead RAF chain and take
// over long enough to recover it. It only runs while the app is visible and time should run.
if(V.watchdog)clearInterval(V.watchdog);
V.watchdog=setInterval(()=>V.recoverIfStalled(),V.WATCH_MS);

['visibilitychange','pageshow','focus'].forEach(name=>window.addEventListener(name,()=>{
  if(name==='visibilitychange'&&!V.visible())return;
  V.repairOnResume();
},{passive:true}));

if(RF.state){
  V.migrate(RF.state);
  RF.lastTick=V.nowPerf();
  RF.save?.(RF.state);
  setTimeout(()=>{V.repairOnResume()},0);
}
})();
