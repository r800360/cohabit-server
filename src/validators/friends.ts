import { body, param } from "express-validator";

export const validateUserId = [
  body("userId").notEmpty().withMessage("User ID is required"),
];

export const validateFriendRequest = [
  body("senderId").notEmpty().withMessage("Sender ID is required"),
  body("receiverId")
    .notEmpty()
    .withMessage("Receiver ID is required")
    .custom((value, { req }) => {
      if (value === req.body.senderId) {
        throw new Error("Cannot send a friend request to yourself");
      }
      return true;
    }),
];

export const validateRemoveFriend = [
  body("userId").notEmpty().withMessage("User ID is required"),
  param("username").notEmpty().withMessage("Username is required"),
];

export const validatePendingRemoval = [
  body("userId").notEmpty().withMessage("User ID is required"),
  param("username").notEmpty().withMessage("Username is required"),
];

export const validateAcceptRejectRequest = [
  body("senderId").notEmpty().withMessage("Sender ID is required"),
  body("receiverId").notEmpty().withMessage("Receiver ID is required"),
];
