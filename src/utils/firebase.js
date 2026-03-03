import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: 'AIzaSyDac_0UmrM1UTpmUzuLb1-o7YkPqXRhW-k',
  authDomain: 'student-portal-313cc.firebaseapp.com',
  projectId: 'student-portal-313cc',
  storageBucket: 'student-portal-313cc.firebasestorage.app',
  messagingSenderId: '129786227482',
  appId: '1:129786227482:web:62b3fdff9fbf2cc55f5aa3'
};

const app = initializeApp(firebaseConfig);

let messaging = null;
try {
  messaging = getMessaging(app);
} catch (err) {
  console.warn('Firebase Messaging not supported in this browser:', err.message);
}

/**
 * Register the Firebase messaging service worker explicitly.
 */
async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return null;
  try {
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
      scope: '/'
    });
    console.log('SW registered:', registration.scope);
    // Wait for the service worker to be ready
    await navigator.serviceWorker.ready;
    return registration;
  } catch (err) {
    console.error('SW registration failed:', err);
    return null;
  }
}

/**
 * Request notification permission and return the FCM token.
 * @param {string} vapidKey - Your VAPID public key from Firebase Console.
 * @returns {Promise<string|null>}
 */
export async function requestNotificationPermission(vapidKey) {
  if (!messaging) return null;

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    console.log('Notification permission denied');
    return null;
  }

  try {
    const swRegistration = await registerServiceWorker();
    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: swRegistration || undefined
    });
    console.log('FCM Token:', token);
    return token;
  } catch (err) {
    console.error('Error getting FCM token:', err);
    return null;
  }
}

/**
 * Listen for foreground messages and call the provided callback.
 */
export function onForegroundMessage(callback) {
  if (!messaging) return () => {};
  return onMessage(messaging, callback);
}
