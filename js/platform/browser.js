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
