// sw.js
const cacheName = 'pwa-desenho-infantil-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/manifest.json',
  '/images/beija_flor.jpg',
  '/images/casinha_de_madeira.jpg',
  '/images/escalada.jpg',
  '/images/irrigando_flores.jpg',
  '/images/jardim_flores.jpg',
  '/images/lagoa_dos_sapos.jpg',
  '/images/montanha.jpg',
  '/images/mundo_dos_duendes.jpg',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(cacheName)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});

// Opcional: remover caches antigos
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [cacheName];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});