window.RF=window.RF||{};
RF.VERSION='10.17.0';
RF.V1017=RF.V1017||{};

/* Realmforge V10.17 — Travel Overlay
   - Travel is presented in a dedicated non-pausing overlay rather than inline on World.
   - Road events/dialogue pause the journey above the overlay, then restore the prior speed.
   - Travel-started combat suspends the journey and restores it after victory / successful flee.
   - Defeat abandons a suspended journey because the player is carried to safety.
   - The overlay owns its own Pause / 1x / 2x controls and Turn Back action.
*/

(()=>{
  const old=document.getElementById('v1017-style');if(old)old.remove();
  const st=document.createElement('style');st.id='v1017-style';st.textContent=`
    .v1017TravelBack{
      position:fixed;z-index:48;inset:0;
      display:grid;place-items:center;
      padding:calc(16px + env(safe-area-inset-top)) 14px calc(20px + env(safe-area-inset-bottom));
      background:rgba(5,4,3,.74);backdrop-filter:blur(5px);
      touch-action:manipulation;
    }
    .v1017TravelModal{
      width:min(660px,100%);max-height:min(84dvh,760px);overflow:auto;
      box-sizing:border-box;padding:18px;
      border:1px solid rgba(200,157,82,.58);border-radius:22px;
      background:linear-gradient(180deg,rgba(42,30,18,.99),rgba(18,14,10,.995));
      box-shadow:0 28px 80px rgba(0,0,0,.68),inset 0 1px rgba(255,255,255,.04);
      overscroll-behavior:contain;-webkit-overflow-scrolling:touch;
    }
    .v1017TravelHead{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}
    .v1017TravelHead h2{margin:2px 0 2px;font-family:Georgia,serif;color:#f1d392;font-size:25px;line-height:1.1}
    .v1017TravelWeather{white-space:nowrap;border:1px solid rgba(210,172,99,.28);border-radius:999px;padding:5px 9px;color:#d9c7a5;font-size:12px;background:rgba(255,255,255,.035)}
    .v1017Route{margin:13px 0 10px;padding:10px 12px;border:1px solid rgba(210,172,99,.18);border-radius:14px;background:rgba(0,0,0,.16);font-size:13px;color:#cbb99a;line-height:1.4}
    .v1017Route b{color:#f2dfb5}
    .v1017Road{position:relative;height:54px;margin:8px 2px 8px;overflow:hidden}
    .v1017Road:before{content:'';position:absolute;left:0;right:0;top:31px;height:5px;border-radius:99px;background:linear-gradient(90deg,#403526,#7b6341,#403526);box-shadow:0 1px rgba(255,255,255,.06)}
    .v1017Road:after{content:'';position:absolute;left:0;right:0;top:23px;border-top:1px dashed rgba(239,210,147,.16)}
    .v1017Walker{position:absolute;top:5px;width:32px;height:38px;line-height:38px;text-align:center;font-size:27px;transform:translateX(-50%) scaleX(-1);transform-origin:center;transition:left .18s linear;filter:drop-shadow(0 3px 4px rgba(0,0,0,.6))}
    .v1017TravelBar{height:10px;border-radius:99px;overflow:hidden;background:#211b14;border:1px solid rgba(208,169,91,.18)}
    .v1017TravelBar>div{height:100%;background:linear-gradient(90deg,#9b7131,#efd084);transition:width .18s linear}
    .v1017TravelStats{display:flex;justify-content:space-between;gap:12px;margin-top:7px;color:#c9b896;font-size:12px}
    .v1017Ambient{margin:13px 0 10px;padding:11px 12px;border-left:3px solid rgba(214,170,82,.55);background:rgba(255,255,255,.025);border-radius:0 10px 10px 0;color:#c5b392;font-size:13px;line-height:1.45;font-style:italic}
    .v1017SpeedRow{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:12px 0}
    .v1017Speed{min-height:44px;border-radius:12px;border:1px solid rgba(192,151,78,.32);background:#21180f;color:#d9c6a3;font:inherit;font-weight:800}
    .v1017Speed.active{border-color:#d3a34a;color:#ffdb8b;background:linear-gradient(180deg,#493017,#291b10);box-shadow:inset 0 0 0 1px rgba(255,219,139,.08)}
    .v1017Speed:disabled{opacity:.42}
    .v1017BoostNote{text-align:center;font-size:11px;color:#a99779;margin:-4px 0 10px}
    .v1017TurnBack{width:100%;min-height:48px;border-radius:13px;border:1px solid rgba(202,153,81,.35);background:#2a1d12;color:#f0d7a6;font:inherit;font-weight:800}
    .v1017TravelHint{text-align:center;color:#998b73;font-size:11px;line-height:1.35;margin-top:10px}
    @media(max-width:420px){.v1017TravelModal{padding:15px}.v1017TravelHead h2{font-size:22px}.v1017Walker{font-size:25px}}
    @media(prefers-reduced-motion:reduce){.v1017Walker,.v1017TravelBar>div{transition:none!important}}
  `;document.head.appendChild(st);
})();

RF.V1017.ensure=function(s){
  if(!s)return null;
  s.v1017=s.v1017||{};
  return s.v1017;
};
RF.V1017.cloneActivity=function(a){
  if(!a)return null;
  try{return JSON.parse(JSON.stringify(a))}catch(_){return {...a}}
};
RF.V1017.captureRunningClock=function(s){
  // If an event popup already paused the world, its stored resume state is the truthful clock.
  const mr=RF.V96?.modalResume;
  if(mr)return {speed:mr.speed||1,paused:!!mr.paused,boostRemaining:Math.max(0,mr.boostRemaining||0)};
  if(typeof RF.v96CaptureClock==='function')return RF.v96CaptureClock(s);
  const speed=[0,1,2].includes(+s?.speed)?+s.speed:1;
  return {speed,paused:speed===0||!!s?.paused,boostRemaining:speed===2&&s?.v8?Math.max(0,(s.v8.boostUntil||0)-Date.now()):0};
};
RF.V1017.applyTravelClock=function(s,snap){
  if(!s||!snap)return;
  let speed=snap.paused?0:(snap.speed||1);if(![0,1,2].includes(speed))speed=1;
  // A normal popup owns the pause. Update what it will resume to without unpausing behind it.
  if(RF.UI.modal&&RF.V96){
    RF.V96.modalResume={speed,paused:speed===0,boostRemaining:snap.boostRemaining||0};
    RF.V96.modalPaused=true;RF.V96.modalWasOpen=true;
    s.speed=0;s.paused=true;return;
  }
  s.speed=speed;s.paused=speed===0;
  if(speed>0&&RF.V96)RF.V96.lastNonZeroSpeed=speed;
  if(s.v8){
    if(speed===2){const left=Math.max(1000,snap.boostRemaining||RF.V8?.boostMs||30000);s.v8.boostUntil=Date.now()+left;}
    else s.v8.boostUntil=0;
  }
};
RF.V1017.travelRecord=function(s){
  if(s?.activity?.type==='travel')return s.activity;
  if(s?.combat&&s?.v1017?.suspendedTravel?.activity)return s.v1017.suspendedTravel.activity;
  return null;
};
RF.V1017.ambient=function(s,a){
  const hour=Math.floor((s.minute||0)/60)%24,w=s.weather||'Clear',region=RF.DATA.locations?.[a?.from]?.region||RF.DATA.locations?.[s.location]?.region||'the road';
  if(w==='Storm')return 'Thunder rolls beyond the road. Every flash briefly redraws the landscape in hard silver.';
  if(w==='Rain')return 'Rain whispers against the road and beads along your travelling gear.';
  if(w==='Fog')return 'The road ahead dissolves into fog; landmarks arrive later than expected.';
  if(hour<5)return `The ${region} road is almost black at this hour, save for the occasional distant lantern.`;
  if(hour<8)return 'Dawn gathers slowly along the road while the world wakes around you.';
  if(hour>=20)return 'Evening settles across the road. Windows and campfires begin to glow in the distance.';
  return 'Boots, weather and road dust mark the steady rhythm of the journey.';
};
RF.V1017.overlayHtml=function(s){
  const a=RF.V1017.travelRecord(s);if(!a)return '';
  const from=RF.DATA.locations?.[a.from]||RF.DATA.locations?.[s.location],to=RF.DATA.locations?.[a.target];
  const duration=Math.max(.001,Number(a.duration)||1),progress=Math.max(0,Math.min(duration,Number(a.progress)||0)),pct=Math.max(0,Math.min(100,100*progress/duration));
  const remaining=Math.max(0,duration-progress),speed=+s.speed||0,realRemain=s.combat?remaining:(speed>0?remaining/speed:remaining);
  const boostCd=typeof RF.boostCooldownRemaining==='function'?RF.boostCooldownRemaining(s):0;
  const boost=typeof RF.boostRemaining==='function'?RF.boostRemaining(s):0;
  const paused=s.combat?'Interrupted by combat':RF.UI.modal?'Journey interrupted':speed===0?'Paused':`${speed}× travel`;
  const remLabel=s.combat||RF.UI.modal?`${Math.ceil(remaining)} sec of road left`:speed===0?`${Math.ceil(remaining)} sec remaining`:`≈ ${Math.ceil(realRemain)} sec remaining`;
  const twoLabel=boostCd?`${Math.ceil(boostCd/1000)}s`:'2×';
  return `<div class="v1017TravelBack" data-v1017-travel-overlay>
    <section class="v1017TravelModal" role="dialog" aria-label="Travelling to ${to?.name||'destination'}">
      <div class="v1017TravelHead"><div><span class="eyebrow">ON THE ROAD</span><h2>🛤️ Travelling to ${to?.name||'your destination'}</h2><div class="sub">${paused}</div></div><div class="v1017TravelWeather">${RF.UI.weatherIcon?.(s.weather)||'☀️'} ${s.weather}</div></div>
      <div class="v1017Route"><b>${from?.icon||'📍'} ${from?.name||'Origin'}</b> &nbsp;→&nbsp; <b>${to?.icon||'📍'} ${to?.name||'Destination'}</b><br>${RF.UI.fmtTime?.(s)||''}</div>
      <div class="v1017Road"><div class="v1017Walker" style="left:${Math.max(3,Math.min(97,pct))}%">🚶</div></div>
      <div class="v1017TravelBar"><div style="width:${pct}%"></div></div>
      <div class="v1017TravelStats"><span>${Math.round(pct)}% complete</span><span>${remLabel}</span></div>
      <div class="v1017Ambient">${RF.V1017.ambient(s,a)}</div>
      <div class="v1017SpeedRow">
        <button class="v1017Speed ${speed===0&&!s.combat&&!RF.UI.modal?'active':''}" data-v1017-speed="0" ${s.combat||RF.UI.modal?'disabled':''}>Ⅱ Pause</button>
        <button class="v1017Speed ${speed===1?'active':''}" data-v1017-speed="1" ${s.combat||RF.UI.modal?'disabled':''}>1×</button>
        <button class="v1017Speed ${speed===2?'active':''}" data-v1017-speed="2" ${s.combat||RF.UI.modal||boostCd?'disabled':''}>${twoLabel}</button>
      </div>
      ${speed===2&&boost?`<div class="v1017BoostNote">2× burst • ${Math.ceil(boost/1000)}s remaining</div>`:boostCd?`<div class="v1017BoostNote">2× recovering • ${Math.ceil(boostCd/1000)}s</div>`:''}
      <button class="v1017TurnBack" data-v1017-turnback ${s.combat||RF.UI.modal?'disabled':''}>Turn back</button>
      <div class="v1017TravelHint">Road events can interrupt the journey. Decisions and battles pause your route, then return you here at the same progress.</div>
    </section>
  </div>`;
};
RF.V1017.mountOverlay=function(s){
  const a=RF.V1017.travelRecord(s);if(!a||RF.V101?.mainMenu)return;
  const root=document.getElementById('app');if(!root)return;
  root.insertAdjacentHTML('beforeend',RF.V1017.overlayHtml(s));
  root.querySelectorAll('[data-v1017-speed]').forEach(b=>b.onclick=()=>RF.setSpeed(+b.dataset.v1017Speed));
  const turn=root.querySelector('[data-v1017-turnback]');if(turn)turn.onclick=()=>RF.cancelActivity();
};

// Travel is no longer drawn as an inline World card. Other activities keep their normal panels.
const v1017ActivityBase=RF.UI.activity.bind(RF.UI);
RF.UI.activity=function(s){if(s?.activity?.type==='travel')return '';return v1017ActivityBase(s)};

// Final render wrapper: base game renders first (including any event/combat overlay), then the
// Travel Overlay is inserted at z48 so ordinary popups/battles at z60 naturally sit above it.
const v1017RenderBase=RF.UI.render.bind(RF.UI);
RF.UI.render=function(s){
  const out=v1017RenderBase(s);
  if(s)RF.V1017.mountOverlay(s);
  return out;
};

// Road interruptions now rely on the normal popup pause/resume machinery. They do not manually
// zero the travel clock or require the player to restart it afterwards.
RF.maybeTravelInterrupt=function(){
  const s=RF.state,a=s?.activity;if(!a||a.type!=='travel'||!a.v8Prepared||a.v8Checked||RF.UI.modal||s.combat)return;
  if(a.progress<a.v8Checkpoint)return;
  a.v8Checked=true;if(Math.random()>a.v8EventChance)return;
  const ev=RF.chooseRoadEvent?.(s);if(!ev)return;
  s.v8=s.v8||{};s.v8.travelInterrupts=(s.v8.travelInterrupts||0)+1;s.stats.travelEvents=(s.stats.travelEvents||0)+1;s.v8.roadEventsSeen=s.v8.roadEventsSeen||{};s.v8.roadEventsSeen[ev.id]=(s.v8.roadEventsSeen[ev.id]||0)+1;
  const at=Math.round(100*Math.max(0,a.progress)/Math.max(1,a.duration));
  RF.UI.modal={type:'event',event:{...ev,choices:ev.choices.map(c=>({...c,result:ss=>{const text=c.result(ss);return `${text}\n\nThe road waits at ${at}% complete. Close this event to continue the journey.`;}}))}};
  RF.log(s,`Travel interrupted: ${ev.title}`,'important');RF.save(s);RF.UI.render(s);
};

// ---------- Combat during travel ----------
RF.V1017.suspendForCombat=function(s){
  if(!s?.activity||s.activity.type!=='travel')return false;
  const v=RF.V1017.ensure(s);v.suspendedTravel={activity:RF.V1017.cloneActivity(s.activity),clock:RF.V1017.captureRunningClock(s),at:Date.now()};
  return true;
};
RF.V1017.restoreAfterCombat=function(s){
  const v=RF.V1017.ensure(s),rec=v?.suspendedTravel;if(!rec?.activity||s.combat)return false;
  s.activity=RF.V1017.cloneActivity(rec.activity);v.suspendedTravel=null;
  RF.V1017.applyTravelClock(s,rec.clock||{speed:1,paused:false,boostRemaining:0});
  RF.V1016?.sanitiseTravel?.(s,{resume:false});
  RF.log?.(s,'You return to the road where the interruption began.','important');RF.save?.(s);return true;
};
RF.V1017.abandonSuspended=function(s){if(s?.v1017)s.v1017.suspendedTravel=null};

const v1017StartBattleBase=RF.startBattle;
RF.startBattle=function(id,opts={}){
  const s=RF.state;if(s?.activity?.type==='travel')RF.V1017.suspendForCombat(s);
  return v1017StartBattleBase.apply(RF,arguments);
};

const v1017WinBase=RF.winCombat;
RF.winCombat=function(){
  const had=!!RF.state?.v1017?.suspendedTravel;
  const out=v1017WinBase.apply(RF,arguments);const s=RF.state;
  if(had&&s&&!s.combat&&RF.V1017.restoreAfterCombat(s))RF.UI.render(s);
  return out;
};

const v1017FleeBase=RF.fleeV4;
RF.fleeV4=function(){
  const had=!!RF.state?.v1017?.suspendedTravel;
  const out=v1017FleeBase.apply(RF,arguments);const s=RF.state;
  if(had&&s&&!s.combat&&RF.V1017.restoreAfterCombat(s))RF.UI.render(s);
  return out;
};

const v1017LoseBase=RF.loseV4Battle;
RF.loseV4Battle=function(){
  const s0=RF.state;RF.V1017.abandonSuspended(s0);
  return v1017LoseBase.apply(RF,arguments);
};

// Emergency travel cancellation / developer teleport must also forget any suspended road state.
if(RF.V1016?.forceTeleport){
  const v1017TeleportBase=RF.V1016.forceTeleport.bind(RF.V1016);
  RF.V1016.forceTeleport=function(id){RF.V1017.abandonSuspended(RF.state);return v1017TeleportBase(id)};
}
const v1017CancelBase=RF.cancelActivity;
RF.cancelActivity=function(){
  const s=RF.state;if(s?.activity?.type==='travel')RF.V1017.abandonSuspended(s);
  return v1017CancelBase.apply(RF,arguments);
};

// Save migration metadata.
RF.V1017.migrate=function(s){if(!s)return s;RF.V1017.ensure(s);s.version='10.17.0';return s};
if(RF.V95){
  RF.V95.SCHEMA='10.17.0';
  const v1017MigrateBase=RF.V95.migrate.bind(RF.V95);
  RF.V95.migrate=function(s){return RF.V1017.migrate(v1017MigrateBase(s))};
}
if(RF.state){RF.V1017.migrate(RF.state);try{RF.save?.(RF.state)}catch(_){};RF.UI.render(RF.state)}
