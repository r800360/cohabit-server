import { body, param } from "express-validator";

export const validateEmail = [
  body("email").isEmail().withMessage("Valid email is required"),
];

export const validateHabitId = [
  param("habitId").notEmpty().withMessage("Habit ID is required"),
];

export const validateCompletionReport = [
  param("id").notEmpty().withMessage("Habit ID is required"),
  param("date").isISO8601().withMessage("Completion/missed date is required"),
]

export const validateHabitCreation = [
  body("id").optional().isString().withMessage("Invalid habit ID"),
  body("title").notEmpty().withMessage("Title is required"),
  body("startDate").isISO8601().withMessage("Start date must be a valid date"),
  body("endDate").isISO8601().withMessage("End date must be a valid date"),
  body("reminderTime").isISO8601().withMessage("Reminder time must be a valid time"),
  body("lastModified").isISO8601().withMessage("Last modified time must be a valid time"),
  body("privacy")
    .isIn(["Private", "Friends-Only", "Public"])
    .withMessage("Invalid privacy setting"),
];

export const validateHabitUpdate = [
  param("habitId").notEmpty().withMessage("Habit ID is required"),
  body("updates").notEmpty().withMessage("Updates object is required"),
  // TODO validate body of updates to prevent storing arbitrary data
];

export const validateHabitDeletion = [
  param("habitId").notEmpty().withMessage("Habit ID is required"),
];

export const validateTombstoneQuery = [
  body("ids").isArray().withMessage("Habit IDs must be passed as an array"),
]