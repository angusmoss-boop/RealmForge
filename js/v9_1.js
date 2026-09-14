window.RF=window.RF||{};
RF.VERSION='9.1.0';
RF.V91=RF.V91||{};

RF.migrateV91=function(s){
  if(!s)return s;
  s.version='9.1.0';
  s.flags=s.flags||{};
  s.stats=s.stats||{};
  if(s.stats.parries==null)s.stats.parries=0;
  if(s.stats.perfectParries==null)s.stats.perfectParries=0;
  return s;
};
const v91New=RF.newGame;RF.newGame=function(...a){return RF.migrateV91(v91New(...a))};
const v91Load=RF.load;RF.load=function(){return RF.migrateV91(v91Load())};
const v91Import=RF.importSave;RF.importSave=function(x){return RF.migrateV91(v91Import(x))};
if(RF.state)RF.migrateV91(RF.state);

// ---------- Combat focus: update in-place, never rebuild the combat popup ----------
RF.v9SetFocus=function(f){
  const s=RF.state,c=s?.combat;
  if(!c||c.phase!=='player'||!['attack','strength','defence'].includes(f))return;
  c.v9Focus=f;
  RF.save(s);
  document.querySelectorAll('[data-combat-focus]').forEach(btn=>btn.classList.toggle('active',btn.dataset.combatFocus===f));
  const label=document.querySelector('[data-focus-note]');
  if(label)label.textContent=`${RF.DATA.skills[f].name} focus selected. New combat training banks here.`;
};

// ---------- Parry: integrated into enemy damage resolution ----------
RF.v9Parry=function(){
  const s=RF.state,c=s?.combat;
  if(!c||c.phase!=='player'||!RF.combatReady())return;
  const def=s.skills.defence.level||1,atk=s.skills.attack.level||1;
  c.v9Parry={
    chance:Math.min(.88,.32+def*.022+atk*.0035),
    minReduce:Math.min(.88,.48+def*.012),
    maxReduce:Math.min(.98,.68+def*.012),
    reflect:Math.min(.72,.16+def*.021),
    perfectChance:Math.min(.36,.035+def*.011)
  };
  c.v9XpPool.defence=(c.v9XpPool.defence||0)+10;
  c.phase='resolving';
  RF.battleLog(s,'You set your feet and watch the enemy’s shoulders.','good');
  if(RF.v8BeginCombatCooldown)RF.v8BeginCombatCooldown(c);
  RF.save(s);RF.UI.render(s);
  setTimeout(()=>RF.enemyBattleTurn(),180);
};

RF.enemyBattleTurn=function(){
  let s=RF.state,c=s.combat;if(!c)return;
  let e=RF.DATA.enemies[c.id];c.phase='enemy';
  const pendingParry=c.v9Parry;c.v9Parry=null;
  let playerWasHit=false;
  if(RF.hasStatus({statuses:c.enemyStatuses},'stagger')){
    RF.battleLog(s,`${e.name} is staggered and loses its turn.`,'good');
  } else {
    if(c.id==='gravewarden'&&c.hp/c.maxHp<.5&&!c.bossPhase2){c.bossPhase2=true;RF.addStatus({statuses:c.enemyStatuses},'focused',99);RF.battleLog(s,'The Gravewarden cracks its helm open. Cold light spills through the fracture. Phase II begins.','bad')}
    if(c.id==='captain_voss'&&c.hp/c.maxHp<.4&&!c.bossPhase2){c.bossPhase2=true;RF.addStatus({statuses:c.enemyStatuses},'focused',4);RF.battleLog(s,'Voss throws away his damaged shield. “Enough games.” His attacks quicken.','bad')}
    const pool=e.moves||['bite'],mid=pool[Math.floor(Math.random()*pool.length)],m=RF.DATA.enemyMoves[mid]||RF.DATA.enemyMoves.bite;
    if(m.kind==='guard'){
      c.enemyGuard=true;RF.addStatus({statuses:c.enemyStatuses},'guard',1);RF.battleLog(s,`${e.name} uses ${m.name}.`);
      if(pendingParry)RF.battleLog(s,'The enemy does not commit to a strike. Your parry window passes unused.','bad');
    } else if(m.kind==='buff'||m.kind==='status'){
      const target=m.kind==='buff'?{statuses:c.enemyStatuses}:{statuses:c.playerStatuses};RF.addStatus(target,m.status.id,m.status.turns);RF.battleLog(s,`${e.name} uses ${m.name}. ${RF.statusName(m.status.id)} takes hold.`,'bad');
      if(pendingParry)RF.battleLog(s,'There is no physical blow to catch. Your parry finds only air.','bad');
    } else if(Math.random()<=(m.accuracy||.9)){
      let raw=(e.damage[0]+Math.random()*(e.damage[1]-e.damage[0]))*(m.power||1),armor=RF.armor(s)*.32,hit=Math.max(1,Math.round(raw-armor));
      if(c.playerGuard)hit=Math.ceil(hit*(s.specialization==='warden'?.35:.46));
      if(RF.hasStatus({statuses:c.enemyStatuses},'weakened'))hit=Math.ceil(hit*.78);
      let finalHit=hit,reflected=0,parried=false,perfect=false;
      if(pendingParry){
        const success=Math.random()<pendingParry.chance;
        if(success){
          parried=true;perfect=Math.random()<pendingParry.perfectChance;
          const reduction=perfect?1:(pendingParry.minReduce+Math.random()*Math.max(0,pendingParry.maxReduce-pendingParry.minReduce));
          const blocked=Math.min(hit,Math.max(1,Math.round(hit*reduction)));
          finalHit=Math.max(0,hit-blocked);
          reflected=Math.max(1,Math.round(blocked*pendingParry.reflect+(s.skills.defence.level||1)*.32));
          c.hp-=reflected;s.stats.parries++;if(perfect)s.stats.perfectParries++;
          c.v9XpPool.defence=(c.v9XpPool.defence||0)+(perfect?16:8);
          RF.battleLog(s,perfect?`✨ PERFECT PARRY! ${hit} damage erased and ${reflected} damage returned.`:`🛡️ Parry! ${blocked} damage stopped, ${finalHit} gets through, and ${reflected} is deflected back.`,'good');
        } else RF.battleLog(s,'Parry mistimed. The attack comes through at full force.','bad');
      }
      if(finalHit>0){s.player.hp-=finalHit;playerWasHit=true;RF.battleLog(s,`${e.name} uses ${m.name} for ${finalHit} damage.`,'bad')}
      else if(!parried)RF.battleLog(s,`${e.name} uses ${m.name}, but deals no damage.`,'good');
      if(m.status&&finalHit>0&&Math.random()<(m.status.chance||1))RF.addStatus({statuses:c.playerStatuses},m.status.id,m.status.turns);
      if(m.drain&&finalHit>0){c.hp=Math.min(c.maxHp,c.hp+Math.ceil(finalHit*.5));RF.battleLog(s,`${e.name} drains vitality.`,'bad')}
      if(c.riposte&&finalHit>0){let ret=Math.max(3,Math.round((RF.weaponDamage(s)+s.skills.defence.level)*.8));c.hp-=ret;RF.battleLog(s,`Riposte returns ${ret} damage.`,'good')}
      if(c.hp<=0)return RF.winCombat();
    } else {
      RF.battleLog(s,`${e.name}'s ${m.name} misses.`,'good');
      if(pendingParry)RF.battleLog(s,'You hold the parry, but the attack misses before it reaches you.','good');
    }
  }
  c.playerGuard=false;c.riposte=false;
  RF.tickStatuses(s,{statuses:c.playerStatuses},'player');
  if(s.player.hp<=0)return RF.loseV4Battle();if(c.hp<=0)return RF.winCombat();
  Object.keys(c.cooldowns).forEach(k=>c.cooldowns[k]=Math.max(0,c.cooldowns[k]-1));c.turn++;c.phase='player';
  s.player.stamina=Math.min(s.player.maxStamina,s.player.stamina+8+(s.companion?2:0));
  if(s.companion&&Math.random()<.42)RF.companionAssist(s);
  RF.save(s);RF.UI.render(s);
  if(playerWasHit)requestAnimationFrame(()=>{const el=document.querySelector('.playerPane');if(!el)return;el.classList.remove('combatImpactPlayer');void el.offsetWidth;el.classList.add('combatImpactPlayer')});
};

// Improve combat copy without changing the rest of the battle layout.
const v91CombatPopupBase=RF.UI.combatPopup.bind(RF.UI);
RF.UI.combatPopup=function(s){
  let h=v91CombatPopupBase(s),c=s.combat;if(!c)return h;
  h=h.replace('<div class="sub">Training XP is banked during battle and awarded when you win. Losing keeps only 25%.</div>','<div class="sub" data-focus-note>Training XP is banked during battle and awarded when you win. Losing keeps only 25%.</div>');
  const def=s.skills.defence.level||1;
  const chance=Math.round(Math.min(.88,.32+def*.022+(s.skills.attack.level||1)*.0035)*100);
  const reflect=Math.round(Math.min(.72,.16+def*.021)*100);
  h=h.replace(/<small>Defence training • Chance to prevent damage and deflect part of the strike\.<\/small>/,`<small>Defence training • ~${chance}% catch chance • reflected force scales with Defence (~${reflect}% of blocked force).</small>`);
  return h;
};

// ---------- Nearby enemies: inspect first, Fight / Leave in a popup ----------
RF.UI.nearbyEnemies=function(s){
  const list=RF.refreshEncounters(s);if(!RF.fieldTables[s.location])return'';
  return `<section class="card"><div class="questTitle"><h3>Nearby Creatures</h3><span class="tag">WILD AREA</span></div><div class="sub">Tap a creature to inspect it. You choose whether to engage unless it ambushes you.</div><div class="list" style="margin-top:9px">${list.length?list.map(x=>{let e=RF.DATA.enemies[x.id],seen=s.collection.enemies[x.id]>0;return `<button class="enemyInspectRow" data-enemy-inspect="${x.uid}" ${s.activity||s.combat?'disabled':''}><span class="enemyInspectIcon">${e.icon}</span><span class="enemyInspectMeta"><b>${seen?e.name:'Unknown '+e.icon} • Lv ${e.level}</b><small>${e.temperament||'Hostile'} • ${seen?`${s.collection.enemies[x.id]} defeated`:'Not yet recorded'}</small></span><span class="chev">›</span></button>`}).join(''):'<div class="sub">The area is unusually quiet.</div>'}</div></section>`;
};
RF.v91OpenEnemy=function(uid){
  const s=RF.state,list=RF.refreshEncounters(s),spot=list.find(x=>x.uid===uid);if(!spot)return;
  RF.UI.modal={type:'enemyInspect',uid,id:spot.id};RF.UI.render(s);
};
const v91FightBase=RF.fightNearby;RF.fightNearby=function(uid){RF.UI.modal=null;return v91FightBase(uid)};
const v91ModalBase=RF.UI.modalHtml.bind(RF.UI);
RF.UI.modalHtml=function(s){
  const m=this.modal;
  if(m?.type==='enemyInspect'){
    const list=RF.refreshEncounters(s),spot=list.find(x=>x.uid===m.uid),e=RF.DATA.enemies[m.id];
    if(!spot||!e){this.modal=null;return''}
    const seen=(s.collection.enemies[m.id]||0)>0,research=s.v7?.research?.[m.id]?.level||0,moves=(e.moves||[]).slice(0,5).map(id=>RF.DATA.enemyMoves[id]?.name||id).join(' • ');
    return `<div class="modalBack"><div class="modal enemyInspectModal"><div class="enemyInspectHero">${e.icon}</div><span class="eyebrow">WILD ENCOUNTER • ${e.temperament||'Hostile'}</span><h2>${seen?e.name:'Unidentified Creature'} • Lv ${e.level}</h2><div class="itemDesc">${e.desc||'You watch the creature from a cautious distance.'}</div><div class="enemyFacts"><span>❤️ ${e.hp} HP</span><span>🛡️ ${e.armor||0} armour</span><span>📓 Research ${research}/3</span></div>${moves?`<div class="sub" style="margin-top:10px">Known/possible techniques: ${moves}</div>`:''}<div class="choices"><button class="choice dangerChoice" data-enemy-fight="${m.uid}"><b>⚔️ Fight</b><small>Enter tactical combat.</small></button>${RF.researchEnemy?`<button class="choice" data-enemy-observe="${m.id}"><b>📓 Observe</b><small>Study it instead. Observation can occasionally provoke an attack.</small></button>`:''}<button class="choice" data-enemy-leave><b>Leave it alone</b><small>Remain in the area without engaging.</small></button></div></div></div>`;
  }
  return v91ModalBase(s);
};

// ---------- Weather/time-responsive world scene ----------
const v91WorldBase=RF.UI.world.bind(RF.UI);
RF.UI.world=function(s){
  let h=v91WorldBase(s),w=String(s.weather||'Clear').toLowerCase(),hour=RF.hour?RF.hour(s):Math.floor(s.minute/60)%24;
  const phase=hour<6?'night':hour<8?'dawn':hour<18?'day':hour<20?'dusk':'night';
  const weatherClass=['rain','storm','fog','cloudy','clear'].includes(w)?w:'clear';
  h=h.replace('<div class="scene">',`<div class="scene weather-${weatherClass} time-${phase}"><div class="skyFx" aria-hidden="true"><i></i><i></i><i></i></div>`);
  return h;
};

const v91BindBase=RF.UI.bind.bind(RF.UI);
RF.UI.bind=function(s){
  v91BindBase(s);
  document.querySelectorAll('[data-enemy-inspect]').forEach(b=>b.onclick=()=>RF.v91OpenEnemy(b.dataset.enemyInspect));
  document.querySelectorAll('[data-enemy-fight]').forEach(b=>b.onclick=()=>RF.fightNearby(b.dataset.enemyFight));
  document.querySelectorAll('[data-enemy-observe]').forEach(b=>b.onclick=()=>{RF.UI.modal=null;RF.researchEnemy(b.dataset.enemyObserve)});
  document.querySelectorAll('[data-enemy-leave]').forEach(b=>b.onclick=()=>{RF.UI.modal=null;RF.UI.render(RF.state)});
};

if(RF.state){
  RF.migrateV91(RF.state);
  if(!RF.state.flags.v91Seen){RF.state.flags.v91Seen=true;RF.log(RF.state,'V9.1: Parry rebuilt, focus switching is seamless, wild enemies are inspect-first, and the world scene now reacts to weather.','important');RF.save(RF.state)}
  RF.UI.render(RF.state);
}
