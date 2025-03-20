import express from "express";
import * as FriendController from "../controllers/friends";
import * as FriendValidator from "../validators/friends";

const router = express.Router();

// Fetching friends and requests
router.get("/", FriendController.fetchFriends);
router.get("/pending", FriendController.fetchPending);

// Friend request management
router.post("/request", FriendValidator.validateFriendRequest, FriendController.createFriendRequest);
router.get("/request/:username", FriendValidator.validateFriendRequestQuery, FriendController.queryFriendRequest);
router.post("/cancel", FriendValidator.validateFriendRequest, FriendController.cancelFriendRequest);
router.post("/accept", FriendValidator.validateAcceptRejectRequest, FriendController.acceptFriendRequest);
router.post("/reject", FriendValidator.validateAcceptRejectRequest, FriendController.rejectFriendRequest);

// Removing friends
router.delete("/:username", FriendValidator.validateRemoveFriend, FriendController.removeFriend);
router.delete("/request/:username", FriendValidator.validatePendingRemoval, FriendController.removePending);
router.post("/remove", FriendValidator.validateRemoveFriend, FriendController.removeFriend);

export default router;
