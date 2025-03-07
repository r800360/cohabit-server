import express from "express";

import * as UserController from "../controllers/user";
import * as UserValidator from "../validators/user";


const router = express.Router();

router.post("/check", UserController.checkUserExists);
router.post("/signup", UserController.createUser);
router.get("/test-db", UserController.debugRoute);

router.get("/", UserController.getAllUsers);
router.post("/", UserValidator.validateUserCreation, UserController.createUser);
router.put("/", UserController.updateUser);
router.delete("/", UserValidator.validateEmail, UserController.deleteUser);
router.post("/check", UserValidator.validateEmail, UserController.checkUserExists);
router.post("/getHabits", UserValidator.validateEmail, UserController.getHabits);
router.delete("/email", UserValidator.validateEmail, UserController.deleteUserByEmail);
  

export default router;