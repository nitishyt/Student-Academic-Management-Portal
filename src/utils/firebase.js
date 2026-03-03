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
 * Wait for a service worker to reach the activated state.
 */
function waitForSWActivation(registration) {
  return new Promise((resolve) => {
    const sw = registration.installing || registration.waiting || registration.active;
    if (sw?.state === 'activated') {
      resolve(registration);
      return;
    }
    if (sw) {
      sw.addEventListener('statechange', () => {
        if (sw.state === 'activated') resolve(registration);
      });
    } else {
      resolve(registration);
    }
  });
}

/**
 * Register the Firebase messaging service worker and wait for activation.
 */
async function getReadySW() {
  if (!('serviceWorker' in navigator)) return undefined;
  try {
    // Unregister any existing SW first to avoid stale state
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const reg of registrations) {
      if (reg.active?.scriptURL?.includes('firebase-messaging-sw')) {
        console.log('Found existing firebase SW, reusing...');
        await waitForSWActivation(reg);
        return reg;
      }
    }
    // Register fresh
    const reg = await navigator.serviceWorker.register('/firebase-messaging-sw.js', { scope: '/' });
    console.log('SW registered, waiting for activation...');
    await waitForSWActivation(reg);
    console.log('SW activated');
    return reg;
  } catch (err) {
    console.error('SW setup failed:', err);
    return undefined;
  }
}

/**
 * Request notification permission and return the FCM token.
 * @param {string} vapidKey - Your VAPID public key from Firebase Console.
 * @returns {Promise<string|null>}
 */
export async function requestNotificationPermission(vapidKey) {
  if (!messaging) {
    console.error('Firebase Messaging not available');
    return null;
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    console.log('Notification permission denied');
    return null;
  }

  // Try up to 3 times with increasing delay
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      console.log(`FCM token attempt ${attempt}...`);
      const swReg = await getReadySW();
      const token = await getToken(messaging, {
        vapidKey,
        serviceWorkerRegistration: swReg
      });
      console.log('FCM Token:', token);
      return token;
    } catch (err) {
      console.error(`Attempt ${attempt} failed:`, err.name, err.message);
      if (attempt < 3) {
        // Wait before retry, unsubscribing any stale push subscription
        try {
          const swReg = await navigator.serviceWorker.ready;
          const sub = await swReg.pushManager.getSubscription();
          if (sub) {
            console.log('Removing stale push subscription...');
            await sub.unsubscribe();
          }
        } catch (e) { /* ignore */ }
        await new Promise(r => setTimeout(r, 1500 * attempt));
      } else {
        console.error('All FCM token attempts failed');
        return null;
      }
    }
  }
  return null;
}

/**
 * Listen for foreground messages and call the provided callback.
 */
export function onForegroundMessage(callback) {
  if (!messaging) return () => {};
  return onMessage(messaging, callback);
}
