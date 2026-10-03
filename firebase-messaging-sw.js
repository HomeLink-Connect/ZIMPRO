/* ZimPro Linkup — background alerts (calls & messages) via Firebase Cloud Messaging.
   This file must sit NEXT TO index.html (same folder, top level of the website). */
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyA7okyR40IeNWJjH5h0cbQF8yYR_5QHi3w",
  authDomain: "zimpro-linkup.firebaseapp.com",
  projectId: "zimpro-linkup",
  storageBucket: "zimpro-linkup.firebasestorage.app",
  messagingSenderId: "794726149912",
  appId: "1:794726149912:web:90814952c75a3fa278786d"
});

const messaging = firebase.messaging();

/* data-only pushes from the push server arrive here while the app is closed or in the background */
messaging.onBackgroundMessage(payload => {
  if (payload.notification) return;                 // FCM already shows those by itself
  const d = payload.data || {};
  const isCall = d.type === 'call';
  return self.registration.showNotification(d.title || 'ZimPro Linkup', {
    body: d.body || (isCall ? 'Incoming call' : 'You have a new message'),
    icon: 'icons/icon-192.png',
    badge: 'icons/favicon-64.png',
    tag: d.tag || (isCall ? 'zpl-call' : 'zpl-msg'),
    renotify: true,
    requireInteraction: isCall,
    vibrate: isCall ? [300, 150, 300, 150, 300, 150, 300] : [120, 60, 120],
    data: { url: d.url || self.registration.scope, type: d.type || '' }
  });
});

/* tapping a notification opens / focuses ZimPro */
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || self.registration.scope;
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const c of list) { if (c.url.indexOf(self.registration.scope) === 0 && 'focus' in c) return c.focus(); }
      return clients.openWindow(target);
    })
  );
});

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
