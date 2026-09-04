// Service worker mínimo — instalável + shell offline.
// Base-agnóstico (funciona em domínio raiz ou subpath): usa o escopo do registro
// e cacheia em runtime (network-first), sem caminhos absolutos fixos.
const CACHE = "health-rebuild-v1";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin)
    return;
  event.respondWith(
    fetch(request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(request, copy)).catch(() => {});
        return res;
      })
      .catch(() =>
        caches
          .match(request)
          .then((r) => r || caches.match(self.registration.scope)),
      ),
  );
});
