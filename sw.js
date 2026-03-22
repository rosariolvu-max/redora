const CACHE='redora-v2';
const ASSETS=['./','./index.html','./manifest.json','./icon.png'];
self.addEventListener('install',e=>{
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS).catch(()=>{})));
});
self.addEventListener('activate',e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(
      keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))
    )).then(()=>self.clients.claim())
  );
});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;
  if(e.request.url.includes('googleapis.com')||e.request.url.includes('accounts.google.com')) return;
  e.respondWith(
    caches.open(CACHE).then(cache=>
      cache.match(e.request).then(hit=>{
        const fresh=fetch(e.request).then(r=>{
          if(r.ok) cache.put(e.request,r.clone());
          return r;
        }).catch(()=>hit||new Response('Offline',{status:503}));
        return hit||fresh;
      })
    )
  );
});
