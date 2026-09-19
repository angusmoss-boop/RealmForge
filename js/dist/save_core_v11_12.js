/* Realmforge V11.12.0 — Canonical Save Core */

/* ===== js/core/bootstrap.js ===== */
/* Realmforge V11.12.0 — canonical production bootstrap. */
window.RF = window.RF || {};
(() => {
  'use strict';
  const RF = window.RF;
  RF.Core = RF.Core || {};
  RF.Systems = RF.Systems || {};
  RF.Platform = RF.Platform || {};
  RF.Catalog = RF.Catalog || {};
  RF.Views = RF.Views || {};
  RF.Assets = RF.Assets || {};
  RF.Modules = RF.Modules || {};

  const registry = RF.Modules.registry instanceof Map ? RF.Modules.registry : new Map();
  RF.Modules.registry = registry;
  RF.Modules.register = function(name, api, meta = {}) {
    if (!name || typeof name !== 'string') throw new Error('Realmforge module name is required.');
    registry.set(name, { name, api, meta: { canonical: true, ...meta } });
    return api;
  };
  RF.Modules.get = name => registry.get(name)?.api;
  RF.Modules.info = name => registry.get(name) || null;
  RF.Modules.list = () => Array.from(registry.values()).map(x => ({ name: x.name, ...x.meta }));

  RF.Core.contract = Object.freeze({
    appVersion: '11.12.0',
    saveSchema: '11.5.3',
    architecture: 'canonical-systems-v6',
    legacyBaseline: '11.5.3'
  });
  RF.Modules.register('core.bootstrap', RF.Core.contract, { owner: 'core', status: 'canonical' });
})();

/* ===== js/platform/browser.js ===== */
/* Browser/PWA platform adapter. Canonical persistence uses this boundary so a
   future Capacitor/Android adapter can replace browser storage without changing
   game systems. */
(() => {
  'use strict';
  const RF = window.RF;
  const safeStorage = {
    get(key) { try { return localStorage.getItem(key); } catch { return null; } },
    set(key, value) { try { localStorage.setItem(key, value); return true; } catch { return false; } },
    remove(key) { try { localStorage.removeItem(key); return true; } catch { return false; } }
  };
  const api = {
    kind: 'browser',
    storage: safeStorage,
    now: () => Date.now(),
    online: () => typeof navigator === 'undefined' ? true : navigator.onLine !== false,
    copyText: async text => {
      if (navigator?.clipboard?.writeText) { await navigator.clipboard.writeText(String(text)); return true; }
      return false;
    },
    onVisibilityChange(handler) {
      if (typeof document === 'undefined') return () => {};
      const fn = () => handler(document.visibilityState);
      document.addEventListener('visibilitychange', fn);
      return () => document.removeEventListener('visibilitychange', fn);
    },
    registerServiceWorker(path = './sw.js') {
      if (!('serviceWorker' in navigator) || !location.protocol.startsWith('http')) return Promise.resolve(null);
      return navigator.serviceWorker.register(path);
    }
  };
  RF.Platform.Browser = RF.Modules.register('platform.browser', api, { owner: 'platform', status: 'canonical' });
  RF.Platform.active = RF.Platform.Browser;
})();

/* ===== js/core/migrations.js ===== */
/* Canonical migration owner.
   Historical migration functions are still defined by the frozen gameplay
   compatibility layer for now, but the migration CHAIN is owned here.
   No patch may wrap RF.load/newGame/importSave or RF.V95.migrate anymore. */
(() => {
  'use strict';
  const RF = window.RF;
  const historical = [];
  const schemaSteps = new Map();
  let baselineInstalled = false;
  let running = 0;

  const addHistorical = (id, version, getter) => historical.push({ id, version, getter });

  const api = {
    get ready() { return baselineInstalled; },
    get running() { return running > 0; },
    currentSchema: () => RF.Core.contract.saveSchema,
    historical: () => historical.map(({ id, version }) => ({ id, version })),
    register(from, to, migrate) {
      if (!from || !to || typeof migrate !== 'function') throw new Error('Invalid migration registration.');
      const key = `${from}->${to}`;
      if (schemaSteps.has(key)) throw new Error(`Migration already registered: ${key}`);
      schemaSteps.set(key, { from, to, migrate });
      return key;
    },
    list: () => Array.from(schemaSteps.values()).map(({ from, to }) => ({ from, to })),
    installHistoricalBaseline() {
      if (baselineInstalled) return historical.length;
      [
        ['v2','2.0.0',()=>RF.migrateV2],['v3','3.0.0',()=>RF.migrateV3],['v4','4.0.0',()=>RF.migrateV4],
        ['v5','5.0.0',()=>RF.migrateV5],['v6','6.0.0',()=>RF.migrateV6],['v7','7.0.0',()=>RF.migrateV7],
        ['v8','8.0.0',()=>RF.migrateV8],['v8.1','8.1.0',()=>RF.migrateV81],['v8.2','8.2.0',()=>RF.migrateV82],
        ['v8.3','8.3.0',()=>RF.migrateV83],['v9','9.0.0',()=>RF.migrateV9],['v9.1','9.1.0',()=>RF.migrateV91],
        ['v9.2','9.2.0',()=>RF.migrateV92],['v9.3','9.3.0',()=>RF.migrateV93],['v9.4','9.4.0',()=>RF.migrateV94],
        ['v10','10.0.0',()=>RF.migrateV10],['v10.1','10.1.0',()=>RF.migrateV101],['v10.2','10.2.0',()=>RF.migrateV102],
        ['v10.3','10.3.0',()=>RF.migrateV103],['v10.6','10.6.0',()=>RF.migrateV106],['v10.7','10.7.0',()=>RF.migrateV107],
        ['v10.16','10.16.0',()=>RF.V1016?.repairCampaign],['v10.17','10.17.0',()=>RF.V1017?.migrate],
        ['v10.18','10.18.0',()=>RF.V1018?.migrate],['v10.19','10.19.0',()=>RF.V1019?.migrate],
        ['v10.20','10.20.0',()=>RF.V1020?.migrate],['v10.21','10.21.0',()=>RF.V1021?.migrate],
        ['v10.22','10.22.0',()=>RF.migrateV1022],['v10.23','10.23.0',()=>RF.migrateV1023],
        ['v10.24','10.24.0',()=>RF.migrateV1024],['v10.25','10.25.0',()=>RF.migrateV1025],
        ['v10.26','10.26.0',()=>RF.migrateV1026],['v10.27','10.27.0',()=>RF.migrateV1027],
        ['v10.28','10.28.0',()=>RF.migrateV1028],['v10.29','10.29.0',()=>RF.migrateV1029],
        ['v10.30','10.30.0',()=>RF.migrateV1030],['v10.31','10.31.0',()=>RF.migrateV1031],
        ['v10.32','10.32.0',()=>RF.migrateV1032],['v10.33','10.33.0',()=>RF.V1033?.migrate],
        ['v10.34','10.34.0',()=>RF.V1034?.migrate],['v10.35','10.35.0',()=>RF.V1035?.migrate],
        ['v10.36','10.36.0',()=>RF.V1036?.migrate],['v10.37','10.37.0',()=>RF.V1037?.migrate],
        ['v10.38','10.38.0',()=>RF.V1038?.migrate],['v10.39','10.39.0',()=>RF.V1039?.migrate],
        ['v10.40','10.40.0',()=>RF.V1040?.migrate],['v10.41','10.41.0',()=>RF.V1041?.migrate],
        ['v10.42','10.42.0',()=>RF.V1042?.migrate],['v10.43','10.43.0',()=>RF.V1043?.migrate],
        ['v10.44','10.44.0',()=>RF.V1044?.migrate],['v10.45','10.45.0',()=>RF.V1045?.migrate],
        ['v10.46','10.46.0',()=>RF.V1046?.migrate],['v10.47','10.47.0',()=>RF.V1047?.migrate],
        ['v10.48','10.48.0',()=>RF.V1048?.migrate],['v10.49','10.49.0',()=>RF.V1049?.migrate],
        ['v10.50','10.50.0',()=>RF.V1050?.migrate],['v10.51','10.51.0',()=>RF.V1051?.migrate],
        ['v10.52','10.52.0',()=>RF.V1052?.migrate],['v10.53','10.53.0',()=>RF.V1053?.migrate],
        ['v10.54','10.54.0',()=>RF.V1054?.migrate],['v10.55','10.55.0',()=>RF.V1055?.migrate],
        ['v10.56','10.56.0',()=>RF.V1056?.migrate],['v10.57','10.57.0',()=>RF.V1057?.migrate],
        ['v10.58','10.58.0',()=>RF.V1058?.migrate],['v10.59','10.59.0',()=>RF.V1059?.migrate],
        ['v10.60','10.60.0',()=>RF.V1060?.migrate],['v10.61','10.61.0',()=>RF.V1061?.migrate],
        ['v11.0','11.0.0',()=>RF.V1062?.migrate],['v11.1','11.1.0',()=>RF.V111?.migrate],
        ['v11.2','11.2.0',()=>RF.V112?.migrate],['v11.2.1','11.2.1',()=>RF.V1121?.migrate],
        ['v11.2.2','11.2.2',()=>RF.V1122?.migrate],['v11.2.3','11.2.3',()=>RF.V1123?.migrate],
        ['v11.3','11.3.0',()=>RF.V113?.migrate],['v11.4','11.4.0',()=>RF.V114?.migrate],
        ['v11.5','11.5.0',()=>RF.V115?.migrate],['v11.5.2','11.5.2',()=>RF.V1152?.migrate],
        ['v11.5.3','11.5.3',()=>RF.V1153?.migrate]
      ].forEach(([id, version, getter]) => addHistorical(id, version, getter));
      baselineInstalled = true;
      return historical.length;
    },
    normalize(state) {
      if (!state || !baselineInstalled) return state;
      running++;
      try {
        for (const step of historical) {
          const fn = step.getter();
          if (typeof fn !== 'function') continue;
          try { state = fn(state) || state; }
          catch (err) { console.warn(`[Realmforge migration ${step.id}]`, err); }
        }
        // Future schema steps are intentionally separate from the historical normalizers.
        let current = state.saveSchema || state.version || RF.Core.contract.saveSchema;
        let guard = 0;
        while (current !== RF.Core.contract.saveSchema && guard++ < 100) {
          const step = Array.from(schemaSteps.values()).find(x => x.from === current);
          if (!step) break;
          state = step.migrate(state) || state;
          current = step.to;
        }
        state.version = RF.Core.contract.saveSchema;
        state.saveSchema = RF.Core.contract.saveSchema;
        return state;
      } finally { running--; }
    }
  };
  RF.Core.Migrations = RF.Modules.register('core.migrations', api, { owner: 'core', status: 'canonical', baselineSchema: RF.Core.contract.saveSchema });
})();

/* ===== js/core/storage.js ===== */
/* Canonical persistence transport. No gameplay code should call localStorage directly. */
(() => {
  'use strict';
  const RF = window.RF;
  const store = () => RF.Platform.active?.storage;
  const api = {
    get(key) { return store()?.get(String(key)) ?? null; },
    set(key, value) {
      const ok = store()?.set(String(key), String(value));
      if (ok === false) throw new Error(`Storage write failed: ${key}`);
      return true;
    },
    remove(key) { return store()?.remove(String(key)) !== false; },
    getJSON(key, fallback = null) {
      try { const raw = api.get(key); return raw == null ? fallback : JSON.parse(raw); }
      catch { return fallback; }
    },
    setJSON(key, value) { return api.set(key, JSON.stringify(value)); }
  };
  RF.Core.Storage = RF.Modules.register('core.storage', api, { owner: 'core', status: 'canonical', backend: 'platform.storage' });
})();

/* ===== js/core/campaigns.js ===== */
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

/* ===== js/core/state.js ===== */
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
    const txt=prompt('Paste your Realmforge save backup:');if(!txt)return;
    try{C.saveNow();const state=RF.importSave(txt),id=C.createSlot(state,`${state.player?.name||'Imported'} • Imported`);C.loadSlot(id);RF.UI.modal={type:'message',title:'Backup Imported',text:'Imported as a separate campaign slot. Your existing campaigns were not overwritten.'};RF.UI.render(RF.state)}
    catch(err){console.warn(err);alert('That save could not be read. No existing campaign was changed.')}
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
