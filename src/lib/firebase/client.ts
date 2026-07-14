import { getApps, initializeApp, getApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getMessaging } from 'firebase/messaging';

// 1. قراءة المتغيرات من ملف .env.local
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// 2. التحقق من وجود المتغيرات (تجنب الأخطاء الغامضة)
if (!firebaseConfig.apiKey) {
  throw new Error('❌ Firebase: Missing environment variables. Check your .env.local file.');
}

// 3. تهيئة التطبيق (مرة واحدة فقط)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// 4. تصدير الخدمات الأساسية
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// 5. (اختياري) تهيئة Messaging فقط في المتصفح
export const messaging = typeof window !== 'undefined' ? getMessaging(app) : null;

// 6. إعداد بقاء المصادقة محلياً وتفعيل التخزين المؤقت لـ Firestore
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
