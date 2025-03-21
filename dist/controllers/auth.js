"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleOAuthCallback = exports.initiateGoogleAuth = exports.validateFirebaseAuthToken = void 0;
const oauth2_1 = require("../config/oauth2");
const crypto_1 = __importDefault(require("crypto"));
const googleapis_1 = require("googleapis");
const firebase_1 = require("../config/firebase");
// const jwt = require('jsonwebtoken');
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function checkTokenType(token) {
    var _a, _b;
    if (!token) {
        console.error("Invalid Token: Empty or Undefined");
        return;
    }
    const decoded = jsonwebtoken_1.default.decode(token, { complete: true });
    if (!decoded || !decoded.payload) {
        console.error("Invalid Token: Could not decode");
        return;
    }
    const payload = decoded.payload;
    console.error("Decoded Header:", decoded.header);
    console.error("Decoded Payload:", payload);
    if ((_a = payload.iss) === null || _a === void 0 ? void 0 : _a.includes("accounts.google.com")) {
        console.error("This is a Google ID Token.");
    }
    else if ((_b = payload.iss) === null || _b === void 0 ? void 0 : _b.includes("securetoken.google.com")) {
        console.error("This is a Firebase ID Token.");
    }
    else {
        console.error("Unknown Token Type.");
    }
}
// // Example usage
// const token: string = "your_jwt_token_here"; // Replace with actual token
// checkTokenType(token);
const validateFirebaseAuthToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { idToken } = req.body;
    checkTokenType(idToken);
    try {
        // Verify the ID token and extract user information
        const decodedToken = yield firebase_1.auth.verifyIdToken(idToken, true);
        const uid = decodedToken.uid;
        // Retrieve the user record from Firebase Auth
        const userRecord = yield firebase_1.auth.getUser(uid);
        const email = userRecord.email;
        if (!email) {
            res.status(400).json({ error: "Email not found in user profile" });
            return;
        }
        if (!email.endsWith("@ucsd.edu")) {
            res.status(403).json({ message: "Only UCSD emails allowed" });
            return;
        }
        // Retrieve the user document from Firestore using the email
        const userDocRef = firebase_1.db.collection("users").doc(email.split("@")[0]); // Use email prefix as document ID
        const userDocSnapshot = yield userDocRef.get();
        // Check if the document already exists
        if (userDocSnapshot.exists) {
            // User already exists
            res.json({ exists: true });
        }
        else {
            // If user does not exist, create the user in Firestore
            yield userDocRef.set({
                name: email.split("@")[0], // Placeholder name (use email prefix as a placeholder)
                email: email,
                friendList: [],
                habitList: [],
                blockedList: [],
            });
            res.json({ exists: false }); // User was created successfully
        }
        return;
        // const userDoc = db.collection("users").doc((email as string).split("@")[0]);
        // await userDoc.set({
        //   name: userDoc.id, // Placeholder
        //   email: email,
        //   friendList: [],
        //   habitList: [],
        //   // courseList: [],
        //   blockedList: [],
        //   // focusGroups: [],
        // });
        // res.json({ exists: !userDoc.empty });
        // return;
    }
    catch (error) {
        console.error("Token validation error:", error);
        res.status(401).json({ error: "Invalid token" });
        return;
    }
});
exports.validateFirebaseAuthToken = validateFirebaseAuthToken;
// Step 1: Initiate Google OAuth
const initiateGoogleAuth = (req, res) => {
    const state = crypto_1.default.randomBytes(32).toString("hex");
    //req.session.state = state;
    req.session.state = state;
    const authorizationUrl = oauth2_1.oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: oauth2_1.scopes,
        include_granted_scopes: true,
        state: state,
    });
    res.redirect(authorizationUrl);
};
exports.initiateGoogleAuth = initiateGoogleAuth;
// Step 2: Handle OAuth Callback
const handleOAuthCallback = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.session.state !== req.query) {
        res.status(400).send("State mismatch error");
        return;
    }
    const { code } = req.query;
    try {
        const { tokens } = yield oauth2_1.oauth2Client.getToken(code);
        oauth2_1.oauth2Client.setCredentials(tokens);
        const oauth2 = googleapis_1.google.oauth2({ version: "v2", auth: oauth2_1.oauth2Client });
        const userInfo = yield oauth2.userinfo.get();
        // Store user info in Firestore
        const userRef = firebase_1.db.collection("users").doc(userInfo.data.id);
        yield userRef.set({
            email: userInfo.data.email,
            name: userInfo.data.name,
            picture: userInfo.data.picture,
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
        });
        res.send(`Welcome, ${userInfo.data.name}`);
    }
    catch (error) {
        console.error("Authentication failed:", error);
        res.status(500).send("Authentication failed.");
    }
});
exports.handleOAuthCallback = handleOAuthCallback;
//# sourceMappingURL=auth.js.map