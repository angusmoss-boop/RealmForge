window.RF=window.RF||{};
RF.VERSION='11.5.3';
RF.BUILD={
  version:'11.5.3',
  title:'Living Encounters',
  built:'18 Sep 2026 • 00:58 BST',
  buildId:'20260918-0058-bst'
};
RF.V1153=RF.V1153||{};

/* Realmforge V11.5.3 — Living Encounters
   - Nearby creature rotations now refresh on each in-game hour instead of each 3-hour block.
   - Field Research lists every UNIQUE creature currently nearby, with no arbitrary 3-entry cap.
   - Duplicate nearby spawns remain possible in the world, but appear only once in Field Research.
   - Encounter-hour stamps are persisted separately so defeating one nearby creature does not
     immediately regenerate the same hour's encounter list after Array.filter strips metadata.
*/

(()=>{
'use strict';
const V=RF.V1153;
V.version='11.5.3';
V.escape=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

V.migrate=function(s){
  if(!s)return s;
  s.v1153=s.v1153||{};
  s.v1153.encounterStamps=s.v1153.encounterStamps||{};
  s.version='11.5.3';
  return s;
};
const oldNew=RF.newGame;RF.newGame=function(...a){return V.migrate(oldNew(...a))};
const oldLoad=RF.load;RF.load=function(){return V.migrate(oldLoad())};
const oldImport=RF.importSave;RF.importSave=function(x){return V.migrate(oldImport(x))};
if(RF.V95){
  RF.V95.SCHEMA='11.5.3';
  const om=RF.V95.migrate.bind(RF.V95);RF.V95.migrate=s=>V.migrate(om(s));
}

V.hourStamp=function(s){
  const day=Math.max(1,Number(s?.day)||1);
  const hour=Math.max(0,Math.min(23,Math.floor(Number(RF.hour?.(s))||0)));
  return `${day}:${hour}`;
};
V.desiredCount=function(loc){
  return ['sunmeadow','forest','river','mine','crossroads','marshroad','reedmere'].includes(loc)?4:3;
};
V.buildEncounterList=function(s,loc,stamp){
  const table=RF.fieldTables?.[loc]||[];
  const bag=[];
  table.forEach(([id,w])=>{
    if(!RF.DATA.enemies?.[id])return;
    for(let i=0;i<Math.max(1,Number(w)||1);i++)bag.push(id);
  });
  if(!bag.length)return[];
  const rnd=RF.seedRand(RF.seedHash(`v1153wild:${loc}:${stamp}`));
  const count=V.desiredCount(loc);
  const arr=[];
  for(let i=0;i<count;i++){
    const id=bag[Math.floor(rnd()*bag.length)],e=RF.DATA.enemies[id];
    arr.push({uid:`${loc}_${stamp}_v1153_${i}`,id,level:e.level,hostile:e.temperament==='aggressive'&&rnd()<.28});
  }
  // Preserve the old special Drowned Heron keeper injection.
  if(loc==='drowned_ruins'&&s.flags?.heron_chamber_open&&!s.kills?.heron_keeper&&RF.DATA.enemies?.heron_keeper){
    if(!arr.some(x=>x.id==='heron_keeper'))arr.push({uid:`keeper_${stamp}`,id:'heron_keeper',level:RF.DATA.enemies.heron_keeper.level,hostile:false});
  }
  return arr;
};

// Final encounter resolver: hourly rotation + persisted stamp.
RF.refreshEncounters=function(s,loc=s.location,force=false){
  if(!s)return[];
  V.migrate(s);
  s.encounters=s.encounters||{};
  if(!RF.fieldTables?.[loc]){
    s.encounters[loc]=[];
    delete s.v1153.encounterStamps[loc];
    return s.encounters[loc];
  }
  const stamp=V.hourStamp(s);
  const old=Array.isArray(s.encounters[loc])?s.encounters[loc]:[];
  const savedStamp=s.v1153.encounterStamps[loc];
  // The persisted stamp survives save/load and also survives combat removing an entry via filter().
  if(!force&&savedStamp===stamp){old._stamp=stamp;return old;}
  const arr=V.buildEncounterList(s,loc,stamp);
  arr._stamp=stamp;
  s.encounters[loc]=arr;
  s.v1153.encounterStamps[loc]=stamp;
  return arr;
};

V.uniqueNearby=function(s){
  const seen=new Set();
  return (RF.refreshEncounters(s)||[]).filter(x=>{
    if(!x?.id||seen.has(x.id))return false;
    seen.add(x.id);return true;
  });
};

// Field Research now mirrors the ENTIRE nearby roster, deduped by creature species.
if(RF.V1048){
  RF.V1048.fieldResearchHtml=function(s){
    const research=V.uniqueNearby(s);
    if(!research.length)return'';
    const p=RF.V1152?.profile?.(s)||{safety:.78,insight:.02};
    const safety=Math.round((p.safety||0)*100),insight=Math.round((p.insight||0)*100);
    const requiredNotes=RF.V1152?.requiredNotes||((rank)=>2+Math.max(0,Number(rank)||0));
    return `<section class="card v1152FieldResearch"><h3>📓 Field Research</h3><div class="sub">Observe nearby entities to build a reliable identification. 🧭 Exploration improves observation safety; 🐾 Hunting improves clue quality. All unique entities currently nearby are listed here.</div><div class="v1152Fieldcraft"><span>🧭 ${safety}% safe</span><span>🐾 ${insight}% keen-insight chance</span></div><div class="list" style="margin-top:8px">${research.map(x=>{
      const e=RF.DATA.enemies?.[x.id];if(!e)return'';
      const rank=Math.max(0,Number(s?.v7?.research?.[x.id]?.level)||0),notes=Math.max(0,Number(s?.v7?.research?.[x.id]?.notes)||0),known=rank>=3,need=requiredNotes(rank);
      return `<div class="row ${known?'':'v1049UnknownResearch'}"><div class="icon">${e.icon}</div><div class="meta"><b>${known?V.escape(e.name):'Unknown Entity'}</b><small>${known?'Research 3/3 • Identification complete':`Research ${rank}/3 • Notes ${notes}/${need}`}</small></div>${known?'<button disabled>Complete</button>':`<button data-research="${x.id}">Observe</button>`}</div>`;
    }).join('')}</div></section>`;
  };
}

if(RF.state){
  V.migrate(RF.state);
  // Seed the current hour immediately so the new hourly schedule takes effect without
  // disturbing any other save/loadout state.
  RF.refreshEncounters(RF.state,RF.state.location,true);
  RF.save?.(RF.state);
  setTimeout(()=>{if(RF.state&&!RF.V101?.mainMenu)RF.UI.render(RF.state)},0);
}
})();
