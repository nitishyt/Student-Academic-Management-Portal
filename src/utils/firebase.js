import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Replace with your own Firebase project config.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'REPLACE_WITH_YOUR_API_KEY',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'REPLACE_WITH_YOUR_AUTH_DOMAIN',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'REPLACE_WITH_YOUR_PROJECT_ID',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'REPLACE_WITH_YOUR_STORAGE_BUCKET',
  messagingSenderId: import.meta.env.VITE_FIREBASE_SENDER_ID || 'REPLACE_WITH_YOUR_SENDER_ID',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || 'REPLACE_WITH_YOUR_APP_ID'
};

const app = initializeApp(firebaseConfig);

let messaging = null;
try {
  messaging = getMessaging(app);
} catch (err) {
  console.warn('Firebase Messaging not supported in this browser:', err.message);
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
    const token = await getToken(messaging, { vapidKey });
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
