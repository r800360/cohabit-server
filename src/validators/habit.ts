import { body, param } from "express-validator";

export const validateEmail = [
  body("email").isEmail().withMessage("Valid email is required"),
];

export const validateHabitId = [
  param("habitId").notEmpty().withMessage("Habit ID is required"),
];

export const validateHabitCreation = [
  body("id").optional().isString().withMessage("Invalid habit ID"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("title").notEmpty().withMessage("Title is required"),
  body("startDate").isISO8601().withMessage("Start date must be a valid date"),
  body("endDate").isISO8601().withMessage("End date must be a valid date"),
  body("reminderTime").isISO8601().withMessage("Reminder time must be a valid time"),
  body("privacy")
    .isIn(["Private", "Friends-Only", "Public"])
    .withMessage("Invalid privacy setting"),
];

export const validateHabitUpdate = [
  body("habitId").notEmpty().withMessage("Habit ID is required"),
  body("updates").notEmpty().withMessage("Updates object is required"),
];

export const validateHabitDeletion = [
  body("habitId").notEmpty().withMessage("Habit ID is required"),
];
