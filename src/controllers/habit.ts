import { Request, Response } from "express";
import { db, auth } from "../config/firebase";
import { firestore } from 'firebase-admin';

export const habitInfo = async (req: Request, res: Response) => {

    const { id } = req.body;

    try {
        const habitRef = db.collection("habits").where("firebaseId", "==", id);
        const snapshot = await habitRef.get();

        if (!snapshot.empty) {
            const habitDoc = snapshot.docs[0];
            const habitData = habitDoc.data();

            const habit = {
                ...habitData,
                startDate: habitData.startDate.toDate(),
                endDate: habitData.endDate.toDate(),
                reminderTime: habitData.reminderTime.toDate(),
            };

            res.status(200).json({ exists: true, habit });
            return;
        } else {
            res.status(404).json({ exists: false });
            return;
        }
    } catch (error) {
        res.status(500).json({ error: "Internal server error describe habit" });
        return;
    }
};


export const createHabit = async (req: Request, res: Response) => {

    const { email, title, description, startDate, endDate, reminderTime, reminderDays, streaks, privacy } = req.body;

    if (!email || !title) {
        res.status(400).json({ error: "Email and title are required" });
        return;
    }

    try {

        const userRef = db.collection("users").where("email", "==", email);
        const userSnapshot = await userRef.get();

        if (userSnapshot.empty) {
            res.status(404).json({ error: "User not found" });
            return;
        }

        const userDoc = userSnapshot.docs[0];
        const userData = userDoc.data();
        const firebaseId = userData.firebaseId;

        const newHabit = {
            firebaseId: db.collection("habits").doc().id,
            title,
            description,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            reminderTime: new Date(reminderTime),
            reminderDays,
            streaks,
            privacy,
        };

        const userDocRef = db.collection("users").doc(firebaseId);
        await userDocRef.update({
            habitList: firestore.FieldValue.arrayUnion(newHabit),
        })

        res.status(201).json({ success: true, habit: newHabit });
        return;

    } catch (error) {

        res.status(500).json({ error: "Internal server error creating habit" });
        return;

    }
};
