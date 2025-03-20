import express from "express";

import * as UserController from "../controllers/user";
import * as UserValidator from "../validators/user";

const router = express.Router();

// Fetch user by email, name, or ID
router.get("/email/:email", UserController.fetchUserByEmail);
router.get("/name/:name", UserController.fetchUserByName);
router.get("/:id", UserController.fetchUserById);

// Fetch user profile and all details about habits (visible, friends-only)
router.get("/profile/name/:name", UserController.fetchProfileByName);
router.get("/profile/email/:email", UserController.fetchProfileByEmail);
router.get("/profile/:id", UserController.fetchProfileById);

// User operations
router.get("/", UserController.getAllUsers);
router.post("/", UserController.createUser);
router.post("/signup", UserController.createUser);
router.patch("/", UserController.updateUser);
router.delete("/", UserController.deleteUserByEmail);

// Debugging
// TODO restrict access to debugging operations
router.get("/test-db", UserController.debugRoute);
router.post("/check", UserValidator.validateEmail, UserController.checkUserExists);
router.delete("/email", UserValidator.validateEmail, UserController.deleteUserByEmail);

export default router;