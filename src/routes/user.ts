import express from "express";

import * as UserController from "../controllers/user";

const router = express.Router();

router.post("/check", UserController.checkUserExists);
router.post("/signup", UserController.createUser);

router.get("/test-db", UserController.debugRoute);
  

export default router;