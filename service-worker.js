const CACHE_NAME = "tape-cache-v1.1";
const CORE_FILES = [
  "index.html",
  "disciplinas.html",
  "anotacoes.html",
  "calculadora.html",
  "estudos.html",
  "ajuda.html",
  "sugestoes.html",
  "creditos.html",
  "apoie.html",
  "login.html",
  "auth.js",
  "manifest.json",
  "icon-192.png",
  "icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_FILES).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

// Estratégia: tenta a rede primeiro (pra pegar sempre a versão mais nova);
// se estiver offline, cai pro que já está salvo em cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
