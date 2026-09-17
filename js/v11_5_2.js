window.RF=window.RF||{};
RF.VERSION='11.5.2';
RF.BUILD={
  version:'11.5.2',
  title:'Fieldcraft Research',
  built:'18 Sep 2026 • 00:28 BST',
  buildId:'20260918-0028-bst'
};
RF.V1152=RF.V1152||{};

/* Realmforge V11.5.2 — Fieldcraft Research
   - Field Research now scales with both Exploration and Hunting in complementary ways.
   - Exploration is the stronger contributor to observation safety.
   - Hunting is the stronger contributor to clue quality / extra research notes.
   - Safe observations always make progress; higher skills accelerate research without making low skills useless.
   - Existing research ranks/notes are preserved exactly.
*/

(()=>{
'use strict';
const V=RF.V1152;
V.version='11.5.2';
V.escape=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
V.level=(s,id)=>Math.max(1,Number(s?.skills?.[id]?.level)||1);
V.requiredNotes=rank=>2+Math.max(0,Number(rank)||0);

// Balanced fieldcraft curve:
// - Exploration drives most of the safety gain.
// - Hunting drives most of the insight gain.
// - 4% danger floor keeps observation from becoming completely risk-free.
// - 35% insight cap keeps research from collapsing into one-tap identification.
V.profile=function(s){
  const exploration=V.level(s,'exploration');
  const hunting=V.level(s,'hunting');
  const provoke=Math.max(.04,.22-(exploration*.005)-(hunting*.0015));
  const insight=Math.min(.35,.02+(exploration*.004)+(hunting*.008));
  return {exploration,hunting,provoke,insight,safety:1-provoke};
};

V.progress=function(r,gain){
  const out={level:Math.max(0,Number(r?.level)||0),notes:Math.max(0,Number(r?.notes)||0),ranked:false,complete:false};
  if(out.level>=3){out.level=3;out.notes=0;out.complete=true;return out;}
  out.notes+=Math.max(1,Number(gain)||1);
  const need=V.requiredNotes(out.level);
  if(out.notes>=need){
    out.notes-=need;
    out.level=Math.min(3,out.level+1);
    out.ranked=true;
    if(out.level>=3){out.level=3;out.notes=0;out.complete=true;}
  }
  return out;
};

V.migrate=function(s){
  if(!s)return s;
  s.v1152=s.v1152||{};
  // No research values are recalculated. Existing rank/note progress survives verbatim.
  s.version='11.5.2';
  return s;
};
const oldNew=RF.newGame;RF.newGame=function(...a){return V.migrate(oldNew(...a))};
const oldLoad=RF.load;RF.load=function(){return V.migrate(oldLoad())};
const oldImport=RF.importSave;RF.importSave=function(x){return V.migrate(oldImport(x))};
if(RF.V95){
  RF.V95.SCHEMA='11.5.2';
  const om=RF.V95.migrate.bind(RF.V95);RF.V95.migrate=s=>V.migrate(om(s));
}

// Replace the older Exploration-only research resolution with dual-skill Fieldcraft.
RF.researchEnemy=function(id){
  const s=RF.state,e=RF.DATA.enemies?.[id];if(!s||!e)return;
  s.v7=s.v7||{};s.v7.research=s.v7.research||{};
  const current=s.v7.research[id]||{level:0,notes:0};
  if((current.level||0)>=3){
    RF.UI.modal={type:'message',title:`Research Complete: ${e.name}`,text:'Your field notes on this entity are already complete.'};
    RF.UI.render(s);return;
  }

  const p=V.profile(s);
  RF.advanceWorld(12);
  const local=RF.fieldTables?.[s.location]?.some(([x])=>x===id);
  if(local&&Math.random()<p.provoke){
    const known=(RF.V1049?.identified?RF.V1049.identified(s,id):((current.level||0)>=3));
    RF.log(s,known?`Your observation of ${e.name} gets much too close. It attacks.`:'Your observation gets much too close. The unknown entity attacks.','bad');
    RF.save(s);RF.startBattle(id,{forced:true});return;
  }

  // Every safe observation earns one note. Skilled fieldcraft can occasionally earn a second.
  const keen=Math.random()<p.insight;
  const beforeLevel=Math.max(0,Number(current.level)||0);
  const r=V.progress(current,keen?2:1);
  s.v7.research[id]=r;
  s.stats=s.stats||{};s.stats.researchActions=(s.stats.researchActions||0)+1;

  if(r.ranked){
    RF.addXp(s,'exploration',30+r.level*18);
    RF.addXp(s,'hunting',18+r.level*12);
  }

  RF.save(s);
  const complete=r.level>=3;
  const extra=keen&&!complete?' Your fieldcraft picks out an extra useful clue.':'';
  const nextNeed=complete?0:V.requiredNotes(r.level);
  let text='';
  if(complete){
    text=`Your notes are now complete. You identify the entity as ${e.name}, and its full field data is added to the Database.${keen?' A sharp final insight brought the profile together.':''}`;
  }else if(r.level===0){
    text=`You record tracks, posture and feeding signs, but cannot identify the entity yet.${extra}`;
  }else if(r.level===1){
    text=`Patterns are beginning to emerge, but its identity and field data remain unconfirmed.${extra}`;
  }else{
    text=`You are close to a confident identification. One final research rank is still required.${extra}`;
  }
  if(!complete)text+=` Notes toward the next rank: ${r.notes}/${nextNeed}.`;

  RF.UI.modal={type:'message',title:complete?`Research Complete: ${e.name}`:'Research: Unknown Entity',text};
  RF.UI.render(s);
};

// Keep the Field Research panel transparent about why the two skills matter, while preserving
// identity secrecy until 3/3 and keeping the visible entity emoji from V10.49.
if(RF.V1048){
  RF.V1048.fieldResearchHtml=function(s){
    const research=(RF.refreshEncounters(s)||[]).slice(0,3);
    if(!research.length)return'';
    const p=V.profile(s);
    const safety=Math.round(p.safety*100),insight=Math.round(p.insight*100);
    return `<section class="card v1152FieldResearch"><h3>📓 Field Research</h3><div class="sub">Observe nearby entities to build a reliable identification. 🧭 Exploration improves observation safety; 🐾 Hunting improves clue quality. Both contribute to both effects.</div><div class="v1152Fieldcraft"><span>🧭 ${safety}% safe</span><span>🐾 ${insight}% keen-insight chance</span></div><div class="list" style="margin-top:8px">${research.map(x=>{
      const e=RF.DATA.enemies[x.id],rank=Math.max(0,Number(s?.v7?.research?.[x.id]?.level)||0),notes=Math.max(0,Number(s?.v7?.research?.[x.id]?.notes)||0),known=rank>=3,need=V.requiredNotes(rank);
      return `<div class="row ${known?'':'v1049UnknownResearch'}"><div class="icon">${e.icon}</div><div class="meta"><b>${known?V.escape(e.name):'Unknown Entity'}</b><small>${known?'Research 3/3 • Identification complete':`Research ${rank}/3 • Notes ${notes}/${need}`}</small></div>${known?'<button disabled>Complete</button>':`<button data-research="${x.id}">Observe</button>`}</div>`;
    }).join('')}</div></section>`;
  };
}

const oldStyle=document.getElementById('v1152-fieldcraft-style');if(oldStyle)oldStyle.remove();
const st=document.createElement('style');st.id='v1152-fieldcraft-style';st.textContent=`
.v1152Fieldcraft{display:flex;gap:7px;flex-wrap:wrap;margin-top:10px}
.v1152Fieldcraft span{display:inline-flex;align-items:center;min-height:27px;padding:5px 9px;border:1px solid #51412b;border-radius:999px;background:#1a1712;color:#d9c9a8;font-size:10px;font-weight:700}
`;
document.head.appendChild(st);

if(RF.state){
  V.migrate(RF.state);RF.save?.(RF.state);
  setTimeout(()=>{if(RF.state&&!RF.V101?.mainMenu)RF.UI.render(RF.state)},0);
}
})();
