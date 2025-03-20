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
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireSignedIn = requireSignedIn;
const firebase_1 = require("../config/firebase");
/**
 * Retrieve and validate the ID token attached with the given request under the Authorization header.
 * If the ID token is invalid, respond to the request with an appropriate error and return `null`.
 * Otherwise, return its decoded elements.
 *
 * @param req The request in which to find the Authorization token.
 * @param res The response mechanism for the request.
 * @returns The decoded authorization token, or `null` if the token was rejected or missing (in which case the calling function should return)
 */
function requireSignedIn(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        // TODO consider caching valid tokens to reduce response time and Firebase load
        const authorization = req.headers.authorization;
        if (!/^Token [a-zA-Z-_0-9\.]+$/.test(authorization)) {
            res.status(403).json({ error: "Malformed or missing Authorization token" });
            return null;
        }
        try {
            const decoded = yield firebase_1.auth.verifyIdToken(authorization.substring(6), true);
            if (decoded.email === undefined || decoded.email === null) {
                res.status(403).json({ error: "Account missing email" });
                return null;
            }
            if (!decoded.email_verified) {
                res.status(403).json({ error: "Please verify your email first!" });
                return null;
            }
            return decoded;
        }
        catch (fail) {
            console.error(fail);
            res.status(403).json({ error: "Account invalid" });
            return null;
        }
    });
}
//# sourceMappingURL=auth.js.map