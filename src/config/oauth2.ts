import dotenv from "dotenv";
import { google } from "googleapis/build/src";

dotenv.config();

// OAuth 2.0 setup
export const oauth2Client = new google.auth.OAuth2(
    process.env.WEB_CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
  );
  
export const scopes = [
'https://www.googleapis.com/auth/userinfo.profile',
'https://www.googleapis.com/auth/userinfo.email',
'https://www.googleapis.com/auth/cloud-platform',
'https://www.googleapis.com/auth/datastore'
];