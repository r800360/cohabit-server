"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const FriendController = __importStar(require("../controllers/friends"));
const FriendValidator = __importStar(require("../validators/friends"));
const router = express_1.default.Router();
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
exports.default = router;
//# sourceMappingURL=friends.js.map