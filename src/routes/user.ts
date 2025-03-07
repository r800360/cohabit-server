import express from "express";

import * as UserController from "../controllers/user";
import * as UserValidator from "../validators/user";

const router = express.Router();

// Fetch user by email, name, or ID
router.get("/email/:email", UserController.fetchUserByEmail);
router.get("/name/:name", UserController.fetchUserByName);
router.get("/:id", UserController.fetchUserById);

// User operations
router.get("/", UserController.getAllUsers);
router.post("/", UserValidator.validateUserCreation, UserController.createUser);
router.post("/signup", UserController.createUser);
router.put("/", UserController.updateUser);
router.delete("/", UserValidator.validateEmail, UserController.deleteUser);
router.delete("/email/:email", UserValidator.validateEmail, UserController.deleteUserByEmail);

// Habits related to user
router.get("/:id/habits", UserValidator.validateUserId, UserController.getHabits);
router.post("/getHabits", UserValidator.validateEmail, UserController.getHabits);

// Debugging
router.get("/test-db", UserController.debugRoute);
router.post("/check", UserValidator.validateEmail, UserController.checkUserExists);
router.delete("/email", UserValidator.validateEmail, UserController.deleteUserByEmail);
  

export default router;