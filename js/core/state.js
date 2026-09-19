/* Canonical state/save facade and global compatibility endpoints. */
(() => {
  'use strict';
  const RF = window.RF;
  const M = RF.Core.Migrations;
  const C = RF.Core.Campaigns;
  const baseNewGame = RF.newGame;

  const encode = state => btoa(unescape(encodeURIComponent(JSON.stringify(state))));
  const decode = text => JSON.parse(decodeURIComponent(escape(atob(String(text||'').trim()))));

  function normalise(state){return state&&M.ready?M.normalize(state):state}

  RF.newGame=function(...args){return normalise(baseNewGame(...args))};
  RF.save=function(state=RF.state){
    if(!state)return false;
    // During compatibility bootstrap, keep only the legacy mirror fresh. Do not churn
    // verified slot backups until the complete canonical migration chain is installed.
    if(!M.ready){try{RF.Core.Storage.set(C.MIRROR_KEY,JSON.stringify(state));return true}catch{return false}}
    let id=C.activeId();
    if(!id){id=C.createSlot(state,`${state.player?.name||'Wanderer'} • Campaign`);return !!id}
    return C.writeSlot(id,state);
  };
  RF.load=function(){return normalise(C.bootstrapRaw())};
  RF.exportSave=function(state=RF.state){if(!state)throw new Error('No campaign to export.');return encode(state)};
  RF.importSave=function(payload){return normalise(decode(payload))};
  RF.startNew=function(name,bg,avatar){
    const state=RF.newGame(name,bg,avatar);RF.state=state;
    const base=(name||'Wanderer').trim()||'Wanderer',existing=C.readIndex().filter(x=>x.name.startsWith(base)).length;
    C.createSlot(state,`${base} • Campaign ${existing+1}`);if(RF.UI){RF.UI.tab='world';RF.UI.modal=null;RF.UI.render(state)};return state;
  };
  RF.importPrompt=function(){
    const txt=RF.Platform?.active?.promptText?.('Paste your Realmforge save backup:','');if(!txt)return;
    try{C.saveNow();const state=RF.importSave(txt),id=C.createSlot(state,`${state.player?.name||'Imported'} • Imported`);C.loadSlot(id);RF.UI.modal={type:'message',title:'Backup Imported',text:'Imported as a separate campaign slot. Your existing campaigns were not overwritten.'};RF.UI.render(RF.state)}
    catch(err){console.warn(err);RF.Platform?.active?.alertMessage?.('That save could not be read. No existing campaign was changed.')}
  };

  const api={
    current:()=>RF.state||null,
    replace(state){RF.state=state;return state},
    newGame:(...args)=>RF.newGame(...args),
    save:state=>RF.save(state||RF.state),load:()=>RF.load(),
    export:state=>RF.exportSave(state||RF.state),import:payload=>RF.importSave(payload),
    schema:()=>RF.Core.contract.saveSchema,appVersion:()=>RF.VERSION,
    snapshot(state=RF.state){return state?JSON.parse(JSON.stringify(state)):null}
  };
  RF.Core.State=RF.Modules.register('core.state',api,{owner:'core',status:'canonical',persistence:'core.campaigns'});
})();
