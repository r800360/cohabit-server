import { Request, Response } from "express";
import { db, auth } from "../config/firebase";

export const debugRoute = async (req: Request, res: Response) => {
  try {
    const snapshot = await db.collection("users").limit(1).get();
    res.json({ success: true, count: snapshot.size });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const usersSnapshot = await db.collection("users").get();
    const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

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
    let { firebaseId, name, email } = req.body;
    if (!email.endsWith("@ucsd.edu")) {
      res.status(403).json({ message: "Only UCSD emails allowed" });
      return;
    }

    if (!firebaseId) {
      firebaseId = db.collection("users").doc().id;
    }

    const userDoc = db.collection("users").doc(firebaseId);
    await userDoc.set({
      firebaseId,
      name,
      email,
      friendList: [],
      habitList: [],
      courseList: [],
      // blockedList: [],
      // focusGroups: [],
    });

    res.status(201).json({ message: "User created successfully" });
    return;
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Internal server error create user" });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  const { firebaseId, updates } = req.body;

  if (!firebaseId || !updates) {
    res.status(400).json({ message: "User ID and updates are required" });
    return;
  }

  try {
    const userRef = db.collection("users").doc(firebaseId);
    await userRef.update(updates);

    res.status(200).json({ message: "User updated successfully" });
    return;
  } catch (error) {
    res.status(500).json({ error: "Error updating user" });
    return;
  }
};

export const updateUserByEmail = async (req: Request, res: Response) => {
  const { email, updates } = req.body;

  if (!email || !updates) {
    res.status(400).json({ message: "Email and updates are required" });
    return;
  }

  try {
    const userSnapshot = await db.collection("users").where("email", "==", email).get();

    if (userSnapshot.empty) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const userDoc = userSnapshot.docs[0];
    await userDoc.ref.update(updates);

    res.status(200).json({ message: "User updated successfully" });
    return;
  } catch (error) {
    res.status(500).json({ error: "Error updating user" });
    return;
  }
};

export const deleteUserByEmail = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({ message: "Email is required" });
    return;
  }

  try {
    const userSnapshot = await db.collection("users").where("email", "==", email).get();
    if (userSnapshot.empty) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const userDoc = userSnapshot.docs[0];
    const firebaseId = userDoc.id;

    await userDoc.ref.delete();
    await auth.deleteUser(firebaseId);

    res.status(200).json({ message: "User deleted successfully" });
    return;
  } catch (error) {
    res.status(500).json({ error: "Error deleting user by email" });
    return;
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  const { firebaseId } = req.body;

  if (!firebaseId) {
    res.status(400).json({ message: "User ID is required" });
    return;
  }

  try {
    await db.collection("users").doc(firebaseId).delete();
    await auth.deleteUser(firebaseId);

    res.status(200).json({ message: "User deleted successfully" });
    return;
  } catch (error) {
    res.status(500).json({ error: "Error deleting user" });
    return;
  }
};


export const getHabits = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    const userSnapshot = await db.collection("users").where("email", "==", email).get();
    if (userSnapshot.empty) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const userDoc = userSnapshot.docs[0];
    const habitList = userDoc.data().habitList || [];

    res.status(200).json(habitList);
    return;
  } catch (error) {
    res.status(500).json({ error: "Error retrieving habits" });
    return;
  }
};