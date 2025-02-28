import express from "express";
import { initiateGoogleAuth, handleOAuthCallback, validateGoogleAuthToken } from "../controllers/auth";

const router = express.Router();

router.get("/auth/google", initiateGoogleAuth);
router.get("/auth/callback", handleOAuthCallback);
router.post("/auth/google", validateGoogleAuthToken);

export default router;
