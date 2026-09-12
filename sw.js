// Service worker : mise en cache des pages/fichiers deja visites, pour un
// acces hors ligne. Strategie "stale-while-revalidate" : sert la version en
// cache immediatement (rapide, fonctionne hors ligne), et la met a jour en
// arriere-plan des que le reseau repond. Rien n'est precharge a l'avance --
// seules les pages reellement visitees deviennent disponibles hors ligne.
// Augmenter CACHE_NAME force un nettoyage complet du cache existant.
const CACHE_NAME = 'mediation-numerique-v1';

self.addEventListener('install', function (event) {
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE_NAME; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then(function (cached) {
      const network = fetch(event.request).then(function (response) {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(function (cache) { cache.put(event.request, clone); });
        }
        return response;
      }).catch(function () { return cached; });
      return cached || network;
    })
  );
});
