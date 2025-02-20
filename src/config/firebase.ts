import dotenv from "dotenv";
import admin from "firebase-admin";

dotenv.config();

const myServiceAccount:admin.ServiceAccount = {
  projectId: process.env.PROJECT_ID,
  clientEmail: process.env.CLIENT_EMAIL,
  privateKey: process.env.PRIVATE_KEY
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert( myServiceAccount as admin.ServiceAccount),
  });
}

export const db = admin.firestore();
export const auth = admin.auth();

