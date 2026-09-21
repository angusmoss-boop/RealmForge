/* Realmforge V12.0.0 — canonical production bootstrap. */
window.RF = window.RF || {};
(() => {
  'use strict';
  const RF = window.RF;
  RF.Core = RF.Core || {};
  RF.Systems = RF.Systems || {};
  RF.Platform = RF.Platform || {};
  RF.Catalog = RF.Catalog || {};
  RF.Authoring = RF.Authoring || {};
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
    appVersion: '12.0.0',
    saveSchema: '11.5.3',
    architecture: 'canonical-systems-v12',
    legacyBaseline: '11.5.3'
  });
  RF.Modules.register('core.bootstrap', RF.Core.contract, { owner: 'core', status: 'canonical' });
})();

/* Browser/PWA platform adapter. Canonical persistence uses this boundary so a
   future Capacitor/Android adapter can replace browser storage without changing
   game systems. */
(() => {
  'use strict';
  const RF = window.RF;
  const safeStorage = {
    get(key) { try { return localStorage.getItem(key); } catch { return null; } },
    set(key, value) { try { localStorage.setItem(key, value); return true; } catch { return false; } },
    remove(key) { try { localStorage.removeItem(key); return true; } catch { return false; } },
    keys(prefix = '') { try { const out=[]; for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&String(k).startsWith(String(prefix)))out.push(String(k));} return out; } catch { return []; } }
  };
  const api = {
    kind: 'browser',
    storage: safeStorage,
    now: () => Date.now(),
    monotonicNow: () => (typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now()),
    online: () => typeof navigator === 'undefined' ? true : navigator.onLine !== false,
    promptText(message, value = '') { try { return typeof prompt === 'function' ? prompt(String(message), String(value ?? '')) : null; } catch { return null; } },
    alertMessage(message) { try { if (typeof alert === 'function') alert(String(message)); return true; } catch { return false; } },
    vibrate(ms = 18) { try { return !!navigator?.vibrate?.(Math.max(0, Number(ms) || 0)); } catch { return false; } },
    isVisible() { try { return typeof document === 'undefined' || document.visibilityState !== 'hidden'; } catch { return true; } },
    onResume(handler) {
      if (typeof window === 'undefined') return () => {};
      const disposers = [];
      const add = (target, name, fn) => { target?.addEventListener?.(name, fn, { passive: true }); disposers.push(() => target?.removeEventListener?.(name, fn)); };
      const visibility = () => { if (api.isVisible()) handler('visibilitychange'); };
      const pageshow = () => handler('pageshow');
      const focus = () => handler('focus');
      // Keep the historical Clock Sentinel event targets/semantics while exposing one adapter seam.
      add(window, 'visibilitychange', visibility);
      add(window, 'pageshow', pageshow);
      add(window, 'focus', focus);
      return () => disposers.splice(0).forEach(fn => { try { fn(); } catch {} });
    },
    copyText: async text => {
      if (navigator?.clipboard?.writeText) { await navigator.clipboard.writeText(String(text)); return true; }
      return false;
    },
    async saveTextFile(filename, text, mime = 'text/plain') {
      try {
        if (typeof document === 'undefined' || typeof Blob === 'undefined' || !URL?.createObjectURL) return false;
        const blob = new Blob([String(text)], { type: String(mime || 'text/plain') });
        const href = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = href; a.download = String(filename || 'realmforge-save.rfsave'); a.style.display = 'none';
        (document.body || document.documentElement).appendChild(a); a.click(); a.remove();
        setTimeout(() => { try { URL.revokeObjectURL(href); } catch {} }, 1000);
        return true;
      } catch { return false; }
    },
    async pickTextFile(accept = '.rfsave,.txt,application/json,text/plain') {
      if (typeof document === 'undefined') return null;
      return new Promise(resolve => {
        try {
          const input = document.createElement('input'); input.type = 'file'; input.accept = accept; input.style.display = 'none';
          let settled = false; const finish = value => { if (settled) return; settled = true; try { input.remove(); } catch {} resolve(value); };
          input.addEventListener('cancel', () => finish(null), { once: true });
          input.addEventListener('change', async () => {
            const file = input.files?.[0]; if (!file) return finish(null);
            try { finish({ name: file.name || '', text: await file.text() }); } catch { finish(null); }
          }, { once: true });
          (document.body || document.documentElement).appendChild(input); input.click();
          // Cancellation is intentionally silent; browsers do not expose a universal file-picker cancel event.
        } catch { resolve(null); }
      });
    },
    onVisibilityChange(handler) {
      if (typeof document === 'undefined') return () => {};
      const fn = () => handler(document.visibilityState);
      document.addEventListener('visibilitychange', fn);
      return () => document.removeEventListener('visibilitychange', fn);
    },
    async fetchBuildInfo(path = './version.txt') {
      if (typeof fetch !== 'function') throw new Error('Fetch unavailable');
      const res = await fetch(path, { cache: 'no-store' });
      return { ok: !!res.ok, status: res.status, text: await res.text(), lastModified: res.headers?.get?.('last-modified') || '' };
    },
    currentUrl() { try { return location.href; } catch { return ''; } },
    replaceHistoryState(state, url) { try { history.replaceState(state, '', url || location.href); return true; } catch { return false; } },
    pushHistoryState(state, url) { try { history.pushState(state, '', url || location.href); return true; } catch { return false; } },
    onBackNavigation(handler) {
      if (typeof window === 'undefined') return () => {};
      window.addEventListener('popstate', handler);
      return () => window.removeEventListener('popstate', handler);
    },
    registerServiceWorker(path = './sw.js') {
      if (!('serviceWorker' in navigator) || !location.protocol.startsWith('http')) return Promise.resolve(null);
      return navigator.serviceWorker.register(path);
    }
  };
  RF.Platform.Browser = RF.Modules.register('platform.browser', api, { owner: 'platform', status: 'canonical' });
  RF.Platform.active = RF.Platform.Browser;
})();

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

/* Realmforge V11.28.0 — historical migration definition ownership.
   Historical normalizer bodies execute at their original patch boundaries,
   but their source now lives with canonical core.migrations rather than gameplay compatibility. */
(() => {
  'use strict';
  const RF=window.RF,api=RF.Core?.Migrations;if(!api)throw new Error('Canonical migrations owner missing before V11.28 definition extension.');
  const definitionSources={"v3":"RF.migrateV3=function(s){\n  if(!s)return s; RF.migrateV2(s); s.version='3.0.0';\n  s.perks=s.perks||{}; s.perkPoints??=Math.max(0,Math.floor((s.player.level-1)/3)); s.perkPointsSpent??=0;\n  s.crime=s.crime||{bounty:0,heat:0,thefts:0}; s.dungeons=s.dungeons||{crypt:{depth:0,cleared:false},ember:{depth:0,cleared:false}};\n  s.reputation.ironridge??=0;s.reputation.underworld??=0;\n  s.equipment.ring1??=null;s.equipment.ring2??=null;s.equipment.legs??=null;s.equipment.boots??=null;\n  s.stats.perksBought??=0;s.stats.crimes??=0;s.stats.dungeonsCleared??=0;s.stats.rareDrops??=0;\n  if(s.flags.wanted&&!s.crime.bounty)s.crime.bounty=35;\n  if(s.quests?.eastwatch_rising?.done&&!s.quests.road_to_ironridge)s.quests.road_to_ironridge={active:true,done:false};\n  if(s.quests?.road_to_ironridge?.done&&!s.quests.the_split_crown)s.quests.the_split_crown={active:true,done:false};\n  return s;\n};\n","v4":"RF.migrateV4=function(s){\n if(!s)return s;s.version='4.0.0';\n s.social=s.social||{relations:{},passersSeen:{},dialogues:0,gifts:0};s.social.relations=s.social.relations||{};s.social.passersSeen=s.social.passersSeen||{};\n s.encounters=s.encounters||{};s.collection=s.collection||{enemies:{},items:{},npcs:{},abilities:{}};\n s.companion=s.companion||null;s.guild=s.guild||{joined:false,rank:0,reputation:0,contracts:[],completed:0};s.home=s.home||{owned:false,level:0,wellRestedBattles:0};s.specialization=s.specialization||null;\n s.factionWar=s.factionWar||{tension:0,lastShiftDay:s.day||1};s.stats=s.stats||{};s.stats.dialogues??=0;s.stats.turnBattles??=0;s.stats.contracts??=0;s.stats.giftsReceived??=0;\n s.flags=s.flags||{};s.reputation=s.reputation||{};s.reputation.wayfarers??=0;\n if((s.player?.level||1)>=3||s.flags.eastwatchOpen)s.flags.wayfarerHallOpen=true;\n // clean legacy combat into V4 battle shape if loading mid-fight\n if(s.combat&&!s.combat.turn){s.combat=null;RF.log(s,'The unfinished V3 skirmish disperses as the V4 battle system takes over.','important')}\n Object.keys(s.inventory||{}).forEach(id=>{if((s.inventory[id]||0)>0)s.collection.items[id]=true});\n return s;\n};\n","v7":"RF.migrateV7=function(s){\n  if(!s)return s;s.version='7.0.0';s.v7=s.v7||{};\n  s.v7.locks=s.v7.locks||{};s.v7.excavated=s.v7.excavated||{};s.v7.formulas=s.v7.formulas||{};s.v7.research=s.v7.research||{};s.v7.pickpockets=s.v7.pickpockets||{};s.v7.rareFinds=s.v7.rareFinds||0;\n  s.stats=s.stats||{};['locksPicked','pickpockets','researchActions','excavations','potionsDiscovered','rareSkillEvents'].forEach(k=>{if(s.stats[k]==null)s.stats[k]=0});\n  if((s.player?.level||1)>=5||s.skills?.exploration?.level>=5)s.flags.marshKnown=true;\n  if(s.quests?.marsh_lights?.done&&!s.quests.bell_below)s.quests.bell_below={active:true,done:false};\n  return s;\n};\n","v8":"RF.migrateV8=function(s){\n  if(!s)return s;\n  s.version='8.0.0';\n  s.v8=s.v8||{};\n  s.v8.boostUntil=s.v8.boostUntil||0;\n  s.v8.boostCooldownUntil=s.v8.boostCooldownUntil||0;\n  s.v8.travelInterrupts=s.v8.travelInterrupts||0;\n  s.v8.roadEventsSeen=s.v8.roadEventsSeen||{};\n  if(![0,1,2].includes(s.speed))s.speed=1;\n  s.stats=s.stats||{};\n  if(s.stats.travelEvents==null)s.stats.travelEvents=0;\n  if(s.stats.cooldownActions==null)s.stats.cooldownActions=0;\n  return s;\n};\n","v8_3":"RF.migrateV83=function(s){\n  if(!s)return s;\n  s.version='8.3.0';\n  s.v83=s.v83||{};\n  if(s.v83.manualPause==null)s.v83.manualPause=false;\n  s.flags=s.flags||{};\n  return s;\n};\n","v9":"RF.migrateV9=function(s){if(!s)return s;s.version='9.0.0';s.v9=s.v9||{};s.flags=s.flags||{};s.stats=s.stats||{};if(s.stats.parries==null)s.stats.parries=0;if(s.stats.perfectParries==null)s.stats.perfectParries=0;return s};\n","v9_1":"RF.migrateV91=function(s){\n  if(!s)return s;\n  s.version='9.1.0';\n  s.flags=s.flags||{};\n  s.stats=s.stats||{};\n  if(s.stats.parries==null)s.stats.parries=0;\n  if(s.stats.perfectParries==null)s.stats.perfectParries=0;\n  return s;\n};\n","v9_2":"RF.migrateV92=function(s){\n  if(!s)return s;s.version='9.2.0';s.v92=s.v92||{};\n  s.v92.inventoryCategory=s.v92.inventoryCategory||'all';\n  s.v92.shopCategory=s.v92.shopCategory||'all';\n  s.stats=s.stats||{};s.stats.burglaries=s.stats.burglaries||0;s.stats.deaths=s.stats.deaths||0;\n  return s;\n};\n","v9_3":"RF.migrateV93=function(s){\n  if(!s)return s;s.version='9.3.0';s.v93=s.v93||{};\n  s.v93.inventoryCategory=s.v93.inventoryCategory||s.v92?.inventoryCategory||'all';\n  s.v93.shopCategory=s.v93.shopCategory||s.v92?.shopCategory||'all';\n  s.v93.bankCategory=s.v93.bankCategory||'all';s.v93.craftCategory=s.v93.craftCategory||'all';\n  s.questOffers=s.questOffers||{};s.questAbandoned=s.questAbandoned||{};\n  return s;\n};\n","v10":"RF.migrateV10=function(s){\n  if(!s)return s;\n  s.version='10.0.0';\n  s.player.maxEnergy=s.player.maxEnergy||100;\n  if(s.player.energy==null)s.player.energy=s.player.maxEnergy;\n  s.stats=s.stats||{};\n  s.stats.instantHarvests??=0;\n  s.stats.energySpent??=0;\n  s.stats.innRests??=0;\n  s.v10=s.v10||{};\n  return s;\n};\n","v10_2":"RF.migrateV102=function(s){if(!s)return s;s.version='10.2.0';s.flags=s.flags||{};return s};\n"};
  const installed=Array.isArray(api.installedDefinitions)?api.installedDefinitions:(api.installedDefinitions=[]);
  const seen=new Set(installed);
  function runClassic(source,label){
    const script=document.createElement('script');script.type='text/javascript';
    script.setAttribute('data-rf-canonical-migration-definition',label);
    script.textContent=source+'\n//# sourceURL=realmforge-canonical:///core.migrations/definition/'+label+'\n';
    (document.head||document.documentElement).appendChild(script);script.remove();
  }
  api.installHistoricalDefinition=function(name){
    if(seen.has(name))return false;const source=definitionSources[name];
    if(typeof source!=='string')throw new Error('Unknown historical migration definition: '+name);
    runClassic(source,name);seen.add(name);installed.push(name);return true;
  };
  api.definitionNames=()=>Object.keys(definitionSources);
})();

/* Realmforge V11.28.0 — Canonical Scoped Historical Runtime.
   This is not a gameplay owner. It is a narrow execution capsule for historical stages
   whose IIFE-local captured bases make ordinary fragment extraction unsafe.
   New gameplay/content must never be added here. */
(() => {
  'use strict';
  const RF=window.RF;
  const stageSources={"js/v10_7.js":"/* Realmforge V10.7 — Teeth, Steel & Progression\n   - Enemy outgoing damage scales meaningfully with enemy level.\n   - Character tab shows Character Level progress and XP to next level.\n   - Pack capacity grows with Character Level.\n   - Enemy inspection shows a threat estimate against current armour.\n*/\n(function(){\n'use strict';\nconst RF=window.RF;if(!RF)return;\nRF.V107=RF.V107||{};RF.V107.version='10.7.0';\n\nRF.migrateV107=function(s){\n  if(!s)return s;\n  s.version='10.7.0';\n  return s;\n};\nif(RF.state)RF.migrateV107(RF.state);\n\n// ---------- Character XP clarity ----------\n// Existing character formula is: level = 1 + floor(sqrt(totalXP / 100)).\n// Therefore level L starts at 100*(L-1)^2 and level L+1 starts at 100*L^2.\nRF.characterXpFloor=function(level){level=Math.max(1,Math.min(100,level||1));return 100*Math.pow(level-1,2)};\nRF.characterXpNext=function(level){level=Math.max(1,Math.min(100,level||1));return level>=100?RF.characterXpFloor(100):100*Math.pow(level,2)};\nRF.characterProgress=function(s){\n  const lv=s?.player?.level||1,xp=Math.max(0,s?.player?.xp||0),floor=RF.characterXpFloor(lv),next=RF.characterXpNext(lv);\n  if(lv>=100)return {level:lv,xp,floor,next,into:xp-floor,need:0,pct:100};\n  const span=Math.max(1,next-floor),into=Math.max(0,xp-floor),need=Math.max(0,next-xp);\n  return {level:lv,xp,floor,next,into,need,pct:Math.max(0,Math.min(100,into/span*100))};\n};\n\n// ---------- Level-scaled inventory ----------\n// Base 28 slots. +1 slot every 2 character levels after level 1.\n// Lv 1: 28, Lv 10: 32, Lv 20: 37, Lv 50: 52, Lv 100: 77.\nRF.packCapacity=function(s){\n  const lv=Math.max(1,s?.player?.level||1);\n  return 28+Math.floor((lv-1)/2);\n};\nRF.packFree=function(s){return Math.max(0,RF.packCapacity(s)-RF.packUsed(s))};\n\n// V8.2 and later code reads RF.V82.PACK_CAP directly. Turn it into a live getter\n// so every existing pack/bank/shop path automatically respects level scaling.\ntry{\n  Object.defineProperty(RF.V82,'PACK_CAP',{configurable:true,enumerable:true,get(){return RF.packCapacity(RF.state)}});\n}catch(_e){}\n\n// ---------- Combat difficulty ----------\n// Preserve authored identity while making enemy level consequential.\nRF.v107EnemyDamageRange=function(enemy){\n  const lv=Math.max(1,enemy?.level||1),base=enemy?.damage||[2,5];\n  // Very low levels stay close to authored numbers. Pressure ramps after level 4.\n  const scale=0.92+lv*0.05;\n  const pressure=Math.max(0,lv-4)*0.30;\n  return [\n    Math.max(1,base[0]*scale+pressure),\n    Math.max(2,base[1]*scale+pressure)\n  ];\n};\n\n// Armour should noticeably matter once enemies begin hitting harder.\n// This modifier only applies during enemy damage resolution and does not inflate\n// the displayed armour stat.\nconst armorBase=RF.armor;\nRF.armor=function(s){\n  const value=armorBase(s);\n  return RF.V107.enemyResolving?value*1.35:value;\n};\n\n// Wrap the current integrated enemy turn (including parry/status/battle summary hooks)\n// and temporarily provide the level-scaled damage range.\nconst enemyTurnBase=RF.enemyBattleTurn;\nRF.enemyBattleTurn=function(){\n  const s=RF.state,c=s?.combat;\n  if(!c)return enemyTurnBase.apply(this,arguments);\n  const enemy=RF.DATA.enemies[c.id];\n  if(!enemy)return enemyTurnBase.apply(this,arguments);\n  const original=enemy.damage;\n  enemy.damage=RF.v107EnemyDamageRange(enemy);\n  RF.V107.enemyResolving=true;\n  try{return enemyTurnBase.apply(this,arguments)}\n  finally{RF.V107.enemyResolving=false;enemy.damage=original}\n};\n\nRF.v107Threat=function(s,e){\n  const armour=armorBase(s)||0,r=RF.v107EnemyDamageRange(e),mitigation=armour*.32*1.35;\n  const lo=Math.max(1,Math.round(r[0]-mitigation)),hi=Math.max(1,Math.round(r[1]-mitigation));\n  const avg=(lo+hi)/2,hits=(s.player.maxHp||100)/Math.max(1,avg);\n  let name='Low';\n  if(hits<2.8)name='Extreme';\n  else if(hits<4)name='Severe';\n  else if(hits<5.5)name='High';\n  else if(hits<8)name='Moderate';\n  return {name,range:[lo,hi]};\n};\n\n// ---------- UI ----------\nconst charBase=RF.UI.character.bind(RF.UI);\nRF.UI.character=function(s){\n  let h=charBase(s),p=RF.characterProgress(s),cap=RF.packCapacity(s),used=RF.packUsed(s);\n  const header=`<section class=\"card v107LevelCard\"><div class=\"questTitle\"><div><span class=\"eyebrow\">CHARACTER PROGRESSION</span><h2>Level ${p.level}</h2></div><div class=\"v107LevelBadge\">${p.level>=100?'MAX':`${p.need.toLocaleString()} XP to next`}</div></div><div class=\"v107XpBar\"><div style=\"width:${p.pct}%\"></div></div><div class=\"sub\">${p.level>=100?`${p.xp.toLocaleString()} total Character XP • Maximum level reached`:`${p.into.toLocaleString()} / ${(p.next-p.floor).toLocaleString()} XP through Level ${p.level} • ${p.xp.toLocaleString()} total XP`}</div><div class=\"v107PackLine\">🎒 Pack capacity <b>${used}/${cap}</b> slots <span>• +1 slot every 2 Character Levels</span></div></section>`;\n  return header+h;\n};\n\nconst modalBase=RF.UI.modalHtml.bind(RF.UI);\nRF.UI.modalHtml=function(s){\n  let h=modalBase(s),m=this.modal;\n  if(m?.type==='enemyInspect'&&m.id&&RF.DATA.enemies[m.id]){\n    const e=RF.DATA.enemies[m.id],t=RF.v107Threat(s,e);\n    const badge=`<div class=\"v107Threat\"><b>⚠️ ${t.name} threat</b><span>Estimated ordinary hit against your current armour: ${t.range[0]}–${t.range[1]}</span></div>`;\n    h=h.replace('<div class=\"choices\">',badge+'<div class=\"choices\">');\n  }\n  return h;\n};\n\nif(!document.getElementById('rf-v107-style')){\n  const st=document.createElement('style');st.id='rf-v107-style';st.textContent=`\n    .v107LevelCard h2{margin:2px 0 0}.v107LevelBadge{font-size:12px;font-weight:800;color:#e7c57d;text-align:right}\n    .v107XpBar{height:10px;border-radius:999px;background:#17130e;border:1px solid #51432f;overflow:hidden;margin:12px 0 8px}\n    .v107XpBar>div{height:100%;background:linear-gradient(90deg,#9d6c2c,#e0b15b);transition:width .25s ease}\n    .v107PackLine{margin-top:10px;padding-top:9px;border-top:1px solid #403629;color:#cfc1a7;font-size:12px}.v107PackLine span{color:#8f8371}\n    .v107Threat{margin:10px 0;padding:10px 12px;border:1px solid #665031;border-radius:12px;background:#211a12}.v107Threat b,.v107Threat span{display:block}.v107Threat b{color:#e7c57d}.v107Threat span{font-size:12px;color:#b9aa91;margin-top:3px}\n  `;document.head.appendChild(st);\n}\n\nif(RF.state){RF.migrateV107(RF.state);RF.save(RF.state);RF.UI.render(RF.state)}\n})();\n"};
  const installedStages=[],seen=new Set();
  function runClassic(source,label){
    const script=document.createElement('script');script.type='text/javascript';
    script.setAttribute('data-rf-scoped-historical-stage',label);
    script.textContent=source+'\n//# sourceURL=realmforge-scoped:///'+label.replace(/^js\//,'')+'\n';
    (document.head||document.documentElement).appendChild(script);script.remove();
  }
  function installHistoricalStage(name){
    if(seen.has(name))return false;const source=stageSources[name];
    if(typeof source!=='string')throw new Error('Unknown scoped historical stage: '+name);
    runClassic(source,name);seen.add(name);installedStages.push(name);return true;
  }
  RF.Core.ScopedRuntime=RF.Modules.register('core.scopedRuntime',{installHistoricalStage,installedStages,stageNames:()=>Object.keys(stageSources)},{owner:'core',status:'canonical',purpose:'scope-preserving historical execution',historicalStageCount:Object.keys(stageSources).length,extractedIn:'11.28.0'});
})();

/* Realmforge V11.29.0 — explicit classification of the remaining historical runtime timeline. */
(() => {
  'use strict';
  const RF=window.RF;
  const entries=Object.freeze([{"patch":"js/v2.js","bodyBytes":200,"category":"canonical_chronology_bridge","tags":["canonical-delegation"],"reason":"No independent gameplay ownership remains here; this stage preserves the original patch boundary while delegating implementation to canonical owners."},{"patch":"js/v3.js","bodyBytes":5722,"category":"mixed_historical_runtime","tags":["content-boundary","save-migration","canonical-delegation"],"reason":"Retains the combined Delve + Prospector finishActivity wrapper; splitting it would cross Dungeon/Mining ownership and alter captured wrapper semantics."},{"patch":"js/v4.js","bodyBytes":5838,"category":"save_migration_bridge","tags":["content-boundary","save-migration","canonical-delegation"],"reason":"Canonical gameplay/data ownership is delegated, but this stage still preserves historical migration invocation and/or activation chronology."},{"patch":"js/v5.js","bodyBytes":215,"category":"canonical_chronology_bridge","tags":["canonical-delegation"],"reason":"No independent gameplay ownership remains here; this stage preserves the original patch boundary while delegating implementation to canonical owners."},{"patch":"js/v6.js","bodyBytes":215,"category":"canonical_chronology_bridge","tags":["canonical-delegation"],"reason":"No independent gameplay ownership remains here; this stage preserves the original patch boundary while delegating implementation to canonical owners."},{"patch":"js/v7.js","bodyBytes":6151,"category":"save_migration_bridge","tags":["content-boundary","save-migration","canonical-delegation"],"reason":"Canonical gameplay/data ownership is delegated, but this stage still preserves historical migration invocation and/or activation chronology."},{"patch":"js/v8.js","bodyBytes":2006,"category":"save_migration_bridge","tags":["save-migration","canonical-delegation"],"reason":"Canonical gameplay/data ownership is delegated, but this stage still preserves historical migration invocation and/or activation chronology."},{"patch":"js/v8_1.js","bodyBytes":207,"category":"canonical_chronology_bridge","tags":["canonical-delegation"],"reason":"No independent gameplay ownership remains here; this stage preserves the original patch boundary while delegating implementation to canonical owners."},{"patch":"js/v8_2.js","bodyBytes":2757,"category":"save_migration_bridge","tags":["save-migration","canonical-delegation"],"reason":"Canonical gameplay/data ownership is delegated, but this stage still preserves historical migration invocation and/or activation chronology."},{"patch":"js/v8_3.js","bodyBytes":1784,"category":"save_migration_bridge","tags":["save-migration","canonical-delegation"],"reason":"Canonical gameplay/data ownership is delegated, but this stage still preserves historical migration invocation and/or activation chronology."},{"patch":"js/v9.js","bodyBytes":2688,"category":"save_migration_bridge","tags":["save-migration","canonical-delegation"],"reason":"Canonical gameplay/data ownership is delegated, but this stage still preserves historical migration invocation and/or activation chronology."},{"patch":"js/v9_1.js","bodyBytes":1507,"category":"save_migration_bridge","tags":["save-migration","canonical-delegation"],"reason":"Canonical gameplay/data ownership is delegated, but this stage still preserves historical migration invocation and/or activation chronology."},{"patch":"js/v9_2.js","bodyBytes":2359,"category":"save_migration_bridge","tags":["content-boundary","save-migration","canonical-delegation"],"reason":"Canonical gameplay/data ownership is delegated, but this stage still preserves historical migration invocation and/or activation chronology."},{"patch":"js/v9_3.js","bodyBytes":1834,"category":"save_migration_bridge","tags":["content-boundary","save-migration","canonical-delegation"],"reason":"Canonical gameplay/data ownership is delegated, but this stage still preserves historical migration invocation and/or activation chronology."},{"patch":"js/v9_4.js","bodyBytes":209,"category":"canonical_chronology_bridge","tags":["canonical-delegation"],"reason":"No independent gameplay ownership remains here; this stage preserves the original patch boundary while delegating implementation to canonical owners."},{"patch":"js/v9_5.js","bodyBytes":210,"category":"canonical_chronology_bridge","tags":["canonical-delegation"],"reason":"No independent gameplay ownership remains here; this stage preserves the original patch boundary while delegating implementation to canonical owners."},{"patch":"js/v9_6.js","bodyBytes":219,"category":"canonical_chronology_bridge","tags":["canonical-delegation"],"reason":"No independent gameplay ownership remains here; this stage preserves the original patch boundary while delegating implementation to canonical owners."},{"patch":"js/v10.js","bodyBytes":3760,"category":"save_migration_bridge","tags":["save-migration","canonical-delegation"],"reason":"Canonical gameplay/data ownership is delegated, but this stage still preserves historical migration invocation and/or activation chronology."},{"patch":"js/v10_1.js","bodyBytes":701,"category":"save_migration_bridge","tags":["save-migration","canonical-delegation"],"reason":"Canonical gameplay/data ownership is delegated, but this stage still preserves historical migration invocation and/or activation chronology."},{"patch":"js/v10_2.js","bodyBytes":2182,"category":"save_migration_bridge","tags":["save-migration","canonical-delegation"],"reason":"Canonical gameplay/data ownership is delegated, but this stage still preserves historical migration invocation and/or activation chronology."},{"patch":"js/v10_3.js","bodyBytes":218,"category":"canonical_chronology_bridge","tags":["canonical-delegation"],"reason":"No independent gameplay ownership remains here; this stage preserves the original patch boundary while delegating implementation to canonical owners."},{"patch":"js/v10_4.js","bodyBytes":206,"category":"canonical_chronology_bridge","tags":["canonical-delegation"],"reason":"No independent gameplay ownership remains here; this stage preserves the original patch boundary while delegating implementation to canonical owners."},{"patch":"js/v10_5.js","bodyBytes":206,"category":"canonical_chronology_bridge","tags":["canonical-delegation"],"reason":"No independent gameplay ownership remains here; this stage preserves the original patch boundary while delegating implementation to canonical owners."},{"patch":"js/v10_6.js","bodyBytes":206,"category":"canonical_chronology_bridge","tags":["canonical-delegation"],"reason":"No independent gameplay ownership remains here; this stage preserves the original patch boundary while delegating implementation to canonical owners."},{"patch":"js/v10_7.js","bodyBytes":201,"category":"canonical_chronology_bridge","tags":["canonical-delegation","scope-capsule"],"reason":"No independent gameplay ownership remains here; this stage preserves the original patch boundary while delegating implementation to canonical owners."},{"patch":"js/v10_8.js","bodyBytes":206,"category":"canonical_chronology_bridge","tags":["canonical-delegation"],"reason":"No independent gameplay ownership remains here; this stage preserves the original patch boundary while delegating implementation to canonical owners."},{"patch":"js/v10_9.js","bodyBytes":234,"category":"canonical_chronology_bridge","tags":["canonical-delegation"],"reason":"No independent gameplay ownership remains here; this stage preserves the original patch boundary while delegating implementation to canonical owners."},{"patch":"js/v10_10.js","bodyBytes":220,"category":"canonical_chronology_bridge","tags":["canonical-delegation"],"reason":"No independent gameplay ownership remains here; this stage preserves the original patch boundary while delegating implementation to canonical owners."},{"patch":"js/v10_11.js","bodyBytes":1379,"category":"canonical_chronology_bridge","tags":["canonical-delegation"],"reason":"No independent gameplay ownership remains here; this stage preserves the original patch boundary while delegating implementation to canonical owners."},{"patch":"js/v10_12.js","bodyBytes":1410,"category":"canonical_chronology_bridge","tags":["canonical-delegation"],"reason":"No independent gameplay ownership remains here; this stage preserves the original patch boundary while delegating implementation to canonical owners."},{"patch":"js/v10_13.js","bodyBytes":200,"category":"canonical_chronology_bridge","tags":["canonical-delegation"],"reason":"No independent gameplay ownership remains here; this stage preserves the original patch boundary while delegating implementation to canonical owners."},{"patch":"js/v10_14.js","bodyBytes":195,"category":"canonical_chronology_bridge","tags":["canonical-delegation"],"reason":"No independent gameplay ownership remains here; this stage preserves the original patch boundary while delegating implementation to canonical owners."},{"patch":"js/v10_15.js","bodyBytes":217,"category":"canonical_chronology_bridge","tags":["canonical-delegation"],"reason":"No independent gameplay ownership remains here; this stage preserves the original patch boundary while delegating implementation to canonical owners."},{"patch":"js/v10_16.js","bodyBytes":349,"category":"canonical_chronology_bridge","tags":["canonical-delegation","build-metadata"],"reason":"No independent gameplay ownership remains here; this stage preserves the original patch boundary while delegating implementation to canonical owners."},{"patch":"js/v10_17.js","bodyBytes":348,"category":"canonical_chronology_bridge","tags":["canonical-delegation","build-metadata"],"reason":"No independent gameplay ownership remains here; this stage preserves the original patch boundary while delegating implementation to canonical owners."},{"patch":"js/v10_18.js","bodyBytes":217,"category":"canonical_chronology_bridge","tags":["canonical-delegation"],"reason":"No independent gameplay ownership remains here; this stage preserves the original patch boundary while delegating implementation to canonical owners."},{"patch":"js/v10_19.js","bodyBytes":217,"category":"canonical_chronology_bridge","tags":["canonical-delegation"],"reason":"No independent gameplay ownership remains here; this stage preserves the original patch boundary while delegating implementation to canonical owners."},{"patch":"js/v10_20.js","bodyBytes":351,"category":"canonical_chronology_bridge","tags":["canonical-delegation","build-metadata"],"reason":"No independent gameplay ownership remains here; this stage preserves the original patch boundary while delegating implementation to canonical owners."},{"patch":"js/v10_21.js","bodyBytes":260,"category":"canonical_chronology_bridge","tags":["canonical-delegation"],"reason":"No independent gameplay ownership remains here; this stage preserves the original patch boundary while delegating implementation to canonical owners."},{"patch":"js/v10_22.js","bodyBytes":224,"category":"canonical_chronology_bridge","tags":["canonical-delegation"],"reason":"No independent gameplay ownership remains here; this stage preserves the original patch boundary while delegating implementation to canonical owners."},{"patch":"js/v10_23.js","bodyBytes":224,"category":"canonical_chronology_bridge","tags":["canonical-delegation"],"reason":"No independent gameplay ownership remains here; this stage preserves the original patch boundary while delegating implementation to canonical owners."},{"patch":"js/v10_24.js","bodyBytes":217,"category":"canonical_chronology_bridge","tags":["canonical-delegation"],"reason":"No independent gameplay ownership remains here; this stage preserves the original patch boundary while delegating implementation to canonical owners."},{"patch":"js/v10_25.js","bodyBytes":226,"category":"canonical_chronology_bridge","tags":["canonical-delegation"],"reason":"No independent gameplay ownership remains here; this stage preserves the original patch boundary while delegating implementation to canonical owners."},{"patch":"js/v10_26.js","bodyBytes":226,"category":"canonical_chronology_bridge","tags":["canonical-delegation"],"reason":"No independent gameplay ownership remains here; this stage preserves the original patch boundary while delegating implementation to canonical owners."},{"patch":"js/v10_27.js","bodyBytes":208,"category":"canonical_chronology_bridge","tags":["canonical-delegation"],"reason":"No independent gameplay ownership remains here; this stage preserves the original patch boundary while delegating implementation to canonical owners."},{"patch":"js/v10_28.js","bodyBytes":217,"category":"canonical_chronology_bridge","tags":["canonical-delegation"],"reason":"No independent gameplay ownership remains here; this stage preserves the original patch boundary while delegating implementation to canonical owners."},{"patch":"js/v10_29.js","bodyBytes":208,"category":"canonical_chronology_bridge","tags":["canonical-delegation"],"reason":"No independent gameplay ownership remains here; this stage preserves the original patch boundary while delegating implementation to canonical owners."},{"patch":"js/v10_30.js","bodyBytes":208,"category":"canonical_chronology_bridge","tags":["canonical-delegation"],"reason":"No independent gameplay ownership remains here; this stage preserves the original patch boundary while delegating implementation to canonical owners."},{"patch":"js/v10_31.js","bodyBytes":208,"category":"canonical_chronology_bridge","tags":["canonical-delegation"],"reason":"No independent gameplay ownership remains here; this stage preserves the original patch boundary while delegating implementation to canonical owners."},{"patch":"js/v10_32.js","bodyBytes":208,"category":"canonical_chronology_bridge","tags":["canonical-delegation"],"reason":"No independent gameplay ownership remains here; this stage preserves the original patch boundary while delegating implementation to canonical owners."},{"patch":"js/v10_33.js","bodyBytes":216,"category":"canonical_chronology_bridge","tags":["canonical-delegation"],"reason":"No independent gameplay ownership remains here; this stage preserves the original patch boundary while delegating implementation to canonical owners."},{"patch":"js/v10_34.js","bodyBytes":226,"category":"canonical_chronology_bridge","tags":["canonical-delegation"],"reason":"No independent gameplay ownership remains here; this stage preserves the original patch boundary while delegating implementation to canonical owners."},{"patch":"js/v10_35.js","bodyBytes":211,"category":"canonical_chronology_bridge","tags":["canonical-delegation"],"reason":"No independent gameplay ownership remains here; this stage preserves the original patch boundary while delegating implementation to canonical owners."},{"patch":"js/v10_36.js","bodyBytes":211,"category":"canonical_chronology_bridge","tags":["canonical-delegation"],"reason":"No independent gameplay ownership remains here; this stage preserves the original patch boundary while delegating implementation to canonical owners."},{"patch":"js/v10_37.js","bodyBytes":211,"category":"canonical_chronology_bridge","tags":["canonical-delegation"],"reason":"No independent gameplay ownership remains here; this stage preserves the original patch boundary while delegating implementation to canonical owners."},{"patch":"js/v10_38.js","bodyBytes":219,"category":"canonical_chronology_bridge","tags":["canonical-delegation"],"reason":"No independent gameplay ownership remains here; this stage preserves the original patch boundary while delegating implementation to canonical owners."},{"patch":"js/v10_39.js","bodyBytes":225,"category":"canonical_chronology_bridge","tags":["canonical-delegation"],"reason":"No independent gameplay ownership remains here; this stage preserves the original patch boundary while delegating implementation to canonical owners."},{"patch":"js/v10_40.js","bodyBytes":225,"category":"canonical_chronology_bridge","tags":["canonical-delegation"],"reason":"No independent gameplay ownership remains here; this stage preserves the original patch boundary while delegating implementation to canonical owners."},{"patch":"js/v10_41.js","bodyBytes":225,"category":"canonical_chronology_bridge","tags":["canonical-delegation"],"reason":"No independent gameplay ownership remains here; this stage preserves the original patch boundary while delegating implementation to canonical owners."},{"patch":"js/v10_42.js","bodyBytes":220,"category":"canonical_chronology_bridge","tags":["canonical-delegation"],"reason":"No independent gameplay ownership remains here; this stage preserves the original patch boundary while delegating implementation to canonical owners."},{"patch":"js/v10_43.js","bodyBytes":220,"category":"canonical_chronology_bridge","tags":["canonical-delegation"],"reason":"No independent gameplay ownership remains here; this stage preserves the original patch boundary while delegating implementation to canonical owners."},{"patch":"js/v10_44.js","bodyBytes":220,"category":"canonical_chronology_bridge","tags":["canonical-delegation"],"reason":"No independent gameplay ownership remains here; this stage preserves the original patch boundary while delegating implementation to canonical owners."},{"patch":"js/v10_45.js","bodyBytes":220,"category":"canonical_chronology_bridge","tags":["canonical-delegation"],"reason":"No independent gameplay ownership remains here; this stage preserves the original patch boundary while delegating implementation to canonical owners."},{"patch":"js/v10_46.js","bodyBytes":220,"category":"canonical_chronology_bridge","tags":["canonical-delegation"],"reason":"No independent gameplay ownership remains here; this stage preserves the original patch boundary while delegating implementation to canonical owners."},{"patch":"js/v10_47.js","bodyBytes":220,"category":"canonical_chronology_bridge","tags":["canonical-delegation"],"reason":"No independent gameplay ownership remains here; this stage preserves the original patch boundary while delegating implementation to canonical owners."},{"patch":"js/v10_48.js","bodyBytes":217,"category":"canonical_chronology_bridge","tags":["canonical-delegation"],"reason":"No independent gameplay ownership remains here; this stage preserves the original patch boundary while delegating implementation to canonical owners."},{"patch":"js/v10_49.js","bodyBytes":217,"category":"canonical_chronology_bridge","tags":["canonical-delegation"],"reason":"No independent gameplay ownership remains here; this stage preserves the original patch boundary while delegating implementation to canonical owners."},{"patch":"js/v10_50.js","bodyBytes":220,"category":"canonical_chronology_bridge","tags":["canonical-delegation"],"reason":"No independent gameplay ownership remains here; this stage preserves the original patch boundary while delegating implementation to canonical owners."},{"patch":"js/v10_51.js","bodyBytes":220,"category":"canonical_chronology_bridge","tags":["canonical-delegation"],"reason":"No independent gameplay ownership remains here; this stage preserves the original patch boundary while delegating implementation to canonical owners."},{"patch":"js/v10_52.js","bodyBytes":220,"category":"canonical_chronology_bridge","tags":["canonical-delegation"],"reason":"No independent gameplay ownership remains here; this stage preserves the original patch boundary while delegating implementation to canonical owners."},{"patch":"js/v10_53.js","bodyBytes":220,"category":"canonical_chronology_bridge","tags":["canonical-delegation"],"reason":"No independent gameplay ownership remains here; this stage preserves the original patch boundary while delegating implementation to canonical owners."},{"patch":"js/v10_54.js","bodyBytes":356,"category":"canonical_chronology_bridge","tags":["canonical-delegation","build-metadata"],"reason":"No independent gameplay ownership remains here; this stage preserves the original patch boundary while delegating implementation to canonical owners."},{"patch":"js/v10_55.js","bodyBytes":220,"category":"canonical_chronology_bridge","tags":["canonical-delegation"],"reason":"No independent gameplay ownership remains here; this stage preserves the original patch boundary while delegating implementation to canonical owners."},{"patch":"js/v10_56.js","bodyBytes":220,"category":"canonical_chronology_bridge","tags":["canonical-delegation"],"reason":"No independent gameplay ownership remains here; this stage preserves the original patch boundary while delegating implementation to canonical owners."},{"patch":"js/v10_57.js","bodyBytes":211,"category":"canonical_chronology_bridge","tags":["canonical-delegation"],"reason":"No independent gameplay ownership remains here; this stage preserves the original patch boundary while delegating implementation to canonical owners."},{"patch":"js/v10_58.js","bodyBytes":211,"category":"canonical_chronology_bridge","tags":["canonical-delegation"],"reason":"No independent gameplay ownership remains here; this stage preserves the original patch boundary while delegating implementation to canonical owners."},{"patch":"js/v10_59.js","bodyBytes":211,"category":"canonical_chronology_bridge","tags":["canonical-delegation"],"reason":"No independent gameplay ownership remains here; this stage preserves the original patch boundary while delegating implementation to canonical owners."},{"patch":"js/v10_60.js","bodyBytes":211,"category":"canonical_chronology_bridge","tags":["canonical-delegation"],"reason":"No independent gameplay ownership remains here; this stage preserves the original patch boundary while delegating implementation to canonical owners."},{"patch":"js/v10_61.js","bodyBytes":213,"category":"canonical_chronology_bridge","tags":["canonical-delegation"],"reason":"No independent gameplay ownership remains here; this stage preserves the original patch boundary while delegating implementation to canonical owners."},{"patch":"js/v11.js","bodyBytes":356,"category":"canonical_chronology_bridge","tags":["canonical-delegation","build-metadata"],"reason":"No independent gameplay ownership remains here; this stage preserves the original patch boundary while delegating implementation to canonical owners."},{"patch":"js/v11_1.js","bodyBytes":211,"category":"canonical_chronology_bridge","tags":["canonical-delegation"],"reason":"No independent gameplay ownership remains here; this stage preserves the original patch boundary while delegating implementation to canonical owners."},{"patch":"js/v11_2.js","bodyBytes":209,"category":"canonical_chronology_bridge","tags":["canonical-delegation"],"reason":"No independent gameplay ownership remains here; this stage preserves the original patch boundary while delegating implementation to canonical owners."},{"patch":"js/v11_2_1.js","bodyBytes":214,"category":"canonical_chronology_bridge","tags":["canonical-delegation"],"reason":"No independent gameplay ownership remains here; this stage preserves the original patch boundary while delegating implementation to canonical owners."},{"patch":"js/v11_2_2.js","bodyBytes":345,"category":"canonical_chronology_bridge","tags":["canonical-delegation","build-metadata"],"reason":"No independent gameplay ownership remains here; this stage preserves the original patch boundary while delegating implementation to canonical owners."},{"patch":"js/v11_2_3.js","bodyBytes":214,"category":"canonical_chronology_bridge","tags":["canonical-delegation"],"reason":"No independent gameplay ownership remains here; this stage preserves the original patch boundary while delegating implementation to canonical owners."},{"patch":"js/v11_3.js","bodyBytes":211,"category":"canonical_chronology_bridge","tags":["canonical-delegation"],"reason":"No independent gameplay ownership remains here; this stage preserves the original patch boundary while delegating implementation to canonical owners."},{"patch":"js/v11_3_1.js","bodyBytes":227,"category":"canonical_chronology_bridge","tags":["canonical-delegation"],"reason":"No independent gameplay ownership remains here; this stage preserves the original patch boundary while delegating implementation to canonical owners."},{"patch":"js/v11_3_2.js","bodyBytes":213,"category":"canonical_chronology_bridge","tags":["canonical-delegation"],"reason":"No independent gameplay ownership remains here; this stage preserves the original patch boundary while delegating implementation to canonical owners."},{"patch":"js/v11_4.js","bodyBytes":215,"category":"canonical_chronology_bridge","tags":["canonical-delegation"],"reason":"No independent gameplay ownership remains here; this stage preserves the original patch boundary while delegating implementation to canonical owners."},{"patch":"js/v11_5.js","bodyBytes":218,"category":"canonical_chronology_bridge","tags":["canonical-delegation"],"reason":"No independent gameplay ownership remains here; this stage preserves the original patch boundary while delegating implementation to canonical owners."},{"patch":"js/v11_5_1.js","bodyBytes":355,"category":"canonical_chronology_bridge","tags":["canonical-delegation","build-metadata"],"reason":"No independent gameplay ownership remains here; this stage preserves the original patch boundary while delegating implementation to canonical owners."},{"patch":"js/v11_5_2.js","bodyBytes":219,"category":"canonical_chronology_bridge","tags":["canonical-delegation"],"reason":"No independent gameplay ownership remains here; this stage preserves the original patch boundary while delegating implementation to canonical owners."},{"patch":"js/v11_5_3.js","bodyBytes":219,"category":"canonical_chronology_bridge","tags":["canonical-delegation"],"reason":"No independent gameplay ownership remains here; this stage preserves the original patch boundary while delegating implementation to canonical owners."}].map(x=>Object.freeze(x)));
  const api={
    entries,
    categories:Object.freeze(['canonical_chronology_bridge','save_migration_bridge','mixed_historical_runtime','retireable_obsolete']),
    forPatch:patch=>entries.find(x=>x.patch===patch)||null,
    byCategory:category=>entries.filter(x=>x.category===category),
    summary:()=>({canonical_chronology_bridge:80,mixed_historical_runtime:1,save_migration_bridge:12,retireable_obsolete:0,total:entries.length,compatibilityBytes:64639}),
    retireable:()=>entries.filter(x=>x.category==='retireable_obsolete'),
    assertRuntimeCount(){const n=RF.PRODUCTION_FOUNDATION?.sourcePatchCount;return n==null||n===entries.length;}
  };
  RF.Core.CompatibilityClassification=RF.Modules.register('core.compatibilityClassification',api,{owner:'core',status:'canonical',purpose:'legacy-classification'});
})();

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
    keys(prefix = '') { const out=store()?.keys?.(String(prefix)); return Array.isArray(out)?out:[]; },
    getJSON(key, fallback = null) {
      try { const raw = api.get(key); return raw == null ? fallback : JSON.parse(raw); }
      catch { return fallback; }
    },
    setJSON(key, value) { return api.set(key, JSON.stringify(value)); }
  };
  RF.Core.Storage = RF.Modules.register('core.storage', api, { owner: 'core', status: 'canonical', backend: 'platform.storage' });
})();

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

/* Realmforge V11.20.0 — Canonical App Lifecycle.
   Owns base startup/offline catch-up orchestration while leaving simulation cadence to
   systems.timeEnergy and resume/stall recovery to systems.travel / Clock Sentinel. */
(() => {
  'use strict';
  const RF = window.RF;
  let booted = false;
  const platform = () => RF.Platform?.active || {};
  const wallNow = () => {
    const v = platform().now?.();
    return Number.isFinite(v) ? v : Date.now();
  };
  const perfNow = () => {
    const v = platform().monotonicNow?.();
    if (Number.isFinite(v)) return v;
    return typeof performance !== 'undefined' && performance.now ? performance.now() : wallNow();
  };


  function installShellAffordances() {
    // Save transfer UX is owned by canonical Core State. Lifecycle only asks it to install
    // the active platform affordances, preventing late legacy handlers from stealing ownership.
    return RF.Core.State?.installTransferAffordances?.() ?? false;
  }

  function installLegacyBoot() {
    if (booted) return false;
    booted = true;
    installShellAffordances();
    RF.state = RF.load();
    if (RF.state) {
      const rawUsed = Object.values(RF.state.inventory || {}).filter(q => (+q || 0) > 0).length;
      const rawCap = 28 + Math.floor((Math.max(1, RF.state.player?.level || 1) - 1) / 2);
      const rawOver = rawUsed > rawCap;
      const now = wallNow();
      const away = Math.max(0, now - (RF.state.lastReal || now));
      const awayMin = Math.min(120, Math.floor(away / 60000));
      if (!rawOver && awayMin >= 2) {
        RF.advanceWorld(awayMin * .15);
        RF.log(RF.state, `While you were away, ${awayMin} real minutes passed. The world moved on a little.`, 'important');
      }
      RF.log(RF.state, 'Campaign loaded.');
      RF.state.speed = rawOver ? 0 : 1;
      RF.state.paused = rawOver;
    }
    RF.UI.render(RF.state);
    RF.lastTick = perfNow();
    requestAnimationFrame(RF.tick);
    platform().registerServiceWorker?.('./sw.js')?.catch?.(() => {});
    return true;
  }

  const api = {
    installLegacyBoot, installShellAffordances,
    get booted() { return booted; },
    wallNow,
    monotonicNow: perfNow,
    visible: () => platform().isVisible?.() ?? true,
    onResume: handler => platform().onResume?.(handler) || (() => {})
  };
  RF.Core.Lifecycle = RF.Modules.register('core.lifecycle', api, {
    owner: 'core', status: 'canonical', extractedIn: '11.20.0',
    owns: ['startup', 'offline-catch-up', 'initial-frame', 'service-worker-bootstrap', 'save-import-export-affordances'],
    travelRecoveryOwner: 'systems.travel', timeOwner: 'systems.timeEnergy'
  });
})();
