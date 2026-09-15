window.RF=window.RF||{};
RF.VERSION='10.29.0';

/* Realmforge V10.29 — Four Pins
   - Rebuilds circular lockpicking around four sequential pin/ridge stages.
   - Each successful pin moves the bright green binding arc to a new position.
   - Lock speed rises and the target narrows/thins with difficulty.
   - Misses still snap one consumable Lockpick; exploration chests still jam after 3 total misses.
   - Lock-session Energy cost is paid once, so four required successes do not quadruple the old Energy burden.
*/
(function(){
'use strict';
const RF=window.RF;if(!RF?.V1027)return;
RF.V1029=RF.V1029||{};RF.V1029.version='10.29.0';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));

RF.V1029.PINS=4;
RF.V1029.randomTargetAway=function(previous){
  let t=RF.V1027.randomTarget?RF.V1027.randomTarget():24+Math.random()*312;
  if(!Number.isFinite(previous))return t;
  for(let i=0;i<8&&RF.V1027.angleDiff(t,previous)<72;i++)t=RF.V1027.randomTarget?RF.V1027.randomTarget():24+Math.random()*312;
  return t;
};
RF.V1029.revSeconds=g=>Math.max(.1,360/Math.max(.001,Number(g?.speed)||.09)/1000);
RF.V1029.profileThickness=function(label){return label==='Master'?15:label==='Hard'?21:29;};
RF.V1029.applyProfile=function(profile){
  profile=Object.assign({},profile||{});
  profile.arcThickness=profile.arcThickness||RF.V1029.profileThickness(profile.label);
  return profile;
};

// Faster than V10.27 overall, with a much clearer difficulty ramp.
RF.V1027.chestProfile=function(s,tier){
  const c=RF.V1025?.CHESTS?.[tier]||{level:3},th=Math.max(1,s.skills?.thieving?.level||1),over=Math.max(0,th-c.level);
  const base=tier==='rare'?{tol:14,speed:.165,label:'Master',thickness:15}:tier==='medium'?{tol:22,speed:.125,label:'Hard',thickness:21}:{tol:32,speed:.090,label:'Simple',thickness:29};
  return {required:c.level,tolerance:clamp(base.tol+Math.min(5,over*.32),10,35),speed:Math.max(base.speed*.88,base.speed*(1-Math.min(.12,over*.006))),label:base.label,arcThickness:base.thickness};
};
RF.V1027.siteProfile=function(s,level=1){
  const th=Math.max(1,s.skills?.thieving?.level||1),over=Math.max(0,th-level),hard=level>=10,mid=level>=6;
  return {required:level,tolerance:clamp(35-level*1.35+Math.min(6,over*.35),12,34),speed:clamp(.082+level*.006-over*.00045,.08,.16),label:hard?'Master':mid?'Hard':'Simple',arcThickness:hard?15:mid?21:29};
};
RF.V1027.burglaryProfile=function(s,site){
  const d=+site?.difficulty||45,th=Math.max(1,s.skills?.thieving?.level||1),hard=d>=70,mid=d>=45;
  return {required:1,tolerance:clamp(38-d*.31+th*.30,12,34),speed:clamp(.078+d*.00095-th*.00035,.08,.16),label:hard?'Master':mid?'Hard':'Simple',arcThickness:hard?15:mid?21:29};
};

// Keep V10.27's start/pause safeguards, then upgrade the newly-created lock session.
const v1029StartBase=RF.V1027.startLock.bind(RF.V1027);
RF.V1027.startLock=function(opts){
  opts=Object.assign({},opts,{profile:RF.V1029.applyProfile(opts?.profile)});
  const ok=v1029StartBase(opts),g=RF.actionGame;
  if(!ok||g?.type!=='v1027Lock')return ok;
  g.pinStage=0;g.pinRequired=RF.V1029.PINS;g.arcThickness=opts.profile.arcThickness;g.sessionEnergyPaid=false;g.burglaryFails=g.burglaryFails||0;
  g.message='Set four pins. Tap TURN THE LOCK whenever the moving pick crosses the bright green binding arc.';
  RF.UI.render(RF.state);RF.V1027.startTicker();return true;
};

RF.V1029.setNextPin=function(g,angle){
  const old=g.target;
  g.target=RF.V1029.randomTargetAway(old);
  g.startAngle=Number.isFinite(angle)?angle:RF.V1027.angle(g);
  g.started=Date.now();g.lastVisualAngle=g.startAngle;g.lastSuccessAt=Date.now();
};
RF.V1029.paySessionEnergy=function(s,g){
  if(g.sessionEnergyPaid)return true;
  const base=RF.v10EnergyCost?RF.v10EnergyCost('lockpick'):2;
  // V10.22 still remembers the retired lockpicking Tool Belt, which can inflate this cost.
  // Cap the whole four-pin lock session at the old practical cost rather than charging four times.
  const cost=clamp(Math.round(base),1,4);
  if(RF.v10SpendEnergy&&!RF.v10SpendEnergy(s,cost))return false;
  g.sessionEnergyPaid=true;g.sessionEnergyCost=cost;return true;
};
RF.V1029.failLock=function(s,g){
  RF.V1027.breakPick(s);s.stats.failedLockpicks=(s.stats.failedLockpicks||0)+1;
  if(g.context==='chest'){
    const ch=RF.V1025?.chestAt(s,g.location);if(ch){ch.failures=(ch.failures||0)+1;
      if(ch.failures>=3){const c=RF.V1025.chestDef(ch);delete s.v1025.chests[g.location];s.stats.chestLocksJammed=(s.stats.chestLocksJammed||0)+1;RF.log(s,`${c.name}: the lock jams permanently after three failed picks.`,'bad');return RF.V1027.resume({type:'message',title:'Lock Jammed',text:`The third failed pick mangles the final mechanism. ${c.name} is permanently jammed and the find is lost.`});}
    }
  }else if(g.context==='burglary'){
    s.stats.burglaryLockFailures=(s.stats.burglaryLockFailures||0)+1;
    const risk=clamp(.05+(g.site?.difficulty||40)*.0025+(g.burglaryFails||0)*.045,.08,.36);g.burglaryFails=(g.burglaryFails||0)+1;
    if(Math.random()<risk){const fine=24+Math.round((g.site?.difficulty||40)*.55);RF.addBounty?.(s,fine,'failed burglary lock');return RF.V1027.resume({type:'message',title:'The House Wakes',text:`The snapped pick rings against the lock. You get away, but somebody gets a useful look at you. Bounty +${fine}g.`});}
  }
  if(!RF.V1027.hasPick(s))return RF.V1027.resume({type:'message',title:'Out of Lockpicks',text:g.context==='chest'?'Your last pick snaps. The chest remains marked here unless that was its third failed attempt.':'Your last pick snaps, leaving you no way to continue working the lock.'});
  const ch=g.context==='chest'?RF.V1025?.chestAt(s,g.location):null,failText=ch?` Chest failures ${ch.failures}/3.`:'';
  g.message=`💥 Lockpick snapped.${failText} Pin ${Math.min((g.pinStage||0)+1,g.pinRequired||4)} is still binding. ${RF.V1027.pickCount(s)} pick${RF.V1027.pickCount(s)===1?'':'s'} remain.`;
  RF.save(s);RF.UI.render(s);RF.V1027.startTicker();
};

RF.V1027.turnLock=function(){
  const s=RF.state,g=RF.actionGame;if(!s||g?.type!=='v1027Lock')return;
  if(!RF.V1029.paySessionEnergy(s,g)){g.message='⚡ You are too tired to keep steady pressure on the lock.';RF.UI.render(s);RF.V1027.startTicker();return;}
  const angle=Number.isFinite(g.lastVisualAngle)?g.lastVisualAngle:RF.V1027.angle(g),diff=RF.V1027.angleDiff(angle,g.target),success=diff<=g.tolerance+1.8;
  if(!success)return RF.V1029.failLock(s,g);

  g.pinStage=Math.min(g.pinRequired||4,(g.pinStage||0)+1);RF.addXp(s,'thieving',2);
  if(g.pinStage>=(g.pinRequired||4)){
    if(g.context==='chest')return RF.V1027.finishChest(s,g);
    if(g.context==='burglary')return RF.V1027.finishBurglary(s,g);
    return RF.V1027.finishSite(s,g);
  }
  RF.V1029.setNextPin(g,angle);
  g.message=`✅ Pin ${g.pinStage}/4 set. The next binding point shifts around the cylinder.`;
  RF.save(s);RF.UI.render(s);RF.V1027.startTicker();
};

// Upgrade old in-progress lock sessions safely if somebody updates with the modal open.
RF.migrateV1029=function(s){
  if(!s)return s;s.version='10.29.0';s.v1029=s.v1029||{};
  const g=RF.actionGame;if(g?.type==='v1027Lock'){
    let p=null;
    if(g.context==='chest')p=RF.V1027.chestProfile(s,g.tier||RF.V1025?.chestAt(s,g.location)?.tier||'low');
    else if(g.context==='burglary')p=RF.V1027.burglaryProfile(s,g.site||{});
    else p=RF.V1027.siteProfile(s,RF.DATA?.lockSites?.[g.siteId]?.level||g.required||1);
    g.tolerance=p.tolerance;g.speed=p.speed;g.difficulty=p.label;g.arcThickness=p.arcThickness;g.pinStage=0;g.pinRequired=4;g.sessionEnergyPaid=false;g.target=RF.V1029.randomTargetAway(g.target);g.started=Date.now();g.startAngle=Math.random()*360;g.message='The lock has four pins. Set each one inside the bright green arc.';
  }
  return s;
};
const v1029New=RF.newGame;RF.newGame=function(...a){return RF.migrateV1029(v1029New(...a))};
const v1029Load=RF.load;RF.load=function(){return RF.migrateV1029(v1029Load())};
const v1029Import=RF.importSave;RF.importSave=function(x){return RF.migrateV1029(v1029Import(x))};
if(RF.V95){RF.V95.SCHEMA='10.29.0';const oldMig=RF.V95.migrate.bind(RF.V95);RF.V95.migrate=s=>RF.migrateV1029(oldMig(s));}

// Much clearer live feedback: the arc is vivid, and the whole ring glows when the pick is actually inside it.
RF.V1027.startTicker=function(){
  RF.V1027.stopTicker();RF.V1027.timer=setInterval(()=>{
    const g=RF.actionGame;if(!g||g.type!=='v1027Lock'){RF.V1027.stopTicker();return;}
    const ang=RF.V1027.angle(g);g.lastVisualAngle=ang;
    const el=document.querySelector('.v1029Needle,.v1027Needle');if(el)el.style.transform=`rotate(${ang}deg)`;
    const dial=document.querySelector('.v1029LockDial');if(dial)dial.classList.toggle('v1029InZone',RF.V1027.angleDiff(ang,g.target)<=g.tolerance+1.8);
  },24);
};

// Replace only the lock action modal. Everything else continues through the accumulated renderer chain.
const v1029ActionModalBase=RF.UI.v7ActionModal.bind(RF.UI);
RF.UI.v7ActionModal=function(s,g){
  if(g?.type!=='v1027Lock')return v1029ActionModalBase(s,g);
  const angle=Number.isFinite(g.lastVisualAngle)?g.lastVisualAngle:g.startAngle||0;
  const width=Math.max(12,(g.tolerance||20)*2),start=(g.target||0)-(g.tolerance||20),visualStart=start+180,picks=RF.V1027.pickCount(s),pins=Math.max(0,g.pinStage||0),total=g.pinRequired||4;
  const thickness=clamp(Number(g.arcThickness)||RF.V1029.profileThickness(g.difficulty),12,32),inner=clamp(96-thickness,62,84);
  const ch=g.context==='chest'?RF.V1025?.chestAt(s,g.location):null,failureLine=ch?`Chest failures ${ch.failures||0}/3`:g.context==='burglary'?`Quiet failures ${g.burglaryFails||0}`:'No permanent jam risk';
  const pinDots=Array.from({length:total},(_,i)=>`<span class="${i<pins?'set':i===pins?'active':''}">${i<pins?'✓':i+1}</span>`).join('');
  return `<div class="modalBack actionBack"><div class="modal actionModal v1027LockModal v1029LockModal"><div class="actionHero">${g.icon||'🔐'}</div><span class="eyebrow">LOCKPICKING • ${String(g.difficulty||'LOCK').toUpperCase()}</span><h2>${g.title}</h2>
    <div class="v1029PinTrack" aria-label="${pins} of ${total} lock pins set">${pinDots}</div>
    <div class="v1029LockDial" aria-label="Circular four-pin lockpicking dial"><div class="v1029Arc" style="--arcStart:${visualStart}deg;--arcWidth:${width}deg;--arcInner:${inner}%"></div><div class="v1029Ring"></div><div class="v1029Needle" style="transform:rotate(${angle}deg)"><span></span></div><div class="v1029Hub">${pins}/${total}</div></div>
    <div class="v1027LockStats"><span>🗝️ Picks <b>${picks}</b></span><span>📌 Pins <b>${pins}/${total}</b></span><span>🎯 Window <b>${Math.round(width)}°</b></span></div>
    <div class="v1029Speed">${RF.V1029.revSeconds(g).toFixed(1)} sec per rotation • ${failureLine}</div>
    <button class="tapButton" data-v1027-turn>🗝️ TURN THE LOCK</button><div class="actionFeedback">${g.message}</div><div class="tiny center">Set all four pins. Hit the bright green arc and it moves to the next binding point. A miss snaps one Lockpick${g.context==='chest'?'; three total misses permanently jam this chest':''}.</div><button class="quietClose" data-v1027-lock-leave>${g.context==='burglary'?'Abandon the door':'Leave it for now'}</button></div></div>`;
};

// Update the chest explanation shown before opening the lock.
const v1029ModalBase=RF.UI.modalHtml.bind(RF.UI);
RF.UI.modalHtml=function(s){
  let h=v1029ModalBase(s);
  if(this.modal?.type==='v1025Chest'){
    h=h.replace('The lock is worked with the circular timing minigame. Every failed turn breaks one Lockpick. Three failed attempts permanently jam and destroy this chest find.','The lock has four pins. Set each pin by turning while the moving pick crosses the bright green arc; after every success the target moves. Every miss breaks one Lockpick, and three total misses permanently jam this chest.');
  }
  return h;
};

if(!document.getElementById('rf-v1029-style')){
  const st=document.createElement('style');st.id='rf-v1029-style';st.textContent=`
  .v1029LockModal{overflow:auto;padding-bottom:max(22px,env(safe-area-inset-bottom))}
  .v1029PinTrack{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;max-width:280px;margin:10px auto 4px}.v1029PinTrack span{height:35px;border-radius:11px;border:1px solid #544735;background:#17140f;color:#756b5b;display:grid;place-items:center;font-weight:900}.v1029PinTrack span.active{border-color:#d7b160;color:#f2dca7;box-shadow:0 0 0 2px rgba(215,177,96,.12) inset}.v1029PinTrack span.set{background:rgba(53,111,60,.42);border-color:#65db7b;color:#9dffad;box-shadow:0 0 12px rgba(86,241,117,.18)}
  .v1029LockDial{position:relative;width:min(72vw,286px);aspect-ratio:1;margin:14px auto 15px;border-radius:50%;background:radial-gradient(circle at 50% 46%,#42382c 0 16%,#171411 17% 50%,#2b251e 51% 71%,#0d0c0a 72% 100%);box-shadow:inset 0 0 0 4px #67543c,inset 0 0 30px #000,0 9px 30px rgba(0,0,0,.48);overflow:hidden}
  .v1029Arc{position:absolute;inset:4px;border-radius:50%;transform:rotate(var(--arcStart));background:conic-gradient(#62ff82 0deg var(--arcWidth),rgba(98,255,130,.22) var(--arcWidth) calc(var(--arcWidth) + 5deg),transparent calc(var(--arcWidth) + 5deg) 360deg);-webkit-mask:radial-gradient(circle,transparent 0 var(--arcInner),#000 calc(var(--arcInner) + 1%) 96%,transparent 97% 100%);mask:radial-gradient(circle,transparent 0 var(--arcInner),#000 calc(var(--arcInner) + 1%) 96%,transparent 97% 100%);filter:drop-shadow(0 0 5px #4cff73) drop-shadow(0 0 11px rgba(76,255,115,.72));pointer-events:none;transition:filter .1s ease}
  .v1029Ring{position:absolute;inset:19%;border:2px dashed rgba(231,211,169,.20);border-radius:50%}.v1029Hub{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:64px;height:64px;border-radius:50%;display:grid;place-items:center;font-size:19px;font-weight:900;color:#f4deb0;background:#15110d;border:2px solid #806a4c;box-shadow:0 0 0 6px rgba(0,0,0,.24)}
  .v1029Needle{position:absolute;left:50%;top:50%;width:2px;height:43%;transform-origin:50% 0;will-change:transform;pointer-events:none}.v1029Needle:before{content:'';position:absolute;left:-4px;top:-4px;width:10px;height:calc(100% + 11px);border-radius:8px;background:linear-gradient(#ffe49a,#c9973e);box-shadow:0 0 9px rgba(255,211,98,.62)}.v1029Needle span{position:absolute;left:-9px;top:calc(100% - 4px);width:20px;height:20px;border-radius:50%;background:#f0cf72;border:2px solid #4a381d;box-shadow:0 0 10px rgba(255,214,104,.42)}
  .v1029InZone{box-shadow:inset 0 0 0 4px #6c5b42,inset 0 0 30px #000,0 0 0 2px rgba(91,255,120,.30),0 0 26px rgba(74,255,108,.26)}.v1029InZone .v1029Arc{filter:brightness(1.35) drop-shadow(0 0 7px #68ff86) drop-shadow(0 0 18px rgba(87,255,122,.9))}.v1029InZone .v1029Needle:before{background:linear-gradient(#d7ffe0,#69ed82);box-shadow:0 0 11px #62ff82}
  .v1029Speed{text-align:center;color:#9e9078;font-size:12px;margin:-3px 0 12px}.v1029LockModal .tapButton{margin-top:0}
  `;document.head.appendChild(st);
}

if(RF.state){
  RF.migrateV1029(RF.state);
  RF.state.flags=RF.state.flags||{};
  if(!RF.state.flags.v1029Seen){RF.state.flags.v1029Seen=true;RF.log?.(RF.state,'V10.29: locks now use four sequential pins, with faster rotation and a bright target arc that moves after every successful set.','important');}
  RF.save?.(RF.state);RF.UI.render(RF.state);
}
})();
