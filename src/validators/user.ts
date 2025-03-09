import { body } from "express-validator";

export const validateUserId = [
  body("userId").notEmpty().withMessage("User ID is required"),
];

export const validateUserCreation = [
  body("name").notEmpty().withMessage("Name is required"),
  body("email")
    .isEmail()
    .withMessage("Invalid email format")
    .matches(/@ucsd\.edu$/)
    .withMessage("Only UCSD emails allowed"),
];

export const validateEmail = [
  body("email").isEmail().withMessage("Invalid email format"),
];
