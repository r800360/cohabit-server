import express from "express";
import { checkUserExists, createUser } from "../controllers/user";

const router = express.Router();

router.post("/check", checkUserExists);
router.post("/signup", createUser);

export default router;