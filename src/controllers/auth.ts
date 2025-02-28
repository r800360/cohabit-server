import { Request, Response } from "express";
import { oauth2Client, scopes } from "../config/oauth2";
import crypto from "crypto";
import { google } from "googleapis";
import { db, auth } from "../config/firebase";

export const validateGoogleAuthToken = async (req: Request, res: Response) => {
    const { idToken } = req.body;

    try {
        // Verify the ID token and extract user information
        const decodedToken = await auth.verifyIdToken(idToken);
        const uid = decodedToken.uid;

        // Retrieve the user record from Firebase Auth
        const userRecord = await auth.getUser(uid);
        const email = userRecord.email;

        if (!email) {
            res.status(400).json({ error: "Email not found in user profile" });
        }

        // Query Firestore for a user with this email
        const userDoc = await db.collection("users").where("email", "==", email).get();

        res.json({ exists: !userDoc.empty });
        return;

    } catch (error) {
        console.error("Token validation error:", error);
        res.status(401).json({ error: "Invalid token" });
        return;
    }
};

// Step 1: Initiate Google OAuth
export const initiateGoogleAuth = (req: Request, res: Response) => {
  const state = crypto.randomBytes(32).toString("hex");
  //req.session.state = state;
  (req.session as any).state = state;

  const authorizationUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    include_granted_scopes: true,
    state: state,
  });

  res.redirect(authorizationUrl);
};

// Step 2: Handle OAuth Callback
export const handleOAuthCallback = async (req: Request, res: Response) => {
  if ((req.session as any).state !== req.query) {
    res.status(400).send("State mismatch error");
    return;
  }

  const { code } = req.query;
  try {
    const { tokens } = await oauth2Client.getToken(code as string);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();

    // Store user info in Firestore
    const userRef = db.collection("users").doc(userInfo.data.id);
    await userRef.set({
      email: userInfo.data.email,
      name: userInfo.data.name,
      picture: userInfo.data.picture,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
    });

    res.send(`Welcome, ${userInfo.data.name}`);
  } catch (error) {
    console.error("Authentication failed:", error);
    res.status(500).send("Authentication failed.");
  }
};
