"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEmail = exports.validateUserCreation = void 0;
const express_validator_1 = require("express-validator");
exports.validateUserCreation = [
    (0, express_validator_1.body)("firebaseId").notEmpty().withMessage("Firebase ID is required"),
    (0, express_validator_1.body)("name").notEmpty().withMessage("Name is required"),
    (0, express_validator_1.body)("email")
        .isEmail()
        .withMessage("Invalid email format")
        .matches(/@ucsd\.edu$/)
        .withMessage("Only UCSD emails allowed"),
];
exports.validateEmail = [
    (0, express_validator_1.body)("email").isEmail().withMessage("Invalid email format"),
];
//# sourceMappingURL=user.js.map