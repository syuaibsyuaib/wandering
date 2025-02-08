importScripts("https://www.gstatic.com/firebasejs/11.2.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/11.2.0/firebase-messaging-compat.js");

// Konfigurasi Firebase
firebase.initializeApp({
  apiKey: "AIzaSyCtr4PH8snb07hHNpq0dzTFGI6pFLOTkns",
  authDomain: "adakah-ddd65.firebaseapp.com",
  projectId: "adakah-ddd65",
  storageBucket: "adakah-ddd65.firebasestorage.app",
  messagingSenderId: "96528323807",
  appId: "1:96528323807:web:d25f87552c42c3c520c56a",
  measurementId: "G-2Y0EQNQPDT",
});

// Inisialisasi Firebase Messaging
const messaging = firebase.messaging();

// Tangani notifikasi saat aplikasi di background
messaging.onBackgroundMessage((payload) => {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: payload.notification.icon || "/icons/windows11/LargeTile.scale-100.png",
  });
});


const HOSTNAME_WHITELIST = [self.location.hostname, "fonts.gstatic.com", "fonts.googleapis.com", "cdn.jsdelivr.net"];

// The Util Function to hack URLs of intercepted requests
const getFixedUrl = (req) => {
  var now = Date.now();
  var url = new URL(req.url);

  // 1. fixed http URL
  // Just keep syncing with location.protocol
  // fetch(httpURL) belongs to active mixed content.
  // And fetch(httpRequest) is not supported yet.
  url.protocol = self.location.protocol;

  // 2. add query for caching-busting.
  // Github Pages served with Cache-Control: max-age=600
  // max-age on mutable content is error-prone, with SW life of bugs can even extend.
  // Until cache mode of Fetch API landed, we have to workaround cache-busting with query string.
  // Cache-Control-Bug: https://bugs.chromium.org/p/chromium/issues/detail?id=453190
  if (url.hostname === self.location.hostname) {
    url.search += (url.search ? "&" : "?") + "cache-bust=" + now;
  }
  return url.href;
};

/**
 *  @Lifecycle Activate
 *  New one activated when old isnt being used.
 *
 *  waitUntil(): activating ====> activated
 */
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

/**
 *  @Lifecycle Install
 *  Service Worker installing.
 */
self.addEventListener("install", (event) => {
  console.log("Service Worker installing.");
  event.waitUntil(
    caches.open("pwa-cache").then((cache) => {
      return cache.addAll([
        "lagioff.html",
        // Tambahkan file lain yang ingin Anda cache di sini
      ]);
    })
  );
});

/**
 *  @Functional Fetch
 *  All network requests are being intercepted here.
 *
 *  void respondWith(Promise<Response> r)
 */
self.addEventListener("fetch", (event) => {
  // Skip some of cross-origin requests, like those for Google Analytics.
  if (HOSTNAME_WHITELIST.indexOf(new URL(event.request.url).hostname) > -1) {
    // Stale-while-revalidate
    // similar to HTTP's stale-while-revalidate: https://www.mnot.net/blog/2007/12/12/stale
    // Upgrade from Jake's to Surma's: https://gist.github.com/surma/eb441223daaedf880801ad80006389f1
    const cached = caches.match(event.request);
    const fixedUrl = getFixedUrl(event.request);
    const fetched = fetch(fixedUrl, { cache: "no-store" });
    const fetchedCopy = fetched.then((resp) => resp.clone());

    // Call respondWith() with whatever we get first.
    // If the fetch fails (e.g disconnected), wait for the cache.
    // If there’s nothing in cache, wait for the fetch.
    // If neither yields a response, return offline pages.
    event.respondWith(
      Promise.race([fetched.catch((_) => cached), cached])
        .then((resp) => resp || fetched)
        .catch((_) => {
          /* eat any errors */
        })
    );

    // Update the cache with the version we fetched (only for ok status)
    event.waitUntil(
      Promise.all([fetchedCopy, caches.open("pwa-cache")])
        .then(([response, cache]) => response.ok && cache.put(event.request, response))
        .catch((_) => {
          /* eat any errors */
        })
    );
  } else {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match("lagioff.html");
      })
    );
  }
});
