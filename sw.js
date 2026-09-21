/* মিলের হিসাব — Service Worker
   এই ফাইলটা আলাদা রাখতেই হবে (ব্রাউজারের নিয়ম) — বাকি সব কিছু (আইকন, manifest)
   index.html এর ভেতরেই বসানো আছে, তাই আপলোড করতে হবে মোটে ২টা ফাইল:
   index.html + sw.js — দুটো একই ফোল্ডারে। */

const CACHE_VERSION = 'v1';
const CACHE_NAME = `mil-hisab-${CACHE_VERSION}`;
const PAGE_URL = './index.html';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(['./', PAGE_URL]))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          caches.open(CACHE_NAME).then((cache) => cache.put(PAGE_URL, res.clone()));
          return res;
        })
        .catch(() => caches.match(PAGE_URL))
    );
    return;
  }

  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(req).then((cached) => cached || fetch(req).then((res) => {
        if (res && res.ok) caches.open(CACHE_NAME).then((cache) => cache.put(req, res.clone()));
        return res;
      }).catch(() => cached))
    );
    return;
  }

  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(
      caches.match(req).then((cached) => cached || fetch(req).then((res) => {
        if (res && res.ok) caches.open(CACHE_NAME).then((cache) => cache.put(req, res.clone()));
        return res;
      }).catch(() => cached))
    );
    return;
  }
});
