/* Canonical verified campaign-slot manager.
   V12 hardening preserves the V9.5 key format while enforcing slot identity,
   non-destructive duplication/import, and verified three-copy recovery. */
(() => {
  'use strict';
  const RF = window.RF;
  const S = RF.Core.Storage;
  const M = RF.Core.Migrations;
  const schema = RF.Core.contract.saveSchema;
  const api = RF.V95 || {};
  const SLOT_STAMP = '__rfSlotId';

  function clone(value){ return JSON.parse(JSON.stringify(value)); }
  function stampState(state,id){
    if(!state||!id)return state;
    try{Object.defineProperty(state,SLOT_STAMP,{value:id,writable:true,configurable:true,enumerable:false});}
    catch{try{state[SLOT_STAMP]=id}catch{}}
    return state;
  }
  function stampedId(state){return state?.[SLOT_STAMP]||'';}

  Object.assign(api, {
    SCHEMA: schema,
    INDEX_KEY: 'realmforge_v95_slots',
    ACTIVE_KEY: 'realmforge_v95_active',
    MIRROR_KEY: 'realmforge_save',
    slotKey(id, kind) { return `realmforge_v95_${id}_${kind}`; },
    hash(str) { let h=2166136261>>>0;for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0).toString(16).padStart(8,'0'); },
    readIndex() { const x=S.getJSON(this.INDEX_KEY,[]); return Array.isArray(x)?x:[]; },
    writeIndex(arr) { S.setJSON(this.INDEX_KEY,Array.isArray(arr)?arr:[]); },
    recoverIndex() {
      const ids=new Set();
      for(const key of S.keys('realmforge_v95_')){const m=key.match(/^realmforge_v95_(.+)_(primary|backup|recovery)$/);if(m)ids.add(m[1]);}
      const recovered=[];
      for(const id of ids){const d=this.readRawSlot(id);if(!d?.state)continue;const st=d.state;recovered.push({id,name:`${st.player?.name||'Recovered'} • Recovered`,created:d.savedAt||Date.now(),updated:d.savedAt||Date.now(),playerName:st.player?.name||'Wanderer',level:st.player?.level||1,day:st.day||1,location:st.location||'greenvale'});}
      recovered.sort((a,b)=>b.updated-a.updated);if(recovered.length)this.writeIndex(recovered);return recovered;
    },
    id() {
      let id='';
      do{id='s'+Date.now().toString(36)+Math.random().toString(36).slice(2,8)}while(this.readIndex().some(x=>x.id===id));
      return id;
    },
    envelope(state) {
      const payload=JSON.stringify(state);
      return JSON.stringify({schema:this.SCHEMA,savedAt:Date.now(),checksum:this.hash(payload),payload});
    },
    decode(raw) {
      if(!raw)return null;
      try{
        const e=JSON.parse(raw);
        if(!e||typeof e.payload!=='string'||e.checksum!==this.hash(e.payload))return null;
        return {state:JSON.parse(e.payload),savedAt:e.savedAt||0,schema:e.schema||null};
      }catch{return null}
    },
    touchMeta(id,state,name) {
      const list=this.readIndex(),i=list.findIndex(x=>x.id===id),old=i>=0?list[i]:null;
      const meta={id,name:name||old?.name||`${state.player?.name||'Wanderer'} Campaign`,created:old?.created||Date.now(),updated:Date.now(),playerName:state.player?.name||'Wanderer',level:state.player?.level||1,day:state.day||1,location:state.location||'greenvale'};
      if(i>=0)list[i]=meta;else list.unshift(meta);this.writeIndex(list);return meta;
    },
    stateSlotId(state){return stampedId(state)},
    stampState,
    activate(id,state){
      if(id)S.set(this.ACTIVE_KEY,id);else S.remove(this.ACTIVE_KEY);
      if(state&&id)stampState(state,id);
      return id||'';
    },
    writeSlot(id,state,name,forceRecovery=false,options={}) {
      if(!id||!state)return false;
      const activate=options.activate!==false;
      const allowIdentityChange=options.allowIdentityChange===true;
      try{
        const primaryKey=this.slotKey(id,'primary'),backupKey=this.slotKey(id,'backup'),recoveryKey=this.slotKey(id,'recovery'),tempKey=this.slotKey(id,'temp');
        const oldRaw=S.get(primaryKey),oldDecoded=this.decode(oldRaw),stateStamp=stampedId(state);
        if(!allowIdentityChange){
          if(stateStamp&&stateStamp!==id)throw new Error(`Cross-slot write blocked: state belongs to ${stateStamp}, target was ${id}`);
          const oldCreated=oldDecoded?.state?.created,incomingCreated=state?.created;
          if(!stateStamp&&oldDecoded&&oldCreated!=null&&incomingCreated!=null&&String(oldCreated)!==String(incomingCreated)){
            throw new Error('Cross-campaign overwrite blocked by campaign identity guard');
          }
        }
        state.version=this.SCHEMA;state.saveSchema=this.SCHEMA;state.lastReal=Date.now();
        const next=this.envelope(state);S.set(tempKey,next);
        if(!this.decode(S.get(tempKey)))throw new Error('Save verification failed');
        const meta=this.readIndex().find(x=>x.id===id),lastRecovery=+(S.get(this.slotKey(id,'recovery_at'))||0);
        if(oldDecoded){
          S.set(backupKey,oldRaw);
          if(forceRecovery||Date.now()-lastRecovery>180000){S.set(recoveryKey,oldRaw);S.set(this.slotKey(id,'recovery_at'),String(Date.now()))}
        } else if(forceRecovery) {
          // A brand-new campaign begins with three independently readable local copies.
          S.set(backupKey,next);S.set(recoveryKey,next);S.set(this.slotKey(id,'recovery_at'),String(Date.now()));
        }
        S.set(primaryKey,next);
        if(!this.decode(S.get(primaryKey)))throw new Error('Primary verification failed');
        S.remove(tempKey);this.touchMeta(id,state,name||meta?.name);
        stampState(state,id);
        if(activate){
          S.set(this.ACTIVE_KEY,id);
          S.set(this.MIRROR_KEY,JSON.stringify(state));
        }
        return true;
      }catch(err){console.error('Realmforge save failed',err);return false}
    },
    readRawSlot(id) {
      for(const kind of ['primary','backup','recovery']){const d=this.decode(S.get(this.slotKey(id,kind)));if(d)return {...d,kind}}
      return null;
    },
    migrate(state) { return M.normalize(state); },
    readSlot(id) { const d=this.readRawSlot(id);if(!d)return null;d.state=this.migrate(d.state);stampState(d.state,id);return d; },
    activeId() { return S.get(this.ACTIVE_KEY)||''; },
    createSlot(state,name,options={}) {
      const id=this.id();
      if(!this.writeSlot(id,state,name,true,{activate:options.activate!==false,allowIdentityChange:true}))return null;
      return id;
    },
    rename(id,name) { name=(name||'').trim().slice(0,40);if(!name)return false;const list=this.readIndex(),m=list.find(x=>x.id===id);if(!m)return false;m.name=name;this.writeIndex(list);return true; },
    delete(id) { this.writeIndex(this.readIndex().filter(x=>x.id!==id));['primary','backup','recovery','temp','recovery_at'].forEach(k=>S.remove(this.slotKey(id,k)));if(this.activeId()===id)S.remove(this.ACTIVE_KEY); },
    duplicate(id,name,options={}) {
      if(this.activeId()===id&&RF.state)this.saveNow();
      const d=this.readSlot(id);if(!d)return null;
      const copy=clone(d.state);
      try{delete copy[SLOT_STAMP]}catch{}
      return this.createSlot(copy,name,{activate:options.activate===true});
    },
    replaceSlot(id,state,name,options={}) {
      return this.writeSlot(id,state,name,true,{activate:options.activate!==false,allowIdentityChange:true});
    },
    loadSlot(id) {
      const raw=this.readRawSlot(id);if(!raw)return false;
      S.set(this.ACTIVE_KEY,id);
      let state=raw.state;
      state.speed=1;state.paused=false;
      state=this.migrate(state);stampState(state,id);RF.state=state;
      try{RF.V1016?.resetUIPause?.(state)}catch(_){ }
      try{RF.V1122?.repairOnResume?.()}catch(_){ }
      S.set(this.MIRROR_KEY,JSON.stringify(state));
      if(RF.UI){RF.UI.modal=null;RF.UI.tab='world'}
      RF.log?.(state,`Campaign loaded${raw.kind!=='primary'?` from ${raw.kind} recovery copy`:''}.`,'important');
      this.writeSlot(id,state,null,false,{activate:true});
      RF.UI?.render?.(state);
      return true;
    },
    saveNow() {
      if(!RF.state)return false;
      let id=stampedId(RF.state)||this.activeId();
      if(!id){id=this.createSlot(RF.state,`${RF.state.player?.name||'Wanderer'} • Campaign`);return !!id}
      if(this.activeId()!==id)S.set(this.ACTIVE_KEY,id);
      return this.writeSlot(id,RF.state,null,true,{activate:true});
    },
    beginNewCampaign() {
      if(RF.state&&this.activeId()&&!this.saveNow())return false;
      S.remove(this.ACTIVE_KEY);
      return true;
    },
    backupSummary(id) { return ['primary','backup','recovery'].map(kind=>{const d=this.decode(S.get(this.slotKey(id,kind)));return {kind,ok:!!d,savedAt:d?.savedAt||0}}); },
    readMirror() { try{return JSON.parse(S.get(this.MIRROR_KEY)||'null')}catch{return null} },
    bootstrapRaw() {
      const active=this.activeId();
      if(active){const d=this.readRawSlot(active);if(d){stampState(d.state,active);return d.state}}
      let slots=this.readIndex();if(!slots.length)slots=this.recoverIndex();
      if(!active&&slots.length){const d=this.readRawSlot(slots[0].id);if(d){S.set(this.ACTIVE_KEY,slots[0].id);stampState(d.state,slots[0].id);return d.state}}
      return this.readMirror();
    },
    reconcileBoot() {
      let slots=this.readIndex(),active=this.activeId(),state=RF.state;if(!slots.length)slots=this.recoverIndex();
      if(!slots.length&&state){
        state=this.migrate(state);RF.state=state;active=this.createSlot(state,`${state.player?.name||'Wanderer'} • Campaign 1`);slots=this.readIndex();
      } else if(active) {
        const d=this.readRawSlot(active);
        if(d){const same=state&&state.created&&d.state.created&&state.created===d.state.created;state=this.migrate(same?state:d.state);stampState(state,active);RF.state=state}
        else if(state){state=this.migrate(state);RF.state=state;active=this.createSlot(state,`${state.player?.name||'Recovered'} • Recovered`)}
      } else if(slots.length) {
        return this.loadSlot(slots[0].id);
      }
      if(RF.state){
        RF.state=this.migrate(RF.state);RF.state.flags=RF.state.flags||{};
        if(!RF.state.flags.v95Seen){RF.state.flags.v95Seen=true;RF.log?.(RF.state,'V9.5: multi-slot verified campaign saves and compact navigation are active.','important')}
        if(!this.activeId())active=this.createSlot(RF.state,`${RF.state.player?.name||'Wanderer'} • Campaign 1`);
        else{stampState(RF.state,this.activeId());this.writeSlot(this.activeId(),RF.state)}
        RF.UI?.render?.(RF.state);
      }
      return !!RF.state;
    }
  });

  RF.V95=api;
  RF.Core.Campaigns=RF.Modules.register('core.campaigns', api, { owner:'core', status:'canonical', storageFormat:'v95-compatible', schema, hardenedIn:'12.0.0' });
})();
