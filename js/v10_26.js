window.RF=window.RF||{};
RF.VERSION='10.26.0';

/* Realmforge V10.26 — Explorer's Pace
   - Fixes combat leaving the world clock paused after non-travel battles, including Explore enemy encounters.
   - Repairs already-stalled 0% Explore activities from the affected save state.
   - Explore now costs a modest amount of Energy, scaling down with Exploration mastery.
*/

(function(){
'use strict';
const RF=window.RF;if(!RF)return;
RF.V1026=RF.V1026||{};
RF.V1026.version='10.26.0';

// ---------- Exploration Energy ----------
// Exploring is a timed, whole-body action rather than a repeated tap skill. The cost is paid
// once when the search begins. Early explorers spend 5 Energy; experience makes route-finding,
// climbing and searching more efficient, bottoming out at 2 Energy per expedition.
RF.V1026.exploreEnergyCost=function(s=RF.state){
  const lv=Math.max(1,Number(s?.skills?.exploration?.level)||1);
  if(lv>=30)return 2;
  if(lv>=15)return 3;
  if(lv>=5)return 4;
  return 5;
};

const v1026ActionBase=RF.action;
RF.action=function(a){
  if(a!=='explore')return v1026ActionBase?.apply(this,arguments);
  const s=RF.state;if(!s||s.activity||s.combat||RF.actionGame)return;
  const cost=RF.V1026.exploreEnergyCost(s);
  if((s.player?.energy||0)<cost){
    RF.UI.modal={type:'message',title:'Too Tired to Explore',text:`A proper search here costs ${cost} Energy. You currently have ${Math.floor(s.player?.energy||0)}. Rest, use a campfire, or let world time pass before heading out again.`};
    RF.UI.render(s);return false;
  }
  if(typeof RF.v10SpendEnergy==='function'){
    if(!RF.v10SpendEnergy(s,cost))return false;
  }else{
    s.player.energy=Math.max(0,(s.player.energy||0)-cost);
    s.stats=s.stats||{};s.stats.energySpent=(s.stats.energySpent||0)+cost;
  }
  s.stats=s.stats||{};s.stats.exploreEnergySpent=(s.stats.exploreEnergySpent||0)+cost;
  const l=RF.DATA.locations?.[s.location];
  RF.startActivity('explore',`Exploring ${l?.name||'the area'}`,13,{v1026EnergyCost:cost});
  RF.save?.(s);
  return true;
};

// Keep V10.25's richer Explore card, but make the Energy cost visible before committing.
const v1026ActionButtonBase=RF.UI.actionButton.bind(RF.UI);
RF.UI.actionButton=function(a,s){
  if(a==='explore'){
    const cost=RF.V1026.exploreEnergyCost(s),en=Math.floor(s.player?.energy||0),tired=en<cost;
    return `<button class="action primary" data-action="explore" ${s.activity||s.combat?'disabled':''}><span class="emoji">🧭</span><b>Explore</b><small>⚡ ${cost} Energy • People • danger • events • rare finds${tired?' • Too tired':''}</small></button>`;
  }
  return v1026ActionButtonBase(a,s);
};

// ---------- Combat clock ownership ----------
// Combat has always stopped simulated time, but the original battle code did not remember the
// clock it interrupted. If combat began from an auto-paused encounter modal, V9.6 correctly gave
// up ownership of that pause while battle was active, leaving no clock state to restore on victory.
// Capture it on entry and restore it on every exit path. Travel combat is already handled by V10.17.
RF.V1026.captureClock=function(s){
  if(typeof RF.V1017?.captureRunningClock==='function')return RF.V1017.captureRunningClock(s);
  if(typeof RF.v96CaptureClock==='function')return RF.v96CaptureClock(s);
  let speed=[0,1,2].includes(+s?.speed)?+s.speed:1;
  return {speed,paused:!!s?.paused||speed===0,boostRemaining:speed===2&&s?.v8?Math.max(0,(s.v8.boostUntil||0)-Date.now()):0};
};
RF.V1026.restoreClock=function(s,snap){
  if(!s||!snap)return;
  if(typeof RF.V1017?.applyTravelClock==='function')return RF.V1017.applyTravelClock(s,snap);
  if(typeof RF.v96RestoreClock==='function'&&!s.combat&&!RF.actionGame){
    if(RF.UI.modal&&RF.V96){RF.V96.modalResume={...snap};RF.V96.modalPaused=true;RF.V96.modalWasOpen=true;s.speed=0;s.paused=true;return;}
    return RF.v96RestoreClock(s,snap);
  }
  let speed=snap.paused?0:(snap.speed||1);if(![0,1,2].includes(speed))speed=1;
  s.speed=speed;s.paused=speed===0;
};

const v1026StartBattleBase=RF.startBattle;
RF.startBattle=function(id,opts={}){
  const s=RF.state;
  const fromTravel=!!(s?.activity?.type==='travel');
  const snap=RF.V1026.captureClock(s);
  const out=v1026StartBattleBase?.apply(this,arguments);
  if(RF.state?.combat){
    RF.state.combat.v1026ResumeClock=snap;
    RF.state.combat.v1026FromTravel=fromTravel;
  }
  return out;
};

const v1026WinBase=RF.winCombat;
RF.winCombat=function(){
  const c=RF.state?.combat;
  const snap=c?.v1026ResumeClock?{...c.v1026ResumeClock}:null;
  const fromTravel=!!c?.v1026FromTravel;
  const out=v1026WinBase?.apply(this,arguments);
  const s=RF.state;
  // V10.17 restores the road itself. For every ordinary battle, restore the interrupted clock.
  if(s&&!s.combat&&snap&&!fromTravel)RF.V1026.restoreClock(s,snap);
  return out;
};

const v1026FleeBase=RF.fleeV4;
if(typeof v1026FleeBase==='function')RF.fleeV4=function(){
  const c=RF.state?.combat;
  const snap=c?.v1026ResumeClock?{...c.v1026ResumeClock}:null;
  const fromTravel=!!c?.v1026FromTravel;
  const out=v1026FleeBase.apply(this,arguments);
  const s=RF.state;
  if(s&&!s.combat&&snap&&!fromTravel)RF.V1026.restoreClock(s,snap);
  return out;
};

const v1026LoseBase=RF.loseV4Battle;
if(typeof v1026LoseBase==='function')RF.loseV4Battle=function(){
  const c=RF.state?.combat;
  const snap=c?.v1026ResumeClock?{...c.v1026ResumeClock}:null;
  const out=v1026LoseBase.apply(this,arguments);
  const s=RF.state;
  // Defeat abandons any suspended road, so even travel-started combat needs the normal clock back.
  if(s&&!s.combat&&snap)RF.V1026.restoreClock(s,snap);
  return out;
};

// ---------- Save repair / migration ----------
RF.migrateV1026=function(s){
  if(!s)return s;
  s.version='10.26.0';s.stats=s.stats||{};s.v1026=s.v1026||{};
  if(s.stats.exploreEnergySpent==null)s.stats.exploreEnergySpent=0;

  // Repair the exact state produced by the reported bug: a freshly-started Explore activity at
  // 0% with no combat/modal owner, while the inherited battle pause is still latched on the save.
  const a=s.activity;
  if(a?.type==='explore'&&(Number(a.progress)||0)<=0.001&&+s.speed===0&&s.paused&&!s.combat){
    s.speed=1;s.paused=false;s.v1026.repairedExplorePause=true;
    RF.V1016?.resetUIPause?.(s);
  }
  return s;
};

const v1026New=RF.newGame;RF.newGame=function(...a){return RF.migrateV1026(v1026New(...a))};
const v1026Load=RF.load;RF.load=function(){return RF.migrateV1026(v1026Load())};
const v1026Import=RF.importSave;RF.importSave=function(x){return RF.migrateV1026(v1026Import(x))};
if(RF.V95){
  RF.V95.SCHEMA='10.26.0';
  const oldMig=RF.V95.migrate.bind(RF.V95);
  RF.V95.migrate=function(s){return RF.migrateV1026(oldMig(s))};
}

if(RF.state){
  RF.migrateV1026(RF.state);
  if(!RF.state.flags?.v1026Seen){
    RF.state.flags=RF.state.flags||{};RF.state.flags.v1026Seen=true;
    RF.log?.(RF.state,`V10.26: Explore now costs ${RF.V1026.exploreEnergyCost(RF.state)} Energy at your current Exploration level, and combat correctly returns the world clock to its previous speed.`,'important');
  }
  RF.save?.(RF.state);RF.UI.render?.(RF.state);
}
})();
