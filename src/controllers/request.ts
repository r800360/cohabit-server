import { Request, Response } from "express";
import { db } from "../config/firebase";

export const listFriends = async (req: Request, res: Response) => {

    const { userID } = req.body;

    if (!userID) {
        return res.status(400).json({ error: "User ID is required"});
    }

    try {
        const friends: string[] = [];

        const sentReqs = await db.collection("requests")
        .where("senderId", "==", userID)
        .where("status", "==", "accepted")
        .get();

        sentReqs.forEach(doc => {
            friends.push(doc.data().receiverId);
        });

        const recReqs = await db.collection("requests")
        .where("receiverId", "==", userID)
        .where("status", "==", "accepted")
        .get();

        recReqs.forEach(doc => {
            friends.push(doc.data().senderId);
        });

        res.status(200).json({ friends });

    } catch (error) {

        res.status(500).json({ error: error.message});

    }

};


export const removeFriend = async (req: Request, res: Response) => {

    const { userID } = req.body;
    const { username } = req.params;

    if (!userID || !username) {
        return res.status(400).json({ error: "User ID and username are required"});
    }

    try {
        const friendRows = await db.collection("requests")
        .where("status", "==", "accepted")
        .where("senderId", "in", [userID, username])
        .where("receiverId", "in", [userID, username])
        .get();

        if (friendRows.empty) {
            return res.status(404).json({ error: "Friendship not found" });
        }

        const batch = db.batch();
        friendRows.forEach(doc => batch.delete(doc.ref));
        await batch.commit();

        res.status(200).json({ success: true, message: "Friend removed successfully" });

    } catch (error) {

        res.status(500).json({ error: error.message});

    }

};


export const createFriendReq = async (req: Request, res: Response) => {

    const { senderId, receiverId } = req.body;

    if (!senderId || !receiverId) {
        return res.status(400).json({ error: "Sender ID and Receiver ID are required" });
    }

    if (senderId === receiverId) {
        return res.status(400).json({ error: "Invalid request: Cannot send a friend request to yourself" })
    }

    try {
        const existingReq = await db.collection("requests")
        .where("senderId", "in", [senderId, receiverId])
        .where("receiverId", "in", [senderId, receiverId])
        .get();

        if (!existingReq.empty) {
            return res.status(400).json({ error: "Friend request already exists" });
        }

        await db.collection("requests").add({
            senderId,
            receiverId,
            status: "pending"
        });

        res.status(201).json({ success: true, message: "Friend request sent successfully" });

    } catch (error) {

        res.status(500).json({ error: error.message});

    }

};


export const removePending = async (req: Request, res: Response) => {

    const { userID } = req.body;
    const { username } = req.params;

    if (!userID || !username) {
        return res.status(400).json({ error: "User ID and username are required"});
    }

    try {
        const friendRows = await db.collection("requests")
        .where("status", "==", "pending")
        .where("senderId", "==", userID)
        .where("receiverId", "==", username)
        .get();

        if (friendRows.empty) {
            return res.status(404).json({ error: "Friend request not found" });
        }

        const batch = db.batch();
        friendRows.forEach(doc => batch.delete(doc.ref));
        await batch.commit();

        res.status(200).json({ success: true, message: "Friend request removed successfully" });

    } catch (error) {

        res.status(500).json({ error: error.message});

    }

};


export const listPending = async (req: Request, res: Response) => {

    const { userID } = req.body;

    if (!userID) {
        return res.status(400).json({ error: "User ID is required"});
    }

    try {
        const pending: string[] = [];

        const senderPending = await db.collection("requests")
        .where("status", "==", "pending")
        .where("senderId", "==", userID)
        .get();

        const receiverPending = await db.collection("requests")
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

    } catch (error) {

        res.status(500).json({ error: error.message});

    }

};


export const acceptFriendReq = async (req: Request, res: Response) => {

    const { senderId, receiverId } = req.body;

    if (!senderId || !receiverId) {
        return res.status(400).json({ error: "Sender ID and Receiver ID are required" });
    }

    try {
        const req = await db.collection("requests")
        .where("status", "==", "pending")
        .where("senderId", "==", senderId)
        .where("receiverId", "==", receiverId)
        .get();

        if (req.empty) {
            return res.status(404).json({ error: "Friend request not found" });
        }

        const docId = req.docs[0].id;
        await db.collection("requests").doc(docId).update({ status: "accepted" });

        res.status(200).json({ success: true, message: "Friend request accepted" });

    } catch (error) {

        res.status(500).json({ error: error.message});

    }

};


export const rejectFriendReq = async (req: Request, res: Response) => {

    const { senderId, receiverId } = req.body;

    if (!senderId || !receiverId) {
        return res.status(400).json({ error: "Sender ID and Receiver ID are required" });
    }

    try {
        const req = await db.collection("requests")
        .where("status", "==", "pending")
        .where("senderId", "==", senderId)
        .where("receiverId", "==", receiverId)
        .get();

        if (req.empty) {
            return res.status(404).json({ error: "Friend request not found" });
        }

        const docId = req.docs[0].id;
        await db.collection("requests").doc(docId).update({ status: "rejected" });

        res.status(200).json({ success: true, message: "Friend request rejected" });

    } catch (error) {

        res.status(500).json({ error: error.message});

    }

};
