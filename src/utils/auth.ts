import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import { auth } from "../config/firebase";
import { Request, Response } from "express";

/**
 * Retrieve and validate the ID token attached with the given request under the Authorization header.
 * If the ID token is invalid, respond to the request with an appropriate error and return `null`.
 * Otherwise, return its decoded elements.
 * 
 * @param req The request in which to find the Authorization token.
 * @param res The response mechanism for the request.
 * @returns The decoded authorization token, or `null` if the token was rejected or missing (in which case the calling function should return)
 */
export async function requireSignedIn(req: Request, res: Response): Promise<(DecodedIdToken & { email: string }) | null> {
  // TODO consider caching valid tokens to reduce response time and Firebase load
  const authorization = req.headers.authorization;
  if (!/^Token [a-zA-Z\.]+$/.test(authorization)) {
    res.status(403).json({ error: "Malformed or missing Authorization token" });
    return null;
  }
  try {
    const decoded = await auth.verifyIdToken(authorization.substring(6), true);
    if (decoded.email === undefined || decoded.email === null) {
      res.status(403).json({ error: "Account missing email" });
      return null;
    }
    if (!decoded.email_verified) {
      res.status(403).json({ error: "Please verify your email first!" });
      return null;
    }
    return decoded as DecodedIdToken & { email: string };
  } catch (fail) {
    res.status(403).json({ error: "Account invalid" });
    return null;
  }
}