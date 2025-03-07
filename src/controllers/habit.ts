import { Request, Response } from "express";
import { db } from "../config/firebase";
import { firestore } from "firebase-admin";
import { Habit } from "../models/habit";

export const getAllHabits = async (req: Request, res: Response) => {
  const { email } = req.query;

  if (!email || typeof email !== "string") {
    res.status(400).json({ error: "Email is required" });
    return;
  }

  try {
    const habitSnapshot = await db.collection("habits").where("email", "==", email).get();

    if (habitSnapshot.empty) {
      res.status(404).json({ error: "No habits found for this user" });
      return;
    }

    const habits = habitSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(habits);
    return;
  } catch (error) {
    res.status(500).json({ error: "Error retrieving habits" });
    return;
  }
};

export const getHabitById = async (req: Request, res: Response) => {
  const { habitId } = req.params;

  if (!habitId) {
    res.status(400).json({ error: "Habit ID is required" });
    return;
  }

  try {
    const habitDoc = await db.collection("habits").doc(habitId).get();

    if (!habitDoc.exists) {
      res.status(404).json({ error: "Habit not found" });
      return;
    }

    const habitData = habitDoc.data();

    res.status(200).json({
      id: habitDoc.id,
      ...habitData,
      startDate: habitData?.startDate.toDate(),
      endDate: habitData?.endDate.toDate(),
      reminderTime: habitData?.reminderTime.toDate(),
    });
    return;
  } catch (error) {
    res.status(500).json({ error: "Error retrieving habit" });
    return;
  }
};

export const createHabit = async (req: Request, res: Response) => {
  const { firebaseId, email, title, description, startDate, endDate, reminderTime, reminderDays, streaks, privacy } = req.body;

  if (!email || !title) {
    res.status(400).json({ error: "Email and title are required" });
    return;
  }

  try {
    const newHabit: Habit = {
      firebaseId: firebaseId || db.collection("habits").doc().id,
      email,
      title,
      description: description || "",
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reminderTime: new Date(reminderTime),
      reminderDays: reminderDays || [],
      streaks: streaks || [],
      privacy: privacy || "Private",
    };

    await db.collection("habits").doc(newHabit.firebaseId).set(newHabit);

    res.status(201).json({ success: true, habit: newHabit });
    return;
  } catch (error) {
    res.status(500).json({ error: "Error creating habit" });
    return;
  }
};

export const updateHabit = async (req: Request, res: Response) => {
  const { habitId, updates } = req.body;

  if (!habitId || !updates) {
    res.status(400).json({ error: "Habit ID and updates are required" });
    return;
  }

  try {
    const habitRef = db.collection("habits").doc(habitId);
    const habitDoc = await habitRef.get();

    if (!habitDoc.exists) {
      res.status(404).json({ error: "Habit not found" });
      return;
    }

    await habitRef.update(updates);

    res.status(200).json({ success: true, message: "Habit updated successfully" });
    return;
  } catch (error) {
    res.status(500).json({ error: "Error updating habit" });
    return;
  }
};

export const deleteHabit = async (req: Request, res: Response) => {
  const { habitId } = req.body;

  if (!habitId) {
    res.status(400).json({ error: "Habit ID is required" });
    return;
  }

  try {
    const habitRef = db.collection("habits").doc(habitId);
    const habitDoc = await habitRef.get();

    if (!habitDoc.exists) {
      res.status(404).json({ error: "Habit not found" });
      return;
    }

    await habitRef.delete();

    res.status(200).json({ success: true, message: "Habit deleted successfully" });
    return;
  } catch (error) {
    res.status(500).json({ error: "Error deleting habit" });
    return;
  }
};
