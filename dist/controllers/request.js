"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rejectFriendReq = exports.acceptFriendReq = exports.listPending = exports.removePending = exports.createFriendReq = exports.removeFriend = exports.listFriends = void 0;
const firebase_1 = require("../config/firebase");
/** Get the list of friends for a user */
const listFriends = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.body;
    if (!userId) {
        res.status(400).json({ error: "User ID is required" });
        return;
    }
    try {
        const friends = [];
        const friendSnapshot = yield firebase_1.db.collection("friends")
            .where("users", "array-contains", userId)
            .get();
        friendSnapshot.forEach(doc => {
            const users = doc.data().users;
            const friendId = users.find((id) => id !== userId);
            if (friendId)
                friends.push(friendId);
        });
        res.status(200).json({ friends });
        return;
    }
    catch (error) {
        res.status(500).json({ error: "Error retrieving friends" });
        return;
    }
});
exports.listFriends = listFriends;
/** Remove a friend */
const removeFriend = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.body;
    const { username } = req.params;
    if (!userId || !username) {
        res.status(400).json({ error: "User ID and username are required" });
        return;
    }
    try {
        const friendSnapshot = yield firebase_1.db.collection("friends")
            .where("users", "array-contains", userId)
            .get();
        const friendDoc = friendSnapshot.docs.find(doc => doc.data().users.includes(username));
        if (!friendDoc) {
            res.status(404).json({ error: "Friendship not found" });
            return;
        }
        yield friendDoc.ref.delete();
        res.status(200).json({ message: "Friend removed successfully" });
        return;
    }
    catch (error) {
        res.status(500).json({ error: "Error removing friend" });
        return;
    }
});
exports.removeFriend = removeFriend;
/** Create a friend request */
const createFriendReq = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { senderId, receiverId } = req.body;
    if (!senderId || !receiverId) {
        res.status(400).json({ error: "Sender ID and Receiver ID are required" });
        return;
    }
    if (senderId === receiverId) {
        res.status(400).json({ error: "Cannot send a friend request to yourself" });
        return;
    }
    try {
        const existingReq = yield firebase_1.db.collection("friendRequests")
            .where("senderId", "==", senderId)
            .where("receiverId", "==", receiverId)
            .get();
        if (!existingReq.empty) {
            res.status(400).json({ error: "Friend request already exists" });
            return;
        }
        yield firebase_1.db.collection("friendRequests").add({
            senderId,
            receiverId,
            status: "pending"
        });
        res.status(201).json({ message: "Friend request sent" });
        return;
    }
    catch (error) {
        res.status(500).json({ error: "Error sending friend request" });
        return;
    }
});
exports.createFriendReq = createFriendReq;
/** Remove a pending friend request */
const removePending = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.body;
    const { username } = req.params;
    if (!userId || !username) {
        res.status(400).json({ error: "User ID and username are required" });
        return;
    }
    try {
        const requestSnapshot = yield firebase_1.db.collection("friendRequests")
            .where("senderId", "==", userId)
            .where("receiverId", "==", username)
            .where("status", "==", "pending")
            .get();
        if (requestSnapshot.empty) {
            res.status(404).json({ error: "Pending request not found" });
            return;
        }
        const batch = firebase_1.db.batch();
        requestSnapshot.forEach(doc => batch.delete(doc.ref));
        yield batch.commit();
        res.status(200).json({ message: "Friend request removed" });
        return;
    }
    catch (error) {
        res.status(500).json({ error: "Error removing friend request" });
        return;
    }
});
exports.removePending = removePending;
/** List pending friend requests */
const listPending = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.body;
    if (!userId) {
        res.status(400).json({ error: "User ID is required" });
        return;
    }
    try {
        const pending = [];
        const pendingSnapshot = yield firebase_1.db.collection("friendRequests")
            .where("receiverId", "==", userId)
            .where("status", "==", "pending")
            .get();
        pendingSnapshot.forEach(doc => {
            pending.push(doc.data().senderId);
        });
        res.status(200).json({ pending });
        return;
    }
    catch (error) {
        res.status(500).json({ error: "Error retrieving pending requests" });
        return;
    }
});
exports.listPending = listPending;
/** Accept a friend request */
const acceptFriendReq = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { senderId, receiverId } = req.body;
    if (!senderId || !receiverId) {
        res.status(400).json({ error: "Sender ID and Receiver ID are required" });
        return;
    }
    try {
        const requestSnapshot = yield firebase_1.db.collection("friendRequests")
            .where("senderId", "==", senderId)
            .where("receiverId", "==", receiverId)
            .where("status", "==", "pending")
            .get();
        if (requestSnapshot.empty) {
            res.status(404).json({ error: "Friend request not found" });
            return;
        }
        const requestDoc = requestSnapshot.docs[0];
        yield requestDoc.ref.update({ status: "accepted" });
        yield firebase_1.db.collection("friends").add({
            users: [senderId, receiverId],
        });
        res.status(200).json({ message: "Friend request accepted" });
        return;
    }
    catch (error) {
        res.status(500).json({ error: "Error accepting friend request" });
        return;
    }
});
exports.acceptFriendReq = acceptFriendReq;
/** Reject a friend request */
const rejectFriendReq = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { senderId, receiverId } = req.body;
    if (!senderId || !receiverId) {
        res.status(400).json({ error: "Sender ID and Receiver ID are required" });
        return;
    }
    try {
        const requestSnapshot = yield firebase_1.db.collection("friendRequests")
            .where("senderId", "==", senderId)
            .where("receiverId", "==", receiverId)
            .where("status", "==", "pending")
            .get();
        if (requestSnapshot.empty) {
            res.status(404).json({ error: "Friend request not found" });
            return;
        }
        const requestDoc = requestSnapshot.docs[0];
        yield requestDoc.ref.update({ status: "rejected" });
        res.status(200).json({ message: "Friend request rejected" });
        return;
    }
    catch (error) {
        res.status(500).json({ error: "Error rejecting friend request" });
        return;
    }
});
exports.rejectFriendReq = rejectFriendReq;
//# sourceMappingURL=request.js.map