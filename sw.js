// Red primero; sin conexión, la última copia guardada. Solo archivos propios (las fotos de tiendas no).
const C = 'north-v3';
self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(C).then(c => c.addAll(['./', 'manifest.webmanifest', 'icon-192.png']))); });
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  // Fotos propias con ?v=: cada versión es una URL nueva, así que se sirven de la caché sin preguntar (no parpadean al redibujar). Al guardar una, se borra su versión anterior.
  if (/\/img\/.*\?v=/.test(e.request.url)) {
    e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(r => { const copy = r.clone(); if (r.ok) caches.open(C).then(c => c.put(e.request, copy).then(() => c.keys()).then(ks => ks.filter(k => k.url.split('?')[0] === e.request.url.split('?')[0] && k.url !== e.request.url).forEach(k => c.delete(k)))); return r; })));
    return;
  }
  // no-cache: siempre pregunta al servidor (sin la caché HTTP de 10 min de GitHub Pages).
  e.respondWith(fetch(e.request, { cache: 'no-cache' }).then(r => { const copy = r.clone(); caches.open(C).then(c => c.put(e.request, copy)); return r; })
    .catch(() => caches.match(e.request, { ignoreSearch: true })));
});
