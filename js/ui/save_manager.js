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
