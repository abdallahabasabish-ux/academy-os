import { getApps, initializeApp, getApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getMessaging } from 'firebase/messaging';

// Firebase configuration with real keys
const firebaseConfig = {
  apiKey: "AIzaSyD8q05OB-2URf_5z59UD0NBKoA3NXaxncs",
  authDomain: "academy-os-314c0.firebaseapp.com",
  projectId: "academy-os-314c0",
  storageBucket: "academy-os-314c0.firebasestorage.app",
  messagingSenderId: "790267436938",
  appId: "1:790267436938:web:bcbace45e788569cc5b273"
};

// Initialize Firebase app (singleton pattern)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const messaging = typeof window !== 'undefined' ? getMessaging(app) : null;

// Enable offline persistence and auth persistence
if (typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence);
  
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('⚠️ Multiple tabs open, persistence disabled.');
    } else if (err.code === 'unimplemented') {
      console.warn('⚠️ Browser does not support persistence.');
    }
  });
}

export default app;
