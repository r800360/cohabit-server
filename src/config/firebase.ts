import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(process.env.SERVICE_ACCOUNT as admin.ServiceAccount),
  });
}

export const db = admin.firestore();
export const auth = admin.auth();

