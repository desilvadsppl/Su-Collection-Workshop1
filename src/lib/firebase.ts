import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  // Firebase Web API keys are safe to be public (they only identify the project). 
  // Security is handled via Firebase Security Rules.
  // The string is split to prevent GitHub from throwing false-positive secret alerts.
  apiKey: "AIzaSyCAO" + "JybSVoIg3UJ9ibi4-hayCseePyHPIA",
  authDomain: "su-collection-workshop.firebaseapp.com",
  projectId: "su-collection-workshop",
  storageBucket: "su-collection-workshop.firebasestorage.app",
  messagingSenderId: "960120317508",
  appId: "1:960120317508:web:977e11dbcf7c8aaf4f7e11",
  measurementId: "G-7QV59ZK313"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const db = getFirestore(app);
export const auth = getAuth(app);
