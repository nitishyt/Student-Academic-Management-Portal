/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/11.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyDac_0UmrM1UTpmUzuLb1-o7YkPqXRhW-k',
  authDomain: 'student-portal-313cc.firebaseapp.com',
  projectId: 'student-portal-313cc',
  storageBucket: 'student-portal-313cc.firebasestorage.app',
  messagingSenderId: '129786227482',
  appId: '1:129786227482:web:62b3fdff9fbf2cc55f5aa3'
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Background message received:', payload);
  const { title, body } = payload.notification || {};
  self.registration.showNotification(title || 'Attendance Update', {
    body: body || '',
    icon: '/vite.svg'
  });
});
