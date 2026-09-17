window.RF=window.RF||{};
RF.VERSION='10.61.0';
RF.BUILD={
  version:'10.61.0',
  title:'Database Grid',
  built:'17 Sep 2026 • 20:10 BST',
  buildId:'20260917-2010-bst'
};
RF.V1061=RF.V1061||{};

/* Realmforge V10.61 — Database Grid
   - Replaces the native Database section dropdown with fast three-column sector tiles.
   - Adds emoji + name sector buttons for Enemies, Items, NPCs, Locations, Resources and Recipes.
   - Orders every Database category by progression level first, then alphabetically.
   - Preserves the Research 3/3 bestiary gate and all existing Database detail modals.
*/

(()=>{
'use strict';
const V=RF.V1061;
V.SECTORS=[
  ['enemies','🐾','Enemies'],
  ['items','🎒','Items'],
  ['npcs','🧑','NPCs'],
  ['locations','🗺️','Locations'],
  ['resources','⛏️','Resources'],
  ['recipes','📜','Recipes']
];

V.escape=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
V.number=v=>Number.isFinite(Number(v))?Number(v):0;
V.identified=(s,id)=>RF.V1049?.identified?RF.V1049.identified(s,id):(RF.V1048?.identified?RF.V1048.identified(s,id):((s?.v7?.research?.[id]?.level||0)>=3));

V.itemLevel=function(it){
  if(!it)return 0;
  if(Number.isFinite(Number(it.level)))return Number(it.level);
  const req=RF.itemRequirement?.(it);
  if(req&&Number.isFinite(Number(req.level)))return Number(req.level);
  // Tools have progression tiers rather than skill-use levels. Use the tier only as
  // an ordering key, without presenting it as a literal character level in the UI.
  if(Number.isFinite(Number(it.tier)))return Number(it.tier);
  return 0;
};
V.locationLevel=function(loc){
  if(!loc)return 0;
  if(Number.isFinite(Number(loc.level)))return Number(loc.level);
  if(loc.lockedSkill&&typeof loc.lockedSkill==='object'){
    const vals=Object.values(loc.lockedSkill).map(Number).filter(Number.isFinite);
    if(vals.length)return Math.max(...vals);
  }
  return 0;
};
V.sortLevel=function(type,id,obj){
  if(type==='enemies')return V.number(obj?.level);
  if(type==='items')return V.itemLevel(obj);
  if(type==='npcs')return V.number(obj?.level);
  if(type==='locations')return V.locationLevel(obj);
  if(type==='resources')return V.number(obj?.level);
  if(type==='recipes')return V.number(obj?.level);
  return 0;
};
V.sortEntries=function(entries){
  return entries.sort((a,b)=>(a.sortLevel-b.sortLevel)||String(a.name||'').localeCompare(String(b.name||''),undefined,{sensitivity:'base'}));
};

V.entries=function(s,type){
  let out=[];
  if(type==='enemies'){
    out=Object.entries(RF.DATA.enemies||{})
      .filter(([id])=>V.identified(s,id))
      .map(([id,e])=>({
        id,icon:e.icon||'🐾',name:e.name||id,sortLevel:V.sortLevel(type,id,e),
        sub:`Lv ${e.level||1} • ${e.temperament||'Hostile'} • ${(s.collection?.enemies?.[id]||0)} defeated • Research 3/3`
      }));
  }
  if(type==='items'){
    out=Object.entries(RF.DATA.items||{}).map(([id,it])=>({
      id,icon:it.icon||'📦',name:it.name||id,sortLevel:V.sortLevel(type,id,it),
      sub:`${it.rarity||'Common'} • ${it.type||'Item'} • ${it.value||0}g base value`
    }));
  }
  if(type==='npcs'){
    out=Object.entries(RF.DATA.npcs||{}).map(([id,n])=>({
      id,icon:n.icon||'🧑',name:n.name||id,sortLevel:V.sortLevel(type,id,n),
      sub:n.job||'Resident'
    }));
  }
  if(type==='locations'){
    out=Object.entries(RF.DATA.locations||{}).map(([id,l])=>({
      id,icon:l.icon||'📍',name:l.name||id,sortLevel:V.sortLevel(type,id,l),
      sub:`${l.region||'Unknown region'}${s.visited?.[id]?' • Visited':' • Unvisited'}`
    }));
  }
  if(type==='resources'){
    out=Object.entries(RF.DATA.resourceDefs||{}).map(([id,r])=>({
      id,icon:r.icon||'⛏️',name:r.name||id,sortLevel:V.sortLevel(type,id,r),
      sub:`${RF.DATA.skills?.[r.skill]?.name||r.skill} Lv ${r.level||1} • yields ${RF.DATA.items?.[r.item]?.name||r.item}`
    }));
  }
  if(type==='recipes'){
    out=Object.entries(RF.DATA.recipes||{}).map(([id,r])=>({
      id,icon:RF.DATA.skills?.[r.skill]?.icon||'📜',name:r.name||id,sortLevel:V.sortLevel(type,id,r),
      sub:`${RF.DATA.skills?.[r.skill]?.name||r.skill} Lv ${r.level||1} • ${RF.v94RecipeOutput?.(r)||''}`
    }));
  }
  return V.sortEntries(out);
};

V.sectorGrid=function(active){
  return `<div class="v1061DbSectorGrid" role="tablist" aria-label="Database sections">${V.SECTORS.map(([id,icon,name])=>`<button type="button" role="tab" aria-selected="${active===id?'true':'false'}" class="v1061DbSector ${active===id?'active':''}" data-v1061-db-type="${id}"><span>${icon}</span><b>${V.escape(name)}</b></button>`).join('')}</div>`;
};

RF.UI.database=function(s){
  s.v94=s.v94||{dbType:'enemies',dbSearch:''};
  const type=V.SECTORS.some(x=>x[0]===s.v94.dbType)?s.v94.dbType:'enemies';
  const q=s.v94.dbSearch||'';
  let entries=V.entries(s,type);
  entries=entries.filter(x=>RF.v94Matches?RF.v94Matches(`${x.name} ${x.sub}`,q):(!q||`${x.name} ${x.sub}`.toLowerCase().includes(String(q).toLowerCase())));
  const rows=entries.map(x=>`<button class="row dbRow" data-db-entry="${type}:${x.id}"><div class="icon">${x.icon}</div><div class="meta"><b>${V.escape(x.name)}</b><small>${V.escape(x.sub)}</small></div><span class="chev">›</span></button>`).join('');
  const bestiary=type==='enemies';
  const intro=bestiary?'The bestiary records only creatures whose Field Research has reached 3/3.':'Field reference for creatures, people, places, items and production knowledge.';
  const placeholder=bestiary?'Search researched creatures…':'Search database…';
  const empty=bestiary?'No fully researched creatures are recorded yet.':'No matching entries.';
  return `<section class="card databaseCard v1061Database"><div class="questTitle"><h2>📚 Database</h2><span class="tag">${entries.length} ENTRIES</span></div><div class="sub">${intro}</div>${V.sectorGrid(type)}<div class="v1061DbSearch"><label><span>Search</span><input data-db-search value="${V.escape(q)}" placeholder="${placeholder}"></label></div><div class="list dbList">${rows||`<div class="sub">${empty}</div>`}</div></section>`;
};

V.migrate=function(s){
  if(!s)return s;
  s.v94=s.v94||{};
  s.v94.dbType=V.SECTORS.some(x=>x[0]===s.v94.dbType)?s.v94.dbType:'enemies';
  s.v94.dbSearch=s.v94.dbSearch||'';
  s.v1061=s.v1061||{};
  s.version='10.61.0';
  return s;
};
const oldNew=RF.newGame;RF.newGame=function(...a){return V.migrate(oldNew(...a))};
const oldLoad=RF.load;RF.load=function(){return V.migrate(oldLoad())};
const oldImport=RF.importSave;RF.importSave=function(x){return V.migrate(oldImport(x))};
if(RF.V95){
  RF.V95.SCHEMA='10.61.0';
  const om=RF.V95.migrate.bind(RF.V95);
  RF.V95.migrate=s=>V.migrate(om(s));
}

const bindBase=RF.UI.bind.bind(RF.UI);
RF.UI.bind=function(s){
  bindBase(s);
  document.querySelectorAll('[data-v1061-db-type]').forEach(btn=>btn.onclick=()=>{
    const ss=RF.state;if(!ss)return;
    ss.v94=ss.v94||{};
    ss.v94.dbType=btn.dataset.v1061DbType;
    ss.v94.dbSearch='';
    RF.save?.(ss);
    RF.UI.render(ss);
  });
};

const oldStyle=document.getElementById('v1061-database-grid-style');if(oldStyle)oldStyle.remove();
const st=document.createElement('style');st.id='v1061-database-grid-style';st.textContent=`
.v1061DbSectorGrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px;margin:15px 0 13px}
.v1061DbSector{appearance:none;min-height:78px;border-radius:15px;border:1px solid rgba(196,153,78,.22);background:linear-gradient(180deg,rgba(41,30,19,.8),rgba(18,13,10,.97));color:#d8c7a5;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;padding:9px 6px;box-shadow:inset 0 1px rgba(255,255,255,.035);text-align:center}
.v1061DbSector>span{font-size:29px;line-height:1}.v1061DbSector>b{font-size:11px;line-height:1.1}
.v1061DbSector.active{border-color:#c99b50;background:linear-gradient(180deg,rgba(107,74,31,.98),rgba(62,42,20,.98));color:#f4dfb1;box-shadow:0 0 0 1px rgba(214,169,87,.13) inset,0 7px 20px #0002}
.v1061DbSearch{margin:0 0 12px}.v1061DbSearch label{display:grid;grid-template-columns:auto minmax(0,1fr);align-items:center;gap:12px}.v1061DbSearch label>span{font-weight:800;color:#b7a487;text-transform:uppercase;letter-spacing:.08em;font-size:11px}.v1061DbSearch input{width:100%;background:#100d0a;color:var(--ink);border:1px solid #4b3927;border-radius:12px;padding:11px 12px}
@media(max-width:430px){.v1061DbSectorGrid{gap:7px}.v1061DbSector{min-height:70px;padding:8px 4px}.v1061DbSector>span{font-size:27px}.v1061DbSector>b{font-size:10.5px}.v1061DbSearch label{grid-template-columns:1fr;gap:6px}}
`;
document.head.appendChild(st);

if(RF.state){V.migrate(RF.state);RF.save?.(RF.state);setTimeout(()=>{if(RF.state&&!RF.V101?.mainMenu)RF.UI.render(RF.state)},0)}
})();
