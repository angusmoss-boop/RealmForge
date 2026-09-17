window.RF=window.RF||{};
RF.VERSION='11.3.0';
RF.BUILD={
  version:'11.3.0',
  title:'Dungeon Codex',
  built:'17 Sep 2026 • 21:32 BST',
  buildId:'20260917-2132-bst'
};
RF.V113=RF.V113||{};

/* Realmforge V11.3 — Dungeon Codex
   - Adds dedicated Dungeons and Magic sections to the Database.
   - Expands Database navigation to a compact 4-column × 2-row sector grid.
   - Dungeon records show dungeon level and exact world location/region.
   - Preserves every existing campaign/loadout value; this update is Database-only.
*/

(()=>{
'use strict';
const V=RF.V113;
V.version='11.3.0';
V.escape=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
V.SECTORS=[
  ['enemies','🐾','Enemies'],
  ['items','🎒','Items'],
  ['npcs','🧑','NPCs'],
  ['locations','🗺️','Locations'],
  ['resources','⛏️','Resources'],
  ['recipes','📜','Recipes'],
  ['dungeons','🗝️','Dungeons'],
  ['magic','🔮','Magic']
];

V.dungeonDefs=function(){
  return RF.V1062?.DUNGEONS||{};
};
V.dungeonEntries=function(s){
  const defs=V.dungeonDefs();
  return Object.entries(defs).map(([locId,d])=>{
    const loc=RF.DATA.locations?.[locId];
    const rec=s?.v1062?.records?.[locId]||{};
    return {
      id:locId,
      icon:d.icon||loc?.icon||'🗝️',
      name:d.name||`${loc?.name||locId} Dungeon`,
      sortLevel:Number(d.level)||0,
      sub:`Lv ${d.level||1} • ${loc?.icon||'📍'} ${loc?.name||locId} • ${d.region||loc?.region||'Unknown region'}${rec.clears?` • ${rec.clears} clear${rec.clears===1?'':'s'}`:''}`
    };
  }).sort((a,b)=>(a.sortLevel-b.sortLevel)||String(a.name).localeCompare(String(b.name),undefined,{sensitivity:'base'}));
};

// Extend the existing Database engine instead of replacing it, so V11.1 location-service
// enrichment, Research 3/3 bestiary gating and V10.61's ordering all remain authoritative.
if(RF.V1061){
  RF.V1061.SECTORS=V.SECTORS;
  const entriesBase=RF.V1061.entries.bind(RF.V1061);
  RF.V1061.entries=function(s,type){
    if(type==='dungeons')return V.dungeonEntries(s);
    if(type==='magic')return [];
    return entriesBase(s,type);
  };
  RF.V1061.sectorGrid=function(active){
    return `<div class="v1061DbSectorGrid v113DbSectorGrid" role="tablist" aria-label="Database sections">${V.SECTORS.map(([id,icon,name])=>`<button type="button" role="tab" aria-selected="${active===id?'true':'false'}" class="v1061DbSector v113DbSector ${active===id?'active':''}" data-v1061-db-type="${id}"><span>${icon}</span><b>${V.escape(name)}</b></button>`).join('')}</div>`;
  };
}

// Rebuild only the top-level Database page copy so Dungeons/Magic get purpose-built text.
RF.UI.database=function(s){
  s.v94=s.v94||{dbType:'enemies',dbSearch:''};
  const sectors=RF.V1061?.SECTORS||V.SECTORS;
  const type=sectors.some(x=>x[0]===s.v94.dbType)?s.v94.dbType:'enemies';
  const q=s.v94.dbSearch||'';
  let entries=RF.V1061?.entries?RF.V1061.entries(s,type):[];
  entries=entries.filter(x=>RF.v94Matches?RF.v94Matches(`${x.name} ${x.sub}`,q):(!q||`${x.name} ${x.sub}`.toLowerCase().includes(String(q).toLowerCase())));
  const rows=entries.map(x=>`<button class="row dbRow" data-db-entry="${type}:${x.id}"><div class="icon">${x.icon}</div><div class="meta"><b>${V.escape(x.name)}</b><small>${V.escape(x.sub)}</small></div><span class="chev">›</span></button>`).join('');

  let intro='Field reference for creatures, people, places, items and production knowledge.';
  let placeholder='Search database…';
  let empty='No matching entries.';
  if(type==='enemies'){
    intro='The bestiary records only creatures whose Field Research has reached 3/3.';
    placeholder='Search researched creatures…';
    empty='No fully researched creatures are recorded yet.';
  }else if(type==='dungeons'){
    intro='Known dungeon sites, their danger level and where to find them in the world.';
    placeholder='Search dungeons or locations…';
    empty='No dungeons are recorded.';
  }else if(type==='magic'){
    intro='Arcane knowledge will be catalogued here when the Magic system arrives.';
    placeholder='Search magic…';
    empty='🔮 Magic records coming soon.';
  }

  return `<section class="card databaseCard v1061Database v113Database"><div class="questTitle"><h2>📚 Database</h2><span class="tag">${entries.length} ENTRIES</span></div><div class="sub">${intro}</div>${RF.V1061?.sectorGrid?RF.V1061.sectorGrid(type):''}<div class="v1061DbSearch"><label><span>Search</span><input data-db-search value="${V.escape(q)}" placeholder="${V.escape(placeholder)}"></label></div><div class="list dbList">${rows||`<div class="sub v113DbEmpty">${empty}</div>`}</div></section>`;
};

// Dedicated dungeon record cards. These deliberately avoid spoiling an uncleared boss/reward
// list; the Database request here is about the dungeon and its world location.
if(typeof RF.v94DetailHtml==='function'){
  const detailBase=RF.v94DetailHtml;
  RF.v94DetailHtml=function(s,type,id){
    if(type!=='dungeons')return detailBase.apply(this,arguments);
    const d=V.dungeonDefs()?.[id],loc=RF.DATA.locations?.[id];
    if(!d||!loc)return '';
    const rec=s?.v1062?.records?.[id]||{attempts:0,clears:0,bestHp:null};
    const visited=!!s?.visited?.[id];
    const h=`<span class="eyebrow">DUNGEON ENTRY</span><div class="dbHero"><span>${d.icon||'🗝️'}</span><div><h2>${V.escape(d.name)}</h2><div class="sub">Dungeon Level ${d.level||1} • ${V.escape(d.region||loc.region||'Unknown region')}</div></div></div><div class="itemDesc">${V.escape(d.desc||'A dangerous multi-stage dungeon.')}</div><div class="dbStatGrid"><div><small>Level</small><b>${d.level||1}</b></div><div><small>Structure</small><b>8 + Boss</b></div><div><small>Attempts</small><b>${rec.attempts||0}</b></div><div><small>Clears</small><b>${rec.clears||0}</b></div></div><h3>World Location</h3><div class="dbChips"><span>${loc.icon||'📍'} ${V.escape(loc.name)}</span><span>${V.escape(loc.region||d.region||'Unknown region')}</span><span>${visited?'Visited':'Unvisited'}</span></div>${rec.bestHp!=null?`<div class="questInfo"><b>Best clear</b><span>${rec.bestHp} HP remaining</span></div>`:''}`;
    return `<div class="modalBack"><div class="modal dbModal v112DbModal v113DungeonDetail"><button type="button" class="v112DbClose v1123CloseX" data-db-close aria-label="Close">✕</button>${h}</div></div>`;
  };
}

V.migrate=function(s){
  if(!s)return s;
  s.v113=s.v113||{};
  s.v94=s.v94||{};
  if(!V.SECTORS.some(x=>x[0]===s.v94.dbType))s.v94.dbType='enemies';
  s.v94.dbSearch=s.v94.dbSearch||'';
  // Do not touch Equipment, Tool Belt, Pack, Bank, active dungeon run, combat or progression.
  s.version='11.3.0';
  return s;
};
const oldNew=RF.newGame;RF.newGame=function(...a){return V.migrate(oldNew(...a))};
const oldLoad=RF.load;RF.load=function(){return V.migrate(oldLoad())};
const oldImport=RF.importSave;RF.importSave=function(x){return V.migrate(oldImport(x))};
if(RF.V95){
  RF.V95.SCHEMA='11.3.0';
  const om=RF.V95.migrate.bind(RF.V95);RF.V95.migrate=s=>V.migrate(om(s));
}

const oldStyle=document.getElementById('v113-dungeon-codex-style');if(oldStyle)oldStyle.remove();
const st=document.createElement('style');st.id='v113-dungeon-codex-style';st.textContent=`
.v113DbSectorGrid{grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:8px!important}
.v113DbSector{min-height:72px!important;padding:8px 4px!important;border-radius:14px!important}
.v113DbSector>span{font-size:27px!important}.v113DbSector>b{font-size:10px!important}
.v113DbEmpty{padding:18px 10px;text-align:center;line-height:1.45}
.v113DungeonDetail .dbStatGrid{margin-top:12px}
@media(max-width:430px){
  .v113DbSectorGrid{gap:7px!important}
  .v113DbSector{min-height:67px!important;padding:7px 3px!important}
  .v113DbSector>span{font-size:25px!important}.v113DbSector>b{font-size:9.5px!important}
}
`;
document.head.appendChild(st);

if(RF.state){
  V.migrate(RF.state);RF.save?.(RF.state);
  setTimeout(()=>{if(RF.state&&!RF.V101?.mainMenu)RF.UI.render(RF.state)},0);
}
})();
