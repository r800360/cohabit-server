import { Request, Response } from "express";
import { db, auth } from "../config/firebase";
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import { requireSignedIn } from "../utils/auth";
import { DocumentData, FieldPath } from "firebase-admin/firestore";

async function getUserIdFromToken(token: DecodedIdToken & { email: string }): Promise<string> {
  return token.email.split("@")[0];
}

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

export const fetchProfileByEmail = async (req: Request, res: Response) => {
  const requester = await requireSignedIn(req, res);
  if (!requester) return;

  const requesterId = await getUserIdFromToken(requester); // Fetch the requester’s ID from the token

  const { email } = req.params;
  try {
    // Fetch the target user by email
    const snapshot = await db.collection("users").where("email", "==", email).get();
    if (snapshot.empty) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const targetUser = snapshot.docs[0].data();
    const targetUserId = snapshot.docs[0].id;
    const friendCount = targetUser.friendList.length || 0;

    const isFriend = targetUser.friendList.includes(requesterId);

    const habitSnapshot = await db.collection("habits")
      .where("email", "==", targetUser.email)
      .where("privacy", "in", isFriend ? ["Public", "Friends-Only"] : ["Public"])
      .get();

    const visibleHabits = habitSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json({
      id: targetUserId,
      name: targetUser.name,
      email: targetUser.email,
      friendCount: friendCount,
      visibleHabits: visibleHabits,
    });
  } catch (error) {
    res.status(500).json({ error: "Error fetching user profile" });
    console.error("Error fetching profile by email:", error);
  }
};


export const fetchProfileByName = async (req: Request, res: Response) => {
  const requester = await requireSignedIn(req, res);
  if (!requester) return;

  const requesterId = await getUserIdFromToken(requester); // Fetch the requester’s ID from the token

  const { name } = req.params;
  try {
    // Fetch the target user by name
    const snapshot = await db.collection("users").where("name", "==", name).get();
    if (snapshot.empty) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const targetUser = snapshot.docs[0].data();
    const targetUserId = snapshot.docs[0].id;

    // Get the number of friends
    const friendCount = targetUser.friendList.length || 0;

    // Check if the requester is a friend of the target user
    const isFriend = targetUser.friendList.includes(requesterId);

    // Fetch habits for the target user with correct visibility
    const habitSnapshot = await db.collection("habits")
      .where("email", "==", targetUser.email)
      .where("privacy", "in", isFriend ? ["Public", "Friends-Only"] : ["Public"])
      .get();

    const visibleHabits = habitSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Return user profile with restricted habit list
    res.status(200).json({
      id: targetUserId,
      name: targetUser.name,
      email: targetUser.email,
      friendCount: friendCount,
      visibleHabits: visibleHabits, // Only public & Friends-Only habits are returned
    });
  } catch (error) {
    res.status(500).json({ error: "Error fetching user profile" });
    console.error("Error fetching profile by name:", error);
  }
};

export const fetchProfileById = async (req: Request, res: Response) => {
  const requester = await requireSignedIn(req, res);
  if (!requester) return;

  const requesterId = await getUserIdFromToken(requester); // Fetch the requester’s ID from the token

  const { id } = req.params;
  try {
    // Fetch the target user by ID
    const userDoc = await db.collection("users").doc(id).get();
    if (!userDoc.exists) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const targetUser = userDoc.data();
    const friendCount = targetUser?.friendList.length || 0;

    const isFriend = targetUser?.friendList.includes(requesterId);

    const habitSnapshot = await db.collection("habits")
      .where("email", "==", targetUser?.email)
      .where("privacy", "in", isFriend ? ["Public", "Friends-Only"] : ["Public"])
      .get();

    const visibleHabits = habitSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json({
      id: userDoc.id,
      name: targetUser?.name,
      email: targetUser?.email,
      friendCount: friendCount,
      visibleHabits: visibleHabits,
    });
  } catch (error) {
    res.status(500).json({ error: "Error fetching user profile" });
    console.error("Error fetching profile by ID:", error);
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
    // The following function requires account creation through Firebase first
    const user = await requireSignedIn(req, res);

    if (!user.email.endsWith("@ucsd.edu")) {
      res.status(403).json({ message: "Only UCSD emails allowed" });
      return;
    }

    const userDoc = db.collection("users").doc((user.email as string).split("@")[0]);
    await userDoc.set({
      name: userDoc.id, // Placeholder
      email: user.email,
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
    await userDoc.ref.delete();
    

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