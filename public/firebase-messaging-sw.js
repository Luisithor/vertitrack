// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.10.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.10.0/firebase-messaging-compat.js');

firebase.initializeApp({    
    apiKey: "AIzaSyCqOZagQ0aQrt0toSMHOg2La1QKq6b2l-o",
    authDomain: "vertitrack-f6f00.firebaseapp.com",
    projectId: "vertitrack-f6f00",
    storageBucket: "vertitrack-f6f00.firebasestorage.app",
    messagingSenderId: "406370468247",
    appId: "1:406370468247:web:d01754c3909ea3ef82c4d2",
    measurementId: "G-98KLRPD2QL"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: '/ios/50.png' 
  });
});