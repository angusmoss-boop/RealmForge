/* Canonical state/save facade and portable backup transport. */
(() => {
  'use strict';
  const RF = window.RF;
  const M = RF.Core.Migrations;
  const C = RF.Core.Campaigns;
  const baseNewGame = RF.newGame;
  const FORMAT='realmforge-save-backup';
  const FORMAT_VERSION=1;

  const encode = state => btoa(unescape(encodeURIComponent(JSON.stringify(state))));
  const decodeLegacy = text => JSON.parse(decodeURIComponent(escape(atob(String(text||'').trim()))));
  function normalise(state){return state&&M.ready?M.normalize(state):state}
  function validateState(state){
    if(!state||typeof state!=='object'||Array.isArray(state))throw new Error('Backup does not contain a Realmforge campaign.');
    if(!state.player||typeof state.player!=='object'||!state.player.name)throw new Error('Backup is missing character data.');
    return state;
  }
  function pack(state=RF.state,meta={}){
    validateState(state);
    const payload=encode(state);
    return JSON.stringify({format:FORMAT,formatVersion:FORMAT_VERSION,appVersion:RF.VERSION||RF.Core.contract.appVersion,saveSchema:state.saveSchema||C.SCHEMA,exportedAt:Date.now(),campaignName:meta.name||'',playerName:state.player?.name||'Wanderer',checksum:C.hash(payload),payload},null,2);
  }
  function unpack(text){
    const raw=String(text||'').trim();if(!raw)throw new Error('Backup is empty.');
    if(raw.startsWith('{')){
      const obj=JSON.parse(raw);
      if(obj?.format===FORMAT){
        if(+obj.formatVersion!==FORMAT_VERSION)throw new Error('Unsupported Realmforge backup format.');
        if(typeof obj.payload!=='string'||obj.checksum!==C.hash(obj.payload))throw new Error('Backup checksum failed.');
        return validateState(decodeLegacy(obj.payload));
      }
    }
    // Backward compatibility with every pre-V12 base64 text export.
    return validateState(decodeLegacy(raw));
  }
  function safeName(v){return String(v||'realmforge').trim().replace(/[^a-z0-9._-]+/gi,'-').replace(/^-+|-+$/g,'').slice(0,64)||'realmforge'}
  function filenameFor(state=RF.state,meta={}){
    const who=safeName(meta.name||state?.player?.name||'wanderer');
    const d=new Date(),stamp=`${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}-${String(d.getHours()).padStart(2,'0')}${String(d.getMinutes()).padStart(2,'0')}`;
    return `Realmforge-${who}-${stamp}.rfsave`;
  }

  RF.newGame=function(...args){return normalise(baseNewGame(...args))};
  RF.save=function(state=RF.state){
    if(!state)return false;
    if(!M.ready){try{RF.Core.Storage.set(C.MIRROR_KEY,JSON.stringify(state));return true}catch{return false}}
    let id=C.stateSlotId(state)||C.activeId();
    if(!id){id=C.createSlot(state,`${state.player?.name||'Wanderer'} • Campaign`);return !!id}
    if(C.activeId()!==id)C.activate(id,state);
    return C.writeSlot(id,state);
  };
  RF.load=function(){return normalise(C.bootstrapRaw())};
  RF.exportSave=function(state=RF.state,meta={}){return pack(state,meta)};
  RF.importSave=function(payload){return normalise(unpack(payload))};
  RF.startNew=function(name,bg,avatar){
    const state=RF.newGame(name,bg,avatar);RF.state=state;
    const base=(name||'Wanderer').trim()||'Wanderer',existing=C.readIndex().filter(x=>x.name.startsWith(base)).length;
    const id=C.createSlot(state,`${base} • Campaign ${existing+1}`,{activate:true});
    if(!id)throw new Error('Could not create a verified campaign slot.');
    if(RF.UI){RF.UI.tab='world';RF.UI.modal=null;RF.UI.render(state)};return state;
  };

  async function exportSlot(id){
    if(id===C.activeId()&&RF.state)C.saveNow();
    const d=id?C.readSlot(id):{state:RF.state};if(!d?.state)throw new Error('Campaign could not be read for export.');
    const meta=id?C.readIndex().find(x=>x.id===id):null;
    const text=pack(d.state,{name:meta?.name||d.state.player?.name});
    const filename=filenameFor(d.state,{name:meta?.name||d.state.player?.name});
    const saved=await RF.Platform?.active?.saveTextFile?.(filename,text,'application/json');
    if(!saved){
      const copied=await RF.Platform?.active?.copyText?.(text).catch?.(()=>false);
      if(!copied)RF.Platform?.active?.promptText?.('Copy this Realmforge backup:',text);
      return {method:copied?'clipboard':'text',filename,text};
    }
    return {method:'file',filename,text};
  }
  function importText(text,{activate=true,name}={}){
    const state=RF.importSave(text);
    const label=(name||`${state.player?.name||'Imported'} • Imported`).slice(0,40);
    const id=C.createSlot(state,label,{activate});
    if(!id)throw new Error('Imported campaign could not be written safely.');
    if(activate)C.loadSlot(id);
    return id;
  }
  function installTransferAffordances(){
    RF.exportPrompt=async function(){
      try{const r=await exportSlot(C.activeId());RF.UI.modal={type:'message',title:'Backup Exported',text:r.method==='file'?`Saved ${r.filename}. Keep this file somewhere safe.`:'Backup copied as portable text. Keep it somewhere safe.'};}
      catch(err){console.warn(err);RF.UI.modal={type:'message',title:'Export Failed',text:'Realmforge could not create the backup. Your campaign was not changed.'};}
      RF.UI.render(RF.state);
    };
    RF.importPrompt=function(){
      RF.UI.modal={type:'importBackupV12'};RF.UI.render(RF.state);
    };
  }

  const api={
    current:()=>RF.state||null,replace(state){RF.state=state;return state},newGame:(...args)=>RF.newGame(...args),
    save:state=>RF.save(state||RF.state),load:()=>RF.load(),export:state=>RF.exportSave(state||RF.state),import:payload=>RF.importSave(payload),
    exportSlot,importText,packBackup:pack,unpackBackup:unpack,backupFilename:filenameFor,installTransferAffordances,
    schema:()=>RF.Core.contract.saveSchema,appVersion:()=>RF.VERSION,snapshot(state=RF.state){return state?JSON.parse(JSON.stringify(state)):null}
  };
  RF.Core.State=RF.Modules.register('core.state',api,{owner:'core',status:'canonical',persistence:'core.campaigns',backupFormat:FORMAT,backupFormatVersion:FORMAT_VERSION,hardenedIn:'12.0.0'});
})();
