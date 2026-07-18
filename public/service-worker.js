const CACHE = 'old-helper-v8';
const ASSETS = [
  './', './index.html', './styles.css', './app.js', './firebase-config.js',
  './manifest.webmanifest', './icon.svg', './icons/icon-192.png', './icons/icon-512.png',
  './icons/icon-maskable-512.png', './vendor/rpg-awesome/css/rpg-awesome.min.css',
  './vendor/rpg-awesome/fonts/rpgawesome-webfont.eot', './vendor/rpg-awesome/fonts/rpgawesome-webfont.svg',
  './vendor/rpg-awesome/fonts/rpgawesome-webfont.ttf', './vendor/rpg-awesome/fonts/rpgawesome-webfont.woff'
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await Promise.all(ASSETS.map(async (asset) => {
      const response = await fetch(asset, { cache:'reload' });
      if (!response.ok) throw new Error(`Falha ao armazenar ${asset}`);
      await cache.put(asset, response);
    }));
  })());
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))));
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  const cacheKey = request.mode === 'navigate' ? './index.html' : request;
  event.respondWith((async () => {
    try {
      const response = await fetch(request, { cache:'no-store' });
      if (response.ok) {
        const cache = await caches.open(CACHE);
        await cache.put(cacheKey, response.clone());
      }
      return response;
    } catch {
      return (await caches.match(cacheKey)) || Response.error();
    }
  })());
});
