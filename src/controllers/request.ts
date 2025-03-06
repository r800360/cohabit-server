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
