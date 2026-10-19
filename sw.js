// Melsa Elevators — offline support for the installed app.
// Bump VERSION when you want every installed copy to refresh its cache.
const VERSION = "melsa-v2";
const SHELL = ["./", "./index.html", "./survey.html", "./manifest.webmanifest", "./assets/logo.png", "./assets/logo-mark.png", "./icons/icon-192.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;               // never cache AI requests
  const url = new URL(req.url);
  if (url.hostname.endsWith("workers.dev")) return;

  // The page itself: try the network first so updates show up, fall back to cache offline.
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req).then((res) => { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); return res; })
        .catch(() => caches.match(req, { ignoreSearch: true }).then((hit) => hit || caches.match("./index.html")))
    );
    return;
  }

  // Images, 3D library and fonts: serve from cache, refresh in the background.
  const cacheable = url.origin === self.location.origin ||
    ["cdn.jsdelivr.net", "fonts.googleapis.com", "fonts.gstatic.com"].includes(url.hostname);
  if (!cacheable) return;
  e.respondWith(
    caches.open(VERSION).then((cache) =>
      cache.match(req).then((hit) => {
        const net = fetch(req).then((res) => { if (res.ok) cache.put(req, res.clone()); return res; }).catch(() => hit);
        return hit || net;
      })
    )
  );
});
