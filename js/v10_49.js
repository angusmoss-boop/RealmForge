window.RF=window.RF||{};
RF.VERSION='10.49.0';
RF.BUILD={
  version:'10.49.0',
  title:'Unknown Entity',
  built:'16 Sep 2026 • 23:59 BST',
  buildId:'20260916-2359-bst'
};
RF.V1049=RF.V1049||{};

/* Realmforge V10.49 — Unknown Entity
   - Unresearched wildlife keeps its visible emoji/silhouette while its identity stays concealed.
   - "Unknown Creature" becomes "Unknown Entity" across field research, encounters and combat.
   - Tactical combat hides enemy armour/identity data until Research 3/3.
   - Fully identified enemies now show both Attack rating and Armour in combat.
*/

(()=>{
'use strict';
const V=RF.V1049;
const F=RF.V1048;
V.UNKNOWN='Unknown Entity';

V.migrate=function(s){
  if(!s)return s;
  s.version='10.49.0';
  s.v1049=s.v1049||{};
  return s;
};
const oldNew=RF.newGame;RF.newGame=function(...a){return V.migrate(oldNew(...a))};
const oldLoad=RF.load;RF.load=function(){return V.migrate(oldLoad())};
const oldImport=RF.importSave;RF.importSave=function(x){return V.migrate(oldImport(x))};
if(RF.V95){
  RF.V95.SCHEMA='10.49.0';
  const om=RF.V95.migrate.bind(RF.V95);
  RF.V95.migrate=s=>V.migrate(om(s));
}

V.identified=(s,id)=>F?.identified?F.identified(s,id):((s?.v7?.research?.[id]?.level||0)>=3);
V.rank=(s,id)=>F?.rank?F.rank(s,id):Math.max(0,Number(s?.v7?.research?.[id]?.level)||0);
V.escape=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
V.escapeRegex=v=>String(v??'').replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
V.attackRating=function(e){
  if(!e)return 0;
  const r=RF.v107EnemyDamageRange?.(e)||e.damage||[1,2];
  return Math.max(1,Math.round(((Number(r[0])||1)+(Number(r[1])||2))/2));
};
V.sanitiseName=function(s,text,id){
  const e=RF.DATA.enemies?.[id];
  if(!e||V.identified(s,id))return text;
  return String(text??'').split(e.name).join(V.UNKNOWN);
};
if(F)F.unknownName=V.UNKNOWN;

// ---------- Nearby Creatures ----------
RF.UI.nearbyEnemies=function(s){
  const list=RF.refreshEncounters(s);if(!RF.fieldTables?.[s.location])return'';
  return `<section class="card"><div class="questTitle"><h3>Nearby Creatures</h3><span class="tag">WILD AREA</span></div><div class="sub">Creature identity and field data are revealed only after Research reaches 3/3.</div><div class="list" style="margin-top:9px">${list.length?list.map(x=>{
    const e=RF.DATA.enemies[x.id],known=V.identified(s,x.id),rank=V.rank(s,x.id),kills=s.collection?.enemies?.[x.id]||0;
    if(known)return `<button class="enemyInspectRow" data-enemy-inspect="${x.uid}" ${s.activity||s.combat?'disabled':''}><span class="enemyInspectIcon">${e.icon}</span><span class="enemyInspectMeta"><b>${V.escape(e.name)} • Lv ${e.level}</b><small>${V.escape(e.temperament||'Hostile')} • ${kills} defeated • Research 3/3</small></span><span class="chev">›</span></button>`;
    return `<button class="enemyInspectRow v1049UnknownEntity" data-enemy-inspect="${x.uid}" ${s.activity||s.combat?'disabled':''}><span class="enemyInspectIcon">${e.icon}</span><span class="enemyInspectMeta"><b>${V.UNKNOWN}</b><small>Research ${rank}/3 • Identity not established</small></span><span class="chev">›</span></button>`;
  }).join(''):'<div class="sub">The area is unusually quiet.</div>'}</div></section>`;
};

// ---------- Field Research ----------
if(F){
  F.fieldResearchHtml=function(s){
    const research=(RF.refreshEncounters(s)||[]).slice(0,3);
    if(!research.length)return'';
    return `<section class="card"><h3>📓 Field Research</h3><div class="sub">Observe nearby entities to build a reliable identification. Names and creature data unlock only at Research 3/3.</div><div class="list" style="margin-top:8px">${research.map(x=>{
      const e=RF.DATA.enemies[x.id],rank=V.rank(s,x.id),known=V.identified(s,x.id);
      return `<div class="row ${known?'':'v1049UnknownResearch'}"><div class="icon">${e.icon}</div><div class="meta"><b>${known?V.escape(e.name):V.UNKNOWN}</b><small>Research ${rank}/3${known?' • Identification complete':' • Identity concealed'}</small></div>${known?'<button disabled>Complete</button>':`<button data-research="${x.id}">Observe</button>`}</div>`;
    }).join('')}</div></section>`;
  };
}

// ---------- Research result wording ----------
const researchBase=RF.researchEnemy;
if(researchBase)RF.researchEnemy=function(id){
  const out=researchBase.apply(this,arguments);
  const m=RF.UI.modal;
  if(m?.type==='message'&&m.title==='Research: Unknown Creature')m.title='Research: Unknown Entity';
  return out;
};

// ---------- Encounter / result modal icon and wording ----------
const modalBase=RF.UI.modalHtml.bind(RF.UI);
RF.UI.modalHtml=function(s){
  const m=this.modal;
  let h=modalBase(s);
  if(!h)return h;
  if((m?.type==='enemyInspect'||m?.type==='v1025Enemy')&&m.id&&!V.identified(s,m.id)){
    const e=RF.DATA.enemies?.[m.id];
    if(e){
      h=h.replace(/Unknown Creature/g,V.UNKNOWN);
      h=h.replace(/UNIDENTIFIED WILD ENCOUNTER/g,'UNIDENTIFIED WILD ENTITY');
      h=h.replace(/UNIDENTIFIED DANGER/g,'UNIDENTIFIED ENTITY');
      h=h.replace(/❔/g,e.icon);
    }
  }
  if(m?.type==='v10BattleSummary'&&m.enemy&&!V.identified(s,m.enemy)){
    const e=RF.DATA.enemies?.[m.enemy];
    if(e)h=h.replace(new RegExp(V.escapeRegex(e.name),'g'),V.UNKNOWN);
  }
  return h;
};

// ---------- Combat secrecy ----------
const combatBase=RF.UI.combatPopup.bind(RF.UI);
RF.UI.combatPopup=function(s){
  let h=combatBase(s);
  const c=s?.combat,e=c&&RF.DATA.enemies?.[c.id];
  if(!h||!c||!e)return h;
  const known=V.identified(s,c.id),rank=V.rank(s,c.id);
  const armourHtml=`<div class="v1035Resource">🛡️ ${e.armor||0} ARMOUR</div>`;
  if(!known){
    h=h.split(e.name).join(V.UNKNOWN);
    h=h.replace(`<small>Lv ${e.level} • ${e.temperament||'hostile'}</small>`,`<small>Identity not established • Research ${rank}/3</small>`);
    h=h.replace(armourHtml,`<div class="v1035Resource v1049UnknownCombatStat">📓 Research ${rank}/3</div>`);
  }else{
    const attack=V.attackRating(e);
    h=h.replace(armourHtml,`<div class="v1049EnemyStats"><span>⚔️ ${attack} ATTACK</span><span>🛡️ ${e.armor||0} ARMOUR</span></div>`);
  }
  return h;
};

// Ensure stored combat/world messages cannot reveal an unidentified enemy name.
const battleLogBase=RF.battleLog;
if(battleLogBase)RF.battleLog=function(s,text,type){
  if(s?.combat?.id)text=V.sanitiseName(s,text,s.combat.id);
  return battleLogBase.call(this,s,text,type);
};
const logBase=RF.log;
if(logBase)RF.log=function(s,text,type){
  text=String(text??'').replace(/Unknown Creature/g,V.UNKNOWN).replace(/unidentified creature/gi,'unidentified entity');
  if(s?.combat?.id)text=V.sanitiseName(s,text,s.combat.id);
  return logBase.call(this,s,text,type);
};

const loseBase=RF.loseV4Battle;
if(loseBase)RF.loseV4Battle=function(){
  const before=RF.state,id=before?.combat?.id,known=id?V.identified(before,id):true,e=id&&RF.DATA.enemies?.[id];
  const out=loseBase.apply(this,arguments),s=RF.state;
  if(!known&&e&&Array.isArray(s?.log)){
    s.log=s.log.map(entry=>entry&&typeof entry.text==='string'?{...entry,text:entry.text.split(e.name).join(V.UNKNOWN)}:entry);
    RF.save?.(s);
  }
  return out;
};

const startBattleBase=RF.startBattle;
if(startBattleBase)RF.startBattle=function(id,opts){
  const out=startBattleBase.apply(this,arguments),s=RF.state;
  if(s?.combat?.id===id&&!V.identified(s,id)){
    s.combat.log=(s.combat.log||[]).map(x=>{
      if(typeof x==='string')return V.sanitiseName(s,x,id);
      if(x&&typeof x.text==='string')return {...x,text:V.sanitiseName(s,x.text,id)};
      return x;
    });
    RF.save?.(s);
  }
  return out;
};

// Identified encounter detail gains the same Attack rating used by combat.
const modal2Base=RF.UI.modalHtml.bind(RF.UI);
RF.UI.modalHtml=function(s){
  let h=modal2Base(s),m=this.modal;
  if(m?.type==='enemyInspect'&&m.id&&V.identified(s,m.id)){
    const e=RF.DATA.enemies?.[m.id];
    if(e&&h.includes('enemyFacts')){
      const armour=`<span>🛡️ ${e.armor||0} armour</span>`;
      if(h.includes(armour))h=h.replace(armour,`<span>⚔️ ${V.attackRating(e)} attack</span>${armour}`);
    }
  }
  return h;
};

const oldStyle=document.getElementById('v1049-unknown-entity-style');if(oldStyle)oldStyle.remove();
const st=document.createElement('style');st.id='v1049-unknown-entity-style';st.textContent=`
.v1049UnknownEntity .enemyInspectIcon,.v1049UnknownResearch .icon{filter:none!important;opacity:1!important}
.v1049UnknownEntity .enemyInspectMeta b,.v1049UnknownResearch .meta b{color:#d8c9ac}
.v1049EnemyStats{display:flex;align-items:center;gap:10px;flex-wrap:wrap;color:#b8ab94;font-size:10px;margin-top:7px}
.v1049EnemyStats span{display:inline-flex;align-items:center;gap:3px}
.v1049UnknownCombatStat{color:#a99b84}
`;
document.head.appendChild(st);

if(RF.state){V.migrate(RF.state);RF.save?.(RF.state);setTimeout(()=>{if(RF.state&&!RF.V101?.mainMenu)RF.UI.render(RF.state)},0)}
})();
