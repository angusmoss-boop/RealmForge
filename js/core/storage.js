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
