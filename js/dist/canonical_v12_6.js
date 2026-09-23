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
        <div class="saveSlotHead"><div><b>${m.id===active?'▶ ':''}${esc(m.name)}${m.mode==='hardcore'?' <span class="v125SaveHardcore">☠ HARDCORE</span>':''}${m.gameOver?' <span class="v125SaveFallen">FALLEN</span>':''}</b><small>${esc(m.playerName)} • Lv ${m.level} • Day ${m.day} • ${esc(loc)}</small><small>Saved ${esc(date)} • ${health}/3 verified local copies</small></div><span class="saveShield">${health===3?'🛡️':health>=2?'✅':'⚠️'}</span></div>
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
      if(RF.CampaignMode?.isGameOver?.(RF.state)){
        RF.UI.modal={type:'message',title:'Hardcore Campaign Fallen',text:'A fallen Hardcore campaign cannot be restarted or revived. Create a new character to begin another run.'};RF.UI.render(RF.state);return;
      }
      if(!C.saveNow()){RF.UI.modal={type:'message',title:'Save Failed',text:'Restart cancelled because the current campaign could not be safely archived.'};RF.UI.render(RF.state);return}
      const archive=C.duplicate(active,`${meta?.name||RF.state.player?.name||'Campaign'} • Before Restart`.slice(0,40),{activate:false});
      if(!archive){RF.UI.modal={type:'message',title:'Archive Failed',text:'Restart cancelled because the safety duplicate could not be verified.'};RF.UI.render(RF.state);return}
      const old=RF.state,fresh=RF.newGame(old.player.name,old.player.background,old.player.avatar,{mode:old.campaign?.mode==='hardcore'?'hardcore':'standard'});RF.state=C.migrate(fresh);
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

/* Realmforge V12.3.0 — Living Codex knowledge links.
   Post-compatibility Database presentation, alphabetical indexing, recipe/use links and focus-safe live search.
   Historical Database stages remain the data/detail authority. */
(() => {
  'use strict';
  const RF=window.RF;if(!RF?.UI)return;
  const DB=RF.Views.Database=RF.Views.Database||{};
  const V=DB.V123=DB.V122=DB.V122||{};
  V.version='12.3.0';
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
  V.alphaCompare=(a,b)=>String(a?.name||'').localeCompare(String(b?.name||''),undefined,{sensitivity:'base',numeric:true});
  V.filteredEntries=function(s,type,q='',filter=V.filterFor(type)){
    const needle=String(q||'').trim().toLowerCase();
    return V.allEntries(s,type)
      .filter(row=>V.matchesCategory(type,row.id,filter)&&(!needle||V.searchText(type,row.id,row).includes(needle)))
      .sort(V.alphaCompare);
  };
  V.countFor=(s,type,filter)=>V.allEntries(s,type).filter(row=>V.matchesCategory(type,row.id,filter)).length;

  V.recipeDiscipline=function(r){
    if(!r)return 'Crafting';
    if(V.isFletching(r))return 'Fletching';
    return RF.DATA.skills?.[r.skill]?.name||title(r.skill||'Crafting');
  };
  V.recipeUsesForItem=function(itemId){
    const uses=[];
    Object.entries(RF.DATA.recipes||{}).forEach(([id,r])=>{
      const inputQty=Number(r?.inputs?.[itemId]||0);if(inputQty<=0)return;
      const outputs=Object.entries(r.outputs||{}).map(([outId,qty])=>{
        const it=RF.DATA.items?.[outId]||{};
        return {id:outId,name:it.name||title(outId),icon:it.icon||'📦',qty:Number(qty)||1};
      });
      uses.push({id,name:r.name||title(id),discipline:V.recipeDiscipline(r),level:Number(r.level)||1,inputQty,outputs,camp:false});
    });
    Object.entries(RF.DATA.campRecipes||{}).forEach(([id,r])=>{
      let inputQty=r?.input===itemId?Number(r.qty||1):0;
      inputQty+=Number(r?.extra?.[itemId]||0);
      if(inputQty<=0)return;
      const outId=r.output,oit=RF.DATA.items?.[outId]||{};
      uses.push({id,name:r.name||title(id),discipline:RF.DATA.skills?.[r.skill]?.name||title(r.skill||'Cooking'),level:Number(r.level)||1,inputQty,outputs:outId?[{id:outId,name:oit.name||title(outId),icon:oit.icon||r.icon||'🍲',qty:1}]:[],camp:true});
    });
    const seen=new Set();
    return uses.filter(u=>{
      const key=[u.name,u.discipline,u.level,u.inputQty,(u.outputs||[]).map(x=>`${x.id}:${x.qty}`).join(',')].join('|');
      if(seen.has(key))return false;seen.add(key);return true;
    }).sort((a,b)=>{
      const ao=a.outputs?.[0]?.name||a.name,bo=b.outputs?.[0]?.name||b.name;
      return String(ao).localeCompare(String(bo),undefined,{sensitivity:'base',numeric:true})||String(a.name).localeCompare(String(b.name),undefined,{sensitivity:'base',numeric:true});
    });
  };
  V.usesHtml=function(itemId){
    const item=RF.DATA.items?.[itemId],uses=V.recipeUsesForItem(itemId);
    if(!item||!uses.length)return '';
    const rows=uses.map(u=>{
      const out=u.outputs?.map(x=>`${x.icon} ${esc(x.name)}${x.qty!==1?` ×${x.qty}`:''}`).join(' + ')||esc(u.name);
      return `<div class="db123UseRow"><span class="db123UseIcon">${u.outputs?.[0]?.icon||'🛠️'}</span><span class="db123UseMeta"><b>${out}</b><small>${esc(u.name)} • ${esc(u.discipline)} Lv ${u.level} • Uses ${u.inputQty} × ${esc(item.name||itemId)}</small></span></div>`;
    }).join('');
    return `<h3 class="db123UsesTitle">Recipes &amp; Uses</h3><div class="db123Uses">${rows}</div>`;
  };

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
  // Enrich item and harvest-resource details without changing the historical detail authority.
  const detailBase=RF.v94DetailHtml;
  if(typeof detailBase==='function')RF.v94DetailHtml=function(s,type,id){
    let h=detailBase.apply(this,arguments);if(!h)return h;
    const itemId=type==='items'?id:(type==='resources'?RF.DATA.resourceDefs?.[id]?.item:null);
    const uses=itemId?V.usesHtml(itemId):'';if(!uses)return h;
    const close=h.lastIndexOf('</div></div>');
    return close>=0?h.slice(0,close)+uses+h.slice(close):h+uses;
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
  .db123UsesTitle{margin-top:18px!important}.db123Uses{display:grid;gap:7px}.db123UseRow{min-width:0;display:grid;grid-template-columns:39px minmax(0,1fr);align-items:center;gap:9px;padding:9px 10px;border:1px solid rgba(184,145,81,.2);border-radius:13px;background:linear-gradient(145deg,rgba(30,25,19,.78),rgba(16,13,10,.82));box-shadow:inset 0 1px rgba(255,255,255,.02)}.db123UseIcon{width:39px;height:39px;display:grid;place-items:center;border:1px solid rgba(191,150,82,.18);border-radius:11px;background:#120f0c;font-size:21px}.db123UseMeta{min-width:0;display:block}.db123UseMeta b{display:block;color:#ead3a5;font-size:11px;line-height:1.3}.db123UseMeta small{display:block;margin-top:3px;color:#9c8f7b;font-size:9px;line-height:1.45}
  @media(max-width:390px){.db122Hero{padding:15px}.db122Hero h2{font-size:24px}.db122Hero p{font-size:10.5px}.db122Count{min-width:61px}.db122Sectors{gap:6px}.db122Sector{min-height:61px;border-radius:13px}.db122Sector span{font-size:22px}.db122Sector b{font-size:8.3px}.db122Result{grid-template-columns:44px minmax(0,1fr) 20px;padding:9px}.db122Icon{width:44px;height:44px;font-size:23px}.db122NameLine em{max-width:86px;overflow:hidden;text-overflow:ellipsis}}
  `;document.head.appendChild(st);
})();

/* Realmforge V12.4.0 — Pack Item Dossier.
   Final post-compatibility owner for Pack item detail presentation and actions.
   Reuses canonical Codex knowledge without adding persistent state. */
(() => {
  'use strict';
  const RF=window.RF;if(!RF?.UI)return;
  const V=RF.Views.ItemDetail=RF.Views.ItemDetail||{};
  V.version='12.4.0';
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const title=v=>String(v||'').replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
  const qty=(s,id)=>Math.max(0,Number(s?.inventory?.[id])||0);
  const db=()=>RF.Views?.Database?.V123||RF.Views?.Database?.V122||null;

  V.sourcesFor=function(id){return typeof RF.v94ItemSources==='function'?RF.v94ItemSources(id):[]};
  V.usesFor=function(id){return db()?.recipeUsesForItem?.(id)||[]};
  V.requirement=function(s,it){
    if(RF.V115?.requirement)return RF.V115.requirement(s,it);
    const r=RF.itemRequirement?.(it);if(!r)return {req:null,met:true,have:0};
    const have=Math.max(1,+s?.skills?.[r.skill]?.level||1);return {req:r,met:have>=r.level,have};
  };

  V.contextLine=function(id,it){
    const uses=V.usesFor(id),n=uses.length,type=String(it?.type||'item').toLowerCase();
    if(it?.tool){const skill=RF.DATA.skills?.[it.tool]?.name||title(it.tool);return `A Tier ${Number(it.tier)||1} ${skill} tool carried in the Tool Belt. Equipping it replaces the current ${skill} tool and keeps the equipped copy outside Pack capacity.`;}
    if(it?.slot){const slots=RF.equipmentSlotsForItem?.(it)||[it.slot];const where=slots.map(x=>RF.V115?.slotLabel?.(x)||title(x)).join(' or ');return `Wearable equipment for ${where}.${n?` It is also used in ${n} known production ${n===1?'recipe':'recipes'}.`:''}`;}
    if(it?.heal||it?.stamina){const bits=[];if(it.heal)bits.push(`${it.heal} health`);if(it.stamina)bits.push(`${it.stamina} stamina`);return `Consumable provisions that restore ${bits.join(' and ')} when used from the Pack.${n?` It also appears in ${n} production ${n===1?'recipe':'recipes'}.`:''}`;}
    if(type==='material'||type==='ammo'){return n?`A production material with ${n} known ${n===1?'use':'uses'} across the realm. The recipes below are generated from the live crafting data.`:'A carried material with no currently recorded production use.';}
    if(type==='quest')return 'A quest-related object. Keep it safe while its associated objective remains active.';
    if(type==='treasure')return n?`A valuable curiosity that also appears in ${n} production ${n===1?'recipe':'recipes'}.`:'A valuable curiosity with no standard production use recorded.';
    return n?`This item appears in ${n} known production ${n===1?'recipe':'recipes'}.`:'A recorded item from your Pack.';
  };

  V.statPills=function(it){
    const rows=[];
    if(it.damage)rows.push(['⚔️','Damage',it.damage]);
    if(it.armor)rows.push(['🛡️','Armour',it.armor]);
    if(it.heal)rows.push(['❤️','Restores',`${it.heal} HP`]);
    if(it.stamina)rows.push(['🟢','Restores',`${it.stamina} stamina`]);
    if(it.tier)rows.push(['⭐','Tier',it.tier]);
    if(it.power!=null)rows.push(['⚙️','Work power',it.power]);
    if(it.control!=null)rows.push(['🎯','Control',`+${Math.round(Number(it.control)*100)}%`]);
    rows.push(['🪙','Base value',`${Number(it.value)||0}g`]);
    return `<div class="v124Stats">${rows.map(([icon,k,v])=>`<div><span>${icon}</span><small>${esc(k)}</small><b>${esc(v)}</b></div>`).join('')}</div>`;
  };

  V.comparisonHtml=function(s,it){
    if(it.tool&&RF.V115?.toolCompareHtml)return `<section class="v124Section"><div class="v124SectionTitle">Tool Belt comparison</div>${RF.V115.toolCompareHtml(s,it,it.tool)}</section>`;
    if(it.slot&&RF.V115?.equipmentCompareHtml){
      const slots=RF.equipmentSlotsForItem?.(it)||[it.slot];
      return `<section class="v124Section"><div class="v124SectionTitle">Compared with worn gear</div><div class="v124Compare">${slots.map(slot=>RF.V115.equipmentCompareHtml(s,it,slot)).join('')}</div></section>`;
    }
    return '';
  };

  V.sourcesHtml=function(id){
    const src=V.sourcesFor(id);
    return `<section class="v124Section"><div class="v124SectionTitle">Known Sources</div><div class="v124Text">${src.length?src.map(esc).join('<br>'):'No standard source recorded.'}</div></section>`;
  };
  V.usesHtml=function(id){
    const html=db()?.usesHtml?.(id)||'';
    return html?`<section class="v124Section v124Uses">${html}</section>`:'';
  };

  V.action=function({icon,label,sub='',attr='',disabled=false,danger=false}){
    return `<button type="button" class="v124Action${danger?' danger':''}" ${attr} ${disabled?'disabled':''}><span>${icon}</span><b>${esc(label)}</b>${sub?`<small>${esc(sub)}</small>`:''}</button>`;
  };
  V.actions=function(s,id,it){
    const q=qty(s,id),rq=V.requirement(s,it),out=[];
    if(it.heal||it.stamina)out.push(V.action({icon:'✨',label:'Use',sub:it.heal?`Restore ${it.heal} HP`:`Restore ${it.stamina} stamina`,attr:`data-v124-use="${esc(id)}"`}));
    if(it.tool){
      const label=RF.v103ToolLabel?.(it.tool)||title(it.tool);
      out.push(V.action({icon:it.icon||'🧰',label:`Equip`,sub:`${label} Tool Belt`,attr:`data-v124-equip-tool="${esc(id)}"`,disabled:q<1||!rq.met}));
    }else if(it.slot){
      const slots=RF.equipmentSlotsForItem?.(it)||[it.slot];
      slots.forEach(slot=>out.push(V.action({icon:RF.V115?.slotMeta?.(slot)?.[1]||it.icon||'🛡️',label:'Equip',sub:RF.V115?.slotLabel?.(slot)||title(slot),attr:`data-v124-equip-slot="${esc(slot)}" data-v124-equip-id="${esc(id)}"`,disabled:q<1||!rq.met})));
    }
    if(q>0)out.push(V.action({icon:'🗑️',label:'Drop 1',sub:'Discard one',attr:`data-v124-drop-one="${esc(id)}"`,danger:true}));
    if(q>1)out.push(V.action({icon:'🗑️',label:`Drop All`,sub:`Discard ${q}`,attr:`data-v124-drop-all="${esc(id)}"`,danger:true}));
    out.push(V.action({icon:'✕',label:'Close',sub:'Return to Pack',attr:'data-v124-close'}));
    return `<div class="v124ActionGrid" style="--v124-cols:${Math.min(4,out.length)}">${out.join('')}</div>`;
  };

  V.detailHtml=function(s,id){
    const it=RF.DATA.items?.[id],q=qty(s,id);if(!it||q<1)return '';
    const rq=V.requirement(s,it),req=rq.req?`<div class="v124Requirement ${rq.met?'met':'unmet'}"><span>${rq.met?'✓':'🔒'}</span><div><b>${rq.met?'Requirement met':'Requirement locked'}</b><small>${esc(RF.DATA.skills?.[rq.req.skill]?.name||rq.req.skill)} Lv ${rq.req.level} • You: ${rq.have}</small></div></div>`:'';
    const rarity=it.rarity||'Common',type=title(it.type||'Item');
    return `<div class="modalBack v124Back"><div class="modal v124ItemModal"><button type="button" class="v124TopClose" data-v124-close aria-label="Close">✕</button><span class="v124Eyebrow">PACK DOSSIER • ${esc(type.toUpperCase())}</span><div class="v124Hero"><span class="v124HeroIcon">${it.icon||'📦'}</span><div><span class="v124Owned">${esc(rarity)} • ${esc(type)} • OWNED ×${q}</span><h2>${esc(it.name||id)}</h2></div></div><div class="v124Description"><p>${esc(it.desc||'No description recorded.')}</p><small>${esc(V.contextLine(id,it))}</small></div>${V.statPills(it)}${req}${V.comparisonHtml(s,it)}${V.sourcesHtml(id)}${V.usesHtml(id)}<section class="v124Actions"><div class="v124SectionTitle">Actions</div>${V.actions(s,id,it)}</section></div></div>`;
  };

  const modalBase=RF.UI.modalHtml.bind(RF.UI);
  RF.UI.modalHtml=function(s){
    const m=this.modal;
    if(m?.type==='itemDetail'&&qty(s,m.id)>0)return V.detailHtml(s,m.id);
    return modalBase(s);
  };

  const bindBase=RF.UI.bind.bind(RF.UI);
  RF.UI.bind=function(s){
    bindBase(s);
    document.querySelectorAll('[data-v124-close]').forEach(b=>b.onclick=()=>{RF.UI.modal=null;RF.UI.render(RF.state)});
    document.querySelectorAll('[data-v124-use]').forEach(b=>b.onclick=()=>{
      const id=b.dataset.v124Use;RF.useItem?.(id);
      if((RF.state?.inventory?.[id]||0)>0)RF.UI.modal={type:'itemDetail',id};else RF.UI.modal=null;
      RF.UI.render(RF.state);
    });
    document.querySelectorAll('[data-v124-drop-one]').forEach(b=>b.onclick=()=>{
      const id=b.dataset.v124DropOne;RF.dropItem?.(id,1);
      RF.UI.modal=(RF.state?.inventory?.[id]||0)>0?{type:'itemDetail',id}:null;RF.UI.render(RF.state);
    });
    document.querySelectorAll('[data-v124-drop-all]').forEach(b=>b.onclick=()=>{
      const id=b.dataset.v124DropAll;RF.dropItem?.(id,Math.max(0,RF.state?.inventory?.[id]||0));RF.UI.modal=null;RF.UI.render(RF.state);
    });
    document.querySelectorAll('[data-v124-equip-tool]').forEach(b=>b.onclick=()=>{
      const id=b.dataset.v124EquipTool,it=RF.DATA.items?.[id],ok=RF.equipTool?.(id);if(ok===false)return;
      RF.UI.modal={type:'v115Slot',kind:'toolbelt',slot:it?.tool};RF.UI.render(RF.state);
    });
    document.querySelectorAll('[data-v124-equip-slot]').forEach(b=>b.onclick=()=>{
      const id=b.dataset.v124EquipId,slot=b.dataset.v124EquipSlot,ok=RF.equipToSlot?.(id,slot);if(ok===false)return;
      RF.UI.modal={type:'v115Slot',kind:'equipment',slot};RF.UI.render(RF.state);
    });
  };

  const oldStyle=document.getElementById('rf-item-detail-v124-style');if(oldStyle)oldStyle.remove();
  const st=document.createElement('style');st.id='rf-item-detail-v124-style';st.textContent=`
  .v124ItemModal{position:relative;width:min(640px,100%);max-height:91dvh;overflow:auto;padding:19px 16px 16px;border:1px solid rgba(211,166,91,.32)!important;border-radius:24px!important;background:radial-gradient(circle at 86% 0,rgba(196,138,55,.13),transparent 28%),linear-gradient(150deg,#241c14,#12100d 72%)!important;box-shadow:0 24px 78px rgba(0,0,0,.72)!important;color:var(--ink)}
  .v124TopClose{position:absolute;z-index:2;top:12px;right:12px;width:40px;height:40px;border:1px solid rgba(211,166,91,.34);border-radius:13px;background:#251c13;color:#efce8b;font-size:20px;line-height:1}.v124Eyebrow{display:block;padding-right:48px;color:#a98a59;font-size:8.5px;font-weight:900;letter-spacing:.18em;text-transform:uppercase}
  .v124Hero{display:grid;grid-template-columns:70px minmax(0,1fr);gap:14px;align-items:center;margin-top:10px;padding:12px;border:1px solid rgba(211,168,98,.15);border-radius:18px;background:rgba(8,7,6,.22)}.v124HeroIcon{width:68px;height:68px;display:grid;place-items:center;border:1px solid rgba(215,170,96,.2);border-radius:17px;background:radial-gradient(circle at 35% 25%,rgba(224,181,108,.08),transparent 60%),#12100d;font-size:40px}.v124Hero h2{margin:4px 0 0;color:#f1dba9;font:700 24px/1.06 Georgia,serif}.v124Owned{color:#a59070;font-size:8.5px;font-weight:850;letter-spacing:.12em;text-transform:uppercase}
  .v124Description{margin-top:10px;padding:12px 13px;border:1px solid #3c3127;border-radius:15px;background:#17130f}.v124Description p{margin:0;color:#e1d5c0;font-size:13px;line-height:1.48}.v124Description small{display:block;margin-top:7px;padding-top:7px;border-top:1px solid rgba(255,255,255,.055);color:#948874;font-size:9.5px;line-height:1.5}
  .v124Stats{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px;margin-top:10px}.v124Stats>div{min-width:0;display:grid;grid-template-columns:24px minmax(0,1fr);grid-template-rows:auto auto;column-gap:6px;padding:8px 9px;border:1px solid rgba(210,163,89,.16);border-radius:13px;background:#12100d}.v124Stats>div>span{grid-row:1/3;align-self:center;font-size:17px}.v124Stats small{color:#857864;font-size:7.5px;text-transform:uppercase;letter-spacing:.08em}.v124Stats b{color:#dcc79e;font-size:10.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .v124Requirement{display:grid;grid-template-columns:30px minmax(0,1fr);gap:8px;align-items:center;margin-top:10px;padding:9px 10px;border-radius:13px;border:1px solid rgba(102,145,92,.28);background:rgba(54,84,48,.16)}.v124Requirement.unmet{border-color:rgba(176,101,82,.34);background:rgba(105,46,36,.16)}.v124Requirement>span{font-size:18px;text-align:center}.v124Requirement b{display:block;color:#cfe0bd;font-size:10px}.v124Requirement.unmet b{color:#e5b0a0}.v124Requirement small{display:block;margin-top:2px;color:#9c8f7b;font-size:8.5px}
  .v124Section{margin-top:14px;min-width:0}.v124SectionTitle{margin:0 0 7px;color:#d7b978;font:700 13px/1.2 Georgia,serif}.v124Text{padding:10px 11px;border:1px solid #3c3127;border-radius:13px;background:#12100d;color:#bbae97;font-size:10px;line-height:1.55}.v124Compare{display:grid;gap:7px}.v124Uses .db123UsesTitle{display:none!important}.v124Uses .db123Uses{margin-top:0}
  .v124Actions{margin-top:16px;padding-top:13px;border-top:1px solid rgba(215,170,96,.13)}.v124ActionGrid{display:grid;grid-template-columns:repeat(var(--v124-cols,4),minmax(0,1fr));gap:8px}.v124Action{min-width:0;aspect-ratio:1/1;min-height:72px;padding:8px 5px;border:1px solid #4a3928;border-radius:15px;background:linear-gradient(155deg,#281e14,#17120e);color:#e7d6b7;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;box-shadow:inset 0 1px rgba(255,255,255,.025),0 5px 13px rgba(0,0,0,.17)}.v124Action:active{transform:scale(.975);border-color:#936b38}.v124Action>span{font-size:20px;line-height:1}.v124Action>b{display:block;margin-top:6px;font-size:9.5px;line-height:1.15}.v124Action>small{display:block;max-width:100%;margin-top:3px;color:#8f816d;font-size:7.5px;line-height:1.2;overflow:hidden;text-overflow:ellipsis}.v124Action.danger{border-color:rgba(155,71,57,.5);background:linear-gradient(155deg,rgba(76,35,28,.62),#17110e)}.v124Action.danger>b{color:#e4b0a2}.v124Action:disabled{opacity:.38;filter:saturate(.4);pointer-events:none}
  @media(max-width:390px){.v124ItemModal{padding:16px 12px 13px}.v124Hero{grid-template-columns:60px minmax(0,1fr);gap:11px;padding:10px}.v124HeroIcon{width:58px;height:58px;font-size:34px}.v124Hero h2{font-size:21px}.v124ActionGrid{gap:6px}.v124Action{min-height:66px;border-radius:13px;padding:6px 3px}.v124Action>span{font-size:18px}.v124Action>b{font-size:8.8px}.v124Action>small{font-size:7px}}
  `;document.head.appendChild(st);

  RF.Modules?.register?.('ui.itemDetail',V,{owner:'ui',status:'canonical',introducedIn:'12.4.0',persistence:'none'});
})();

/* Realmforge V12.5.0 — Hardcore Campaign Rules.
   Final canonical owner for campaign mode selection, permadeath and character-record presentation. */
(() => {
  'use strict';
  const RF=window.RF;
  if(!RF?.UI||!RF.Core?.Campaigns||!RF.Core?.State)throw new Error('Hardcore campaign rules require canonical UI and persistence.');

  const api={
    version:'12.5.0',
    mode:s=>s?.campaign?.mode==='hardcore'?'hardcore':'standard',
    isHardcore:s=>s?.campaign?.mode==='hardcore',
    isGameOver:s=>s?.campaign?.mode==='hardcore'&&s?.campaign?.gameOver===true
  };

  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  // ----- Character creation -----
  const creatorBase=RF.UI.creator.bind(RF.UI);
  RF.UI.creator=function(){
    let h=creatorBase();
    const block=`<div class="field v125ModeField"><label>Campaign Rules</label>
      <div class="v125ModeGrid">
        <button type="button" class="v125ModeChoice selected" data-v125-standard><span>🛡️</span><b>Standard</b><small>Defeat hurts, but your journey continues.</small></button>
        <button type="button" class="v125ModeChoice hardcore" data-v125-hardcore-open><span>☠️</span><b>Hardcore</b><small>One life. Death ends the campaign.</small></button>
      </div>
      <div class="v125ModeNote" data-v125-mode-note>Standard campaign • Defeat uses Realmforge's normal recovery rules.</div>
    </div>
    <div class="v125HardcoreConfirm" data-v125-hardcore-confirm hidden>
      <div class="v125HardcoreWarning"><span class="v125Skull">☠️</span><div><b>Enable Hardcore?</b><p>If this character dies, the campaign is permanently over. The fallen save remains as a memorial, but it cannot be resumed or revived.</p><strong>This choice cannot be changed after creation.</strong></div></div>
      <div class="v125ConfirmActions"><button type="button" data-v125-hardcore-enable>Enable Hardcore</button><button type="button" data-v125-hardcore-cancel>Cancel</button></div>
    </div>`;
    return h.replace('<button id="startGame" class="startBtn">',block+'<button id="startGame" class="startBtn">');
  };

  const bindCreatorBase=RF.UI.bindCreator.bind(RF.UI);
  RF.UI.bindCreator=function(){
    bindCreatorBase();
    let mode='standard';
    const standard=document.querySelector('[data-v125-standard]'),hardcore=document.querySelector('[data-v125-hardcore-open]');
    const confirmBox=document.querySelector('[data-v125-hardcore-confirm]'),note=document.querySelector('[data-v125-mode-note]');
    const applyMode=next=>{
      mode=next;
      standard?.classList.toggle('selected',next==='standard');
      hardcore?.classList.toggle('selected',next==='hardcore');
      if(note)note.innerHTML=next==='hardcore'
        ? '<b>☠ Hardcore campaign</b> • One life. Death permanently ends this campaign.'
        : "Standard campaign • Defeat uses Realmforge's normal recovery rules.";
    };
    standard?.addEventListener('click',()=>applyMode('standard'));
    hardcore?.addEventListener('click',()=>{if(confirmBox)confirmBox.hidden=false;});
    document.querySelector('[data-v125-hardcore-enable]')?.addEventListener('click',()=>{applyMode('hardcore');if(confirmBox)confirmBox.hidden=true;});
    document.querySelector('[data-v125-hardcore-cancel]')?.addEventListener('click',()=>{if(confirmBox)confirmBox.hidden=true;});
    const start=document.getElementById('startGame');
    if(start)start.onclick=()=>{
      const name=document.getElementById('charName')?.value?.trim()||'';
      if(!name){document.getElementById('charName')?.focus();return;}
      const chosen=document.querySelector('.bgopt.sel')?.dataset?.bg||'farmer';
      const avatar=document.getElementById('avatar')?.value||'🧑';
      RF.startNew(name,chosen,avatar,{mode});
    };
  };

  // ----- Character record -----
  const characterBase=RF.UI.character.bind(RF.UI);
  RF.UI.character=function(s){
    let h=characterBase(s);
    if(api.isHardcore(s)){
      const banner=`<section class="v125HardcoreBanner"><div><span>☠️</span><div><b>HARDCORE CAMPAIGN</b><small>One life • Death permanently ends this run</small></div></div><strong>ALIVE</strong></section>`;
      const firstEnd=h.indexOf('</section>');
      if(firstEnd>=0)h=h.slice(0,firstEnd+10)+banner+h.slice(firstEnd+10);
    }else{
      const deaths=Math.max(0,Number(s?.stats?.deaths)||0);
      h=h.replace('<section class="card"><h3>Lifetime</h3><div class="statsGrid">',`<section class="card"><h3>Lifetime</h3><div class="statsGrid"><div class="statbox v125DeathStat"><span>💀 Deaths</span><b>${deaths}</b></div>`);
    }
    return h;
  };

  // ----- Hardcore permadeath -----
  const loseBase=RF.loseV4Battle;
  RF.loseV4Battle=function(...args){
    const s=RF.state;
    if(!api.isHardcore(s))return loseBase?.apply(this,args);
    if(!s||api.isGameOver(s))return false;
    const combat=s.combat||{},enemy=RF.DATA?.enemies?.[combat.id],enemyName=enemy?.name||'an unknown foe';
    s.stats=s.stats||{};s.stats.deaths=(s.stats.deaths||0)+1;
    s.campaign=s.campaign||{};s.campaign.mode='hardcore';s.campaign.gameOver=true;s.campaign.endedAt=Date.now();
    s.campaign.death={enemyId:combat.id||null,enemyName,day:s.day||1,minute:s.minute||0,location:s.location||'unknown',level:s.player?.level||1};
    if(s.player){s.player.hp=0;s.player.stamina=0;}
    s.combat=null;s.activity=null;s.speed=0;s.paused=true;
    RF.log?.(s,`Hardcore death: ${s.player?.name||'The wanderer'} fell to ${enemyName}. This campaign is over.`,'bad');
    RF.UI.modal=null;RF.save(s);RF.UI.render(s);return false;
  };

  function deathPlace(s){
    const d=s?.campaign?.death||{},loc=RF.DATA?.locations?.[d.location]?.name||d.location||'Unknown';
    return {d,loc};
  }
  function gameOverHtml(s){
    const {d,loc}=deathPlace(s),mins=Math.max(0,Number(d.minute)||0),hh=String(Math.floor(mins/60)%24).padStart(2,'0'),mm=String(Math.floor(mins%60)).padStart(2,'0');
    return `<main class="v125GameOver">
      <section class="v125Memorial">
        <div class="v125GameOverMark">☠️</div><span class="v125GameOverEyebrow">HARDCORE CAMPAIGN</span>
        <h1>Game Over</h1><h2>${esc(s.player?.avatar||'🧑')} ${esc(s.player?.name||'Wanderer')}</h2>
        <p>${esc(s.player?.name||'Your wanderer')} fell to <b>${esc(d.enemyName||'an unknown foe')}</b>. This campaign is permanently concluded.</p>
        <div class="v125MemorialGrid">
          <div><small>Final Level</small><b>${Number(d.level)||s.player?.level||1}</b></div>
          <div><small>Day</small><b>${Number(d.day)||s.day||1} • ${hh}:${mm}</b></div>
          <div><small>Location</small><b>${esc(loc)}</b></div>
          <div><small>Total XP</small><b>${Number(s.player?.xp||0).toLocaleString()}</b></div>
          <div><small>Enemies Defeated</small><b>${Number(s.stats?.enemiesKilled||0).toLocaleString()}</b></div>
          <div><small>Gold</small><b>${Number(s.gold||0).toLocaleString()}g</b></div>
        </div>
        <div class="v125FinalRule">☠ The save is preserved as a memorial, but gameplay cannot resume.</div>
        <div class="v125GameOverActions">
          <button data-v125-new-character><span>✨</span><b>New Character</b><small>Begin a separate campaign</small></button>
          <button data-v125-main-menu><span>🏰</span><b>Main Menu</b><small>Return to campaign selection</small></button>
          <button data-v125-export-final><span>📤</span><b>Export Memorial</b><small>Keep a portable final save</small></button>
        </div>
      </section>
    </main>`;
  }
  function bindGameOver(){
    document.querySelector('[data-v125-main-menu]')?.addEventListener('click',()=>{
      RF.Core.Campaigns.saveNow?.();if(RF.V101){RF.V101.mainMenu=true;RF.V101.renderMainMenu?.();}
    });
    document.querySelector('[data-v125-new-character]')?.addEventListener('click',()=>{
      RF.Core.Campaigns.saveNow?.();RF.Core.Campaigns.activate('',null);RF.state=null;RF.UI.modal=null;
      if(RF.V1011)RF.V1011.allowCreator=true;if(RF.V101)RF.V101.mainMenu=false;RF.UI.render(null);
    });
    document.querySelector('[data-v125-export-final]')?.addEventListener('click',async()=>{
      const btn=document.querySelector('[data-v125-export-final]');
      try{
        const r=await RF.Core.State.exportSlot(RF.Core.Campaigns.activeId());
        if(btn){const b=btn.querySelector?.('b');if(b)b.textContent=r?.method==='file'?'Memorial Exported':'Memorial Copied';}
      }catch(err){console.warn(err);if(btn){const b=btn.querySelector?.('b');if(b)b.textContent='Export Failed';}}
    });
  }

  const renderBase=RF.UI.render.bind(RF.UI);
  RF.UI.render=function(s){
    if(s&&api.isGameOver(s)){
      const root=document.getElementById('app');if(!root)return;
      root.innerHTML=gameOverHtml(s);bindGameOver(s);return root.innerHTML;
    }
    return renderBase(s);
  };

  const style=document.createElement('style');style.id='rf-hardcore-v125-style';style.textContent=`
    .v125ModeField{margin-top:14px}.v125ModeGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.v125ModeChoice{min-height:96px;padding:12px 10px;border:1px solid #46392a;border-radius:16px;background:#17130f;color:#c8b89c;text-align:left}.v125ModeChoice>span{display:block;font-size:22px}.v125ModeChoice b,.v125ModeChoice small{display:block}.v125ModeChoice b{margin-top:5px;color:#e6d2ab;font-size:13px}.v125ModeChoice small{margin-top:4px;color:#8e826f;font-size:9px;line-height:1.35}.v125ModeChoice.selected{border-color:#b9873d;background:linear-gradient(145deg,rgba(168,111,39,.21),#18130e);box-shadow:inset 0 0 0 1px rgba(220,174,97,.12)}.v125ModeChoice.hardcore.selected{border-color:#a84d43;background:linear-gradient(145deg,rgba(133,45,39,.28),#190f0d)}.v125ModeNote{margin-top:8px;padding:9px 10px;border:1px solid #3a3025;border-radius:12px;background:#12100d;color:#968875;font-size:9px;line-height:1.45}.v125ModeNote b{color:#e6a095}
    .v125HardcoreConfirm{margin-top:10px;padding:12px;border:1px solid #7f3f39;border-radius:16px;background:linear-gradient(145deg,#25110f,#160d0c);box-shadow:0 12px 30px rgba(0,0,0,.25)}.v125HardcoreWarning{display:grid;grid-template-columns:38px minmax(0,1fr);gap:10px}.v125Skull{font-size:28px}.v125HardcoreWarning b{color:#f0b0a1;font:700 15px Georgia,serif}.v125HardcoreWarning p{margin:5px 0;color:#d2b8ad;font-size:10px;line-height:1.45}.v125HardcoreWarning strong{color:#e7c98d;font-size:9px}.v125ConfirmActions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:11px}.v125ConfirmActions button{min-height:42px;border:1px solid #574332;border-radius:12px;background:#211812;color:#dbc59e;font-weight:800}.v125ConfirmActions button:first-child{border-color:#a34840;background:#3a1714;color:#f3b6aa}
    .v125HardcoreBanner{margin:0 0 14px;padding:11px 13px;border:1px solid rgba(192,75,63,.55);border-radius:17px;background:radial-gradient(circle at 90% 10%,rgba(184,70,52,.18),transparent 40%),linear-gradient(140deg,#24100e,#16100d);display:flex;align-items:center;justify-content:space-between;gap:10px;box-shadow:0 10px 28px rgba(0,0,0,.22)}.v125HardcoreBanner>div{display:flex;align-items:center;gap:10px}.v125HardcoreBanner>div>span{font-size:27px}.v125HardcoreBanner b,.v125HardcoreBanner small{display:block}.v125HardcoreBanner b{color:#f0b1a1;font-size:12px;letter-spacing:.08em}.v125HardcoreBanner small{margin-top:2px;color:#b99c91;font-size:9px}.v125HardcoreBanner>strong{padding:5px 8px;border:1px solid rgba(219,144,93,.35);border-radius:999px;color:#e8c17f;font-size:9px;letter-spacing:.1em}
    .v125DeathStat{border-color:rgba(126,92,71,.55)!important}.v125SaveHardcore{color:#e2a194;font-size:9px}.v125SaveFallen{color:#d07869;font-size:9px}
    .v125GameOver{min-height:100dvh;display:grid;place-items:center;padding:max(24px,env(safe-area-inset-top)) 18px max(24px,env(safe-area-inset-bottom));background:radial-gradient(circle at 50% 8%,rgba(130,34,28,.23),transparent 35%),linear-gradient(#0e0908,#070606);color:#e6d8bd}.v125Memorial{width:min(620px,100%);padding:22px;border:1px solid #69382f;border-radius:26px;background:radial-gradient(circle at 80% 0,rgba(169,67,45,.12),transparent 35%),#17100e;box-shadow:0 30px 90px rgba(0,0,0,.75);text-align:center}.v125GameOverMark{font-size:54px}.v125GameOverEyebrow{display:block;margin-top:6px;color:#b86f60;font-size:9px;font-weight:900;letter-spacing:.22em}.v125Memorial h1{margin:7px 0 2px;color:#edb2a4;font:700 38px Georgia,serif}.v125Memorial h2{margin:0;color:#ead4a7;font:700 22px Georgia,serif}.v125Memorial>p{margin:14px auto;max-width:470px;color:#bbaa94;font-size:11px;line-height:1.6}.v125MemorialGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;text-align:left}.v125MemorialGrid>div{padding:10px 11px;border:1px solid #392a23;border-radius:13px;background:#110d0b}.v125MemorialGrid small,.v125MemorialGrid b{display:block}.v125MemorialGrid small{color:#826f61;font-size:8px;text-transform:uppercase;letter-spacing:.08em}.v125MemorialGrid b{margin-top:3px;color:#dbc7a1;font-size:11px}.v125FinalRule{margin-top:12px;padding:10px;border:1px solid #743c34;border-radius:13px;background:#24110f;color:#dca99d;font-size:9px;font-weight:800}.v125GameOverActions{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:14px}.v125GameOverActions button{min-height:92px;padding:10px 7px;border:1px solid #4e3829;border-radius:15px;background:#1c1511;color:#d9c49e}.v125GameOverActions span,.v125GameOverActions b,.v125GameOverActions small{display:block}.v125GameOverActions span{font-size:20px}.v125GameOverActions b{margin-top:4px;font-size:10px}.v125GameOverActions small{margin-top:3px;color:#897a68;font-size:7.5px;line-height:1.35}@media(max-width:430px){.v125ModeGrid{grid-template-columns:1fr}.v125GameOverActions{grid-template-columns:repeat(2,minmax(0,1fr))}.v125GameOverActions button:first-child{grid-column:1/-1}.v125MemorialGrid{grid-template-columns:1fr 1fr}}
  `;document.head.appendChild(style);

  RF.CampaignMode=RF.Modules.register('systems.hardcore',api,{owner:'systems',status:'canonical',introducedIn:'12.5.0',persistent:true,saveSchema:'12.5.0'});
})();

/* Realmforge V12.6.0 — Canonical Energy Scale.
   Expands character Energy capacity to a 1000-point baseline while preserving activity costs.
   The save migration preserves each existing character's percentage-full Energy state. */
(() => {
  'use strict';
  const RF=window.RF;
  const BASE=1000, PER_LEVEL=20;
  const maxEnergy=level=>{
    level=Math.max(1,Math.min(100,Number(level)||1));
    return BASE+(level-1)*PER_LEVEL;
  };
  function sync(s,preserveGain=true){
    if(!s?.player)return s;
    const next=maxEnergy(s.player.level);
    let oldMax=Math.max(1,Number(s.player.maxEnergy)||next);
    let cur=Number(s.player.energy);if(!Number.isFinite(cur))cur=oldMax;
    if(preserveGain&&next>oldMax)cur+=next-oldMax;
    s.player.maxEnergy=next;
    s.player.energy=Math.max(0,Math.min(next,cur));
    s.v126=s.v126||{};s.v126.energyScale=10;
    return s;
  }
  if(RF.V1022){
    RF.V1022.maxEnergy=maxEnergy;
    RF.V1022.syncEnergyCap=sync;
  }
  // Historical v10.22 normalization calls syncEnergyCap by reference, so replacing it
  // here prevents any future save/load normalization from shrinking V12.6 Energy back
  // to the old 100-point curve.
  const baseNewGame=RF.newGame;
  if(typeof baseNewGame==='function')RF.newGame=function(...args){
    const s=baseNewGame.apply(this,args);if(!s?.player)return s;
    const next=maxEnergy(s.player.level);
    // Fresh campaigns should always begin full. Imported/migrated states are handled by core migration.
    s.player.maxEnergy=next;s.player.energy=next;s.v126=s.v126||{};s.v126.energyScale=10;return s;
  };
  if(RF.state){
    const target=Number(RF.state.v126?.energyMigrationTarget);
    sync(RF.state,false);
    if(Number.isFinite(target))RF.state.player.energy=Math.max(0,Math.min(RF.state.player.maxEnergy,target));
    if(RF.state.v126)delete RF.state.v126.energyMigrationTarget;
  }
  const api={version:'12.6.0',base:BASE,perLevel:PER_LEVEL,maxEnergy,sync,costsPreserved:true};
  RF.Systems.EnergyScale=RF.Modules.register('systems.energyScale',api,{owner:'systems',status:'canonical',persistentScale:10});
})();

/* Realmforge V12.6.0 — Modern Village Workshop.
   Final presentation owner for Greenvale workshop categories and modal chrome. */
(() => {
  'use strict';
  const RF=window.RF,V=RF.V1028;
  if(!RF.UI||!V)throw new Error('Modern Workshop requires RF.UI and V10.28 workshop runtime.');
  const labels={all:'All Recipes',weapons:'Weapons',armour:'Armour',consumables:'Consumables',materials:'Materials',tools:'Tools',treasure:'Treasure',other:'Other'};
  const icons={all:'⚒️',weapons:'⚔️',armour:'🛡️',consumables:'🧪',materials:'🧱',tools:'🛠️',treasure:'💎',other:'📦'};
  const baseBind=RF.UI.bind.bind(RF.UI);
  V.workshopModal=function(s){
    const cat=V.category(s),entries=V.recipeEntries(s),rows=entries.map(([id,r])=>V.recipeRow(s,id,r)).join('');
    const tabs=V.categories.map(id=>`<button type="button" class="v126WorkshopTab ${cat===id?'active':''}" data-v126-workshop-category="${id}"><span>${icons[id]||'•'}</span><b>${labels[id]||V.categoryLabel(id)}</b></button>`).join('');
    const all=Object.entries(RF.DATA?.recipes||{}).filter(([,r])=>r?.skill!=='cooking').length;
    return `<div class="modalBack"><div class="modal itemModal v1028WorkshopModal v126WorkshopModal"><button class="rfCloseX v126WorkshopClose" data-v126-workshop-close aria-label="Close Workshop">×</button><div class="v126WorkshopHero"><div class="v126WorkshopIcon">⚒️</div><div><span class="eyebrow">GREENVALE • PRODUCTION HUB</span><h2>Village Workshop</h2><p>Forge, craft and brew using materials from your Pack first, then Greenvale Bank.</p></div></div><div class="v126WorkshopSummary"><span><b>${entries.length}</b> shown</span><span><b>${all}</b> workshop recipes</span><span><b>${s.skills?.smithing?.level||1}</b> Smithing</span></div><div class="v126WorkshopTabs" role="tablist" aria-label="Workshop recipe categories">${tabs}</div><div class="list v1028RecipeList v126RecipeList">${rows||'<div class="v126WorkshopEmpty">No recipes in this category yet.</div>'}</div><div class="notice v126CookingNote">🍳 Cooking remains separate: use an active campfire or your cottage kitchen.</div></div></div>`;
  };
  RF.UI.bind=function(s){
    baseBind(s||RF.state);
    document.querySelectorAll('[data-v126-workshop-close]').forEach(b=>b.onclick=()=>{RF.UI.modal=null;RF.UI.render(RF.state)});
    document.querySelectorAll('[data-v126-workshop-category]').forEach(b=>b.onclick=()=>{
      const st=RF.state,id=b.dataset.v126WorkshopCategory;if(!st||!V.categories.includes(id))return;
      st.v1028=st.v1028||{};st.v1028.category=id;RF.save?.(st);RF.UI.modal={type:'v1028Workshop'};RF.UI.render(st);
    });
  };
  const old=document.getElementById('rf-v126-workshop-style');if(old)old.remove();
  const st=document.createElement('style');st.id='rf-v126-workshop-style';st.textContent=`
    .v126WorkshopModal{position:relative;width:min(680px,calc(100vw - 24px));max-width:100%;min-width:0;max-height:min(88dvh,900px);overflow:auto;padding:20px 16px 18px;border-color:rgba(215,169,84,.42);background:radial-gradient(circle at 90% 0%,rgba(155,102,31,.12),transparent 32%),linear-gradient(180deg,#21180f,#120e0a 55%,#0d0a08)}
    .v126WorkshopClose{position:absolute;top:12px;right:12px;z-index:3}.v126WorkshopHero{display:grid;grid-template-columns:64px minmax(0,1fr);gap:13px;align-items:center;padding-right:48px}.v126WorkshopIcon{width:62px;height:62px;display:grid;place-items:center;border-radius:18px;font-size:34px;background:linear-gradient(145deg,rgba(111,72,27,.85),rgba(36,25,16,.95));border:1px solid rgba(219,170,86,.3);box-shadow:inset 0 0 28px rgba(224,161,63,.06)}
    .v126WorkshopHero h2{margin:2px 0 3px;color:#f0d79e}.v126WorkshopHero p{margin:0;color:#b9aa91;font-size:12px;line-height:1.45}.v126WorkshopSummary{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;margin:14px 0 12px}.v126WorkshopSummary span{min-width:0;padding:8px 7px;border:1px solid rgba(211,166,85,.16);border-radius:12px;background:rgba(255,255,255,.025);text-align:center;color:#a9987c;font-size:9px}.v126WorkshopSummary b{display:block;color:#e8ca8d;font-size:13px;margin-bottom:1px}
    .v126WorkshopTabs{width:100%;max-width:100%;min-width:0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));grid-template-rows:repeat(2,auto);gap:7px;margin:0 0 13px}.v126WorkshopTab{min-width:0;min-height:62px;padding:7px 4px;border:1px solid rgba(203,159,78,.18);border-radius:14px;background:linear-gradient(180deg,rgba(42,31,21,.9),rgba(18,13,10,.98));color:#b9aa90;font:inherit;text-align:center;display:grid;place-items:center;align-content:center;gap:3px}.v126WorkshopTab span{font-size:18px;line-height:1}.v126WorkshopTab b{font-size:8px;line-height:1.15;white-space:normal;overflow-wrap:anywhere}.v126WorkshopTab.active{border-color:#c99642;background:linear-gradient(180deg,rgba(112,74,29,.88),rgba(54,36,20,.98));color:#f2d79d;box-shadow:inset 0 0 0 1px rgba(242,198,116,.08),0 0 18px rgba(188,126,42,.08)}
    .v126RecipeList{min-width:0;margin-top:0;display:grid;gap:8px}.v126RecipeList .v1028RecipeRow{margin:0;border-radius:15px;background:linear-gradient(180deg,rgba(31,24,18,.94),rgba(15,12,9,.98));border-color:rgba(203,159,78,.16)}.v126WorkshopEmpty{padding:24px 12px;border:1px dashed rgba(202,159,80,.22);border-radius:14px;text-align:center;color:#9f927c}.v126CookingNote{margin-top:13px}
    @media(max-width:430px){.v126WorkshopModal{width:calc(100vw - 18px);padding:17px 11px 14px}.v126WorkshopHero{grid-template-columns:52px minmax(0,1fr);gap:10px}.v126WorkshopIcon{width:50px;height:50px;border-radius:14px;font-size:28px}.v126WorkshopHero p{font-size:10px}.v126WorkshopTabs{gap:6px}.v126WorkshopTab{min-height:57px;padding:6px 3px}.v126WorkshopTab b{font-size:7.5px}.v126WorkshopSummary span{font-size:8px;padding:7px 4px}}
  `;document.head.appendChild(st);
  const api={version:'12.6.0',columns:4,rows:2,categories:[...V.categories]};
  RF.Views.Workshop=RF.Modules.register('ui.workshop',api,{owner:'ui',status:'canonical',presentation:'4x2-category-grid'});
})();

/* Realmforge V12.6.0 — canonical system/UI ownership verification. */
(() => {
  'use strict';
  const RF=window.RF;
  // Apply canonical gathering content packs only after the mature historical resource tables exist.
  RF.Systems?.Gathering?.applyConfiguredContent?.();
  const commerce=RF.Systems?.Commerce,dungeons=RF.Systems?.Dungeons,travel=RF.Systems?.Travel,quests=RF.Systems?.Quests,wayfinder=RF.Systems?.Wayfinder;
  const combat=RF.Systems?.Combat,equipment=RF.Systems?.Equipment,inventory=RF.Systems?.Inventory,research=RF.Systems?.Research,crafting=RF.Systems?.Crafting,skills=RF.Systems?.Skills,character=RF.Systems?.Character,collection=RF.Systems?.Collection,specialist=RF.Systems?.Specialist,cadence=RF.Systems?.Cadence;
  const fieldcraft=RF.Systems?.Fieldcraft,gathering=RF.Systems?.Gathering,hunting=RF.Systems?.Hunting,fishing=RF.Systems?.Fishing,cooking=RF.Systems?.Cooking,world=RF.Systems?.World,worldEvents=RF.Systems?.WorldEvents,social=RF.Systems?.Social,encounters=RF.Systems?.Encounters;
  const exploration=RF.Systems?.Exploration,locks=RF.Systems?.Locks,crime=RF.Systems?.Crime,property=RF.Systems?.Property,timeEnergy=RF.Systems?.TimeEnergy,energyScale=RF.Systems?.EnergyScale;
  const focusClock=RF.Views?.FocusClock,database=RF.Views?.Database,workshop=RF.Views?.Workshop,navigation=RF.Views?.Navigation,presentation=RF.Views?.Presentation,overlays=RF.Views?.Overlays,appShell=RF.Views?.AppShell,saveManager=RF.Views?.SaveManager,developer=RF.Views?.Developer,itemBrowser=RF.Views?.ItemBrowser,itemDetail=RF.Views?.ItemDetail,hardcore=RF.CampaignMode,worldActions=RF.Views?.WorldActions,lifecycle=RF.Core?.Lifecycle,scopedRuntime=RF.Core?.ScopedRuntime,migrations=RF.Core?.Migrations,compatClassification=RF.Core?.CompatibilityClassification,authoring=RF.Authoring,assets=RF.Assets;
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
    timeEnergyCanonical:canonical('systems.timeEnergy',timeEnergy),timeEnergyStages:hasAll(timeEnergy,expected.timeEnergyStages),timeEnergyFragments:hasFrags(timeEnergy,expected.timeEnergyFragments),energyScaleCanonical:canonical('systems.energyScale',energyScale)&&energyScale?.version==='12.6.0'&&energyScale?.maxEnergy?.(1)===1000&&energyScale?.maxEnergy?.(4)===1060,workshopCanonical:canonical('ui.workshop',workshop)&&workshop?.version==='12.6.0'&&workshop?.columns===4&&workshop?.rows===2,
    focusClockCanonical:canonical('ui.focusClock',focusClock),focusClockStages:hasAll(focusClock,expected.focusClock),gatheringFragments:hasFrags(gathering,expected.gatheringFragments),
    databaseCanonical:canonical('ui.database',database),databaseModern:RF.Views?.Database?.modernVersion==='12.3.0',databaseStages:hasAll(database,expected.database),databaseReady:typeof RF.UI?.database==='function'&&typeof RF.v94DetailHtml==='function'&&typeof RF.V1061?.entries==='function'&&typeof RF.V111?.facilities==='function'&&typeof RF.V113?.dungeonEntries==='function',
    navigationCanonical:canonical('ui.navigation',navigation),navigationStages:hasAll(navigation,expected.navigation),navigationReady:typeof RF.UI?.nav==='function'&&Array.isArray(RF.V1038?.items),
    presentationCanonical:canonical('ui.presentation',presentation),presentationStages:hasAll(presentation,expected.presentation),presentationReady:typeof RF.V1039?.scene==='function'&&typeof RF.V1039?.replaceScene==='function'&&!!RF.V1040&&!!RF.V1041&&!!RF.V1131,
    overlaysCanonical:canonical('ui.overlays',overlays),overlaysStages:hasAll(overlays,expected.overlays),overlaysFragments:hasFrags(overlays,expected.overlaysFragments),overlaysReady:typeof RF.V1121?.sync==='function'&&typeof RF.V1123?.normaliseCloseButtons==='function',
    saveManagerCanonical:canonical('ui.saveManager',saveManager),saveManagerReady:!!saveManager&&typeof saveManager.exportSlot==='function'&&typeof RF.Core?.State?.importText==='function',appShellCanonical:canonical('ui.appShell',appShell),appShellStages:hasAll(appShell,expected.appShell),appShellFragments:hasFrags(appShell,expected.appShellFragments),appShellReady:typeof RF.V101?.renderMainMenu==='function'&&typeof RF.UI?.options==='function'&&Array.isArray(RF.V95?.navItems),
    developerCanonical:canonical('ui.developer',developer),developerStages:hasAll(developer,expected.developer),developerFragments:hasFrags(developer,expected.developerFragments),developerReady:typeof RF.V1033?.checkRemoteBuild==='function'&&typeof RF.V1033?.playerAction==='function'&&typeof RF.V1033?.bindDev==='function'&&typeof RF.UI?.dev==='function',
    worldCanonical:canonical('systems.world',world),worldStages:hasAll(world,expected.world),worldFragments:hasFrags(world,expected.worldFragments),worldEventsCanonical:canonical('systems.worldEvents',worldEvents),worldEventFragments:hasFrags(worldEvents,expected.worldEventFragments),worldReady:typeof RF.worldPulse==='function'&&typeof RF.npcsHere==='function'&&typeof RF.refreshEncounters==='function',
    socialCanonical:canonical('systems.social',social),socialFragments:hasFrags(social,expected.socialFragments),socialReady:typeof RF.openDialogue==='function'&&typeof RF.resolveDialogue==='function'&&typeof RF.generateContracts==='function'&&typeof RF.passersHere==='function',
    encountersCanonical:canonical('systems.encounters',encounters),encounterFragments:hasFrags(encounters,expected.encounterFragments),encountersReady:typeof RF.v91OpenEnemy==='function'&&typeof RF.UI?.nearbyEnemies==='function',
    itemBrowserCanonical:canonical('ui.itemBrowser',itemBrowser),itemBrowserFragments:hasFrags(itemBrowser,expected.itemBrowserFragments),itemBrowserReady:typeof RF.v92Category==='function'&&typeof RF.v93Req==='function',itemDetailCanonical:canonical('ui.itemDetail',itemDetail),itemDetailReady:itemDetail?.version==='12.4.0'&&typeof itemDetail?.detailHtml==='function'&&typeof itemDetail?.sourcesFor==='function',hardcoreCanonical:canonical('systems.hardcore',hardcore)&&hardcore?.version==='12.5.0'&&typeof hardcore?.isHardcore==='function'&&typeof hardcore?.isGameOver==='function',
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

/* Realmforge V12.6.0 production finalizer. */
(() => {
  'use strict';
  const RF=window.RF;
  RF.VERSION='12.6.0';
  RF.BUILD={version:'12.6.0',title:'Workshop & Energy Expansion',built:'23 Sep 2026 • V12',buildId:'20260923-v1260-workshop-energy'};
  RF.PRODUCTION_FOUNDATION=RF.PRODUCTION_FOUNDATION||{};
  Object.assign(RF.PRODUCTION_FOUNDATION,{
    phase:29,architecture:'canonical-systems-v12',legacyBaseline:'11.5.3',compatibilityLayer:'js/legacy/compat_gameplay_scoped_residuals_trimmed_v1153.js',saveSchema:RF.Core.contract.saveSchema,
    persistenceOwner:'core.campaigns',migrationOwner:'core.migrations',contentOwner:'data.catalog',configOwner:'data.config',assetOwner:'data.assets',authoringOwner:'data.authoring',compatibilityClassificationOwner:'core.compatibilityClassification',
    scopedRuntimeOwner:'core.scopedRuntime',cadenceOwner:'systems.cadence',characterOwner:'systems.character',collectionOwner:'systems.collection',worldEventsOwner:'systems.worldEvents',travelOwner:'systems.travel',questOwner:'systems.quests',wayfinderOwner:'systems.wayfinder',combatOwner:'systems.combat',equipmentOwner:'systems.equipment',inventoryOwner:'systems.inventory',
    researchOwner:'systems.research',craftingOwner:'systems.crafting',skillsOwner:'systems.skills',fieldcraftOwner:'systems.fieldcraft',
    gatheringOwner:'systems.gathering',huntingOwner:'systems.hunting',fishingOwner:'systems.fishing',cookingOwner:'systems.cooking',
    explorationOwner:'systems.exploration',locksOwner:'systems.locks',crimeOwner:'systems.crime',propertyOwner:'systems.property',timeEnergyOwner:'systems.timeEnergy',energyScaleOwner:'systems.energyScale',focusClockOwner:'ui.focusClock',databaseOwner:'ui.database',workshopOwner:'ui.workshop',itemDetailOwner:'ui.itemDetail',hardcoreOwner:'systems.hardcore',navigationOwner:'ui.navigation',presentationOwner:'ui.presentation',overlayOwner:'ui.overlays',appShellOwner:'ui.appShell',saveManagerOwner:'ui.saveManager',developerOwner:'ui.developer',platformOwner:'platform.browser',lifecycleOwner:'core.lifecycle',worldOwner:'systems.world',socialOwner:'systems.social',canonicalModules:RF.Modules.list().map(x=>x.name)
  });
  RF.Systems?.Gathering?.applyConfiguredContent?.();
  RF.PRODUCTION_FOUNDATION.contentAuthoring=RF.Authoring?.report?.()||null;
  RF.PRODUCTION_FOUNDATION.contentSources={baseParts:9,legacyBlocks:RF.Content?.legacyBlockCount?.()||0,configDefinitions:RF.Config?.size?.()||0,assets:RF.Assets?.count?.()||0,contentPacks:'js/data/content/packs'};
  RF.PRODUCTION_FOUNDATION.compatibilityClassification=RF.Core?.CompatibilityClassification?.summary?.()||null;
  RF.Modules.register('core.finalize',RF.PRODUCTION_FOUNDATION,{owner:'core',status:'canonical'});
})();
