"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEmail = exports.validateUserId = void 0;
const express_validator_1 = require("express-validator");
exports.validateUserId = [
    (0, express_validator_1.body)("userId").notEmpty().withMessage("User ID is required"),
];
exports.validateEmail = [
    (0, express_validator_1.body)("email").isEmail().withMessage("Invalid email format"),
];
//# sourceMappingURL=user.js.map