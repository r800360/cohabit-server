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
