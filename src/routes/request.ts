import express from "express";

import * as RequestController from "../controllers/request";

const router = express.Router();

router.get("/", RequestController.listFriends);
router.delete("/:username", RequestController.removeFriend);
router.post("/request", RequestController.createFriendReq);
router.delete("/request/:username", RequestController.removePending);
router.get("/pending", RequestController.listPending);
router.post("/accept", RequestController.acceptFriendReq);
router.post("/reject", RequestController.rejectFriendReq);

// router.get("/test-db", RequestController.debugRoute);

export default router;
