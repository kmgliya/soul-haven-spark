import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string | undefined,
};

let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;

const isBrowser = typeof window !== "undefined";

function ensureFirebase() {
  if (!isBrowser) return null;
  if (_app) return _app;

  if (!firebaseConfig.apiKey || !firebaseConfig.projectId || !firebaseConfig.appId) {
    if (import.meta.env.DEV) {
      console.warn(
        "[firebase] Не заданы VITE_FIREBASE_* переменные окружения. Создай .env.local на основе .env.example.",
      );
    }
    return null;
  }

  _app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  _auth = getAuth(_app);
  _db = getFirestore(_app);
  return _app;
}

export function getFirebaseApp(): FirebaseApp | null {
  return ensureFirebase();
}

export function getFirebaseAuth(): Auth | null {
  ensureFirebase();
  return _auth;
}

export function getDb(): Firestore | null {
  ensureFirebase();
  return _db;
}

export function isFirebaseConfigured(): boolean {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId);
}
