/* Realmforge V11.12.0 — Canonical Travel & World Routing.
   Owns mature routing, journey, overlay and clock-recovery behaviour formerly housed in
   the historical compatibility runtime. Historical installers run at their original boundaries. */
(() => {
  'use strict';
  const RF=window.RF;
  const installed=new Set();
  function once(key,fn){if(installed.has(key))return;installed.add(key);return fn();}
  function installHistoricalV9Routing(){return once('v9-routing',()=>{
    // ---------- World map / routing ----------
    RF.v9LocationUnlocked=function(s,id){let l=RF.DATA.locations[id];if(!l)return false;if(l.lockedFlag&&!s.flags[l.lockedFlag])return false;if(l.lockedSkill){let [sk,lv]=Object.entries(l.lockedSkill)[0];if((s.skills[sk]?.level||1)<lv)return false}return true};
    RF.v9Route=function(s,start,dest,allowLocked=false){if(start===dest)return {path:[start],minutes:0};let q=[[start,[start],0]],seen=new Set([start]);while(q.length){let [cur,path,min]=q.shift(),l=RF.DATA.locations[cur];for(let [n,cost] of Object.entries(l?.neighbors||{})){if(seen.has(n))continue;if(!allowLocked&&!RF.v9LocationUnlocked(s,n))continue;let np=[...path,n],nm=min+cost;if(n===dest)return {path:np,minutes:nm};seen.add(n);q.push([n,np,nm])}}return null};
    RF.v9LockText=function(s,id){let l=RF.DATA.locations[id];if(!l)return'';if(l.lockedFlag&&!s.flags[l.lockedFlag])return `Requires world progress: ${l.lockedFlag.replace(/_/g,' ')}`;if(l.lockedSkill){let [sk,lv]=Object.entries(l.lockedSkill)[0];if((s.skills[sk]?.level||1)<lv)return `Requires ${RF.DATA.skills[sk]?.name||sk} Lv ${lv}`}return''};
    RF.UI.worldMap=function(s){let groups={};Object.entries(RF.DATA.locations).forEach(([id,l])=>(groups[l.region||'Other']=groups[l.region||'Other']||[]).push([id,l]));let chosen=s.v9?.mapDest,route=chosen?RF.v9Route(s,s.location,chosen,false):null,lockedRoute=chosen&&!route?RF.v9Route(s,s.location,chosen,true):null;let routeCard='';if(chosen){let d=RF.DATA.locations[chosen],lock=RF.v9LockText(s,chosen);routeCard=`<section class="card routePlanner"><span class="eyebrow">ROUTE PLANNER</span><h2>${d.icon} ${d.name}</h2>${route?`<div class="routeChain">${route.path.map((id,i)=>`<span class="routeStop ${id===s.location?'here':''}">${RF.DATA.locations[id].icon} ${RF.DATA.locations[id].name}</span>${i<route.path.length-1?'<b>›</b>':''}`).join('')}</div><div class="sub">Estimated road time: ${route.minutes} game min${route.path.length>1?` • Next stop: <b>${RF.DATA.locations[route.path[1]].name}</b>`:''}</div>${route.path.length>1?`<button class="action primary" data-travel="${route.path[1]}" style="width:100%;margin-top:10px"><b>Travel next leg → ${RF.DATA.locations[route.path[1]].name}</b><small>${RF.DATA.locations[s.location].neighbors[route.path[1]]} min</small></button>`:'<div class="notice good">You are already here.</div>'}`:`<div class="notice">No currently usable route.${lock?` ${lock}.`:''}${lockedRoute?` Potential route: ${lockedRoute.path.map(id=>RF.DATA.locations[id].name).join(' → ')}.`:''}</div>`}</section>`}let cards=Object.entries(groups).map(([region,arr])=>`<section class="card"><div class="questTitle"><h3>${region}</h3><span class="tag">${arr.length} PLACES</span></div><div class="mapList">${arr.map(([id,l])=>{let unlocked=RF.v9LocationUnlocked(s,id),visited=!!s.visited[id],r=unlocked?RF.v9Route(s,s.location,id,false):null,req=RF.v9LockText(s,id);return `<button class="mapPlace ${id===s.location?'here':''} ${!unlocked?'locked':''}" data-map-dest="${id}"><span class="mapPlaceIcon">${l.icon}</span><span><b>${l.name}</b><small>${id===s.location?'YOU ARE HERE':!unlocked?`🔒 ${req||'Undiscovered route'}`:r?`${r.minutes} min • ${Math.max(0,r.path.length-1)} road leg${r.path.length-1===1?'':'s'}`:visited?'No known route from here':'Route not yet known'}</small></span><span class="chev">›</span></button>`}).join('')}</div></section>`).join('');return `<section class="card mapIntro"><h2>🗺️ World Map</h2><div class="sub">Choose any location to plan a route. Realmforge shows every road junction you must pass through rather than pretending distant locations are adjacent.</div></section>${routeCard}${cards}`};
    const v9NavBase=RF.UI.nav.bind(RF.UI);RF.UI.nav=function(){let n=[['world','🌍','WORLD'],['map','🗺️','MAP'],['character','🧍','CHAR'],['skills','📊','SKILLS'],['inventory','🎒','PACK'],['quests','📜','QUESTS'],['shop','🪙','SHOP']];return `<nav class="bottomnav"><div class="bottomInner v9nav">${n.map(x=>`<button class="navbtn ${this.tab===x[0]?'active':''}" data-tab="${x[0]}"><span>${x[1]}</span>${x[2]}</button>`).join('')}</div></nav>`};
    const v9PageBase=RF.UI.page.bind(RF.UI);RF.UI.page=function(s){if(this.tab==='map')return this.worldMap(s);return v9PageBase(s)};
  });}
  function installHistoricalV1016(){return once('js/v10_16.js',()=>{
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
    /* V11.8: legacy save/migration wrapper extracted to canonical core. */

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
  });}
  function installHistoricalV1017(){return once('js/v10_17.js',()=>{
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
    /* V11.8: legacy save/migration wrapper extracted to canonical core. */
    if(RF.state){RF.V1017.migrate(RF.state);try{RF.save?.(RF.state)}catch(_){};RF.UI.render(RF.state)}
  });}
  function installHistoricalV1020(){return once('js/v10_20.js',()=>{
    window.RF = window.RF || {};
    RF.VERSION='10.20.0';

    /* Realmforge V10.20 — Waypoint Journeys
       - World Map locations open a route-confirmation popup.
       - Direct routes can be started from the popup or left alone.
       - Multi-leg routes show every waypoint before departure.
       - A planned journey persists across individual travel legs.
       - At each intermediate stop, the player chooses Continue Journey or Stop Here.
       - Existing Travel Overlay, road events and combat interruptions continue to operate per leg.
    */

    RF.V1020=RF.V1020||{launchingRouteLeg:false};
    RF.V1020.ensure=function(s){
      if(!s)return null;
      s.v1020=s.v1020||{};
      if(!('routePlan' in s.v1020))s.v1020.routePlan=null;
      return s.v1020;
    };
    RF.V1020.loc=function(id){return RF.DATA.locations?.[id]||null};
    RF.V1020.route=function(s,dest,allowLocked=false){
      if(!s||!dest||typeof RF.v9Route!=='function')return null;
      try{return RF.v9Route(s,s.location,dest,allowLocked)}catch(_){return null}
    };
    RF.V1020.legMinutes=function(from,to){return Number(RF.DATA.locations?.[from]?.neighbors?.[to])||0};
    RF.V1020.routeNames=function(path){return (path||[]).map(id=>RF.V1020.loc(id)?.name||id)};
    RF.V1020.chainHtml=function(path,current){
      return `<div class="v1020RouteChain">${(path||[]).map((id,i)=>{
        const l=RF.V1020.loc(id);return `<span class="v1020Stop ${id===current?'here':''}">${l?.icon||'📍'} ${l?.name||id}</span>${i<(path.length-1)?'<b>›</b>':''}`;
      }).join('')}</div>`;
    };
    RF.V1020.clearPlan=function(s,reason=''){
      const v=RF.V1020.ensure(s);if(!v)return;
      if(v.routePlan&&reason)RF.log?.(s,reason);
      v.routePlan=null;
    };

    // ---------- World Map: tap a destination, inspect the route, then deliberately begin ----------
    RF.V1020.openRoutePreview=function(dest){
      const s=RF.state,d=RF.V1020.loc(dest);if(!s||!d)return;
      RF.V1020.ensure(s);
      s.v9=s.v9||{};s.v9.mapDest=null; // V9's old inline route card is superseded by the popup.
      RF.UI.modal={type:'v1020RoutePreview',destination:dest};
      RF.UI.render(s);
    };

    RF.V1020.beginRoute=function(dest){
      const s=RF.state;if(!s)return;
      const route=RF.V1020.route(s,dest,false);
      if(!route||!route.path||route.path.length<2){
        RF.UI.modal={type:'message',title:'Route unavailable',text:'There is no currently usable road route to that destination.'};RF.UI.render(s);return;
      }
      const v=RF.V1020.ensure(s);
      v.routePlan={
        destination:dest,
        path:[...route.path],
        currentIndex:0,
        pending:false,
        startedDay:s.day,
        startedMinute:s.minute,
        startedAt:Date.now()
      };
      const next=route.path[1];
      RF.UI.modal=null;
      RF.V1020.launchingRouteLeg=true;
      try{RF.travel(next)}finally{RF.V1020.launchingRouteLeg=false}
      if(s.activity?.type==='travel'){
        s.activity.v1020Planned=true;s.activity.v1020Destination=dest;
        RF.save?.(s);
      }else{
        RF.V1020.clearPlan(s);
        RF.UI.modal={type:'message',title:'Could not depart',text:'The journey could not be started. Check that the next road is still available.'};RF.UI.render(s);
      }
    };

    RF.V1020.remainingRoute=function(s){
      const p=RF.V1020.ensure(s)?.routePlan;if(!p?.destination)return null;
      return RF.V1020.route(s,p.destination,false);
    };
    RF.V1020.openContinue=function(s){
      const p=RF.V1020.ensure(s)?.routePlan;if(!p?.pending||RF.UI.modal||s.combat||s.activity)return false;
      if(s.location===p.destination){RF.V1020.clearPlan(s);return false}
      RF.UI.modal={type:'v1020RouteContinue',destination:p.destination};
      return true;
    };
    RF.V1020.continueRoute=function(){
      const s=RF.state,p=RF.V1020.ensure(s)?.routePlan;if(!s||!p)return;
      const route=RF.V1020.remainingRoute(s);
      if(!route||route.path.length<2){
        p.pending=false;RF.UI.modal={type:'message',title:'Journey interrupted',text:'The onward route is no longer available from here. Your planned journey has been stopped.'};RF.V1020.clearPlan(s);RF.save?.(s);RF.UI.render(s);return;
      }
      p.path=[...route.path];p.currentIndex=0;p.pending=false;
      const next=route.path[1];RF.UI.modal=null;
      RF.V1020.launchingRouteLeg=true;
      try{RF.travel(next)}finally{RF.V1020.launchingRouteLeg=false}
      if(s.activity?.type==='travel'){
        s.activity.v1020Planned=true;s.activity.v1020Destination=p.destination;RF.save?.(s);
      }else{
        RF.V1020.clearPlan(s);RF.UI.modal={type:'message',title:'Could not continue',text:'The next road could not be started.'};RF.UI.render(s);
      }
    };
    RF.V1020.stopRoute=function(){
      const s=RF.state;if(!s)return;const p=RF.V1020.ensure(s)?.routePlan;
      const dest=p?.destination?RF.V1020.loc(p.destination)?.name:null;
      RF.V1020.clearPlan(s,dest?`You stop the planned journey to ${dest} here.`:'');
      RF.UI.modal=null;RF.save?.(s);RF.UI.render(s);
    };

    // ---------- Map presentation ----------
    const v1020WorldMapBase=RF.UI.worldMap?.bind(RF.UI);
    if(v1020WorldMapBase)RF.UI.worldMap=function(s){
      if(s?.v9)s.v9.mapDest=null;
      let h=v1020WorldMapBase(s);
      h=h.replace('Choose any location to plan a route. Realmforge shows every road junction you must pass through rather than pretending distant locations are adjacent.',
        'Tap a location to inspect the route. Multi-leg journeys show every waypoint before you set out.');
      return h;
    };

    // ---------- Modal UI ----------
    const v1020ModalBase=RF.UI.modalHtml.bind(RF.UI);
    RF.UI.modalHtml=function(s){
      const m=this.modal;
      if(m?.type==='v1020RoutePreview'){
        const dest=m.destination,d=RF.V1020.loc(dest),unlocked=RF.v9LocationUnlocked?RF.v9LocationUnlocked(s,dest):true;
        const route=unlocked?RF.V1020.route(s,dest,false):null;
        const potential=!route?RF.V1020.route(s,dest,true):null;
        const lock=RF.v9LockText?.(s,dest)||'';
        if(dest===s.location)return `<div class="modalBack"><div class="modal v1020RouteModal"><div class="itemHero">${d?.icon||'📍'}</div><span class="eyebrow">WORLD MAP</span><h2>${d?.name||'Location'}</h2><div class="itemDesc">${d?.desc||''}</div><div class="notice good">You are already here.</div><div class="choices"><button class="choice" data-v1020-route-leave><b>Close</b></button></div></div></div>`;
        if(!route){
          const potentialText=potential?.path?.length>1?`<div class="v1020Potential"><b>Known path:</b> ${RF.V1020.routeNames(potential.path).join(' → ')}</div>`:'';
          return `<div class="modalBack"><div class="modal v1020RouteModal"><div class="itemHero">${d?.icon||'📍'}</div><span class="eyebrow">WORLD MAP • ROUTE</span><h2>${d?.name||'Destination'}</h2><div class="itemDesc">${d?.desc||''}</div><div class="notice">No usable route from your current location.${lock?`<br><b>${lock}</b>`:''}</div>${potentialText}<div class="choices"><button class="choice" data-v1020-route-leave><b>Leave it</b></button></div></div></div>`;
        }
        const legs=route.path.length-1,direct=legs===1,first=route.path[1],firstMin=RF.V1020.legMinutes(s.location,first),mids=route.path.slice(1,-1);
        return `<div class="modalBack"><div class="modal v1020RouteModal"><div class="itemHero">${d?.icon||'📍'}</div><span class="eyebrow">WORLD MAP • ${direct?'DIRECT JOURNEY':`${legs}-LEG JOURNEY`}</span><h2>${d?.name||'Destination'}</h2><div class="itemDesc">${d?.desc||''}</div>${RF.V1020.chainHtml(route.path,s.location)}<div class="tradeSummary"><span>Road legs <b>${legs}</b></span><span>Total road time <b>${route.minutes} min</b></span><span>First leg <b>${firstMin} min</b></span></div>${mids.length?`<div class="notice"><b>Waypoints:</b> ${mids.map(id=>`${RF.V1020.loc(id)?.icon||'📍'} ${RF.V1020.loc(id)?.name||id}`).join(' → ')}<br><small>You will be asked whether to continue at each stop.</small></div>`:`<div class="notice good">A single road leads directly there.</div>`}<div class="choices"><button class="choice" data-v1020-route-begin="${dest}"><b>Begin journey</b><small>${direct?`Travel directly to ${d.name}.`:`Start with ${RF.V1020.loc(first)?.name||'the first waypoint'}.`}</small></button><button class="choice" data-v1020-route-leave><b>Leave it</b></button></div></div></div>`;
      }
      if(m?.type==='v1020RouteContinue'){
        const p=RF.V1020.ensure(s)?.routePlan,dest=p?.destination||m.destination,d=RF.V1020.loc(dest),route=RF.V1020.route(s,dest,false);
        if(!route||route.path.length<2)return `<div class="modalBack"><div class="modal v1020RouteModal"><div class="itemHero">🛑</div><span class="eyebrow">PLANNED JOURNEY</span><h2>Route unavailable</h2><div class="notice">The onward road to ${d?.name||'your destination'} is no longer usable from here.</div><div class="choices"><button class="choice" data-v1020-route-stop><b>Stop here</b></button></div></div></div>`;
        const next=route.path[1],nextLoc=RF.V1020.loc(next),legs=route.path.length-1;
        return `<div class="modalBack"><div class="modal v1020RouteModal"><div class="itemHero">${RF.V1020.loc(s.location)?.icon||'📍'}</div><span class="eyebrow">WAYPOINT REACHED</span><h2>${RF.V1020.loc(s.location)?.name||'Waypoint'}</h2><div class="itemDesc">You have reached an intermediate stop on your planned journey to <b>${d?.name||'your destination'}</b>.</div>${RF.V1020.chainHtml(route.path,s.location)}<div class="tradeSummary"><span>Next leg <b>${RF.V1020.legMinutes(s.location,next)} min</b></span><span>Road legs left <b>${legs}</b></span><span>Remaining road time <b>${route.minutes} min</b></span></div><div class="notice">Next: ${nextLoc?.icon||'📍'} <b>${nextLoc?.name||next}</b>${legs>1?`<br><small>You will be asked again at the next waypoint.</small>`:''}</div><div class="choices"><button class="choice" data-v1020-route-continue><b>Continue journey</b><small>Begin the next leg toward ${d?.name||'the destination'}.</small></button><button class="choice" data-v1020-route-stop><b>Stop here</b><small>End the planned journey and remain at ${RF.V1020.loc(s.location)?.name||'this location'}.</small></button></div></div></div>`;
      }
      return v1020ModalBase(s);
    };

    // ---------- Route lifecycle ----------
    const v1020TravelBase=RF.travel;
    RF.travel=function(id){
      const s=RF.state;
      // A normal World travel button starts an independent journey and cancels any old route chain.
      if(s&&!RF.V1020.launchingRouteLeg&&RF.V1020.ensure(s)?.routePlan)RF.V1020.clearPlan(s);
      return v1020TravelBase.apply(RF,arguments);
    };

    const v1020FinishTravelBase=RF.finishTravel;
    RF.finishTravel=function(a){
      const planned=!!RF.state?.v1020?.routePlan && (a?.v1020Planned||a?.v1020Destination===RF.state.v1020.routePlan.destination);
      const target=a?.target;
      const out=v1020FinishTravelBase.apply(RF,arguments);
      const s=RF.state,p=RF.V1020.ensure(s)?.routePlan;
      if(!planned||!s||!p)return out;
      if(target===p.destination||s.location===p.destination){
        const name=RF.V1020.loc(p.destination)?.name||'your destination';
        RF.log?.(s,`Planned journey complete: ${name}.`,'important');RF.V1020.clearPlan(s);RF.save?.(s);return out;
      }
      // We reached a waypoint. Preserve the route plan and wait for any arrival event/combat to finish.
      p.pending=true;p.lastWaypoint=s.location;p.arrivedAt=Date.now();RF.save?.(s);
      if(!RF.UI.modal&&!s.combat&&!s.activity){RF.V1020.openContinue(s);RF.UI.render(s)}
      return out;
    };

    // If an arrival event or battle temporarily occupies the UI, show the waypoint choice as soon as it is safe.
    const v1020RenderBase=RF.UI.render.bind(RF.UI);
    RF.UI.render=function(s){
      if(s){
        const p=RF.V1020.ensure(s)?.routePlan;
        if(p?.pending&&!RF.UI.modal&&!s.combat&&!s.activity&&!RF.V101?.mainMenu)RF.V1020.openContinue(s);
      }
      return v1020RenderBase(s);
    };

    // Stopping/turning back or emergency teleporting ends a planned route chain as well.
    const v1020CancelBase=RF.cancelActivity;
    RF.cancelActivity=function(){
      const s=RF.state,wasTravel=s?.activity?.type==='travel';
      if(wasTravel&&RF.V1020.ensure(s)?.routePlan)RF.V1020.clearPlan(s);
      return v1020CancelBase.apply(RF,arguments);
    };
    if(RF.V1016?.forceTeleport){
      const v1020TeleportBase=RF.V1016.forceTeleport.bind(RF.V1016);
      RF.V1016.forceTeleport=function(id){RF.V1020.clearPlan(RF.state);return v1020TeleportBase(id)};
    }
    if(typeof RF.loseV4Battle==='function'){
      const v1020LoseBase=RF.loseV4Battle;
      RF.loseV4Battle=function(){RF.V1020.clearPlan(RF.state);return v1020LoseBase.apply(RF,arguments)};
    }

    // ---------- Bind final map/modal controls after all historical wrappers ----------
    const v1020BindBase=RF.UI.bind.bind(RF.UI);
    RF.UI.bind=function(s){
      try{v1020BindBase(s||RF.state)}catch(err){console.warn('[Realmforge V10.20 bind recovery]',err)}
      document.querySelectorAll('[data-map-dest]').forEach(b=>b.onclick=()=>RF.V1020.openRoutePreview(b.dataset.mapDest));
      document.querySelectorAll('[data-v1020-route-begin]').forEach(b=>b.onclick=()=>RF.V1020.beginRoute(b.dataset.v1020RouteBegin));
      document.querySelectorAll('[data-v1020-route-leave]').forEach(b=>b.onclick=()=>{RF.UI.modal=null;RF.UI.render(RF.state)});
      document.querySelectorAll('[data-v1020-route-continue]').forEach(b=>b.onclick=()=>RF.V1020.continueRoute());
      document.querySelectorAll('[data-v1020-route-stop]').forEach(b=>b.onclick=()=>RF.V1020.stopRoute());
    };

    // ---------- Styling ----------
    (function(){
      const css=document.createElement('style');css.id='rf-v1020-style';css.textContent=`
        .v1020RouteModal .itemDesc{margin-bottom:12px}
        .v1020RouteChain{display:flex;align-items:center;gap:7px;overflow-x:auto;padding:10px 4px 13px;margin:5px 0 8px;scrollbar-width:none}
        .v1020RouteChain::-webkit-scrollbar{display:none}
        .v1020RouteChain>b{flex:0 0 auto;color:#a98c5d;font-size:20px}
        .v1020Stop{flex:0 0 auto;padding:8px 10px;border:1px solid rgba(211,173,104,.24);border-radius:12px;background:rgba(0,0,0,.16);font-size:13px;color:#dbc79e;white-space:nowrap}
        .v1020Stop.here{border-color:#e1bb6f;background:rgba(174,118,41,.18);color:#ffe6a9}
        .v1020Potential{margin:10px 0;padding:10px 12px;border-radius:12px;background:rgba(0,0,0,.17);color:#cbb99a;line-height:1.45}
        .v1020RouteModal .tradeSummary{grid-template-columns:repeat(3,minmax(0,1fr));gap:7px}
        .v1020RouteModal .tradeSummary span{min-width:0;text-align:center}
        @media(max-width:390px){.v1020RouteModal .tradeSummary{grid-template-columns:1fr 1fr}.v1020RouteModal .tradeSummary span:last-child{grid-column:1/-1}}
      `;document.head.appendChild(css);
    })();

    RF.V1020.migrate=function(s){if(!s)return s;RF.V1020.ensure(s);s.version='10.20.0';return s};
    /* V11.8: legacy save/migration wrapper extracted to canonical core. */
    if(RF.state){RF.V1020.migrate(RF.state);try{RF.save?.(RF.state)}catch(_){};RF.UI.render(RF.state)}
  });}
  function installHistoricalV1122(){return once('js/v11_2_2.js',()=>{
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
    /* V11.8: legacy save/migration wrapper extracted to canonical core. */

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
  });}
  const api={
    installHistoricalV9Routing,installHistoricalV1016,installHistoricalV1017,installHistoricalV1020,installHistoricalV1122,
    get installedStages(){return Array.from(installed);},
    start:id=>RF.travel(id),finish:a=>RF.finishTravel(a),setSpeed:s=>typeof RF.setSpeed==='function'?RF.setSpeed(s):null,
    repair:s=>typeof RF.repairTravelIfStalled==='function'?RF.repairTravelIfStalled(s):s,
    route:(s,from,to,allowLocked=false)=>typeof RF.v9Route==='function'?RF.v9Route(s,from,to,allowLocked):null,
    preview:id=>RF.V1020?.openRoutePreview?RF.V1020.openRoutePreview(id):null,
    beginRoute:(...a)=>RF.V1020?.beginRoute?RF.V1020.beginRoute(...a):null,
    clearPlan:(s,r)=>RF.V1020?.clearPlan?RF.V1020.clearPlan(s,r):null,
    unlocked:(s,id)=>typeof RF.v9LocationUnlocked==='function'?RF.v9LocationUnlocked(s,id):false,
    lockText:(s,id)=>typeof RF.v9LockText==='function'?RF.v9LockText(s,id):''
  };
  RF.Systems.Travel=RF.Modules.register('systems.travel',api,{owner:'systems',status:'canonical',historicalStages:['v9-routing','v10.16','v10.17','v10.20','v11.2.2']});
})();
