/* Realmforge V12.0.0 — Canonical Save Manager UI.
   Final owner for Options & Saves interactions after historical app-shell installation. */
(() => {
  'use strict';
  const RF=window.RF,C=RF.Core.Campaigns,State=RF.Core.State;
  if(!RF.UI||!C||!State)throw new Error('Save Manager requires canonical UI, Campaigns and State.');
  const esc=v=>String(v??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
  const baseModal=RF.UI.modalHtml.bind(RF.UI),baseBind=RF.UI.bind.bind(RF.UI),baseConfirm=RF.V95.doConfirm?.bind(RF.V95);

  function uniqueCopyName(meta){
    const existing=new Set(C.readIndex().map(x=>x.name));
    const base=`${meta?.name||meta?.playerName||'Campaign'} • Copy`;
    if(!existing.has(base))return base.slice(0,40);
    let n=2,name='';do{name=`${base} ${n++}`.slice(0,40)}while(existing.has(name));return name;
  }
  function slotRows(){
    const active=C.activeId();
    return C.readIndex().slice().sort((a,b)=>b.updated-a.updated).map(m=>{
      const copies=C.backupSummary(m.id),health=copies.filter(x=>x.ok).length,loc=RF.DATA.locations[m.location]?.name||m.location||'Unknown';
      const date=new Date(m.updated).toLocaleString();
      return `<div class="saveSlot ${m.id===active?'activeSlot':''}">
        <div class="saveSlotHead"><div><b>${m.id===active?'▶ ':''}${esc(m.name)}</b><small>${esc(m.playerName)} • Lv ${m.level} • Day ${m.day} • ${esc(loc)}</small><small>Saved ${esc(date)} • ${health}/3 verified local copies</small></div><span class="saveShield">${health===3?'🛡️':health>=2?'✅':'⚠️'}</span></div>
        <div class="saveActions v12SaveActions">
          <button data-slot-load="${m.id}" ${m.id===active?'disabled':''}>Load</button>
          <button data-slot-save="${m.id}" ${m.id!==active?'disabled':''}>Save Now</button>
          <button data-v12-slot-duplicate="${m.id}">Duplicate</button>
          <button data-v12-slot-export="${m.id}">Export</button>
          <button data-slot-rename="${m.id}">Rename</button>
          <button data-slot-delete="${m.id}" class="dangerMini">Delete</button>
        </div>
      </div>`;
    }).join('');
  }

  RF.UI.options=function(){
    return `<section class="card optionsCard"><h2>⚙️ Options & Saves</h2>
      <div class="notice good"><b>Verified campaign saves</b><br>Each campaign has a primary save, previous-good backup and recovery snapshot. V12 also blocks accidental cross-campaign overwrites at the storage layer.</div>
      <h3>Current Campaign</h3><div class="grid2">
        <button class="action primary" data-save-now><b>💾 Save Now</b><small>Write and verify a fresh recovery point</small></button>
        <button class="action" data-new-campaign><b>✨ New Campaign</b><small>Create a completely separate campaign slot</small></button>
        <button class="action" data-export><b>📤 Export Backup</b><small>Download a checksummed .rfsave file</small></button>
        <button class="action" data-import><b>📥 Import Backup</b><small>Import a file or old text backup as a new slot</small></button>
        <button class="action danger" data-restart-campaign><b>♻️ Restart Campaign</b><small>Duplicate the old campaign first, then restart this slot</small></button>
      </div>
      <h3>Save Slots</h3><div class="saveSlots">${slotRows()||'<div class="sub">No campaign slots yet.</div>'}</div>
      <div class="sub saveFoot">Exported backups protect against cleared browser/app storage. Imports and duplicates always create separate slots.</div>
    </section>`;
  };

  RF.UI.modalHtml=function(s){
    const m=this.modal;
    if(m?.type==='importBackupV12')return `<div class="modalBack"><div class="modal"><button class="rfCloseX" data-v12-import-cancel aria-label="Close">×</button><h2>📥 Import Backup</h2><div class="sub">Imports are verified and always create a new campaign slot. Your current campaign is saved first and never overwritten.</div><div class="choices" style="margin-top:14px"><button class="choice" data-v12-import-file><b>📁 Choose .rfsave File</b><small>Recommended for V12 backups</small></button><button class="choice" data-v12-import-paste><b>📋 Paste Backup Text</b><small>Also accepts pre-V12 text exports</small></button></div></div></div>`;
    return baseModal(s);
  };

  RF.V95.doConfirm=function(m){
    const id=m?.data?.id,active=C.activeId();
    if(m?.action==='new'){
      if(RF.state&&active&&!C.saveNow()){RF.UI.modal={type:'message',title:'Save Failed',text:'The current campaign could not be verified, so Realmforge refused to start a new one.'};RF.UI.render(RF.state);return}
      C.activate('',null);if(RF.V1011)RF.V1011.allowCreator=true;RF.UI.modal=null;RF.state=null;RF.UI.render(null);return;
    }
    if(m?.action==='duplicate'){
      const meta=C.readIndex().find(x=>x.id===id),newId=C.duplicate(id,uniqueCopyName(meta),{activate:false});
      RF.UI.modal={type:'message',title:newId?'Campaign Duplicated':'Duplicate Failed',text:newId?'A separate verified copy was created. The currently loaded campaign has not changed.':'Realmforge could not verify the duplicate, so no new slot was kept.'};RF.UI.render(RF.state);return;
    }
    if(m?.action==='restart'){
      const meta=C.readIndex().find(x=>x.id===active);if(!active||!RF.state)return;
      if(!C.saveNow()){RF.UI.modal={type:'message',title:'Save Failed',text:'Restart cancelled because the current campaign could not be safely archived.'};RF.UI.render(RF.state);return}
      const archive=C.duplicate(active,`${meta?.name||RF.state.player?.name||'Campaign'} • Before Restart`.slice(0,40),{activate:false});
      if(!archive){RF.UI.modal={type:'message',title:'Archive Failed',text:'Restart cancelled because the safety duplicate could not be verified.'};RF.UI.render(RF.state);return}
      const old=RF.state,fresh=RF.newGame(old.player.name,old.player.background,old.player.avatar);RF.state=C.migrate(fresh);
      if(!C.replaceSlot(active,RF.state,meta?.name,{activate:true})){C.loadSlot(active);RF.UI.modal={type:'message',title:'Restart Failed',text:'The original campaign was restored. Its Before Restart duplicate is also available.'};RF.UI.render(RF.state);return}
      RF.UI.modal={type:'message',title:'Campaign Restarted',text:'The current slot has been restarted. A separate “Before Restart” duplicate was verified first.'};RF.UI.tab='world';RF.UI.render(RF.state);return;
    }
    if(m?.action==='delete'){
      const was=active===id;C.delete(id);
      if(was){const left=C.readIndex().sort((a,b)=>b.updated-a.updated);if(left.length){C.loadSlot(left[0].id)}else{RF.state=null;RF.UI.modal=null;if(RF.V101){RF.V101.mainMenu=true;RF.V101.renderMainMenu?.()}else RF.UI.render(null)}}
      else{RF.UI.modal=null;RF.UI.render(RF.state)}
      return;
    }
    return baseConfirm?.(m);
  };

  async function exportOne(id){
    try{const r=await State.exportSlot(id);RF.UI.modal={type:'message',title:'Backup Exported',text:r.method==='file'?`Saved ${r.filename}.`:'Backup copied as portable text.'};}
    catch(err){console.warn(err);RF.UI.modal={type:'message',title:'Export Failed',text:'The campaign could not be exported. No save data was changed.'};}
    RF.UI.render(RF.state);
  }
  async function importFile(){
    try{
      const f=await RF.Platform?.active?.pickTextFile?.();if(!f?.text)return;
      if(RF.state&&C.activeId()&&!C.saveNow())throw new Error('Current campaign save verification failed.');
      State.importText(f.text,{activate:true});
      RF.UI.modal={type:'message',title:'Backup Imported',text:`${esc(f.name||'Backup')} was imported as a separate verified campaign slot.`};RF.UI.render(RF.state);
    }catch(err){console.warn(err);RF.UI.modal={type:'message',title:'Import Failed',text:'That backup could not be verified or read. No existing campaign was changed.'};RF.UI.render(RF.state)}
  }
  function importPaste(){
    const txt=RF.Platform?.active?.promptText?.('Paste your Realmforge save backup:','');if(!txt)return;
    try{if(RF.state&&C.activeId()&&!C.saveNow())throw new Error('Current campaign save verification failed.');State.importText(txt,{activate:true});RF.UI.modal={type:'message',title:'Backup Imported',text:'Imported as a separate verified campaign slot. Your existing campaigns were not overwritten.'};}
    catch(err){console.warn(err);RF.UI.modal={type:'message',title:'Import Failed',text:'That backup could not be verified or read. No existing campaign was changed.'};}
    RF.UI.render(RF.state);
  }

  RF.UI.bind=function(s){
    baseBind(s);
    document.querySelectorAll('[data-v12-slot-duplicate]').forEach(b=>b.onclick=()=>{const m=C.readIndex().find(x=>x.id===b.dataset.v12SlotDuplicate);RF.V95.confirm('Duplicate Campaign?',`Create a separate verified copy of “${m?.name||'this campaign'}”?`,'duplicate',{id:b.dataset.v12SlotDuplicate},false,'Duplicate')});
    document.querySelectorAll('[data-v12-slot-export]').forEach(b=>b.onclick=()=>exportOne(b.dataset.v12SlotExport));
    document.querySelector('[data-v12-import-file]')?.addEventListener('click',importFile);
    document.querySelector('[data-v12-import-paste]')?.addEventListener('click',importPaste);
    document.querySelector('[data-v12-import-cancel]')?.addEventListener('click',()=>{RF.UI.modal=null;RF.UI.render(RF.state)});
  };

  // Reinstall the canonical transfer affordances after every historical layer has finished.
  State.installTransferAffordances();
  RF.Views.SaveManager=RF.Modules.register('ui.saveManager',{slotRows,exportSlot:exportOne,importFile,importPaste},{owner:'ui',status:'canonical',introducedIn:'12.0.0',persistenceOwner:'core.campaigns'});
})();

/* Runs after gameplay compatibility has defined all historical migration functions. */
(() => {
  'use strict';
  const RF=window.RF;
  const count=RF.Core.Migrations.installHistoricalBaseline();
  // Re-normalise the already loaded campaign under the single canonical chain,
  // then reconcile it with the verified slot index.
  if(RF.state)RF.state=RF.Core.Migrations.normalize(RF.state);
  RF.Core.Campaigns.SCHEMA=RF.Core.contract.saveSchema;
  RF.Core.Campaigns.reconcileBoot();
  RF.PRODUCTION_FOUNDATION=RF.PRODUCTION_FOUNDATION||{};
  RF.PRODUCTION_FOUNDATION.saveCore={owner:'canonical',historicalNormalizers:count,slotFormat:'v95-compatible',schema:RF.Core.contract.saveSchema};
  RF.Modules.register('core.saveBoot',RF.PRODUCTION_FOUNDATION.saveCore,{owner:'core',status:'canonical'});
})();

/* Realmforge V11.29.0 — canonical content finalizer / ownership contract. */
(() => {
  'use strict';
  const RF=window.RF;
  const expected=RF.Content?.expectedLegacyBlocks||0;
  const applied=RF.Content?.appliedLegacyBlocks?.()||[];
  const summary=RF.Catalog?.summary?.()||{};
  const validation=RF.Catalog?.validate?.()||[];
  const authoring=RF.Authoring?.report?.()||null;
  const info={owner:'data',status:'canonical',legacyBlocksExpected:expected,legacyBlocksApplied:applied.length,allBlocksApplied:applied.length===expected,summary,validationIssues:validation,authoringReady:!!RF.Authoring,authoringValid:authoring?authoring.valid:validation.length===0,authoringIssues:authoring?.issues||[]};
  RF.PRODUCTION_FOUNDATION=RF.PRODUCTION_FOUNDATION||{};
  RF.PRODUCTION_FOUNDATION.contentCore=info;
  RF.Modules.register('data.contentCore',info,{owner:'data',status:'canonical'});
})();

/* Realmforge V11.29.0 — canonical configuration validation / ownership contract. */
(() => {
  'use strict';
  const RF=window.RF,C=RF.Config;
  const issues=[];
  const items=RF.DATA?.items||{}, enemies=RF.DATA?.enemies||{}, locations=RF.DATA?.locations||{};
  const markets=C?.get('commerce.markets')||{};
  for(const [loc,m] of Object.entries(markets)){
    if(!locations[loc])issues.push(`market missing location ${loc}`);
    for(const row of (m.stock||[]))if(!items[row[0]])issues.push(`market ${loc} stocks missing item ${row[0]}`);
  }
  const ecosystems=C?.get('world.ecosystems')||{};
  for(const [loc,rows] of Object.entries(ecosystems)){
    if(!locations[loc])issues.push(`ecosystem missing location ${loc}`);
    if(rows.length!==8)issues.push(`ecosystem ${loc} has ${rows.length} species, expected 8`);
    for(const [id] of rows)if(!enemies[id])issues.push(`ecosystem ${loc} references missing enemy ${id}`);
  }
  const liveDungeons=RF.Systems?.Dungeons?.definitions?.()||RF.V1062?.DUNGEONS||{};
  for(const [loc,d] of Object.entries(liveDungeons)){
    if(!locations[loc])issues.push(`dungeon missing location ${loc}`);
    if(!enemies[d.boss])issues.push(`dungeon ${loc} boss missing ${d.boss}`);
    for(const id of (d.rewards||[]))if(!items[id])issues.push(`dungeon ${loc} reward missing ${id}`);
    for(const row of (d.materials||[]))if(!items[row[0]])issues.push(`dungeon ${loc} material missing ${row[0]}`);
  }
  const sites=C?.get('crime.greenvaleBurglarySites')||[];
  for(const s of sites)for(const id of (s.items||[]))if(!items[id])issues.push(`burglary ${s.id} references missing item ${id}`);
  const statBalance=C?.get('equipment.statBalance')||{};
  for(const id of Object.keys(statBalance))if(!items[id])issues.push(`equipment stat config references missing item ${id}`);
  const entitySpecs=C?.get('dungeons.v114EntitySpecs')||[];
  for(const [id] of entitySpecs)if(!enemies[id])issues.push(`V11.4 entity spec was not registered: ${id}`);
  const gearSpecs=C?.get('dungeons.v114GearSpecs')||[];
  for(const [id] of gearSpecs)if(!items[id])issues.push(`V11.4 gear spec was not registered: ${id}`);
  const authoringIssues=RF.Authoring?.validateConfig?.();
  const finalIssues=Array.isArray(authoringIssues)?authoringIssues.filter(x=>x.severity==='error').map(x=>x.message):issues;
  const info={owner:'data',status:'canonical',definitions:C?.size?.()||0,keys:C?.keys?.()||[],issues:finalIssues,valid:finalIssues.length===0,authoringValidator:!!RF.Authoring?.validateConfig};
  RF.PRODUCTION_FOUNDATION=RF.PRODUCTION_FOUNDATION||{};
  RF.PRODUCTION_FOUNDATION.configCore=info;
  RF.Modules.register('data.configCore',info,{owner:'data',status:'canonical'});
})();

/* Canonical UI facade. Future screens should register/render through RF.Views
   instead of adding version wrappers directly to RF.UI. */
(() => {
  'use strict';
  const RF = window.RF;
  const api = {
    render: state => RF.UI.render(state || RF.state),
    navigate(tab, state = RF.state) {
      RF.UI.tab = tab;
      RF.UI.render(state);
      return tab;
    },
    modal: () => RF.UI.modal,
    openModal(modal, state = RF.state) { RF.UI.modal = modal; RF.UI.render(state); return modal; },
    closeModal(state = RF.state) { RF.UI.modal = null; RF.UI.render(state); },
    currentTab: () => RF.UI.tab,
    root: () => document.getElementById('app')
  };
  RF.Views.Shell = RF.Modules.register('ui.shell', api, { owner: 'ui', status: 'canonical-facade', delegatesTo: 'legacy-v11.5.3' });
})();

/* Realmforge V12.2.1 — Living Codex responsive refinement hotfix.
   Post-compatibility Database presentation, refiners and focus-safe live search.
   Historical Database stages remain the data/detail authority. */
(() => {
  'use strict';
  const RF=window.RF;if(!RF?.UI)return;
  const DB=RF.Views.Database=RF.Views.Database||{};
  const V=DB.V122=DB.V122||{};
  V.version='12.2.1';
  DB.modernVersion=V.version;

  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const title=v=>String(v||'').replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
  const sectors=()=>RF.V1061?.SECTORS||RF.V113?.SECTORS||[
    ['enemies','🐾','Enemies'],['items','🎒','Items'],['npcs','🧑','NPCs'],['locations','🗺️','Locations'],
    ['resources','⛏️','Resources'],['recipes','📜','Recipes'],['dungeons','🗝️','Dungeons'],['magic','🔮','Magic']
  ];

  V.activeFilters={items:'all',resources:'all',recipes:'all'};
  V.filterDefs={
    items:[
      ['all','All'],['weapon','Weapons'],['armor','Armour'],['tool','Tools'],['food','Food'],['material','Materials'],
      ['ammo','Ammo'],['utility','Utilities'],['trinket','Trinkets'],['quest_treasure','Quest & Treasure']
    ],
    resources:[['all','All'],['mining','Mining'],['woodcutting','Woodcutting'],['fishing','Fishing'],['foraging','Foraging']],
    recipes:[['all','All'],['smithing','Smithing'],['fletching','Fletching'],['crafting','Crafting'],['cooking','Cooking'],['herblore','Herblore']]
  };
  V.hasRefiners=type=>Object.prototype.hasOwnProperty.call(V.filterDefs,type);
  V.filterFor=type=>V.activeFilters[type]||'all';
  V.setFilter=(type,id)=>{if(V.filterDefs[type]?.some(x=>x[0]===id))V.activeFilters[type]=id;return V.filterFor(type)};

  V.isFletching=function(recipe){
    if(!recipe||recipe.skill!=='crafting')return false;
    const ids=Object.keys(recipe.outputs||{});
    return ids.some(id=>{
      const it=RF.DATA.items?.[id];
      return it?.type==='ammo'||(it?.type==='weapon'&&(String(id).includes('bow')||String(it.name||'').toLowerCase().includes('bow')));
    })||/arrow|bow|fletch/i.test(String(recipe.name||''));
  };
  V.matchesCategory=function(type,id,filter){
    if(!filter||filter==='all')return true;
    if(type==='items'){
      const t=RF.DATA.items?.[id]?.type||'';
      return filter==='quest_treasure'?(t==='quest'||t==='treasure'):t===filter;
    }
    if(type==='resources')return RF.DATA.resourceDefs?.[id]?.skill===filter;
    if(type==='recipes'){
      const r=RF.DATA.recipes?.[id];if(!r)return false;
      if(filter==='fletching')return V.isFletching(r);
      if(filter==='crafting')return r.skill==='crafting'&&!V.isFletching(r);
      return r.skill===filter;
    }
    return true;
  };
  V.searchText=function(type,id,row){
    const bits=[id,row?.name,row?.sub];
    if(type==='items'){
      const it=RF.DATA.items?.[id]||{};bits.push(it.type,it.rarity,it.desc,it.value);
    }else if(type==='resources'){
      const r=RF.DATA.resourceDefs?.[id]||{},it=RF.DATA.items?.[r.item];bits.push(r.skill,r.desc,r.item,it?.name);
    }else if(type==='recipes'){
      const r=RF.DATA.recipes?.[id]||{};bits.push(r.skill,r.level,r.name);
      Object.keys(r.inputs||{}).forEach(x=>bits.push(x,RF.DATA.items?.[x]?.name));
      Object.keys(r.outputs||{}).forEach(x=>bits.push(x,RF.DATA.items?.[x]?.name));
    }
    return bits.filter(v=>v!==undefined&&v!==null).join(' ').toLowerCase();
  };
  V.allEntries=function(s,type){return (RF.V1061?.entries?.(s,type)||[]).slice()};
  V.filteredEntries=function(s,type,q='',filter=V.filterFor(type)){
    const needle=String(q||'').trim().toLowerCase();
    return V.allEntries(s,type).filter(row=>V.matchesCategory(type,row.id,filter)&&(!needle||V.searchText(type,row.id,row).includes(needle)));
  };
  V.countFor=(s,type,filter)=>V.allEntries(s,type).filter(row=>V.matchesCategory(type,row.id,filter)).length;

  V.sectionCopy=function(type){
    const copy={
      enemies:['Bestiary','Only fully researched creatures earn a place in the Codex.','Search researched creatures…','No fully researched creatures match this search.'],
      items:['Item Archive','Weapons, armour, tools, supplies and curios gathered across the realm.','Search items, types, rarities…','No items match these filters.'],
      npcs:['People','Known residents, specialists and wanderers encountered on your travels.','Search people or roles…','No people match this search.'],
      locations:['World Atlas','Settlements, wilds, routes and facilities recorded across the realm.','Search locations, regions, facilities…','No locations match this search.'],
      resources:['Resource Index','Harvestable seams, trees, waters and forage with their skill requirements.','Search resources, skills, yields…','No resources match these filters.'],
      recipes:['Recipe Library','Production knowledge across Smithing, Crafting, Fletching, Cooking and Herblore.','Search recipes, ingredients, outputs…','No recipes match these filters.'],
      dungeons:['Dungeon Records','Known dungeon sites, danger levels and expedition records.','Search dungeons or regions…','No dungeons match this search.'],
      magic:['Arcane Archive','A sealed wing reserved for the realm’s future magical disciplines.','Search arcane records…','🔮 Magic records are coming soon.']
    };
    return copy[type]||['Database','Field knowledge gathered during your journey.','Search database…','No matching entries.'];
  };
  V.rowBadge=function(type,id){
    if(type==='items')return title(RF.DATA.items?.[id]?.type||'Item');
    if(type==='resources'){const r=RF.DATA.resourceDefs?.[id];return r?`Lv ${r.level} ${title(r.skill)}`:'';}
    if(type==='recipes'){
      const r=RF.DATA.recipes?.[id];if(!r)return'';
      return `Lv ${r.level} ${V.isFletching(r)?'Fletching':title(r.skill)}`;
    }
    if(type==='dungeons'){const d=RF.V113?.dungeonDefs?.()?.[id];return d?`Lv ${d.level}`:'';}
    return '';
  };
  V.rowsHtml=function(s,type,q,filter){
    const rows=V.filteredEntries(s,type,q,filter),copy=V.sectionCopy(type);
    const html=rows.map(x=>{
      const badge=V.rowBadge(type,x.id);
      return `<button type="button" class="db122Result" data-db-entry="${esc(type)}:${esc(x.id)}"><span class="db122Icon">${x.icon||'📖'}</span><span class="db122Meta"><span class="db122NameLine"><b>${esc(x.name)}</b>${badge?`<em>${esc(badge)}</em>`:''}</span><small>${esc(x.sub||'')}</small></span><span class="db122Chevron">›</span></button>`;
    }).join('');
    return {rows,html:html||`<div class="db122Empty"><span>⌕</span><b>No records found</b><small>${esc(copy[3])}</small></div>`};
  };
  V.refinersHtml=function(s,type){
    if(!V.hasRefiners(type))return'';
    const active=V.filterFor(type);
    return `<div class="db122Refine"><div class="db122RefineHead"><span>REFINE</span><small>Choose categories</small></div><div class="db122Chips" role="group" aria-label="Refine ${esc(type)}">${V.filterDefs[type].map(([id,label])=>`<button type="button" class="db122Chip ${active===id?'active':''}" aria-pressed="${active===id?'true':'false'}" data-db122-filter="${esc(id)}"><span>${esc(label)}</span><b>${V.countFor(s,type,id)}</b></button>`).join('')}</div></div>`;
  };
  V.sectorGrid=function(active){
    return `<div class="db122Sectors" role="tablist" aria-label="Database sections">${sectors().map(([id,icon,name])=>`<button type="button" role="tab" aria-selected="${active===id?'true':'false'}" class="db122Sector ${active===id?'active':''}" data-v1061-db-type="${esc(id)}"><span>${icon}</span><b>${esc(name)}</b></button>`).join('')}</div>`;
  };
  V.pageHtml=function(s){
    s.v94=s.v94||{dbType:'enemies',dbSearch:''};
    const type=sectors().some(x=>x[0]===s.v94.dbType)?s.v94.dbType:'enemies';
    const q=s.v94.dbSearch||'',copy=V.sectionCopy(type),result=V.rowsHtml(s,type,q,V.filterFor(type));
    return `<section class="db122Codex" data-db122-root data-db122-type="${esc(type)}">
      <header class="db122Hero"><div><span class="db122Eyebrow">REALMFORGE CODEX</span><h2><span>📚</span> Database</h2><p>${esc(copy[1])}</p></div><div class="db122Count"><b data-db122-count>${result.rows.length}</b><span>RECORDS</span></div></header>
      ${V.sectorGrid(type)}
      <div class="db122Workbench"><div class="db122SectionHead"><div><span>${esc(copy[0])}</span><small>${esc(sectors().find(x=>x[0]===type)?.[2]||title(type))}</small></div></div>
        <label class="db122Search"><span class="db122SearchIcon">⌕</span><input type="search" autocomplete="off" autocorrect="off" spellcheck="false" data-db-search data-rf-live-edit="database-search" value="${esc(q)}" placeholder="${esc(copy[2])}" aria-label="Search database"><button type="button" data-db122-clear aria-label="Clear search" ${q?'':'hidden'}>✕</button></label>
        ${V.refinersHtml(s,type)}
      </div>
      <div class="db122Results" data-db122-results>${result.html}</div>
    </section>`;
  };

  RF.UI.database=function(s){return V.pageHtml(s)};

  V.refreshResults=function(s=RF.state,{keepFocus=true}={}){
    const root=document.querySelector?.('[data-db122-root]');if(!root||!s)return false;
    const type=root.dataset.db122Type||s.v94?.dbType||'enemies';
    const input=root.querySelector?.('[data-db-search]'),q=input?.value??s.v94?.dbSearch??'';
    s.v94=s.v94||{};s.v94.dbSearch=q;
    const result=V.rowsHtml(s,type,q,V.filterFor(type));
    const host=root.querySelector?.('[data-db122-results]');if(host)host.innerHTML=result.html;
    const count=root.querySelector?.('[data-db122-count]');if(count)count.textContent=String(result.rows.length);
    const clear=root.querySelector?.('[data-db122-clear]');if(clear)clear.hidden=!q;
    V.bindResultRows(s,root);
    if(keepFocus&&input&&document.activeElement!==input){try{input.focus({preventScroll:true})}catch(_){input.focus?.()}}
    return true;
  };
  V.bindResultRows=function(s,root=document){
    root.querySelectorAll?.('[data-db-entry]').forEach(btn=>{
      btn.onclick=()=>{
        const [type,id]=String(btn.dataset.dbEntry||'').split(':');
        const detail=RF.v94DetailHtml?.(s,type,id);if(!detail)return;
        RF.UI.modal={type:'dbDetail',dbType:type,id};
        RF.UI.render(s);
      };
    });
  };
  V.forceRender=false;
  V.renderNow=function(s=RF.state){V.forceRender=true;try{return RF.UI.render(s)}finally{V.forceRender=false}};
  V.shouldHoldRender=function(){
    if(V.forceRender||RF.UI.modal||RF.actionGame||RF.state?.combat)return false;
    if(RF.UI.tab!=='database')return false;
    const a=document.activeElement;
    return !!(a?.matches?.('[data-rf-live-edit="database-search"]'));
  };

  // Final render boundary. The live clock may keep advancing, but it cannot destroy an actively edited field.
  const renderBase=RF.UI.render.bind(RF.UI);
  RF.UI.render=function(s){if(V.shouldHoldRender())return;return renderBase(s)};

  // Let all established binders run first, then replace Database-specific handlers with focus-safe ones.
  const bindBase=RF.UI.bind?.bind(RF.UI);
  if(bindBase)RF.UI.bind=function(s){
    bindBase(s);
    const root=document.querySelector?.('[data-db122-root]');if(!root)return;
    const input=root.querySelector('[data-db-search]');
    if(input){
      input.oninput=()=>{s.v94=s.v94||{};s.v94.dbSearch=input.value;V.refreshResults(s,{keepFocus:false})};
      input.onsearch=()=>{s.v94=s.v94||{};s.v94.dbSearch=input.value;V.refreshResults(s,{keepFocus:false})};
    }
    const clear=root.querySelector('[data-db122-clear]');
    if(clear)clear.onclick=()=>{if(!input)return;input.value='';s.v94=s.v94||{};s.v94.dbSearch='';V.refreshResults(s,{keepFocus:false});input.focus?.()};
    root.querySelectorAll('[data-db122-filter]').forEach(btn=>btn.onclick=()=>{
      const type=root.dataset.db122Type||s.v94?.dbType||'items';V.setFilter(type,btn.dataset.db122Filter);
      root.querySelectorAll('[data-db122-filter]').forEach(x=>{const on=x.dataset.db122Filter===V.filterFor(type);x.classList.toggle('active',on);x.setAttribute('aria-pressed',on?'true':'false')});
      V.refreshResults(s,{keepFocus:false});
    });
    root.querySelectorAll('[data-v1061-db-type]').forEach(btn=>btn.onclick=()=>{
      s.v94=s.v94||{};s.v94.dbType=btn.dataset.v1061DbType;s.v94.dbSearch='';
      input?.blur?.();V.renderNow(s);
    });
    V.bindResultRows(s,root);
  };

  const oldStyle=document.getElementById('rf-database-v122-style');if(oldStyle)oldStyle.remove();
  const st=document.createElement('style');st.id='rf-database-v122-style';st.textContent=`
  .db122Codex{display:grid;gap:12px;margin:0 0 18px;color:var(--ink);--db122Gold:#d7a856;--db122Gold2:#f0cc83;--db122Line:rgba(213,171,100,.2);--db122Panel:linear-gradient(145deg,rgba(33,27,20,.98),rgba(19,16,13,.98))}
  .db122Hero{position:relative;overflow:hidden;display:flex;align-items:flex-start;justify-content:space-between;gap:14px;padding:18px;border:1px solid var(--db122Line);border-radius:22px;background:radial-gradient(circle at 88% 10%,rgba(201,143,60,.19),transparent 34%),linear-gradient(145deg,#211a13,#13100d 72%);box-shadow:0 14px 34px rgba(0,0,0,.28),inset 0 1px rgba(255,255,255,.025)}
  .db122Hero:after{content:'✦';position:absolute;right:76px;top:-29px;font-size:112px;color:rgba(235,190,111,.035);transform:rotate(12deg);pointer-events:none}
  .db122Eyebrow{display:block;margin-bottom:4px;color:#a98d61;font-size:9px;font-weight:850;letter-spacing:.19em}
  .db122Hero h2{display:flex;align-items:center;gap:9px;margin:0;font:700 27px/1.05 Georgia,serif;color:#f2dfb8;letter-spacing:.01em}.db122Hero h2>span{font-size:25px}.db122Hero p{max-width:520px;margin:9px 0 0;color:#b8aa91;font-size:11.5px;line-height:1.55}
  .db122Count{position:relative;z-index:1;min-width:68px;padding:10px 9px;text-align:center;border:1px solid rgba(226,178,94,.24);border-radius:16px;background:rgba(11,9,7,.42);box-shadow:inset 0 1px rgba(255,255,255,.025)}.db122Count b{display:block;color:var(--db122Gold2);font:700 22px/1 Georgia,serif}.db122Count span{display:block;margin-top:4px;color:#8f8068;font-size:7.5px;font-weight:900;letter-spacing:.14em}
  .db122Sectors{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}.db122Sector{min-width:0;min-height:67px;padding:8px 4px;border:1px solid #3c3125;border-radius:15px;background:linear-gradient(160deg,#1c1813,#14110e);color:#b9aa90;box-shadow:0 6px 16px rgba(0,0,0,.16);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px}.db122Sector span{font-size:24px;filter:saturate(.72);transition:.15s}.db122Sector b{max-width:100%;overflow:hidden;text-overflow:ellipsis;color:#a99a82;font-size:9px;letter-spacing:.025em}.db122Sector.active{border-color:#936c37;background:radial-gradient(circle at 50% 10%,rgba(213,162,79,.17),transparent 50%),linear-gradient(160deg,#2b2014,#19130d);box-shadow:inset 0 0 0 1px rgba(231,186,107,.08),0 8px 20px rgba(0,0,0,.2)}.db122Sector.active span{filter:none;transform:translateY(-1px)}.db122Sector.active b{color:#ecc77f}
  .db122Workbench{padding:13px;border:1px solid var(--db122Line);border-radius:19px;background:var(--db122Panel);box-shadow:0 10px 26px rgba(0,0,0,.2)}.db122SectionHead{display:flex;justify-content:space-between;align-items:end;margin:0 1px 10px}.db122SectionHead>div>span{display:block;color:#e7c887;font:700 16px/1.15 Georgia,serif}.db122SectionHead small{display:block;margin-top:3px;color:#756b5b;font-size:8px;font-weight:800;letter-spacing:.13em;text-transform:uppercase}
  .db122Search{display:flex;align-items:center;gap:8px;height:45px;padding:0 9px 0 12px;border:1px solid #50402e;border-radius:14px;background:#0f0d0a;box-shadow:inset 0 1px 8px rgba(0,0,0,.35);transition:border-color .15s,box-shadow .15s}.db122Search:focus-within{border-color:#9d743c;box-shadow:0 0 0 3px rgba(176,125,54,.1),inset 0 1px 8px rgba(0,0,0,.35)}.db122SearchIcon{color:#96784b;font-size:21px;line-height:1}.db122Search input{min-width:0;flex:1;width:100%;padding:0!important;border:0!important;outline:0!important;background:transparent!important;color:#eee0c4!important;font:500 13px/1.2 system-ui!important;box-shadow:none!important}.db122Search input::placeholder{color:#716756}.db122Search button{width:29px;height:29px;min-width:29px;padding:0;border:0;border-radius:9px;background:#272018;color:#9f8e75;font-size:12px}.db122Search button[hidden]{display:none!important}
  .db122Codex,.db122Hero,.db122Sectors,.db122Workbench,.db122Refine,.db122Chips,.db122Results{min-width:0;max-width:100%;box-sizing:border-box}.db122Codex>*{min-width:0}.db122Refine{margin-top:12px}.db122RefineHead{display:flex;justify-content:space-between;align-items:center;margin:0 2px 6px}.db122RefineHead>span{color:#8d7d65;font-size:8px;font-weight:900;letter-spacing:.14em}.db122RefineHead small{color:#62594d;font-size:8px}.db122Chips{display:flex;flex-wrap:wrap;align-items:flex-start;gap:6px;width:100%;overflow:visible;padding:1px 1px 4px}.db122Chip{flex:0 1 auto;max-width:100%;display:flex;align-items:center;gap:6px;min-height:31px;white-space:nowrap;padding:5px 9px;border:1px solid #40352a;border-radius:999px;background:#17130f;color:#9f927e;font-size:9.5px}.db122Chip b{display:grid;place-items:center;min-width:19px;height:19px;padding:0 5px;border-radius:999px;background:#252019;color:#857761;font-size:8px}.db122Chip.active{border-color:#916b38;background:linear-gradient(#302315,#21180f);color:#edcb88}.db122Chip.active b{background:#704a20;color:#f6deb0}
  .db122Results{display:grid;grid-template-columns:1fr;gap:7px}.db122Result{width:100%;min-width:0;display:grid;grid-template-columns:48px minmax(0,1fr) 24px;align-items:center;gap:10px;padding:10px;border:1px solid #3b3127;border-radius:15px;background:linear-gradient(145deg,#1d1914,#14110e);color:inherit;text-align:left;box-shadow:0 6px 16px rgba(0,0,0,.14);transition:transform .12s,border-color .12s,background .12s}.db122Result:active{transform:scale(.988);border-color:#84623a;background:#221a12}.db122Icon{display:grid;place-items:center;width:48px;height:48px;border:1px solid rgba(209,164,91,.15);border-radius:13px;background:radial-gradient(circle at 35% 25%,rgba(224,181,108,.09),transparent 60%),#110f0c;font-size:25px}.db122Meta{min-width:0}.db122NameLine{display:flex;align-items:center;gap:7px;min-width:0}.db122NameLine b{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#e9d9ba;font:700 13px/1.2 system-ui}.db122NameLine em{flex:0 0 auto;padding:3px 6px;border:1px solid #4a3a28;border-radius:999px;background:#18130e;color:#aa8c5e;font:700 7.5px/1 system-ui;font-style:normal;text-transform:uppercase;letter-spacing:.04em}.db122Meta small{display:-webkit-box;margin-top:4px;overflow:hidden;-webkit-line-clamp:2;-webkit-box-orient:vertical;color:#8f8371;font-size:9.5px;line-height:1.35}.db122Chevron{color:#7f6a4c;font:300 25px/1 Georgia,serif;text-align:center}.db122Empty{padding:28px 15px;border:1px dashed #44382b;border-radius:17px;background:#15120e;text-align:center}.db122Empty>span{display:block;color:#806842;font-size:27px}.db122Empty>b{display:block;margin-top:5px;color:#c7b693;font:700 14px Georgia,serif}.db122Empty>small{display:block;margin:5px auto 0;max-width:300px;color:#766d60;font-size:10px;line-height:1.45}
  .v112DbModal,.dbModal{border:1px solid rgba(210,165,91,.28)!important;border-radius:21px!important;background:radial-gradient(circle at 88% 0,rgba(196,138,55,.12),transparent 29%),linear-gradient(145deg,#211b15,#12100d)!important;box-shadow:0 22px 70px rgba(0,0,0,.68)!important}.v112DbModal .eyebrow,.dbModal .eyebrow{color:#a88958!important;letter-spacing:.16em!important}.v112DbModal .dbHero,.dbModal .dbHero{padding:9px;border:1px solid rgba(211,168,98,.13);border-radius:16px;background:rgba(8,7,6,.22)}.v112DbModal .dbHero>span,.dbModal .dbHero>span{border-color:rgba(215,170,96,.2)!important;background:#12100d!important;box-shadow:inset 0 0 20px rgba(197,139,57,.05)}.v112DbModal .dbStatGrid>div,.dbModal .dbStatGrid>div{border-color:rgba(210,163,89,.16)!important;background:#12100d!important}.v112DbModal .questInfo,.dbModal .questInfo{border-color:#3f3326!important;background:#15120e!important}.v112DbModal .dbText,.dbModal .dbText{border-color:#392f25!important;background:#12100d!important}.v112DbModal .dbChips span,.dbModal .dbChips span{border-color:#493825!important;background:#17130e!important;color:#cdbb99!important}
  @media(min-width:680px){.db122Results{grid-template-columns:repeat(2,minmax(0,1fr))}.db122Hero{padding:21px}.db122Sector{min-height:73px}.db122Sector span{font-size:27px}}
  @media(max-width:390px){.db122Hero{padding:15px}.db122Hero h2{font-size:24px}.db122Hero p{font-size:10.5px}.db122Count{min-width:61px}.db122Sectors{gap:6px}.db122Sector{min-height:61px;border-radius:13px}.db122Sector span{font-size:22px}.db122Sector b{font-size:8.3px}.db122Result{grid-template-columns:44px minmax(0,1fr) 20px;padding:9px}.db122Icon{width:44px;height:44px;font-size:23px}.db122NameLine em{max-width:86px;overflow:hidden;text-overflow:ellipsis}}
  `;document.head.appendChild(st);
})();

/* Realmforge V12.2.1 — canonical system/UI ownership verification. */
(() => {
  'use strict';
  const RF=window.RF;
  // Apply canonical gathering content packs only after the mature historical resource tables exist.
  RF.Systems?.Gathering?.applyConfiguredContent?.();
  const commerce=RF.Systems?.Commerce,dungeons=RF.Systems?.Dungeons,travel=RF.Systems?.Travel,quests=RF.Systems?.Quests,wayfinder=RF.Systems?.Wayfinder;
  const combat=RF.Systems?.Combat,equipment=RF.Systems?.Equipment,inventory=RF.Systems?.Inventory,research=RF.Systems?.Research,crafting=RF.Systems?.Crafting,skills=RF.Systems?.Skills,character=RF.Systems?.Character,collection=RF.Systems?.Collection,specialist=RF.Systems?.Specialist,cadence=RF.Systems?.Cadence;
  const fieldcraft=RF.Systems?.Fieldcraft,gathering=RF.Systems?.Gathering,hunting=RF.Systems?.Hunting,fishing=RF.Systems?.Fishing,cooking=RF.Systems?.Cooking,world=RF.Systems?.World,worldEvents=RF.Systems?.WorldEvents,social=RF.Systems?.Social,encounters=RF.Systems?.Encounters;
  const exploration=RF.Systems?.Exploration,locks=RF.Systems?.Locks,crime=RF.Systems?.Crime,property=RF.Systems?.Property,timeEnergy=RF.Systems?.TimeEnergy;
  const focusClock=RF.Views?.FocusClock,database=RF.Views?.Database,navigation=RF.Views?.Navigation,presentation=RF.Views?.Presentation,overlays=RF.Views?.Overlays,appShell=RF.Views?.AppShell,saveManager=RF.Views?.SaveManager,developer=RF.Views?.Developer,itemBrowser=RF.Views?.ItemBrowser,worldActions=RF.Views?.WorldActions,lifecycle=RF.Core?.Lifecycle,scopedRuntime=RF.Core?.ScopedRuntime,migrations=RF.Core?.Migrations,compatClassification=RF.Core?.CompatibilityClassification,authoring=RF.Authoring,assets=RF.Assets;
  const expected={
    combat:["js/v8_1.js","js/v10_35.js","js/v10_36.js","js/v10_57.js","js/v10_58.js","js/v10_59.js","js/v10_60.js","js/v11_3_2.js"],
    characterFragments:["v3-perk-core","v3-perk-modifiers","v3-character-perks-ui","v10-character-creator","v10-progression-queue","v10-progression-render-queue","v7-character-records-ui","v4-character-shell-ui","v10_2-character-skills-grid"],
    collectionFragments:["v4-collection-item-tracking","v4-collection-ui"],
    equipment:["js/v10_3.js","js/v10_50.js","js/v10_53.js","js/v10_55.js","js/v11_5.js"],equipmentFragments:["v3-bulwark-armor","v3-equipment-ui","v8_2-equipment-foundation","v8_2-equipment-actions"],
    inventory:["js/v10_10.js","js/v10_14.js","js/v10_42.js","js/v10_43.js","js/v10_44.js","js/v10_45.js","js/v10_46.js","js/v10_47.js","js/v10_51.js","js/v10_52.js","js/v10_56.js"],inventoryFragments:["v8_2-pack-foundation","v8_2-pack-migration-intake-items","v8_2-bank-actions","v8_2-pack-bank-ui","v8_2-pack-bank-bind","v10_12-pack-ui","v10_12-bank-ui","v10_12-world-bank-stability","v7-antivenom","v10_9-split-vault"],
    research:["js/v10_48.js","js/v10_49.js","js/v11_5_2.js","js/v11_5_3.js"],
    crafting:["js/v10_15.js","js/v10_18.js","js/v10_19.js","js/v10_28.js"],skills:["js/v10_37.js","js/v11_2.js"],skillsFragments:["v10-skills-ui","v10_12-skills-crafting-ui"],
    fieldcraft:["js/v5.js","js/v6.js"],fieldcraftFragments:["v7-rare-skilling","v7-marsh-cooking","v7-camp-extras","v10_2-campfire-duration"],
    exploration:["js/v10_25.js","js/v10_26.js","js/v10_34.js"],explorationFragments:["v7-excavation"],
    locks:["js/v10_27.js","js/v10_29.js","js/v10_32.js"],locksFragments:["v7-lockpicking"],
    crime:["js/v10_4.js","js/v10_5.js","js/v10_6.js","js/v10_8.js","js/v10_30.js","js/v10_31.js"],crimeFragments:["v3-crime-base","v4-bounty-resolution","v9_2-crime-foundation","v10-pickpocket-tuning","v10_2-pickpocket-feedback","v10_2-pickpocket-ui","v9_2-crime-modal-ui","v9_2-crime-bind-ui","v9_2-reedmere-crime-ui","v10_1-pickpocket-repair","v7-pickpocket-timing","v9-dynamic-pickpocket","v9-pickpocket-resume"],
    property:["js/v10_24.js"],propertyFragments:["v4-home-actions","v10-inn-rest","v4-buy-home"],
    timeEnergyStages:["js/v10_22.js","js/v10_23.js"],timeEnergyFragments:["v8-time-controls","v8-speed-rebind","v8_3-manual-pause","v10-energy-core","v10_2-world-clock","v10_26-combat-clock"],focusClock:["js/v9_6.js"],gatheringFragments:["v10_22-continuous-gathering","v8_2-mastery-work","v8_2-mastery-ui","v10-instant-harvest","v10_1-repaired-gathering"],
    database:["js/v9_4.js","js/v10_61.js","js/v11_1.js","js/v11_3.js"],
    navigation:["js/v10_38.js"],
    presentation:["js/v10_13.js","js/v10_39.js","js/v10_40.js","js/v10_41.js","js/v11_3_1.js"],
    overlays:["js/v11_2_1.js","js/v11_2_3.js"],overlaysFragments:["v10-modal-style","v10-milestone-modal-renderer","v10-modal-bindings"],
    appShell:["js/v9_5.js"],appShellFragments:["v10_1-app-shell","v10_11-campaign-state-guard"],developer:["js/v10_33.js"],developerFragments:["v9_3-developer-shell","v9_3-developer-actions-bind","v10-dev-energy"],
    world:["js/v2.js"],worldFragments:["v9_2-encounter-ecology","v7-mirefen-encounter-tables","v7-mirefen-world-reveal","v4-encounter-ecology-core"],worldEventFragments:["v3-world-events","v4-forced-world-events","v8-road-interruptions"],socialFragments:["v4-social-core","v4-dialogue-ui","v4-people-ui","v4-guild-ui","v4-talk-action","v9_2-dialogue"],presentationFragments:["v9_1-weather-scene","v10_11-layout-style","v10_2-skills-crime-style","v8-cooldown-ui","v8-touch-render"],combatFragments:["v8_3-cadence-motion","v9_1-parry-focus","v9_2-defeat-xp","v7-research-combat","v9-combat-focus-core","v9-combat-focus-ui","v4-combat-move-pools","v4-tactical-combat-core","v4-tactical-combat-ui"],travelFragments:["v8-travel-activity-ui","v8_3-travel-repair","v7-mirefen-travel-gate","v7-marsh-sidequest-travel"],encounterFragments:["v9_1-inspect-ui","v9_1-inspect-bind","v4-nearby-enemies-ui"],itemBrowserFragments:["v8_3-deliberate-item-ui","v9_2-category-ui","v9_3-filter-ui","v9_3-detail-bank-ui","v9-quantity-detail-ui","v10_11-category-ordering"],
    specialistFragments:["v7-specialist-core","v7-potion-experiment"],worldActionsFragments:["v7-world-context-modal-ui","v7-action-bind-ui","v9-action-modal-ui","v9-action-bind-ui","v3-world-dungeon-crime-ui","v4-modal-composition","v4-world-encounter-social-composition","v4-region-home-composition","v4-bind-composition","v10_21-decision-reliability","v3-perk-crime-bind-bridge"],commerceFragments:["v9-quantity-trade","v3-ironridge-market-ui"],craftingFragments:["v7-smithing-heat","v9-batch-crafting"],researchFragments:["v7-bestiary-research"],cadenceFragments:["v8-runtime-config","v8-action-cadence"]
  };
  const hasAll=(api,list)=>!!api&&list.every(x=>api.installedStages?.includes(x));
  const hasFrags=(api,list)=>!!api&&list.every(x=>api.installedFragments?.includes(x));
  const canonical=(name,api)=>!!api&&RF.Modules.info(name)?.meta?.status==='canonical';
  const checks={
    commerceCanonical:canonical('systems.commerce',commerce),commerceInstalled:!!commerce?.installed&&!!RF.V1054?.trade&&!!RF.openMarket,commerceFragments:hasFrags(commerce,expected.commerceFragments),
    dungeonsCanonical:canonical('systems.dungeons',dungeons),dungeonsInstalled:!!dungeons?.installed&&!!RF.V1062?.start&&!!RF.V1062?.DUNGEONS,dungeonsV114:Array.isArray(dungeons?.installedStages)&&dungeons.installedStages.includes('js/v11_4.js')&&Array.isArray(dungeons?.installedFragments)&&dungeons.installedFragments.includes('v3-delve-action-ui')&&dungeons.installedFragments.includes('v3-delve-action-bridge'),
    travelCanonical:canonical('systems.travel',travel),travelInstalled:Array.isArray(travel?.installedStages)&&travel.installedStages.includes('v9-routing')&&travel.installedStages.includes('js/v10_17.js')&&travel.installedStages.includes('js/v10_20.js')&&travel.installedStages.includes('js/v11_2_2.js'),travelFragments:hasFrags(travel,expected.travelFragments),
    questsCanonical:canonical('systems.quests',quests),questsInstalled:quests?.installed===true&&typeof RF.v93AcceptQuest==='function'&&typeof RF.UI?.quests==='function',
    wayfinderCanonical:canonical('systems.wayfinder',wayfinder),wayfinderInstalled:wayfinder?.installed===true&&typeof RF.V1151?.progressHint==='function',
    scopedRuntimeCanonical:canonical('core.scopedRuntime',scopedRuntime),scopedRuntimeV107:Array.isArray(scopedRuntime?.installedStages)&&scopedRuntime.installedStages.includes('js/v10_7.js'),compatibilityClassificationCanonical:canonical('core.compatibilityClassification',compatClassification),compatibilityClassificationComplete:compatClassification?.summary?.().total===93&&compatClassification?.summary?.().retireable_obsolete===0,authoringCanonical:canonical('data.authoring',authoring),authoringValid:authoring?.report?.().valid===true,assetsCanonical:canonical('data.assets',assets),assetsValid:Array.isArray(assets?.validate?.())&&assets.validate().length===0,migrationDefinitions:Array.isArray(migrations?.installedDefinitions)&&['v3','v4','v7','v8','v8_3','v9','v9_1','v9_2','v9_3','v10','v10_2'].every(x=>migrations.installedDefinitions.includes(x)),cadenceCanonical:canonical('systems.cadence',cadence),cadenceFragments:hasFrags(cadence,expected.cadenceFragments),characterCanonical:canonical('systems.character',character),characterFragments:hasFrags(character,expected.characterFragments),collectionCanonical:canonical('systems.collection',collection),collectionFragments:hasFrags(collection,expected.collectionFragments),collectionReady:typeof RF.UI?.collectionPanel==='function'&&typeof RF.addItem==='function',specialistCanonical:canonical('systems.specialist',specialist),specialistFragments:hasFrags(specialist,expected.specialistFragments),specialistReady:typeof RF.v7Resume==='function'&&typeof RF.startPotionLab==='function',worldActionsCanonical:canonical('ui.worldActions',worldActions),worldActionsFragments:hasFrags(worldActions,expected.worldActionsFragments),worldActionsReady:typeof RF.v7ContextPanel==='function'&&typeof RF.UI?.v7ActionModal==='function',characterReady:typeof RF.perkRank==='function'&&typeof RF.buyPerk==='function'&&typeof RF.UI?.creator==='function',
    combatCanonical:canonical('systems.combat',combat),combatStages:hasAll(combat,expected.combat),combatFragments:hasFrags(combat,expected.combatFragments),
    equipmentCanonical:canonical('systems.equipment',equipment),equipmentStages:hasAll(equipment,expected.equipment),equipmentFragments:hasFrags(equipment,expected.equipmentFragments),
    inventoryCanonical:canonical('systems.inventory',inventory),inventoryStages:hasAll(inventory,expected.inventory),inventoryFragments:hasFrags(inventory,expected.inventoryFragments),
    researchCanonical:canonical('systems.research',research),researchStages:hasAll(research,expected.research),researchFragments:hasFrags(research,expected.researchFragments),
    craftingCanonical:canonical('systems.crafting',crafting),craftingStages:hasAll(crafting,expected.crafting),craftingFragments:hasFrags(crafting,expected.craftingFragments),
    skillsCanonical:canonical('systems.skills',skills),skillsStages:hasAll(skills,expected.skills),skillsFragments:hasFrags(skills,expected.skillsFragments),
    fieldcraftCanonical:canonical('systems.fieldcraft',fieldcraft),fieldcraftStages:hasAll(fieldcraft,expected.fieldcraft),fieldcraftFragments:hasFrags(fieldcraft,expected.fieldcraftFragments),
    gatheringCanonical:canonical('systems.gathering',gathering),gatheringContentApplied:Array.isArray(gathering?.configuredContent?.())&&gathering.configuredContent().includes('gathering.content.v12_1_forge_fletch'),huntingCanonical:canonical('systems.hunting',hunting),fishingCanonical:canonical('systems.fishing',fishing),cookingCanonical:canonical('systems.cooking',cooking),
    explorationCanonical:canonical('systems.exploration',exploration),explorationStages:hasAll(exploration,expected.exploration),explorationFragments:hasFrags(exploration,expected.explorationFragments),
    locksCanonical:canonical('systems.locks',locks),locksStages:hasAll(locks,expected.locks),locksFragments:hasFrags(locks,expected.locksFragments),
    crimeCanonical:canonical('systems.crime',crime),crimeStages:hasAll(crime,expected.crime),crimeFragments:hasFrags(crime,expected.crimeFragments),
    propertyCanonical:canonical('systems.property',property),propertyStages:hasAll(property,expected.property),propertyFragments:hasFrags(property,expected.propertyFragments),
    timeEnergyCanonical:canonical('systems.timeEnergy',timeEnergy),timeEnergyStages:hasAll(timeEnergy,expected.timeEnergyStages),timeEnergyFragments:hasFrags(timeEnergy,expected.timeEnergyFragments),
    focusClockCanonical:canonical('ui.focusClock',focusClock),focusClockStages:hasAll(focusClock,expected.focusClock),gatheringFragments:hasFrags(gathering,expected.gatheringFragments),
    databaseCanonical:canonical('ui.database',database),databaseModern:RF.Views?.Database?.modernVersion==='12.2.1',databaseStages:hasAll(database,expected.database),databaseReady:typeof RF.UI?.database==='function'&&typeof RF.v94DetailHtml==='function'&&typeof RF.V1061?.entries==='function'&&typeof RF.V111?.facilities==='function'&&typeof RF.V113?.dungeonEntries==='function',
    navigationCanonical:canonical('ui.navigation',navigation),navigationStages:hasAll(navigation,expected.navigation),navigationReady:typeof RF.UI?.nav==='function'&&Array.isArray(RF.V1038?.items),
    presentationCanonical:canonical('ui.presentation',presentation),presentationStages:hasAll(presentation,expected.presentation),presentationReady:typeof RF.V1039?.scene==='function'&&typeof RF.V1039?.replaceScene==='function'&&!!RF.V1040&&!!RF.V1041&&!!RF.V1131,
    overlaysCanonical:canonical('ui.overlays',overlays),overlaysStages:hasAll(overlays,expected.overlays),overlaysFragments:hasFrags(overlays,expected.overlaysFragments),overlaysReady:typeof RF.V1121?.sync==='function'&&typeof RF.V1123?.normaliseCloseButtons==='function',
    saveManagerCanonical:canonical('ui.saveManager',saveManager),saveManagerReady:!!saveManager&&typeof saveManager.exportSlot==='function'&&typeof RF.Core?.State?.importText==='function',appShellCanonical:canonical('ui.appShell',appShell),appShellStages:hasAll(appShell,expected.appShell),appShellFragments:hasFrags(appShell,expected.appShellFragments),appShellReady:typeof RF.V101?.renderMainMenu==='function'&&typeof RF.UI?.options==='function'&&Array.isArray(RF.V95?.navItems),
    developerCanonical:canonical('ui.developer',developer),developerStages:hasAll(developer,expected.developer),developerFragments:hasFrags(developer,expected.developerFragments),developerReady:typeof RF.V1033?.checkRemoteBuild==='function'&&typeof RF.V1033?.playerAction==='function'&&typeof RF.V1033?.bindDev==='function'&&typeof RF.UI?.dev==='function',
    worldCanonical:canonical('systems.world',world),worldStages:hasAll(world,expected.world),worldFragments:hasFrags(world,expected.worldFragments),worldEventsCanonical:canonical('systems.worldEvents',worldEvents),worldEventFragments:hasFrags(worldEvents,expected.worldEventFragments),worldReady:typeof RF.worldPulse==='function'&&typeof RF.npcsHere==='function'&&typeof RF.refreshEncounters==='function',
    socialCanonical:canonical('systems.social',social),socialFragments:hasFrags(social,expected.socialFragments),socialReady:typeof RF.openDialogue==='function'&&typeof RF.resolveDialogue==='function'&&typeof RF.generateContracts==='function'&&typeof RF.passersHere==='function',
    encountersCanonical:canonical('systems.encounters',encounters),encounterFragments:hasFrags(encounters,expected.encounterFragments),encountersReady:typeof RF.v91OpenEnemy==='function'&&typeof RF.UI?.nearbyEnemies==='function',
    itemBrowserCanonical:canonical('ui.itemBrowser',itemBrowser),itemBrowserFragments:hasFrags(itemBrowser,expected.itemBrowserFragments),itemBrowserReady:typeof RF.v92Category==='function'&&typeof RF.v93Req==='function',
    presentationFragments:hasFrags(presentation,expected.presentationFragments),
    lifecycleCanonical:canonical('core.lifecycle',lifecycle),lifecycleBooted:lifecycle?.booted===true,
    platformShellBridge:typeof RF.Platform?.active?.copyText==='function'&&typeof RF.Platform?.active?.promptText==='function'&&typeof RF.Platform?.active?.alertMessage==='function'&&typeof RF.Platform?.active?.vibrate==='function'&&typeof RF.Platform?.active?.isVisible==='function'&&typeof RF.Platform?.active?.onResume==='function'&&typeof RF.Platform?.active?.fetchBuildInfo==='function'&&typeof RF.Platform?.active?.registerServiceWorker==='function'&&typeof RF.Platform?.active?.onBackNavigation==='function'&&typeof RF.Platform?.active?.pushHistoryState==='function'&&typeof RF.Platform?.active?.replaceHistoryState==='function'&&typeof RF.Platform?.active?.saveTextFile==='function'&&typeof RF.Platform?.active?.pickTextFile==='function',
    explorationReady:typeof RF.V1025?.finishExplore==='function'&&typeof RF.startExcavation==='function'&&typeof RF.excavateTile==='function',
    locksReady:typeof RF.V1027?.startLock==='function'&&typeof RF.V1027?.turnLock==='function'&&RF.V1029?.PINS===4&&!!RF.V1032,
    crimeReady:typeof RF.commitCrime==='function'&&typeof RF.startPickpocket==='function'&&typeof RF.v92BurglaryAttempt==='function'&&typeof RF.V1031?.cooldownRemaining==='function',
    propertyReady:typeof RF.buyHome==='function'&&typeof RF.restAtHome==='function'&&typeof RF.v10RestUntil==='function'&&typeof RF.V1024?.startHomeCook==='function',
    timeEnergyReady:typeof RF.v10SpendEnergy==='function'&&typeof RF.V1023?.minutesPerEnergy==='number'&&typeof RF.v96CaptureClock==='function'&&typeof RF.V1026?.restoreClock==='function',
    marketCount:Object.keys(RF.V1054?.MARKETS||{}).length,dungeonCount:Object.keys(RF.V1062?.DUNGEONS||{}).length
  };
  checks.valid=Object.entries(checks).filter(([k])=>!['marketCount','dungeonCount'].includes(k)).every(([,v])=>!!v)&&checks.marketCount===10&&checks.dungeonCount===8;
  RF.PRODUCTION_FOUNDATION=RF.PRODUCTION_FOUNDATION||{};RF.PRODUCTION_FOUNDATION.systemOwnership=checks;RF.Modules.register('core.systemOwnership',checks,{owner:'core',status:'canonical'});
})();

/* Realmforge V12.2.1 production finalizer. */
(() => {
  'use strict';
  const RF=window.RF;
  RF.VERSION='12.2.1';
  RF.BUILD={version:'12.2.1',title:'Living Codex — Responsive Refiners',built:'22 Sep 2026 • V12',buildId:'20260922-v1221-responsive-refiners'};
  RF.PRODUCTION_FOUNDATION=RF.PRODUCTION_FOUNDATION||{};
  Object.assign(RF.PRODUCTION_FOUNDATION,{
    phase:26,architecture:'canonical-systems-v12',legacyBaseline:'11.5.3',compatibilityLayer:'js/legacy/compat_gameplay_scoped_residuals_trimmed_v1153.js',saveSchema:RF.Core.contract.saveSchema,
    persistenceOwner:'core.campaigns',migrationOwner:'core.migrations',contentOwner:'data.catalog',configOwner:'data.config',assetOwner:'data.assets',authoringOwner:'data.authoring',compatibilityClassificationOwner:'core.compatibilityClassification',
    scopedRuntimeOwner:'core.scopedRuntime',cadenceOwner:'systems.cadence',characterOwner:'systems.character',collectionOwner:'systems.collection',worldEventsOwner:'systems.worldEvents',travelOwner:'systems.travel',questOwner:'systems.quests',wayfinderOwner:'systems.wayfinder',combatOwner:'systems.combat',equipmentOwner:'systems.equipment',inventoryOwner:'systems.inventory',
    researchOwner:'systems.research',craftingOwner:'systems.crafting',skillsOwner:'systems.skills',fieldcraftOwner:'systems.fieldcraft',
    gatheringOwner:'systems.gathering',huntingOwner:'systems.hunting',fishingOwner:'systems.fishing',cookingOwner:'systems.cooking',
    explorationOwner:'systems.exploration',locksOwner:'systems.locks',crimeOwner:'systems.crime',propertyOwner:'systems.property',timeEnergyOwner:'systems.timeEnergy',focusClockOwner:'ui.focusClock',databaseOwner:'ui.database',navigationOwner:'ui.navigation',presentationOwner:'ui.presentation',overlayOwner:'ui.overlays',appShellOwner:'ui.appShell',saveManagerOwner:'ui.saveManager',developerOwner:'ui.developer',platformOwner:'platform.browser',lifecycleOwner:'core.lifecycle',worldOwner:'systems.world',socialOwner:'systems.social',canonicalModules:RF.Modules.list().map(x=>x.name)
  });
  RF.Systems?.Gathering?.applyConfiguredContent?.();
  RF.PRODUCTION_FOUNDATION.contentAuthoring=RF.Authoring?.report?.()||null;
  RF.PRODUCTION_FOUNDATION.contentSources={baseParts:9,legacyBlocks:RF.Content?.legacyBlockCount?.()||0,configDefinitions:RF.Config?.size?.()||0,assets:RF.Assets?.count?.()||0,contentPacks:'js/data/content/packs'};
  RF.PRODUCTION_FOUNDATION.compatibilityClassification=RF.Core?.CompatibilityClassification?.summary?.()||null;
  RF.Modules.register('core.finalize',RF.PRODUCTION_FOUNDATION,{owner:'core',status:'canonical'});
})();
