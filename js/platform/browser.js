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
