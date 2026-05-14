import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Send a notification to a specific user by their UID.
 * Writes to: users/{toUid}/notifications/{auto-id}
 */
export async function sendNotification({ toUid, type, title, body, fromUid, fromRole, toRole, relatedRequestId = null }) {
  if (!toUid) {
    console.error('sendNotification: toUid is required');
    return;
  }

  try {
    await addDoc(collection(db, 'users', toUid, 'notifications'), {
      type,
      title,
      body,
      read: false,
      createdAt: serverTimestamp(),
      fromUid:   fromUid   || null,
      fromRole:  fromRole  || null,
      toRole:    toRole    || null,
      relatedRequestId,
    });
    console.log(`✅ Notification sent to ${toUid}`);
  } catch (err) {
    console.error('sendNotification error:', err);
  }
}