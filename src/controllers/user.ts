import { Request, Response } from "express";
import { db, auth } from "../config/firebase";
import { requireSignedIn } from "../utils/auth";
import { DocumentData, FieldPath } from "firebase-admin/firestore";

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

export const fetchUserByEmail = async (req: Request, res: Response) => {
  if (!await requireSignedIn(req, res)) return;

  const { email } = req.params;
  try {
    const snapshot = await db.collection("users").where("email", "==", email).get();
    if (snapshot.empty) {
      res.status(404).json({ error: "User not found" });
      return;
    } 

    const user = await buildUserProfile(snapshot.docs[0].data(), email);
    res.status(200).json({ id: snapshot.docs[0].id, ...user });
    return;
  } catch (error) {
    res.status(500).json({ error: "Error fetching user" });
    return;
  }
};

export const fetchUserByName = async (req: Request, res: Response) => {
  if (!await requireSignedIn(req, res)) return;

  const { name } = req.params;
  try {
    const snapshot = await db.collection("users").where("name", "==", name).get();
    if (snapshot.empty) {
      res.status(404).json(null);
      return;
    } 

    const user = snapshot.docs[0].data();
    res.status(200).json({ id: snapshot.docs[0].id, ...user });
  } catch (error) {
    res.status(500).json({ error: "Error fetching user" });
  }
};

export const fetchUserById = async (req: Request, res: Response) => {
  if (!await requireSignedIn(req, res)) return;
  const { id } = req.params;
  try {
    const userDoc = await db.collection("users").doc(id).get();
    if (!userDoc.exists) {
      res.status(404).json(null);;
      return; 
    } 

    res.status(200).json({ id: userDoc.id, ...userDoc.data() });
  } catch (error) {
    res.status(500).json({ error: "Error fetching user" });
  }
};

export const checkUserExists = async (req: Request, res: Response) => {
  if (!await requireSignedIn(req, res)) return;
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
    let { name, email } = req.body;
    if (!email.endsWith("@ucsd.edu")) {
      res.status(403).json({ message: "Only UCSD emails allowed" });
      return;
    }

    const userDoc = db.collection("users").doc((email as string).split("@")[0]);
    await userDoc.create({
      name,
      email,
      friendList: [],
      habitList: [],
      // courseList: [],
      blockedList: [],
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
  const user = await requireSignedIn(req, res);
  if (!user) return;

  const { updates } = req.body;

  if (!updates) {
    res.status(400).json({ message: "Email and updates are required" });
    return;
  }

  try {
    const userSnapshot = await db.collection("users").where("email", "==", user.email).get();

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
    console.error("Error updating user:", error);
    return;
  }
};

export const deleteUserByEmail = async (req: Request, res: Response) => {
  const user = await requireSignedIn(req, res);
  if (!user) return;

  try {
    const userSnapshot = await db.collection("users").where("email", "==", user.email).get();
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
    console.error("Error deleting user:", error);
    return;
  }
};

const buildUserProfile = async (userEntry: DocumentData, email: string) => {
  const habitDocs = await db.collection("habits")
    .where("email", "==", email)
    .select(FieldPath.documentId())
    .get();
  const habitIds = habitDocs.docs.map((doc) => doc.id);
  return { ...userEntry, habitList: habitIds };
};