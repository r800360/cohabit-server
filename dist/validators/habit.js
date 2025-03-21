"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateTombstoneQuery = exports.validateHabitDeletion = exports.validateHabitUpdate = exports.validateHabitCreation = exports.validateCompletionReport = exports.validateHabitId = exports.validateEmail = void 0;
const express_validator_1 = require("express-validator");
exports.validateEmail = [
    (0, express_validator_1.body)("email").isEmail().withMessage("Valid email is required"),
];
exports.validateHabitId = [
    (0, express_validator_1.param)("habitId").notEmpty().withMessage("Habit ID is required"),
];
exports.validateCompletionReport = [
    (0, express_validator_1.param)("id").notEmpty().withMessage("Habit ID is required"),
    (0, express_validator_1.param)("date").isISO8601().withMessage("Completion/missed date is required"),
];
exports.validateHabitCreation = [
    (0, express_validator_1.body)("id").optional().isString().withMessage("Invalid habit ID"),
    (0, express_validator_1.body)("title").notEmpty().withMessage("Title is required"),
    (0, express_validator_1.body)("startDate").isISO8601().withMessage("Start date must be a valid date"),
    (0, express_validator_1.body)("endDate").isISO8601().withMessage("End date must be a valid date"),
    (0, express_validator_1.body)("reminderTime").isISO8601().withMessage("Reminder time must be a valid time"),
    (0, express_validator_1.body)("lastModified").isISO8601().withMessage("Last modified time must be a valid time"),
    (0, express_validator_1.body)("privacy")
        .isIn(["Private", "Friends-Only", "Public"])
        .withMessage("Invalid privacy setting"),
];
exports.validateHabitUpdate = [
    (0, express_validator_1.param)("habitId").notEmpty().withMessage("Habit ID is required"),
    (0, express_validator_1.body)("updates").notEmpty().withMessage("Updates object is required"),
    // TODO validate body of updates to prevent storing arbitrary data
];
exports.validateHabitDeletion = [
    (0, express_validator_1.param)("habitId").notEmpty().withMessage("Habit ID is required"),
];
exports.validateTombstoneQuery = [
    (0, express_validator_1.body)("ids").isArray().withMessage("Habit IDs must be passed as an array"),
];
//# sourceMappingURL=habit.js.map