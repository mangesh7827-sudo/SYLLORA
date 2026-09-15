import { getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const firebaseConfigured = Object.values(config).every(Boolean);

const app = getApps().length ? getApps()[0] : initializeApp({
  ...config,
  apiKey: config.apiKey || 'not-configured',
  authDomain: config.authDomain || 'not-configured.firebaseapp.com',
  projectId: config.projectId || 'not-configured',
  storageBucket: config.storageBucket || 'not-configured.firebasestorage.app',
  messagingSenderId: config.messagingSenderId || 'not-configured',
  appId: config.appId || 'not-configured',
});
export const firebaseApp = app;
export const firebaseAuth = getAuth(app);
export const firebaseDb = getFirestore(app);
export const firebaseStorage = getStorage(app);
