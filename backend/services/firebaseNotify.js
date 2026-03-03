const admin = require('firebase-admin');

// Initialize Firebase Admin SDK (once)
if (!admin.apps.length) {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    : undefined;

  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && privateKey) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey
      })
    });
    console.log('✅ Firebase Admin initialized');
  } else {
    console.warn('⚠️ Firebase env vars missing – push notifications disabled');
  }
}

/**
 * Send attendance notification to a single parent device.
 */
async function notifyParent({ fcmToken, studentName, status, subject, time }) {
  if (!fcmToken || !admin.apps.length) return null;

  const message = {
    token: fcmToken,
    notification: {
      title: `Attendance: ${studentName}`,
      body: `${status.toUpperCase()} — ${subject} at ${time}`
    },
    data: { studentName, status, subject, time, type: 'attendance' }
  };

  try {
    const response = await admin.messaging().send(message);
    console.log(`📩 Notified ${studentName}'s parent:`, response);
    return response;
  } catch (error) {
    // If token is invalid / expired, log but don't crash
    console.error(`Notification failed for ${studentName}:`, error.message);
    return null;
  }
}

/**
 * Send bulk notifications for an entire class.
 */
async function notifyAllParents(notifications) {
  if (!admin.apps.length) return { sent: 0, total: notifications.length };

  const results = await Promise.allSettled(notifications.map(n => notifyParent(n)));
  const sent = results.filter(r => r.status === 'fulfilled' && r.value).length;
  console.log(`📩 Notifications sent: ${sent}/${notifications.length}`);
  return { sent, total: notifications.length };
}

module.exports = { notifyParent, notifyAllParents };
