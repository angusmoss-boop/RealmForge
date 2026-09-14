window.RF = window.RF || {};
RF.VERSION = '8.0.0';

/* Realmforge V8 — Road & Rhythm
   Travel interruptions, deliberate action pacing, burst-speed limits and polish.
*/

RF.V8 = RF.V8 || {
  actionCooldowns:{work:520,production:600,huntTrack:700,fire:620,forge:650,lock:560,excavate:650,potion:700,combat:850},
  boostMs:30000,
  boostRecoveryMs:20000
};

RF.migrateV8=function(s){
  if(!s)return s;
  s.version='8.0.0';
  s.v8=s.v8||{};
  s.v8.boostUntil=s.v8.boostUntil||0;
  s.v8.boostCooldownUntil=s.v8.boostCooldownUntil||0;
  s.v8.travelInterrupts=s.v8.travelInterrupts||0;
  s.v8.roadEventsSeen=s.v8.roadEventsSeen||{};
  if(![0,1,2].includes(s.speed))s.speed=1;
  s.stats=s.stats||{};
  if(s.stats.travelEvents==null)s.stats.travelEvents=0;
  if(s.stats.cooldownActions==null)s.stats.cooldownActions=0;
  return s;
};
const v8NewGameBase=RF.newGame; RF.newGame=function(...a){return RF.migrateV8(v8NewGameBase(...a));};
const v8LoadBase=RF.load; RF.load=function(){return RF.migrateV8(v8LoadBase());};
const v8ImportBase=RF.importSave; RF.importSave=function(x){return RF.migrateV8(v8ImportBase(x));};
if(RF.state)RF.migrateV8(RF.state);

// ---------- Time controls: Pause / 1x / limited 2x ----------
const v8SetSpeedBase=RF.setSpeed;
RF.setSpeed=function(v){
  const s=RF.state;if(!s)return;
  v=+v;if(![0,1,2].includes(v))v=1;
  const now=Date.now();
  if(v===2){
    if((s.v8.boostCooldownUntil||0)>now){RF.animateDenied('.speed[data-speed="2"]');return;}
    if(s.speed!==2||!s.v8.boostUntil||s.v8.boostUntil<=now)s.v8.boostUntil=now+RF.V8.boostMs;
  } else if(v!==2){ s.v8.boostUntil=0; }
  return v8SetSpeedBase(v);
};
RF.boostRemaining=function(s){return Math.max(0,(s.v8?.boostUntil||0)-Date.now());};
RF.boostCooldownRemaining=function(s){return Math.max(0,(s.v8?.boostCooldownUntil||0)-Date.now());};
RF.animateDenied=function(sel){requestAnimationFrame(()=>{const el=document.querySelector(sel);if(!el)return;el.classList.remove('shake');void el.offsetWidth;el.classList.add('shake');});};
RF.v8ClockTimer=setInterval(()=>{
  const s=RF.state;if(!s?.v8)return;const now=Date.now();let dirty=false;
  if(s.speed===2&&s.v8.boostUntil&&now>=s.v8.boostUntil){
    s.speed=1;s.paused=false;s.v8.boostUntil=0;s.v8.boostCooldownUntil=now+RF.V8.boostRecoveryMs;RF.log(s,'2× burst exhausted. Time settles back to 1× while the chronometer recovers.','important');RF.save(s);dirty=true;
  }
  if(dirty||s.speed===2||(s.v8.boostCooldownUntil||0)>now){
    if(!RF.UI.modal&&!s.combat&&!RF.actionGame)RF.UI.render(s);
  }
},500);

const v8TopBase=RF.UI.top.bind(RF.UI);
RF.UI.top=function(s){
  const hp=100*s.player.hp/s.player.maxHp,st=100*s.player.stamina/s.player.maxStamina,boost=RF.boostRemaining(s),cd=RF.boostCooldownRemaining(s);
  const boostPct=s.speed===2?Math.max(0,100*boost/RF.V8.boostMs):0;
  const label=cd?`${Math.ceil(cd/1000)}s`:'2×';
  return `<header class="topbar"><div class="heroRow"><div class="avatar">${s.player.avatar}</div><div class="grow"><div class="nameLine"><strong>${s.player.name}</strong><span class="tiny">Lv ${s.player.level} • ${s.gold}g</span></div><div class="tiny">HP ${Math.ceil(s.player.hp)}/${s.player.maxHp}</div><div class="bar"><div class="fill hp" style="width:${hp}%"></div></div><div class="tiny" style="margin-top:3px">Stamina ${Math.ceil(s.player.stamina)}/${s.player.maxStamina}</div><div class="bar"><div class="fill st" style="width:${st}%"></div></div></div></div><div class="timeRow"><div class="clock">${RF.UI.fmtTime(s)} • ${s.weather}</div><div class="speeds"><button class="speed ${s.speed===0?'active':''}" data-speed="0">Ⅱ</button><button class="speed ${s.speed===1?'active':''}" data-speed="1">1×</button><button class="speed ${s.speed===2?'active':''} ${cd?'recovering':''}" data-speed="2">${label}</button></div></div>${s.speed===2?`<div class="boostBar"><div style="width:${boostPct}%"></div></div><div class="boostCaption">2× burst • ${Math.ceil(boost/1000)}s remaining</div>`:cd?`<div class="boostCaption muted">2× recovering • ${Math.ceil(cd/1000)}s</div>`:''}</header>`;
};

// ---------- Travel interruptions ----------
RF.DATA.roadEvents=[
 {id:'broken_cart',icon:'🛞',title:'A Wheel in the Ditch',text:'A merchant is wrestling with a snapped cart wheel while a mule watches with the calm superiority of a creature not expected to understand carpentry.',choices:[
   {text:'Help lift the cart.',result:s=>{RF.addXp(s,'strength',18);RF.addXp(s,'speech',8);if(Math.random()<.55){RF.addItem(s,'bread',1);s.gold+=6;return 'Together you lever the cart free. The merchant presses bread and a few coins into your hand.'}return 'You get the wheel seated again. The merchant thanks you sincerely before rattling away.';}},
   {text:'Offer to sell them a spare tool.',condition:s=>(s.inventory.crude_axe||0)>1,result:s=>{RF.takeItem(s,'crude_axe',1);s.gold+=28;RF.addXp(s,'trading',20);return 'They overpay rather gratefully for the crude axe and improvise a brace from its handle.';}},
   {text:'Wish them luck and continue.',result:s=>'You leave them arguing with the wheel. The mule appears vindicated.'}
 ]},
 {id:'roadside_cache',icon:'🧺',title:'Something Under the Hedge',text:'A scrap of waxed cloth protrudes beneath the roots beside the road. It could be dropped cargo. It could also be bait.',choices:[
   {text:'Search carefully.',result:s=>{let good=Math.random()<.7+s.skills.perception?.level*.005;if(good){let id=Math.random()<.45?'lockpick':'field_tonic';RF.addItem(s,id,1);RF.addXp(s,'exploration',20);return `You uncover a small forgotten cache containing ${RF.DATA.items[id].name}.`}s.crime.heat=Math.min(100,(s.crime.heat||0)+4);return 'The bundle is empty except for a chalk mark used by roadside thieves. You move on before its owner returns.';}},
   {text:'Leave it.',result:s=>'Not every suspicious bundle needs to become part of your biography.'}
 ]},
 {id:'sudden_storm',icon:'⛈️',title:'Rain Like Thrown Gravel',text:'The sky closes almost at once. Wind drives cold rain across the road and visibility collapses.',choices:[
   {text:'Shelter and wait it out.',result:s=>{if(s.activity?.type==='travel')s.activity.duration+=12;RF.advanceWorld(12);RF.addXp(s,'survival',14);return 'You crouch beneath cover until the worst passes. The delay costs time, but little else.';}},
   {text:'Push through.',result:s=>{let ok=Math.random()<.55+s.skills.survival.level*.018;if(ok){RF.addXp(s,'survival',24);return 'You keep your footing and make surprisingly good time through the downpour.'}s.player.stamina=Math.max(0,s.player.stamina-18);if(s.activity?.type==='travel')s.activity.duration+=5;return 'Mud drags at every step. You emerge soaked, tired and several minutes behind.';}}
 ]},
 {id:'passing_company',icon:'🔥',title:'Smoke Beside the Road',text:'Three travellers have made a tiny roadside fire and wave as you approach. Their kettle smells considerably better than the weather.',choices:[
   {text:'Share the fire for a few minutes.',result:s=>{RF.advanceWorld(8);s.player.stamina=Math.min(s.player.maxStamina,s.player.stamina+16);RF.addXp(s,'speech',10);return 'You trade small stories and worse jokes. Nothing world-changing happens, which is rather pleasant.';}},
   {text:'Ask if they have anything to trade.',result:s=>{s.gold=Math.max(0,s.gold-0);RF.addXp(s,'trading',6);RF.addItem(s,'wild_berries',1);return 'They have little to spare, but one traveller hands you a wrapped portion of berries for the road.';}},
   {text:'Keep moving.',result:s=>'You exchange waves and carry on.'}
 ]},
 {id:'forked_tracks',icon:'👣',title:'Fresh Tracks Across the Road',text:'Tracks leave the road toward rough ground. Heavy boots, hurried pace, at least two people.',choices:[
   {text:'Follow them.',result:s=>{RF.addXp(s,'hunting',16);RF.addXp(s,'exploration',16);if(Math.random()<.48){setTimeout(()=>RF.startBattle(s.location==='marshroad'?'fenroad_raider':'bandit',{forced:true}),100);return 'The trail bends behind cover. Someone was waiting.'}s.gold+=9;return 'The trail ends at an abandoned pack. You salvage 9 gold from a torn purse.';}},
   {text:'Mark the trail and continue.',result:s=>{RF.addXp(s,'exploration',8);return 'You make a note of the sign and keep to the road.';}}
 ]},
 {id:'animal_crossing',icon:'🦌',title:'Movement Ahead',text:'Something large moves through the brush beside the road, close enough that you hear branches flex.',choices:[
   {text:'Stop and observe.',result:s=>{RF.addXp(s,'hunting',14);RF.addXp(s,'exploration',10);return 'You wait quietly until a wary animal crosses the road and vanishes into cover. Useful tracks remain behind.';}},
   {text:'Make noise and move on.',result:s=>'Whatever it was chooses distance over curiosity.'}
 ]}
];
RF.chooseRoadEvent=function(s){
  let bag=RF.DATA.roadEvents.slice();if(s.weather==='Storm'||s.weather==='Rain')bag.push(RF.DATA.roadEvents.find(x=>x.id==='sudden_storm'));
  return bag[Math.floor(Math.random()*bag.length)];
};
const v8TravelBase=RF.travel;
RF.travel=function(id){
  const out=v8TravelBase(id),s=RF.state;
  if(s?.activity?.type==='travel'&&!s.activity.v8Prepared){
    const duration=s.activity.duration;s.activity.v8Prepared=true;
    s.activity.v8Checkpoint=Math.max(2,duration*(.28+Math.random()*.42));
    s.activity.v8EventChance=Math.min(.78,.38+duration/120+(s.weather==='Storm'?.12:0));
    s.activity.v8Checked=false;
  }
  return out;
};
RF.maybeTravelInterrupt=function(){
  const s=RF.state,a=s?.activity;if(!a||a.type!=='travel'||!a.v8Prepared||a.v8Checked||RF.UI.modal||s.combat)return;
  if(a.progress<a.v8Checkpoint)return;
  a.v8Checked=true;
  if(Math.random()>a.v8EventChance)return;
  const ev=RF.chooseRoadEvent(s);if(!ev)return;
  const old=s.speed;s.speed=0;s.v8.travelInterrupts++;s.stats.travelEvents++;s.v8.roadEventsSeen[ev.id]=(s.v8.roadEventsSeen[ev.id]||0)+1;
  RF.UI.modal={type:'event',event:{...ev,choices:ev.choices.map(c=>({...c,result:ss=>{let text=c.result(ss);ss.speed=0;return `${text}\n\nYour journey is still underway. Resume at 1× or use a 2× burst when ready.`;}}))}};
  RF.log(s,`Travel interrupted: ${ev.title}`,'important');RF.save(s);RF.UI.render(s);
};
const v8AdvanceBase=RF.advanceWorld;
RF.advanceWorld=function(min){const out=v8AdvanceBase(min);RF.maybeTravelInterrupt();return out;};

// ---------- Real-time action cooldowns ----------
RF.actionReady=function(g,key,ms){
  if(!g)return false;const now=Date.now(),until=g.v8CooldownUntil||0;
  if(now<until){RF.animateDenied('.tapButton, .action.primary, .abilityBtn');return false;}
  g.v8CooldownUntil=now+(ms||500);g.v8CooldownMs=ms||500;g.v8CooldownKey=key;RF.state.stats.cooldownActions++;RF.ensureCooldownTicker();return true;
};
RF.cooldownRemaining=function(g){return Math.max(0,(g?.v8CooldownUntil||0)-Date.now());};
RF.ensureCooldownTicker=function(){
  if(RF.v8ActionTicker)return;
  const tick=()=>{RF.v8ActionTicker=null;let g=RF.actionGame,c=RF.state?.combat,active=(g&&RF.cooldownRemaining(g)>0)||(c&&Math.max(0,(c.v8CooldownUntil||0)-Date.now())>0);if(active){RF.UI.render(RF.state);RF.v8ActionTicker=setTimeout(tick,80);}};RF.v8ActionTicker=setTimeout(tick,80);
};
function wrapAction(name,key,ms){const base=RF[name];if(typeof base!=='function')return;RF[name]=function(...args){let g=RF.actionGame;if(g&&!RF.actionReady(g,key,ms))return;return base.apply(RF,args);};}
wrapAction('workTap','work',RF.V8.actionCooldowns.work);
wrapAction('productionTap','production',RF.V8.actionCooldowns.production);
wrapAction('huntTrack','huntTrack',RF.V8.actionCooldowns.huntTrack);
wrapAction('fireTap','fire',RF.V8.actionCooldowns.fire);
wrapAction('setTumbler','lock',RF.V8.actionCooldowns.lock);
wrapAction('stokeForge','forge',RF.V8.actionCooldowns.forge);
wrapAction('hammerForge','forge',RF.V8.actionCooldowns.forge);
wrapAction('excavateTile','excavate',RF.V8.actionCooldowns.excavate);

// Combat gets a short real-time cadence on top of turn cooldowns.
RF.combatReady=function(){let c=RF.state?.combat;if(!c)return false;let now=Date.now();if(now<(c.v8CooldownUntil||0)){RF.animateDenied('.abilityGrid');return false;}c.v8CooldownUntil=now+RF.V8.actionCooldowns.combat;c.v8CooldownMs=RF.V8.actionCooldowns.combat;RF.ensureCooldownTicker();return true;};
const v8BattleAbilityBase=RF.battleAbility; RF.battleAbility=function(id){if(!RF.combatReady())return;return v8BattleAbilityBase(id);};
const v8BattleItemBase=RF.useBattleItem; RF.useBattleItem=function(id){if(!RF.combatReady())return;return v8BattleItemBase(id);};
const v8FleeBase=RF.fleeV4; RF.fleeV4=function(){if(!RF.combatReady())return;return v8FleeBase();};

// ---------- UI cooldown decoration / travel progress ----------
RF.v8CooldownMarkup=function(g){let rem=RF.cooldownRemaining(g);if(!rem)return '';let pct=Math.max(0,100*rem/(g.v8CooldownMs||500));return `<div class="actionCooldown"><div style="width:${pct}%"></div></div><div class="cooldownText">Recovering ${Math.ceil(rem/100)/10}s</div>`;};
const v8V6ModalBase=RF.UI.v6ActionModal?.bind(RF.UI);
if(v8V6ModalBase)RF.UI.v6ActionModal=function(s,g){let h=v8V6ModalBase(s,g);if(g&&RF.cooldownRemaining(g)>0)h=h.replace(/(<div class="actionFeedback[^>]*>)/,RF.v8CooldownMarkup(g)+'$1');return h;};
const v8V7ModalBase=RF.UI.v7ActionModal?.bind(RF.UI);
if(v8V7ModalBase)RF.UI.v7ActionModal=function(s,g){let h=v8V7ModalBase(s,g);if(g&&RF.cooldownRemaining(g)>0&&!h.includes('actionCooldown'))h=h.replace(/(<div class="actionFeedback[^>]*>)/,RF.v8CooldownMarkup(g)+'$1');return h;};
const v8CombatPopupBase=RF.UI.combatPopup.bind(RF.UI);
RF.UI.combatPopup=function(s){let h=v8CombatPopupBase(s),c=s.combat,rem=Math.max(0,(c?.v8CooldownUntil||0)-Date.now());if(rem>0){let pct=Math.max(0,100*rem/(c.v8CooldownMs||850));h=h.replace('<div class="battleSectionTitle">Choose a move</div>',`<div class="combatCadence"><div class="actionCooldown"><div style="width:${pct}%"></div></div><span>Recovering ${Math.ceil(rem/100)/10}s</span></div><div class="battleSectionTitle">Choose a move</div>`);h=h.replace(/class="abilityBtn /g,'disabled class="abilityBtn ');h=h.replace(/<button data-battle-item=/g,'<button disabled data-battle-item=');}return h;};

// More informative activity panel for journeys.
const v8ActivityBase=RF.UI.activity.bind(RF.UI);
RF.UI.activity=function(s){
  if(s.activity?.type==='travel'){
    const a=s.activity,p=Math.min(100,100*a.progress/a.duration),dest=RF.DATA.locations[a.target];
    return `<section class="card travelCard"><span class="eyebrow">ON THE ROAD</span><h3>🛤️ ${a.label}</h3><div class="roadStrip"><div class="roadWalker" style="left:calc(${Math.max(2,Math.min(94,p))}% - 10px)">🚶</div></div><div class="bar large"><div class="fill xp" style="width:${p}%"></div></div><div class="rowBetween tiny"><span>${Math.round(p)}% complete</span><span>${Math.max(0,Math.ceil(a.duration-a.progress))} sec remaining</span></div><div class="sub">Road events can interrupt the journey before you reach ${dest?.name||'your destination'}.</div><button class="cancelBtn" data-cancel>Turn back</button></section>`;
  }
  return v8ActivityBase(s);
};

// Animation class hooks on changing action feedback.
const v8RenderBase=RF.UI.render.bind(RF.UI);
RF.UI.render=function(s){v8RenderBase(s);requestAnimationFrame(()=>{document.querySelectorAll('.tapButton:not(:disabled), .abilityBtn:not(:disabled), .action:not(:disabled)').forEach(el=>el.classList.add('touchAlive'));});};

// Binders need to rebind 2x even while recovering so denied clicks can animate rather than vanish.
const v8BindBase=RF.UI.bind.bind(RF.UI);
RF.UI.bind=function(s){v8BindBase(s);document.querySelectorAll('[data-speed="2"]').forEach(b=>b.onclick=()=>RF.setSpeed(2));};

