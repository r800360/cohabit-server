"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scopes = exports.oauth2Client = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const src_1 = require("googleapis/build/src");
dotenv_1.default.config();
// OAuth 2.0 setup
exports.oauth2Client = new src_1.google.auth.OAuth2(process.env.WEB_CLIENT_ID, process.env.CLIENT_SECRET, process.env.REDIRECT_URI);
exports.scopes = [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/cloud-platform',
    'https://www.googleapis.com/auth/datastore'
];
//# sourceMappingURL=oauth2.js.map