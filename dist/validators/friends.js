"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAcceptRejectRequest = exports.validatePendingRemoval = exports.validateRemoveFriend = exports.validateFriendRequest = exports.validateUserId = void 0;
const express_validator_1 = require("express-validator");
exports.validateUserId = [
    (0, express_validator_1.body)("userId").notEmpty().withMessage("User ID is required"),
];
exports.validateFriendRequest = [
    (0, express_validator_1.body)("receiverId")
        .notEmpty()
        .withMessage("Receiver ID is required")
        .custom((value, { req }) => {
        if (value === req.body.senderId) {
            throw new Error("Cannot send a friend request to yourself");
        }
        return true;
    }),
];
exports.validateRemoveFriend = [
    (0, express_validator_1.param)("username").notEmpty().withMessage("Username is required"),
];
exports.validatePendingRemoval = [
    (0, express_validator_1.param)("username").notEmpty().withMessage("Username is required"),
];
exports.validateAcceptRejectRequest = [
    (0, express_validator_1.body)("receiverId").notEmpty().withMessage("Receiver ID is required"),
];
//# sourceMappingURL=friends.js.map