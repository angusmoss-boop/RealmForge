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
