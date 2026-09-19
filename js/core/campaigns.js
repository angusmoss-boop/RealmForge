/* Canonical verified campaign-slot manager.
   Preserves the V9.5 key format so every existing browser campaign remains readable. */
(() => {
  'use strict';
  const RF = window.RF;
  const S = RF.Core.Storage;
  const M = RF.Core.Migrations;
  const schema = RF.Core.contract.saveSchema;
  const api = RF.V95 || {};

  Object.assign(api, {
    SCHEMA: schema,
    INDEX_KEY: 'realmforge_v95_slots',
    ACTIVE_KEY: 'realmforge_v95_active',
    MIRROR_KEY: 'realmforge_save',
    slotKey(id, kind) { return `realmforge_v95_${id}_${kind}`; },
    hash(str) { let h=2166136261>>>0;for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0).toString(16).padStart(8,'0'); },
    readIndex() { const x=S.getJSON(this.INDEX_KEY,[]); return Array.isArray(x)?x:[]; },
    writeIndex(arr) { S.setJSON(this.INDEX_KEY,Array.isArray(arr)?arr:[]); },
    id() { return 's'+Date.now().toString(36)+Math.random().toString(36).slice(2,7); },
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
    writeSlot(id,state,name,forceRecovery=false) {
      if(!id||!state)return false;
      try{
        state.version=this.SCHEMA;state.saveSchema=this.SCHEMA;state.lastReal=Date.now();
        const primaryKey=this.slotKey(id,'primary'),backupKey=this.slotKey(id,'backup'),recoveryKey=this.slotKey(id,'recovery'),tempKey=this.slotKey(id,'temp');
        const next=this.envelope(state);S.set(tempKey,next);
        if(!this.decode(S.get(tempKey)))throw new Error('Save verification failed');
        const old=S.get(primaryKey),meta=this.readIndex().find(x=>x.id===id),lastRecovery=+(S.get(this.slotKey(id,'recovery_at'))||0);
        if(old&&this.decode(old)){
          S.set(backupKey,old);
          if(forceRecovery||Date.now()-lastRecovery>180000){S.set(recoveryKey,old);S.set(this.slotKey(id,'recovery_at'),String(Date.now()))}
        }
        S.set(primaryKey,next);
        if(!this.decode(S.get(primaryKey)))throw new Error('Primary verification failed');
        S.remove(tempKey);this.touchMeta(id,state,name||meta?.name);S.set(this.ACTIVE_KEY,id);
        // Retain the legacy mirror until the old bootstrap is retired in a later extraction.
        S.set(this.MIRROR_KEY,JSON.stringify(state));
        return true;
      }catch(err){console.error('Realmforge save failed',err);return false}
    },
    readRawSlot(id) {
      for(const kind of ['primary','backup','recovery']){const d=this.decode(S.get(this.slotKey(id,kind)));if(d)return {...d,kind}}
      return null;
    },
    migrate(state) { return M.normalize(state); },
    readSlot(id) { const d=this.readRawSlot(id);if(!d)return null;d.state=this.migrate(d.state);return d; },
    activeId() { return S.get(this.ACTIVE_KEY)||''; },
    createSlot(state,name) { const id=this.id();this.writeSlot(id,state,name,true);return id; },
    rename(id,name) { name=(name||'').trim().slice(0,40);if(!name)return false;const list=this.readIndex(),m=list.find(x=>x.id===id);if(!m)return false;m.name=name;this.writeIndex(list);return true; },
    delete(id) { this.writeIndex(this.readIndex().filter(x=>x.id!==id));['primary','backup','recovery','temp','recovery_at'].forEach(k=>S.remove(this.slotKey(id,k)));if(this.activeId()===id)S.remove(this.ACTIVE_KEY); },
    duplicate(id,name) { const d=this.readSlot(id);if(!d)return null;return this.createSlot(JSON.parse(JSON.stringify(d.state)),name); },
    loadSlot(id) {
      const raw=this.readRawSlot(id);if(!raw)return false;
      S.set(this.ACTIVE_KEY,id);
      let state=raw.state;
      // The legacy slot loader resumed at 1x before later repair migrations had their say.
      state.speed=1;state.paused=false;
      state=this.migrate(state);
      RF.state=state;
      try{RF.V1016?.resetUIPause?.(state)}catch(_){ }
      try{RF.V1122?.repairOnResume?.()}catch(_){ }
      S.set(this.MIRROR_KEY,JSON.stringify(state));
      if(RF.UI){RF.UI.modal=null;RF.UI.tab='world'}
      RF.log?.(state,`Campaign loaded${raw.kind!=='primary'?` from ${raw.kind} recovery copy`:''}.`,'important');
      this.writeSlot(id,state);
      RF.UI?.render?.(state);
      return true;
    },
    saveNow() { let id=this.activeId();if(!id&&RF.state)id=this.createSlot(RF.state,`${RF.state.player?.name||'Wanderer'} • Campaign`);return id?this.writeSlot(id,RF.state,null,true):false; },
    backupSummary(id) { return ['primary','backup','recovery'].map(kind=>{const d=this.decode(S.get(this.slotKey(id,kind)));return {kind,ok:!!d,savedAt:d?.savedAt||0}}); },
    readMirror() { try{return JSON.parse(S.get(this.MIRROR_KEY)||'null')}catch{return null} },
    bootstrapRaw() {
      const active=this.activeId();
      if(active){const d=this.readRawSlot(active);if(d)return d.state}
      const slots=this.readIndex();
      if(!active&&slots.length){const d=this.readRawSlot(slots[0].id);if(d)return d.state}
      return this.readMirror();
    },
    reconcileBoot() {
      let slots=this.readIndex(),active=this.activeId(),state=RF.state;
      if(!slots.length&&state){
        state=this.migrate(state);RF.state=state;active=this.createSlot(state,`${state.player?.name||'Wanderer'} • Campaign 1`);slots=this.readIndex();
      } else if(active) {
        const d=this.readRawSlot(active);
        if(d){const same=state&&state.created&&d.state.created&&state.created===d.state.created;state=this.migrate(same?state:d.state);RF.state=state}
        else if(state){state=this.migrate(state);RF.state=state;active=this.createSlot(state,`${state.player?.name||'Recovered'} • Recovered`)}
      } else if(slots.length) {
        return this.loadSlot(slots[0].id);
      }
      if(RF.state){
        RF.state=this.migrate(RF.state);RF.state.flags=RF.state.flags||{};
        if(!RF.state.flags.v95Seen){RF.state.flags.v95Seen=true;RF.log?.(RF.state,'V9.5: multi-slot verified campaign saves and compact navigation are active.','important')}
        if(!this.activeId())active=this.createSlot(RF.state,`${RF.state.player?.name||'Wanderer'} • Campaign 1`);
        else this.writeSlot(this.activeId(),RF.state);
        RF.UI?.render?.(RF.state);
      }
      return !!RF.state;
    }
  });

  RF.V95=api;
  RF.Core.Campaigns=RF.Modules.register('core.campaigns', api, { owner:'core', status:'canonical', storageFormat:'v95-compatible', schema });
})();
