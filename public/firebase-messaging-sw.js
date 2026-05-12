/**
 * Service worker для FCM. Должен содержать тот же firebaseConfig, что и веб-приложение
 * (Firebase Console → Project settings → Your apps → SDK snippet).
 * Пока поля пустые — getToken на клиенте не сработает, пока не вставишь значения.
 */
importScripts("https://www.gstatic.com/firebasejs/12.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/12.12.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
});

firebase.messaging();
