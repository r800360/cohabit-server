import express from "express";
import * as RequestController from "../controllers/request";
import * as RequestValidator from "../validators/request";

const router = express.Router();

router.get("/", RequestValidator.validateUserId, RequestController.listFriends);
router.delete("/:username", RequestValidator.validateRemoveFriend, RequestController.removeFriend);
router.post("/request", RequestValidator.validateFriendRequest, RequestController.createFriendReq);
router.delete("/request/:username", RequestValidator.validatePendingRemoval, RequestController.removePending);
router.get("/pending", RequestValidator.validateUserId, RequestController.listPending);
router.post("/accept", RequestValidator.validateAcceptRejectRequest, RequestController.acceptFriendReq);
router.post("/reject", RequestValidator.validateAcceptRejectRequest, RequestController.rejectFriendReq);

export default router;
