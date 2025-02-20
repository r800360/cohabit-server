import { Request, Response } from "express";
import { db, auth } from "../config/firebase";

export const checkUserExists = async (req: Request, res: Response) => {
  const { email } = req.body;
  const userRef = db.collection("users").where("email", "==", email);
  const snapshot = await userRef.get();

  if (!snapshot.empty) {
    res.status(200).json({ exists: true });
    return;
  } else {
    res.status(404).json({ exists: false });
    return;
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { firebaseId, name, email } = req.body;
    if (!email.endsWith("@ucsd.edu")) {
      res.status(403).json({ message: "Only UCSD emails allowed" });
      return;
    }

    const userDoc = db.collection("users").doc(firebaseId);
    await userDoc.set({
      firebaseId,
      name,
      email,
      friendList: [],
      habitList: [],
      courseList: [],
      blockedList: [],
      focusGroups: [],
    });

    res.status(201).json({ message: "User created successfully" });
    return;
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Internal server error create user" });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  const { firebaseId } = req.body;

  if (!firebaseId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    // Delete from Firestore
    await db.collection("users").doc(firebaseId).delete();

    // Delete from Firebase Authentication
    await auth.deleteUser(firebaseId);

    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Error in deleting user!" });
  }
};
