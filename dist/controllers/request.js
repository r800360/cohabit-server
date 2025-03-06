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
const listFriends = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userID } = req.body;
    if (!userID) {
        return res.status(400).json({ error: "User ID is required" });
    }
    try {
        const friends = [];
        const sentReqs = yield firebase_1.db.collection("requests")
            .where("senderId", "==", userID)
            .where("status", "==", "accepted")
            .get();
        sentReqs.forEach(doc => {
            friends.push(doc.data().receiverId);
        });
        const recReqs = yield firebase_1.db.collection("requests")
            .where("receiverId", "==", userID)
            .where("status", "==", "accepted")
            .get();
        recReqs.forEach(doc => {
            friends.push(doc.data().senderId);
        });
        res.status(200).json({ friends });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.listFriends = listFriends;
const removeFriend = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userID } = req.body;
    const { username } = req.params;
    if (!userID || !username) {
        return res.status(400).json({ error: "User ID and username are required" });
    }
    try {
        const friendRows = yield firebase_1.db.collection("requests")
            .where("status", "==", "accepted")
            .where("senderId", "in", [userID, username])
            .where("receiverId", "in", [userID, username])
            .get();
        if (friendRows.empty) {
            return res.status(404).json({ error: "Friendship not found" });
        }
        const batch = firebase_1.db.batch();
        friendRows.forEach(doc => batch.delete(doc.ref));
        yield batch.commit();
        res.status(200).json({ success: true, message: "Friend removed successfully" });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.removeFriend = removeFriend;
const createFriendReq = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { senderId, receiverId } = req.body;
    if (!senderId || !receiverId) {
        return res.status(400).json({ error: "Sender ID and Receiver ID are required" });
    }
    if (senderId === receiverId) {
        return res.status(400).json({ error: "Invalid request: Cannot send a friend request to yourself" });
    }
    try {
        const existingReq = yield firebase_1.db.collection("requests")
            .where("senderId", "in", [senderId, receiverId])
            .where("receiverId", "in", [senderId, receiverId])
            .get();
        if (!existingReq.empty) {
            return res.status(400).json({ error: "Friend request already exists" });
        }
        yield firebase_1.db.collection("requests").add({
            senderId,
            receiverId,
            status: "pending"
        });
        res.status(201).json({ success: true, message: "Friend request sent successfully" });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.createFriendReq = createFriendReq;
const removePending = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userID } = req.body;
    const { username } = req.params;
    if (!userID || !username) {
        return res.status(400).json({ error: "User ID and username are required" });
    }
    try {
        const friendRows = yield firebase_1.db.collection("requests")
            .where("status", "==", "pending")
            .where("senderId", "==", userID)
            .where("receiverId", "==", username)
            .get();
        if (friendRows.empty) {
            return res.status(404).json({ error: "Friend request not found" });
        }
        const batch = firebase_1.db.batch();
        friendRows.forEach(doc => batch.delete(doc.ref));
        yield batch.commit();
        res.status(200).json({ success: true, message: "Friend request removed successfully" });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.removePending = removePending;
const listPending = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userID } = req.body;
    if (!userID) {
        return res.status(400).json({ error: "User ID is required" });
    }
    try {
        const pending = [];
        const senderPending = yield firebase_1.db.collection("requests")
            .where("status", "==", "pending")
            .where("senderId", "==", userID)
            .get();
        const receiverPending = yield firebase_1.db.collection("requests")
            .where("status", "==", "pending")
            .where("receiverId", "==", userID)
            .get();
        if (senderPending.empty && receiverPending.empty) {
            return res.status(404).json({ error: "No pending requests found" });
        }
        senderPending.forEach(doc => {
            pending.push(doc.data().receiverId);
        });
        receiverPending.forEach(doc => {
            pending.push(doc.data().senderId);
        });
        res.status(200).json({ pending });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.listPending = listPending;
const acceptFriendReq = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { senderId, receiverId } = req.body;
    if (!senderId || !receiverId) {
        return res.status(400).json({ error: "Sender ID and Receiver ID are required" });
    }
    try {
        const req = yield firebase_1.db.collection("requests")
            .where("status", "==", "pending")
            .where("senderId", "==", senderId)
            .where("receiverId", "==", receiverId)
            .get();
        if (req.empty) {
            return res.status(404).json({ error: "Friend request not found" });
        }
        const docId = req.docs[0].id;
        yield firebase_1.db.collection("requests").doc(docId).update({ status: "accepted" });
        res.status(200).json({ success: true, message: "Friend request accepted" });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.acceptFriendReq = acceptFriendReq;
const rejectFriendReq = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { senderId, receiverId } = req.body;
    if (!senderId || !receiverId) {
        return res.status(400).json({ error: "Sender ID and Receiver ID are required" });
    }
    try {
        const req = yield firebase_1.db.collection("requests")
            .where("status", "==", "pending")
            .where("senderId", "==", senderId)
            .where("receiverId", "==", receiverId)
            .get();
        if (req.empty) {
            return res.status(404).json({ error: "Friend request not found" });
        }
        const docId = req.docs[0].id;
        yield firebase_1.db.collection("requests").doc(docId).update({ status: "rejected" });
        res.status(200).json({ success: true, message: "Friend request rejected" });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.rejectFriendReq = rejectFriendReq;
//# sourceMappingURL=request.js.map