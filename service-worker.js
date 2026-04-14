self.addEventListener("install", e => {
  console.log("Service Worker installed");
});

self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);

  // 🚫 Ignore non-GET requests
  if (event.request.method !== 'GET') return;

  // 🚫 Skip external requests (GitHub PDFs etc.)
  if (requestUrl.origin !== self.location.origin) {
    return;
  }

  // 🚫 Skip PDFs
  if (requestUrl.pathname.endsWith('.pdf')) {
    return;
  }

  // ✅ Handle only your app files
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
