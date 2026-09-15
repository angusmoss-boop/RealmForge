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
if(RF.V95){
  RF.V95.SCHEMA='10.20.0';
  const base=RF.V95.migrate.bind(RF.V95);RF.V95.migrate=s=>RF.V1020.migrate(base(s));
}
if(RF.state){RF.V1020.migrate(RF.state);try{RF.save?.(RF.state)}catch(_){};RF.UI.render(RF.state)}
