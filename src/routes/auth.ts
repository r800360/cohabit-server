import express from "express";
import * as AuthController from "../controllers/auth";

const router = express.Router();

router.get("/google", AuthController.initiateGoogleAuth);
router.get("/callback", AuthController.handleOAuthCallback);
router.post("/google", AuthController.validateGoogleAuthToken);

export default router;
