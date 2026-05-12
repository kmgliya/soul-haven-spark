import { arrayUnion, doc, setDoc } from "firebase/firestore";
import { getMessaging, getToken, isSupported } from "firebase/messaging";
import { getDb, getFirebaseApp } from "@/lib/firebase";

/**
 * Сохраняет FCM-токен в `users/{uid}.fcmTokens` для Cloud Functions (push при nudge и т.д.).
 * Нужны: VITE_FIREBASE_VAPID_KEY, заполненный `public/firebase-messaging-sw.js`, разрешение на уведомления.
 */
export async function registerPushForUser(uid: string): Promise<void> {
  const app = getFirebaseApp();
  const db = getDb();
  const vapid = import.meta.env.VITE_FIREBASE_VAPID_KEY as string | undefined;
  if (!app || !db || !vapid?.trim()) return;
  if (typeof window === "undefined" || !("Notification" in window)) return;

  const supported = await isSupported();
  if (!supported) return;

  if (Notification.permission === "denied") return;
  if (Notification.permission === "default") {
    const p = await Notification.requestPermission();
    if (p !== "granted") return;
  }

  const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
  const messaging = getMessaging(app);
  const token = await getToken(messaging, {
    vapidKey: vapid.trim(),
    serviceWorkerRegistration: registration,
  });
  if (!token) return;

  await setDoc(doc(db, "users", uid), { fcmTokens: arrayUnion(token) }, { merge: true });
}
