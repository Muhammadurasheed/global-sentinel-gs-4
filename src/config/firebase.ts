
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase client config - these are safe to expose in client bundles
const firebaseConfig = {
  apiKey: "AIzaSyChM_6ZDrtLiNo0M4mY78RKAMm7ilP8g5U",
  authDomain: "global-sentinel2.firebaseapp.com",
  projectId: "global-sentinel2",
  storageBucket: "global-sentinel2.firebasestorage.app",
  messagingSenderId: "1050762813317",
  appId: "1:1050762813317:web:762d2706c3a95b584a6eec"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const firestore = getFirestore(app);

// Export the app instance
export default app;
