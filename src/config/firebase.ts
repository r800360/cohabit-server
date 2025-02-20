import dotenv from "dotenv";
import admin from "firebase-admin";

dotenv.config();

// const { myPrivateKey } = JSON.parse(process.env.PRIVATE_KEY);

const myServiceAccount:admin.ServiceAccount = {
  projectId: process.env.PROJECT_ID,
  clientEmail: process.env.CLIENT_EMAIL,
  privateKey: process?.env?.PRIVATE_KEY?.replace(
    /\\n/g,
   '\n',
  )
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert( myServiceAccount as admin.ServiceAccount),
  });
}

export const db = admin.firestore();
export const auth = admin.auth();

