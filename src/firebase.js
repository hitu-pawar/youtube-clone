import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "vidtube-2fb2f.firebaseapp.com",
  projectId: "vidtube-2fb2f",
  storageBucket: "vidtube-2fb2f.firebasestorage.app",
  messagingSenderId: "785073127196",
  appId: "1:785073127196:web:4bd497a73bd56a1a0044d9"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);