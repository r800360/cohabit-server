import { body } from "express-validator";

export const validateUserCreation = [
  body("firebaseId").notEmpty().withMessage("Firebase ID is required"),
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
