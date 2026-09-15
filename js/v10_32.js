window.RF=window.RF||{};
RF.VERSION='10.32.0';

/* Realmforge V10.32 — Clean Run
   - Lockpicking now demands four consecutive pin successes.
   - Letting the rotating pick pass completely through the green window without turning counts as a miss.
   - Any miss breaks one Lockpick and resets current pin progress to 0/4.
   - Exploration chests retain the existing three-failure permanent jam rule.
   - Greenvale burglary locks now jam after three lock failures, ending the attempt and refreshing that property’s 24-hour cooldown.
*/
(function(){
'use strict';
const RF=window.RF;if(!RF?.V1031||!RF?.V1029||!RF?.V1027)return;
RF.V1032=RF.V1032||{};RF.V1032.version='10.32.0';

RF.V1032.resetPassTracking=function(g){
  if(!g)return;
  g.v1032WasInZone=false;
  g.v1032EnteredZone=false;
  g.v1032HandlingMiss=false;
};
RF.V1032.reseedTarget=function(g,angle){
  if(!g)return;
  const here=Number.isFinite(angle)?angle:(Number.isFinite(g.lastVisualAngle)?g.lastVisualAngle:RF.V1027.angle(g));
  const old=g.target;
  let t=RF.V1029.randomTargetAway?RF.V1029.randomTargetAway(old):RF.V1027.randomTarget();
  const clearance=Math.min(100,Math.max(42,(g.tolerance||20)+26));
  for(let i=0;i<14&&RF.V1027.angleDiff(t,here)<clearance;i++)t=RF.V1029.randomTargetAway?RF.V1029.randomTargetAway(t):RF.V1027.randomTarget();
  g.target=t;
  g.startAngle=here;
  g.lastVisualAngle=here;
  g.started=Date.now();
  RF.V1032.resetPassTracking(g);
};

// Every newly opened lock starts with a fair approach to the first target rather than spawning inside it.
const v1032StartBase=RF.V1027.startLock.bind(RF.V1027);
RF.V1027.startLock=function(opts){
  const ok=v1032StartBase(opts),g=RF.actionGame;
  if(ok&&g?.type==='v1027Lock'){
    g.pinStage=0;g.pinRequired=4;g.v1032LockFailures=0;
    RF.V1032.reseedTarget(g,Number.isFinite(g.lastVisualAngle)?g.lastVisualAngle:g.startAngle);
    g.message='Set four pins consecutively. If the green binding window passes without a successful turn, the sequence resets.';
    RF.UI.render(RF.state);RF.V1027.startTicker();
  }
  return ok;
};

// A successful pin still relocates the target, but make sure the next target is safely ahead of the current pick.
const v1032NextPinBase=RF.V1029.setNextPin.bind(RF.V1029);
RF.V1029.setNextPin=function(g,angle){
  v1032NextPinBase(g,angle);
  RF.V1032.reseedTarget(g,Number.isFinite(angle)?angle:g.lastVisualAngle);
};

// Final failure wrapper: every kind of miss resets the four-pin streak.
const v1032FailBase=RF.V1029.failLock.bind(RF.V1029);
RF.V1029.failLock=function(s,g){
  if(!s||g?.type!=='v1027Lock')return v1032FailBase(s,g);
  const reason=g.v1032FailureReason||'turn';g.v1032FailureReason=null;
  const lostPins=Math.max(0,g.pinStage||0);
  g.pinStage=0;
  const out=v1032FailBase(s,g);

  // The underlying failure can already have ended the session through detection, no picks, or a chest jam.
  if(RF.actionGame!==g)return out;

  // Burglary doors now share a three-strike jam rule, but the property recovers after its normal one-day cooldown.
  if(g.context==='burglary'&&(g.burglaryFails||0)>=3){
    const site=g.site;s.stats=s.stats||{};s.stats.burglaryLocksJammed=(s.stats.burglaryLocksJammed||0)+1;
    if(site&&RF.V1030?.isGreenvaleSite(site))RF.V1031.setCooldown(s,site,true);
    RF.log?.(s,`${site?.name||'A burglary target'}: the door lock jams after three failed picks.`,'bad');
    return RF.V1027.resume({type:'message',title:'Door Lock Jammed',text:`The third failed pick drives the pins out of alignment. ${site?.name||'The property'} is too hot to work now. Its lock will be usable again after the 24-hour burglary cooldown.`});
  }

  const angle=Number.isFinite(g.lastVisualAngle)?g.lastVisualAngle:RF.V1027.angle(g);
  RF.V1032.reseedTarget(g,angle);
  const picks=RF.V1027.pickCount(s),ch=g.context==='chest'?RF.V1025?.chestAt(s,g.location):null;
  const failCount=ch?`${ch.failures||0}/3`:g.context==='burglary'?`${g.burglaryFails||0}/3`:null;
  const why=reason==='pass'?'⏱️ The binding window slipped past untouched.':'💥 The turn missed the binding window.';
  g.message=`${why} ${lostPins?`Your ${lostPins}/4 pin streak is lost. `:''}Progress resets to 0/4. One Lockpick snaps.${failCount?` Failures ${failCount}.`:''} ${picks} pick${picks===1?'':'s'} remain.`;
  RF.save?.(s);RF.UI.render(s);RF.V1027.startTicker();
  return out;
};

// Called when the moving pick enters and then fully exits the green target without the player turning it.
RF.V1032.passMiss=function(s,g){
  if(!s||RF.actionGame!==g||g?.type!=='v1027Lock'||g.v1032HandlingMiss)return;
  g.v1032HandlingMiss=true;g.v1032FailureReason='pass';RF.V1027.stopTicker();
  try{return RF.V1029.failLock(s,g)}finally{if(RF.actionGame===g)g.v1032HandlingMiss=false;}
};

// Live lock ticker now watches the target crossing itself. Merely waiting for another lap is a failed pick.
RF.V1027.startTicker=function(){
  RF.V1027.stopTicker();RF.V1027.timer=setInterval(()=>{
    const s=RF.state,g=RF.actionGame;if(!g||g.type!=='v1027Lock'){RF.V1027.stopTicker();return;}
    const ang=RF.V1027.angle(g);g.lastVisualAngle=ang;
    const el=document.querySelector('.v1029Needle,.v1027Needle');if(el)el.style.transform=`rotate(${ang}deg)`;
    const inZone=RF.V1027.angleDiff(ang,g.target)<=g.tolerance+1.8;
    const dial=document.querySelector('.v1029LockDial');if(dial)dial.classList.toggle('v1029InZone',inZone);
    if(g.v1032HandlingMiss)return;
    if(inZone&&!g.v1032WasInZone)g.v1032EnteredZone=true;
    if(!inZone&&g.v1032WasInZone&&g.v1032EnteredZone){
      g.v1032WasInZone=false;g.v1032EnteredZone=false;RF.V1032.passMiss(s,g);return;
    }
    g.v1032WasInZone=inZone;
  },20);
};

// Clarify the harsher four-in-a-row rule and show burglary lock jams as an explicit /3 counter.
const v1032ActionModalBase=RF.UI.v7ActionModal.bind(RF.UI);
RF.UI.v7ActionModal=function(s,g){
  if(g?.type!=='v1027Lock')return v1032ActionModalBase(s,g);
  let h=v1032ActionModalBase(s,g);
  if(g.context==='burglary')h=h.replace(/Quiet failures\s+\d+/g,`Lock failures ${g.burglaryFails||0}/3`);
  h=h.replace(/Set all four pins\. The bright green arc is the exact hit zone and moves after each successful pin\. A miss snaps one Lockpick(?:; three total misses permanently jam this chest)?\./,
    `Set all four pins consecutively. If you press outside the green arc, or let the green window pass without turning, one Lockpick breaks and progress resets to 0/4.${g.context==='chest'?' Three failures permanently jam this chest.':g.context==='burglary'?' Three lock failures jam the door and end this burglary attempt.':''}`);
  return h;
};

// Chest preface should match the new mandatory-window rule too.
const v1032ModalBase=RF.UI.modalHtml.bind(RF.UI);
RF.UI.modalHtml=function(s){
  let h=v1032ModalBase(s);
  if(this.modal?.type==='v1025Chest'){
    h=h.replace(/The lock has four pins\.[\s\S]*?permanently jam this chest\./,
      'The lock has four pins and they must be set consecutively. Letting a green window pass, or turning outside it, snaps one Lockpick and resets progress to 0/4. Three failures permanently jam this chest.');
  }
  return h;
};

RF.migrateV1032=function(s){
  if(!s)return s;s.version='10.32.0';s.v1032=s.v1032||{};s.stats=s.stats||{};
  const g=RF.actionGame;if(g?.type==='v1027Lock'){
    g.pinStage=0;g.pinRequired=4;g.v1032LockFailures=0;RF.V1032.reseedTarget(g,Number.isFinite(g.lastVisualAngle)?g.lastVisualAngle:g.startAngle);
    g.message='Lock rules updated: four consecutive pins are required. Missing or ignoring a green window resets the sequence.';
  }
  return s;
};
const v1032New=RF.newGame;RF.newGame=function(...a){return RF.migrateV1032(v1032New(...a))};
const v1032Load=RF.load;RF.load=function(){return RF.migrateV1032(v1032Load())};
const v1032Import=RF.importSave;RF.importSave=function(x){return RF.migrateV1032(v1032Import(x))};
if(RF.V95){RF.V95.SCHEMA='10.32.0';const oldMig=RF.V95.migrate.bind(RF.V95);RF.V95.migrate=s=>RF.migrateV1032(oldMig(s));}

if(RF.state){
  RF.migrateV1032(RF.state);RF.state.flags=RF.state.flags||{};
  if(!RF.state.flags.v1032Seen){RF.state.flags.v1032Seen=true;RF.log?.(RF.state,'V10.32: lockpicking now requires four consecutive pins; letting a target window pass counts as a failed pick, and burglary door locks jam after three lock failures.','important');}
  RF.save?.(RF.state);RF.UI.render(RF.state);
}
})();
