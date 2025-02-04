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
        icon: payload.notification.icon || "/icons/windows11/LargeTile.scale-100.png"
    });
});
