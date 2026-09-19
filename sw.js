const CACHE='realmforge-v11-6';
const FILES=[
  './',
  './index.html',
  './style.css',
  './manifest.webmanifest',
  './js/data.js',
  './js/state.js',
  './js/ui.js',
  './js/main.js',
  './js/realmforge_runtime_v11_6.js',
  './version.txt'
];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;const u=new URL(e.request.url);if(u.pathname.endsWith('/version.txt')){e.respondWith(fetch(e.request,{cache:'no-store'}).catch(()=>caches.match('./version.txt')));return;}e.respondWith(fetch(e.request).then(r=>{let c=r.clone();caches.open(CACHE).then(x=>x.put(e.request,c)).catch(()=>{});return r}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html'))))});
