import { Request, Response } from "express";
import { db } from "../config/firebase";
import { Habit } from "../models/habit";
import { requireSignedIn } from "../utils/auth";

export const getAllHabits = async (req: Request, res: Response) => {
  const token = await requireSignedIn(req, res);
  if (token === null) return;

  const { email } = req.query;

  if (!email || typeof email !== "string") {
    res.status(400).json({ error: "Email is required" });
    return;
  }

  try {
    // TODO restrict visibility
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
  const user = await requireSignedIn(req, res);
  if (user === null) return;

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
  const user = await requireSignedIn(req, res);
  if (!user) return;

  const { firebaseId, title, description, startDate, endDate, reminderTime, reminderDays, streaks, privacy } = req.body;

  if (!title) {
    res.status(400).json({ error: "Title are required" });
    return;
  }

  try {
    const newHabit: Habit = {
      firebaseId: firebaseId || db.collection("habits").doc().id,
      email: user.email,
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
  const user = await requireSignedIn(req, res);
  if (!user) return;
  const { updates } = req.body;
  const { habitId } = req.params;

  if (!habitId || !updates) {
    res.status(400).json({ error: "Habit ID and updates are required" });
    return;
  }

  try {
    const habitRef = db.collection("habits").doc(habitId);
    const habitDoc = await habitRef.get();

    if (!habitDoc.exists || habitDoc.get("email") !== user.email) {
      // The user should not even be aware that another user's habit exists with this ID
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
  const user = await requireSignedIn(req, res);
  if (!user) return;

  const { habitId } = req.params;

  if (!habitId) {
    res.status(400).json({ error: "Habit ID is required" });
    return;
  }

  try {
    const habitRef = db.collection("habits").doc(habitId);
    const habitDoc = await habitRef.get();

    if (!habitDoc.exists || habitDoc.get("email") !== user.email) {
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

/** Fetch habit streaks */
export const fetchHabitStreaks = async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) {
        res.status(400).json({ error: "Habit ID is required" });
        return;
    }
  
    try {
      const habitDoc = await db.collection("habits").doc(id).get();
      if (!habitDoc.exists) {
        res.status(404).json({ error: "Habit not found" });
        return;
      } 
  
      const habitData = habitDoc.data();
      res.status(200).json(habitData?.streaks || []);
      return;
    } catch (error) {
      res.status(500).json({ error: "Error retrieving habit streaks" });
      return;
    }
  };
  
  /** Mark habit as complete */
  export const markHabitComplete = async (req: Request, res: Response) => {
    const user = await requireSignedIn(req, res);
    if (!user) return;

    const { id, date } = req.body;
    if (!id || !date) {
        res.status(400).json({ error: "Habit ID and date are required" });
        return;
    } 

    try {
      const habitRef = db.collection("habits").doc(id);
      const habitDoc = await habitRef.get();

      if (!habitDoc.exists || habitDoc.get("email") !== user.email) {
        res.status(404).json({ error: "Habit not found" });
        return;
      }

      const habitData = habitDoc.data();
      const updatedStreaks = [...(habitData?.streaks || []), date];
  
      await habitRef.update({ streaks: updatedStreaks });
      res.status(200).json({ message: "Habit marked as complete", streaks: updatedStreaks });
      return;
    } catch (error) {
      res.status(500).json({ error: "Error marking habit complete" });
      return;
    }
  };
  
  /** Mark habit as missed */
  export const markHabitMissed = async (req: Request, res: Response) => {
    const user = await requireSignedIn(req, res);
    if (!user) return;

    const { id, date } = req.body;
    if (!id || !date) {
        res.status(400).json({ error: "Habit ID and date are required" });
        return;
    } 
  
    try {
      const habitRef = db.collection("habits").doc(id);
      const habitDoc = await habitRef.get();
  
      if (!habitDoc.exists || habitDoc.get("email") !== user.email) {
        res.status(404).json({ error: "Habit not found" });
        return;
      }
  
      const habitData = habitDoc.data();
      const updatedStreaks = (habitData?.streaks || []).filter((streakDate: string | FirebaseFirestore.Timestamp) => streakDate !== date);
  
      await habitRef.update({ streaks: updatedStreaks });
      res.status(200).json({ message: "Habit marked as missed", streaks: updatedStreaks });
      return;
    } catch (error) {
      res.status(500).json({ error: "Error marking habit missed" });
      return;
    }
  };
  