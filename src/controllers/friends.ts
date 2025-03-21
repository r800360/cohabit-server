import { Request, Response } from "express";
import { db } from "../config/firebase";
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import { requireSignedIn } from "../utils/auth";

async function getUserIdFromToken(token: DecodedIdToken & { email: string }): Promise<string> {
  return token.email.split("@")[0];
}

/** Get the list of friends for a user */
export const fetchFriends = async (req: Request, res: Response) => {
  const user = await requireSignedIn(req, res);
  if (!user) return;
  const userId = await getUserIdFromToken(user);

  try {
    const friends: string[] = [];

    const friendSnapshot = await db.collection("friends")
      .where("users", "array-contains", userId)
      .get();

    friendSnapshot.forEach(doc => {
      const users = doc.data().users;
      const friendId = users.find((id: string) => id !== userId);
      if (friendId) friends.push(friendId);
    });

    res.status(200).json({ friends });
    return;
  } catch (error) {
    res.status(500).json({ error: "Error retrieving friends" });
    return;
  }
};

/** Remove a friend */
export const removeFriend = async (req: Request, res: Response) => {
  const user = await requireSignedIn(req, res);
  if (!user) return;
  const userId = await getUserIdFromToken(user);

  const { username } = req.params;

  if (!userId || !username) {
    res.status(400).json({ error: "User ID and username are required" });
    return;
  }

  try {
    const friendSnapshot = await db.collection("friends")
      .where("users", "array-contains", userId)
      .get();

    const friendDoc = friendSnapshot.docs.find(doc => doc.data().users.includes(username));

    if (!friendDoc) {
      res.status(404).json({ error: "Friendship not found" });
      return;
    }

    await friendDoc.ref.delete();

    res.status(200).json({ message: "Friend removed successfully" });
    return;
  } catch (error) {
    res.status(500).json({ error: "Error removing friend" });
    return;
  }
};

/** Create a friend request */
export const createFriendRequest = async (req: Request, res: Response) => {
  const user = await requireSignedIn(req, res);
  if (!user) return;
  const senderId = await getUserIdFromToken(user);

  const { receiverId } = req.body;

  if (!senderId || !receiverId) {
    res.status(400).json({ error: "Sender ID and Receiver ID are required" });
    return;
  }

  if (senderId === receiverId) {
    res.status(400).json({ error: "Cannot send a friend request to yourself" });
    return;
  }

  try {
    const existingReq = await db.collection("friendRequests")
      .where("senderId", "==", senderId)
      .where("receiverId", "==", receiverId)
      .get();

    if (!existingReq.empty) {
      res.status(400).json({ error: "Friend request already exists" });
      return;
    }

    await db.collection("friendRequests").add({
      senderId,
      receiverId,
      status: "pending"
    });

    res.status(201).json({ message: "Friend request sent" });
    return;
  } catch (error) {
    res.status(500).json({ error: "Error sending friend request" });
    return;
  }
};

export const queryFriendRequest = async (req: Request, res: Response) => {
  const user = await requireSignedIn(req, res);
  if (!user) return;
  const senderId = await getUserIdFromToken(user);

  const { username: receiverId } = req.params;

  if (!senderId || !receiverId) {
    res.status(400).json({ error: "Sender ID and Receiver ID are required" });
    return;
  }

  try {
    const existingReq = await db.collection("friendRequests")
      .where("senderId", "==", senderId)
      .where("receiverId", "==", receiverId)
      .get();

    if (!existingReq.empty) {
      res.status(200).json(existingReq.docs[0].data());
    } else {
      res.status(404).json({ error: "No such friend request found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error querying friend request" });
    return;
  }
}

/** Remove a pending friend request */
export const removePending = async (req: Request, res: Response) => {
  const user = await requireSignedIn(req, res);
  if (!user) return;
  const userId = await getUserIdFromToken(user);

  const { username } = req.params;
  if (!userId || !username) {
    res.status(400).json({ error: "User ID and username are required" });
    return;
  }

  try {
    const requestSnapshot = await db.collection("friendRequests")
      .where("senderId", "==", userId)
      .where("receiverId", "==", username)
      .where("status", "==", "pending")
      .get();

    if (requestSnapshot.empty) {
      res.status(404).json({ error: "Pending request not found" });
      return;
    }

    const batch = db.batch();
    requestSnapshot.forEach(doc => batch.delete(doc.ref));
    await batch.commit();

    res.status(200).json({ message: "Friend request removed" });
    return;
  } catch (error) {
    res.status(500).json({ error: "Error removing friend request" });
    return;
  }
};

/** List pending friend requests */
export const fetchPending = async (req: Request, res: Response) => {
  const user = await requireSignedIn(req, res);
  if (!user) return;
  const userId = await getUserIdFromToken(user);

  try {
    const pending: string[] = [];

    const pendingSnapshot = await db.collection("friendRequests")
      .where("receiverId", "==", userId)
      .where("status", "==", "pending")
      .get();

    pendingSnapshot.forEach(doc => {
      pending.push(doc.data().senderId);
    });

    res.status(200).json({ pending });
    return;
  } catch (error) {
    res.status(500).json({ error: "Error retrieving pending requests" });
    return;
  }
};

/** Accept a friend request */
export const acceptFriendRequest = async (req: Request, res: Response) => {
  const user = await requireSignedIn(req, res);
  if (!user) return;
  
  const receiverId = await getUserIdFromToken(user);
  const { senderId } = req.body;

  if (!senderId || !receiverId) {
    res.status(400).json({ error: "Sender ID and Receiver ID are required" });
    return;
  }

  try {
    const requestSnapshot = await db.collection("friendRequests")
      .where("senderId", "==", senderId)
      .where("receiverId", "==", receiverId)
      .where("status", "==", "pending")
      .get();

    if (requestSnapshot.empty) {
      res.status(404).json({ error: "Friend request not found" });
      return;
    }

    const requestDoc = requestSnapshot.docs[0];
    await requestDoc.ref.update({ status: "accepted" });

    // Fetch the user documents for both the sender and the receiver
    const senderDoc = await db.collection("users").doc(senderId).get();
    const receiverDoc = await db.collection("users").doc(receiverId).get();

    if (!senderDoc.exists || !receiverDoc.exists) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const senderData = senderDoc.data();
    const receiverData = receiverDoc.data();

    // Check if the sender is already in the receiver's friendList
    if (receiverData?.friendList && !receiverData.friendList.includes(senderId)) {
      await db.collection("users").doc(receiverId).update({
        friendList: [...receiverData.friendList, senderId],
      });
    }

    // Check if the receiver is already in the sender's friendList
    if (senderData?.friendList && !senderData.friendList.includes(receiverId)) {
      await db.collection("users").doc(senderId).update({
        friendList: [...senderData.friendList, receiverId],
      });
    }

    await db.collection("friends").add({
      users: [senderId, receiverId],
    });

    res.status(200).json({ message: "Friend request accepted and friendship added" });
    return;
  } catch (error) {
    res.status(500).json({ error: "Error accepting friend request" });
    return;
  }
};

/** Reject a friend request */
export const rejectFriendRequest = async (req: Request, res: Response) => {
  const user = await requireSignedIn(req, res);
  if (!user) return;
  const receiverId = await getUserIdFromToken(user);
  const { senderId } = req.body;

  if (!senderId || !receiverId) {
    res.status(400).json({ error: "Sender ID and Receiver ID are required" });
    return;
  }

  try {
    const requestSnapshot = await db.collection("friendRequests")
      .where("senderId", "==", senderId)
      .where("receiverId", "==", receiverId)
      .where("status", "==", "pending")
      .get();

    if (requestSnapshot.empty) {
      res.status(404).json({ error: "Friend request not found" });
      return;
    }

    const requestDoc = requestSnapshot.docs[0];
    await requestDoc.ref.update({ status: "rejected" });

    res.status(200).json({ message: "Friend request rejected" });
    return;
  } catch (error) {
    res.status(500).json({ error: "Error rejecting friend request" });
    return;
  }
};

/** Cancel a friend request */
export const cancelFriendRequest = async (req: Request, res: Response) => {
  const user = await requireSignedIn(req, res);
  if (!user) return;
  const senderId = await getUserIdFromToken(user);

  const { receiverId } = req.body;
  if (!senderId || !receiverId) {
    res.status(400).json({ error: "Sender and Receiver ID are required" });
    return;
  } 

  try {
    const requestSnapshot = await db.collection("friendRequests")
      .where("senderId", "==", senderId)
      .where("receiverId", "==", receiverId)
      .where("status", "==", "pending")
      .get();

    if (requestSnapshot.empty) {
      res.status(404).json({ error: "Friend request not found" });
      return;
    }

    const batch = db.batch();
    requestSnapshot.forEach(doc => batch.delete(doc.ref));
    await batch.commit();

    res.status(200).json({ message: "Friend request canceled" });
    return;
  } catch (error) {
    res.status(500).json({ error: "Error canceling friend request" });
    return;
  }
};
