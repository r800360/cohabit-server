import express from "express";
import { initiateGoogleAuth, handleOAuthCallback, validateGoogleAuthToken } from "../controllers/auth";

const router = express.Router();

router.get("/google", initiateGoogleAuth);
router.get("/callback", handleOAuthCallback);
router.post("/google", validateGoogleAuthToken);

export default router;
