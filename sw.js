importScripts("https://www.gstatic.com/firebasejs/11.2.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/11.2.0/firebase-messaging-compat.js");

const HOSTNAME_WHITELIST = [self.location.hostname, "www.highperformanceformat.com", "pl25732847.profitablecpmrate.com", "unpkg.com","cdn.glitch.global", "thinnerlanguish.com","fonts.gstatic.com", "fonts.googleapis.com", "cdn.jsdelivr.net", "play.google.com", "thelifewillbefine.de", "code.jquery.com", "script.google.com", "www.gstatic.com"];
// const CACHE_FILES = ["/", "index.html", "icons/windows11/LargeTile.scale-100.png", "icons/windows11/SmallTile.scale-100.png", "icons/windows11/Square44x44Logo.scale-100.png", "icons/windows11/Square150x150Logo.scale-100.png", "icons/windows11/Square310x310Logo.scale-100.png", "icons/windows11/Square70x70Logo.scale-100.png", "icons/windows11/Wide310x150Logo.scale-100.png", "icons/windows11/SplashScreen.scale-100.png", "lagioff.html"];
// const CACHE_FILES = ["/wandering/", "/wandering/lagioff.html", "/wandering/script.js", "/wandering/style.css", "/wandering/icons/"]
const CACHE_FILES = ["/", "lagioff.html", "wandering/lagioff.html", "/lagioff.html"]

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

// self.addEventListener("activate", (event) => {
//   event.waitUntil(
//     caches.keys().then((cacheNames) => {
//       return Promise.all(
//         cacheNames.map((cache) => {
//           if (cache !== CACHE_FILES) {
//             console.log("Deleting old cache:", cache);
//             return caches.delete(cache);
//           }
//         })
//       );
//     })
//   );
// });
/**
 *  @Lifecycle Install
 *  Service Worker installing.
 */


self.addEventListener("install", (event) => {
  console.log("Service Worker installing.");
  event.waitUntil(
    caches
      .open("pwa-cache-v1")
      .then((cache) => {
        // console.log(self.location.hostname)
        return cache.addAll(["/","/wandering/", "/wandering/index.html", "/wandering/lagioff.html"]);
      })
      .catch((error) => {
        console.error("Failed to cache resources:", error);
      })
  );
});

/**
 *  @Functional Fetch
 *  All network requests are being intercepted here.
 *
 *  void respondWith(Promise<Response> r)
 */
// self.addEventListener("fetch", (event) => {
//   const requestUrl = new URL(event.request.url);
//   if (!HOSTNAME_WHITELIST.includes(requestUrl.hostname)) {
//     event.respondWith(fetch(event.request).catch(() => caches.match("/wandering/lagioff.html")));
//     return;
//   }

//   event.respondWith(
//     caches.match(event.request).then((cached) => {
//       if (cached) {
//         return cached;
//       }

//       return fetch(getFixedUrl(event.request), { cache: "no-store" })
//         .then((response) => {
//           if (!response || response.status !== 200 || response.type !== "basic") {
//             return response;
//           }
//           const responseClone = response.clone();
//           caches.open("pwa-cache").then((cache) => cache.put(event.request, responseClone));
//           return response;
//         })
//         .catch(() => caches.match("lagioff.html"));
//     })
//   );
// });

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      console.log(cachedResponse)
      return cachedResponse || fetch(event.request).catch(() => caches.match("/wandering/lagioff.html"));
    })
  );
});

// Konfigurasi Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCtr4PH8snb07hHNpq0dzTFGI6pFLOTkns",
  authDomain: "adakah-ddd65.firebaseapp.com",
  projectId: "adakah-ddd65",
  storageBucket: "adakah-ddd65.appspot.com",
  messagingSenderId: "96528323807",
  appId: "1:96528323807:web:d25f87552c42c3c520c56a",
  measurementId: "G-2Y0EQNQPDT",
};

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
