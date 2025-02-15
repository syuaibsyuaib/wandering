importScripts("https://www.gstatic.com/firebasejs/11.2.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/11.2.0/firebase-messaging-compat.js");
importScripts("firebase-config.js");

const HOSTNAME_WHITELIST = [self.location.hostname, "fonts.gstatic.com", "fonts.googleapis.com", "cdn.jsdelivr.net"];

// The Util Function to hack URLs of intercepted requests
const getFixedUrl = (req) => {
  var now = Date.now();
  var url = new URL(req.url);

  url.protocol = self.location.protocol;

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

const CACHE_FILES = [
  "./",
  "./index.html",
  "./manifest.json",
  "./sw.js",
  "./css/style.css",
  "./js/main.js",
  "./js/jquery.min.js",
  "./js/popper.min.js",
  "./js/bootstrap.min.js",
  "./js/fontawesome.js",
  "./icons/windows11/LargeTile.scale-100.png",
  "./icons/windows11/SmallTile.scale-100.png",
  "./icons/windows11/Square44x44Logo.scale-100.png",
  "./icons/windows11/Square150x150Logo.scale-100.png",
  "./icons/windows11/Square310x310Logo.scale-100.png",
  "./icons/windows11/Square70x70Logo.scale-100.png",
  "./icons/windows11/Wide310x150Logo.scale-100.png",
  "./icons/windows11/SplashScreen.scale-100.png",
  "./lagioff.html",
];


self.addEventListener("install", (event) => {
  console.log("Service Worker installing.");
  event.waitUntil(
    caches.open("pwa-cache").then((cache) => {
      return cache.addAll(CACHE_FILES);
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
  const requestUrl = new URL(event.request.url);
  if (!HOSTNAME_WHITELIST.includes(requestUrl.hostname)) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match("./lagioff.html"))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        return cached;
      }

      return fetch(getFixedUrl(event.request), { cache: "no-store" })
        .then((response) => {
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response;
          }
          const responseClone = response.clone();
          caches.open("pwa-cache").then((cache) => cache.put(event.request, responseClone));
          return response;
        })
        .catch(() => caches.match("./lagioff.html"));
    })
  );
});



// Konfigurasi Firebase
firebase.initializeApp(firebaseConfig);

// Inisialisasi Firebase Messaging
const messaging = firebase.messaging();

// Tangani notifikasi saat aplikasi di background
messaging.onBackgroundMessage((payload) => {
  const { title, body, icon, click_action } = payload.notification;
  self.registration.showNotification(title, {
    body,
    icon: icon || "/icons/windows11/LargeTile.scale-100.png",
    data: { click_action },
    actions: [{ action: "open_url", title: "Buka" }],
  });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  if (event.notification.data && event.notification.data.click_action) {
    event.waitUntil(clients.openWindow(event.notification.data.click_action));
  }
});