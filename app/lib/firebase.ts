import { getApp, getApps, initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};
export const configured = Boolean(
  config.apiKey &&
  config.authDomain &&
  config.projectId &&
  config.appId &&
  !config.apiKey.startsWith("your_"),
);
let services: { auth: ReturnType<typeof getAuth>; db: ReturnType<typeof getFirestore> } | undefined;
export function firebase() {
  if (services) return services;
  if (!configured)
    throw new Error("Add the Firebase web configuration to .env.local, then restart the website.");
  const app = getApps().length ? getApp() : initializeApp(config);
  services = { auth: getAuth(app), db: getFirestore(app) };
  if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true") {
    connectAuthEmulator(services.auth, "http://127.0.0.1:9099", { disableWarnings: true });
    connectFirestoreEmulator(services.db, "127.0.0.1", 8089);
  }
  return services;
}
