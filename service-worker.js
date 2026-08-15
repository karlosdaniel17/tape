const CACHE_NAME = "tape-cache-v1.2";
const CORE_FILES = [
  "index.html",
  "disciplinas.html",
  "anotacoes.html",
  "calculadora.html",
  "estudos.html",
  "aulas.html",
  "foco.html",
  "formulas.html",
  "perfil.html",
  "ajuda.html",
  "sugestoes.html",
  "creditos.html",
  "apoie.html",
  "login.html",
  "auth.js",
  "assistente.js",
  "manifest.json",
  "apple-touch-icon.png",
  "favicon-32.png",
  "icon-192.png",
  "icon-512.png"
];

// Antes: cache.addAll(CORE_FILES) — addAll é "tudo ou nada": se UM arquivo
// da lista falhar (ex.: icon-192.png/icon-512.png que não existiam), a
// promise inteira rejeita e NENHUM arquivo fica em cache, mesmo com o
// .catch(() => {}) escondendo o erro. Trocado por cache.add() individual
// com Promise.allSettled, então um arquivo faltando não derruba os outros.
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.allSettled(CORE_FILES.map((file) => cache.add(file)))
    )
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
