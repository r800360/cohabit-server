import { Request, Response } from "express";
import { db, auth } from "../config/firebase";

export const checkUserExists = async (req: Request, res: Response) => {
  const { email } = req.body;
  const userRef = db.collection("users").where("email", "==", email);
  const snapshot = await userRef.get();

  if (!snapshot.empty) {
    return res.status(200).json({ exists: true });
  } else {
    return res.status(404).json({ exists: false });
  }
};

export const createUser = async (req: Request, res: Response) => {
  const { firebaseId, name, email } = req.body;
  if (!email.endsWith("@ucsd.edu")) {
    return res.status(403).json({ message: "Only UCSD emails allowed" });
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

  return res.status(201).json({ message: "User created successfully" });
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
    return res.status(500).json({ error: error.message });
  }
};
