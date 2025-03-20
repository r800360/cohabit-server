import { body } from "express-validator";

export const validateUserId = [
  body("userId").notEmpty().withMessage("User ID is required"),
];

export const validateEmail = [
  body("email").isEmail().withMessage("Invalid email format"),
];
