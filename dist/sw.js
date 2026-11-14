const CACHE_NAME = "marche-plus-v2";
const ASSETS = [
  "/",
  "/index.html",
  "/logo.png",
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k.startsWith("marche-plus-") && k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith("/api/")) return;

  if (event.request.mode === "navigate") {
    const fallbackPage = url.pathname === "/admin.html" ? "/admin.html" : "/index.html";
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response.ok) caches.open(CACHE_NAME).then(cache => cache.put(fallbackPage, response.clone()));
          return response;
        })
        .catch(() => caches.match(fallbackPage))
    );
    return;
  }

  if (!["style", "script", "image", "font"].includes(event.request.destination)) return;
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
      if (response.ok) caches.open(CACHE_NAME).then(cache => cache.put(event.request, response.clone()));
      return response;
    }))
  );
});
