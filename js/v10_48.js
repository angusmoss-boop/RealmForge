window.RF=window.RF||{};
RF.VERSION='10.48.0';
RF.BUILD={
  version:'10.48.0',
  title:'Field Identification',
  built:'16 Sep 2026 • 23:42 BST',
  buildId:'20260916-2342-bst'
};
RF.V1048=RF.V1048||{};

/* Realmforge V10.48 — Field Identification
   - Creature identity and combat/reference data remain hidden until Field Research reaches 3/3.
   - Nearby Creatures and Field Research show unidentified creatures while research is incomplete.
   - The Database bestiary contains only fully researched creatures.
*/

(()=>{
'use strict';
const V=RF.V1048;
V.REQUIRED_RESEARCH=3;
V.rank=(s,id)=>Math.max(0,Number(s?.v7?.research?.[id]?.level)||0);
V.identified=(s,id)=>V.rank(s,id)>=V.REQUIRED_RESEARCH;
V.unknownName='Unknown Creature';
V.unknownIcon='❔';
V.escape=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

V.migrate=function(s){
  if(!s)return s;
  s.version='10.48.0';
  s.v1048=s.v1048||{};
  return s;
};
const oldNew=RF.newGame;RF.newGame=function(...a){return V.migrate(oldNew(...a))};
const oldLoad=RF.load;RF.load=function(){return V.migrate(oldLoad())};
const oldImport=RF.importSave;RF.importSave=function(x){return V.migrate(oldImport(x))};
if(RF.V95){
  RF.V95.SCHEMA='10.48.0';
  const om=RF.V95.migrate.bind(RF.V95);
  RF.V95.migrate=s=>V.migrate(om(s));
}

// ---------- Research progression ----------
// Keep V7's progression/risk model, but do not leak the creature's identity before 3/3.
RF.researchEnemy=function(id){
  const s=RF.state,e=RF.DATA.enemies?.[id];if(!s||!e)return;
  const current=s.v7?.research?.[id]||{level:0,notes:0};
  if((current.level||0)>=V.REQUIRED_RESEARCH){
    RF.UI.modal={type:'message',title:`Research Complete: ${e.name}`,text:'Your field notes on this creature are already complete.'};
    RF.UI.render(s);return;
  }
  const r={level:current.level||0,notes:current.notes||0};
  const risk=Math.max(.04,.22-(s.skills?.exploration?.level||1)*.006);
  RF.advanceWorld(12);
  if(Math.random()<risk&&RF.fieldTables?.[s.location]?.some(([x])=>x===id)){
    RF.log(s,V.identified(s,id)?`Your observation of ${e.name} gets much too close. It attacks.`:'Your observation gets much too close. The unidentified creature attacks.','bad');
    RF.save(s);RF.startBattle(id,{forced:true});return;
  }
  r.notes++;
  if(r.notes>=2+r.level){
    r.level=Math.min(V.REQUIRED_RESEARCH,r.level+1);
    r.notes=0;
    RF.addXp(s,'exploration',30+r.level*18);
    RF.addXp(s,'hunting',18+r.level*12);
  }
  s.v7.research[id]=r;
  s.stats=s.stats||{};s.stats.researchActions=(s.stats.researchActions||0)+1;
  RF.save(s);
  const complete=r.level>=V.REQUIRED_RESEARCH;
  RF.UI.modal={
    type:'message',
    title:complete?`Research Complete: ${e.name}`:'Research: Unknown Creature',
    text:complete
      ?`Your notes are now complete. You identify the creature as ${e.name}, and its full field data is added to the Database.`
      :r.level===0?'You record tracks, posture and feeding signs, but cannot identify the creature yet.'
      :r.level===1?'Patterns are beginning to emerge, but its identity and field data remain unconfirmed.'
      :'You are close to a confident identification. One final research rank is still required.'
  };
  RF.UI.render(s);
};

// ---------- Nearby Creatures ----------
RF.UI.nearbyEnemies=function(s){
  const list=RF.refreshEncounters(s);if(!RF.fieldTables?.[s.location])return'';
  return `<section class="card"><div class="questTitle"><h3>Nearby Creatures</h3><span class="tag">WILD AREA</span></div><div class="sub">Creature identity and field data are revealed only after Research reaches 3/3.</div><div class="list" style="margin-top:9px">${list.length?list.map(x=>{
    const e=RF.DATA.enemies[x.id],known=V.identified(s,x.id),rank=V.rank(s,x.id),kills=s.collection?.enemies?.[x.id]||0;
    if(known)return `<button class="enemyInspectRow" data-enemy-inspect="${x.uid}" ${s.activity||s.combat?'disabled':''}><span class="enemyInspectIcon">${e.icon}</span><span class="enemyInspectMeta"><b>${V.escape(e.name)} • Lv ${e.level}</b><small>${V.escape(e.temperament||'Hostile')} • ${kills} defeated • Research 3/3</small></span><span class="chev">›</span></button>`;
    return `<button class="enemyInspectRow v1048UnknownCreature" data-enemy-inspect="${x.uid}" ${s.activity||s.combat?'disabled':''}><span class="enemyInspectIcon">${V.unknownIcon}</span><span class="enemyInspectMeta"><b>${V.unknownName}</b><small>Research ${rank}/3 • Identity not established</small></span><span class="chev">›</span></button>`;
  }).join(''):'<div class="sub">The area is unusually quiet.</div>'}</div></section>`;
};

// ---------- Field Research panel ----------
V.fieldResearchHtml=function(s){
  const research=(RF.refreshEncounters(s)||[]).slice(0,3);
  if(!research.length)return'';
  return `<section class="card"><h3>📓 Field Research</h3><div class="sub">Observe nearby creatures to build a reliable identification. Names and creature data unlock only at Research 3/3.</div><div class="list" style="margin-top:8px">${research.map(x=>{
    const e=RF.DATA.enemies[x.id],rank=V.rank(s,x.id),known=rank>=V.REQUIRED_RESEARCH;
    return `<div class="row ${known?'':'v1048UnknownResearch'}"><div class="icon">${known?e.icon:V.unknownIcon}</div><div class="meta"><b>${known?V.escape(e.name):V.unknownName}</b><small>Research ${rank}/3${known?' • Identification complete':' • Identity concealed'}</small></div>${known?'<button disabled>Complete</button>':`<button data-research="${x.id}">Observe</button>`}</div>`;
  }).join('')}</div></section>`;
};
const contextBase=RF.v7ContextPanel?.bind(RF);
if(contextBase)RF.v7ContextPanel=function(s){
  let h=contextBase(s);
  const replacement=V.fieldResearchHtml(s);
  const pattern=/<section class="card"><h3>📓 Field Research<\/h3>[\s\S]*?<\/section>/;
  if(pattern.test(h))h=h.replace(pattern,replacement);
  else if(replacement)h+=replacement;
  return h;
};

// ---------- Creature inspection / Explore encounter secrecy ----------
const modalBase=RF.UI.modalHtml.bind(RF.UI);
RF.UI.modalHtml=function(s){
  const m=this.modal;
  if(m?.type==='enemyInspect'&&m.id){
    const list=RF.refreshEncounters(s),spot=list.find(x=>x.uid===m.uid),e=RF.DATA.enemies?.[m.id];
    if(!spot||!e){this.modal=null;return''}
    const rank=V.rank(s,m.id),known=rank>=V.REQUIRED_RESEARCH;
    if(!known){
      return `<div class="modalBack"><div class="modal enemyInspectModal v1048UnknownInspect"><div class="enemyInspectHero">${V.unknownIcon}</div><span class="eyebrow">UNIDENTIFIED WILD ENCOUNTER</span><h2>${V.unknownName}</h2><div class="itemDesc">You can see the creature, but your field notes are not yet reliable enough to identify it or expose its combat data.</div><div class="enemyFacts"><span>📓 Research ${rank}/3</span></div><div class="choices"><button class="choice dangerChoice" data-enemy-fight="${m.uid}"><b>⚔️ Fight</b><small>Engage without a completed field profile.</small></button><button class="choice" data-enemy-observe="${m.id}"><b>📓 Observe</b><small>Study it instead. Observation can occasionally provoke an attack.</small></button><button class="choice" data-enemy-leave><b>Leave it alone</b><small>Remain in the area without engaging.</small></button></div></div></div>`;
    }
    const moves=(e.moves||[]).slice(0,5).map(id=>RF.DATA.enemyMoves?.[id]?.name||id).join(' • '),kills=s.collection?.enemies?.[m.id]||0;
    const t=RF.v107Threat?.(s,e);
    const threat=t?`<div class="v107Threat"><b>⚠️ ${t.name} threat</b><span>Estimated ordinary hit against your current armour: ${t.range[0]}–${t.range[1]}</span></div>`:'';
    return `<div class="modalBack"><div class="modal enemyInspectModal"><div class="enemyInspectHero">${e.icon}</div><span class="eyebrow">WILD ENCOUNTER • ${V.escape(e.temperament||'Hostile')}</span><h2>${V.escape(e.name)} • Lv ${e.level}</h2><div class="itemDesc">${V.escape(e.desc||'You watch the creature from a cautious distance.')}</div><div class="enemyFacts"><span>❤️ ${e.hp} HP</span><span>🛡️ ${e.armor||0} armour</span><span>📓 Research 3/3</span><span>⚔️ ${kills} defeated</span></div>${moves?`<div class="sub" style="margin-top:10px">Known techniques: ${V.escape(moves)}</div>`:''}${threat}<div class="choices"><button class="choice dangerChoice" data-enemy-fight="${m.uid}"><b>⚔️ Fight</b><small>Enter tactical combat.</small></button><button class="choice" data-enemy-leave><b>Leave it alone</b><small>Remain in the area without engaging.</small></button></div></div></div>`;
  }
  if(m?.type==='v1025Enemy'&&m.id&&!V.identified(s,m.id)){
    const rank=V.rank(s,m.id);
    return `<div class="modalBack"><div class="modal v1025ExploreModal v1048UnknownInspect"><div class="resultIcon">${V.unknownIcon}</div><span class="eyebrow">UNIDENTIFIED DANGER</span><h2>${V.unknownName}</h2><div class="itemDesc">Your search carries you into a creature's territory. Your research is only ${rank}/3, so its identity and field data remain unknown.</div><div class="choices"><button class="choice dangerChoice" data-v1025-enemy="fight"><b>⚔️ Fight</b><small>Enter tactical combat without a completed field profile.</small></button><button class="choice" data-v1025-enemy="observe"><b>📓 Observe from Cover</b><small>Gain field research, with some risk of provoking it.</small></button><button class="choice" data-v1025-enemy="leave"><b>🌿 Back Away Carefully</b><small>Exploration skill improves your chance of leaving unnoticed.</small></button></div></div></div>`;
  }
  return modalBase(s);
};

// ---------- Database bestiary gating ----------
const databaseBase=RF.UI.database.bind(RF.UI);
RF.UI.database=function(s){
  const type=s.v94?.dbType||'enemies';
  if(type!=='enemies')return databaseBase(s);
  const q=s.v94?.dbSearch||'';
  const options=RF.V94.types.map(([id,n])=>`<option value="${id}" ${type===id?'selected':''}>${n}</option>`).join('');
  let entries=Object.entries(RF.DATA.enemies)
    .filter(([id])=>V.identified(s,id))
    .map(([id,e])=>({id,icon:e.icon,name:e.name,sub:`Lv ${e.level} • ${e.temperament||'Hostile'} • ${(s.collection?.enemies?.[id]||0)} defeated • Research 3/3`}))
    .filter(x=>RF.v94Matches(`${x.name} ${x.sub}`,q))
    .sort((a,b)=>a.name.localeCompare(b.name));
  const rows=entries.map(x=>`<button class="row dbRow" data-db-entry="enemies:${x.id}"><div class="icon">${x.icon}</div><div class="meta"><b>${V.escape(x.name)}</b><small>${V.escape(x.sub)}</small></div><span class="chev">›</span></button>`).join('');
  return `<section class="card databaseCard"><div class="questTitle"><h2>📚 Database</h2><span class="tag">${entries.length} ENTRIES</span></div><div class="sub">The bestiary records only creatures whose Field Research has reached 3/3.</div><div class="dbControls"><label class="filterSelect"><span>Section</span><select data-db-type>${options}</select></label><label class="filterSelect"><span>Search</span><input data-db-search value="${V.escape(q)}" placeholder="Search researched creatures…"></label></div><div class="list dbList">${rows||'<div class="sub">No fully researched creatures are recorded yet.</div>'}</div></section>`;
};

const detailBase=RF.v94DetailHtml.bind(RF);
RF.v94DetailHtml=function(s,type,id){
  if(type==='enemies'&&!V.identified(s,id)){
    return `<div class="modalBack"><div class="modal dbModal"><div class="dbHero"><span>${V.unknownIcon}</span><div><span class="eyebrow">BESTIARY LOCKED</span><h2>${V.unknownName}</h2></div></div><div class="itemDesc">Complete Field Research to 3/3 before this creature is identified and added to the Database.</div><button class="quietClose" data-db-close>Close</button></div></div>`;
  }
  return detailBase(s,type,id);
};

const oldStyle=document.getElementById('v1048-field-identification-style');if(oldStyle)oldStyle.remove();
const st=document.createElement('style');st.id='v1048-field-identification-style';st.textContent=`
.v1048UnknownCreature .enemyInspectIcon,.v1048UnknownResearch .icon{filter:grayscale(1);opacity:.8}
.v1048UnknownCreature .enemyInspectMeta b,.v1048UnknownResearch .meta b{color:#d8c9ac}
.v1048UnknownInspect .enemyInspectHero,.v1048UnknownInspect .resultIcon{filter:grayscale(.25);opacity:.9}
`;
document.head.appendChild(st);

if(RF.state){V.migrate(RF.state);RF.save?.(RF.state);setTimeout(()=>{if(RF.state&&!RF.V101?.mainMenu)RF.UI.render(RF.state)},0)}
})();
