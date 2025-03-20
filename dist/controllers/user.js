"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUserByEmail = exports.updateUser = exports.createUser = exports.checkUserExists = exports.fetchUserById = exports.fetchUserByName = exports.fetchUserByEmail = exports.getAllUsers = exports.debugRoute = void 0;
const firebase_1 = require("../config/firebase");
const auth_1 = require("../utils/auth");
const firestore_1 = require("firebase-admin/firestore");
const debugRoute = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const snapshot = yield firebase_1.db.collection("users").limit(1).get();
        res.json({ success: true, count: snapshot.size });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.debugRoute = debugRoute;
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const usersSnapshot = yield firebase_1.db.collection("users").get();
        const users = usersSnapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
        res.status(200).json(users);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch users" });
    }
});
exports.getAllUsers = getAllUsers;
const fetchUserByEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!(yield (0, auth_1.requireSignedIn)(req, res)))
        return;
    const { email } = req.params;
    try {
        const snapshot = yield firebase_1.db.collection("users").where("email", "==", email).get();
        if (snapshot.empty) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        const user = yield buildUserProfile(snapshot.docs[0].data(), email);
        res.status(200).json(Object.assign({ id: snapshot.docs[0].id }, user));
        return;
    }
    catch (error) {
        res.status(500).json({ error: "Error fetching user" });
        return;
    }
});
exports.fetchUserByEmail = fetchUserByEmail;
const fetchUserByName = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!(yield (0, auth_1.requireSignedIn)(req, res)))
        return;
    const { name } = req.params;
    try {
        const snapshot = yield firebase_1.db.collection("users").where("name", "==", name).get();
        if (snapshot.empty) {
            res.status(404).json(null);
            return;
        }
        const user = snapshot.docs[0].data();
        res.status(200).json(Object.assign({ id: snapshot.docs[0].id }, user));
    }
    catch (error) {
        res.status(500).json({ error: "Error fetching user" });
    }
});
exports.fetchUserByName = fetchUserByName;
const fetchUserById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!(yield (0, auth_1.requireSignedIn)(req, res)))
        return;
    const { id } = req.params;
    try {
        const userDoc = yield firebase_1.db.collection("users").doc(id).get();
        if (!userDoc.exists) {
            res.status(404).json(null);
            ;
            return;
        }
        res.status(200).json(Object.assign({ id: userDoc.id }, userDoc.data()));
    }
    catch (error) {
        res.status(500).json({ error: "Error fetching user" });
    }
});
exports.fetchUserById = fetchUserById;
const checkUserExists = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!(yield (0, auth_1.requireSignedIn)(req, res)))
        return;
    const { email } = req.body;
    const userRef = firebase_1.db.collection("users").where("email", "==", email);
    const snapshot = yield userRef.get();
    if (!snapshot.empty) {
        res.status(200).json({ exists: true });
        return;
    }
    else {
        res.status(404).json({ exists: false });
        return;
    }
});
exports.checkUserExists = checkUserExists;
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { name, email } = req.body;
        if (!email.endsWith("@ucsd.edu")) {
            res.status(403).json({ message: "Only UCSD emails allowed" });
            return;
        }
        const userDoc = firebase_1.db.collection("users").doc(email.split("@")[0]);
        yield userDoc.create({
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
    }
    catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ error: "Internal server error create user" });
    }
});
exports.createUser = createUser;
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield (0, auth_1.requireSignedIn)(req, res);
    if (!user)
        return;
    const { updates } = req.body;
    if (!updates) {
        res.status(400).json({ message: "Email and updates are required" });
        return;
    }
    try {
        const userSnapshot = yield firebase_1.db.collection("users").where("email", "==", user.email).get();
        if (userSnapshot.empty) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        const userDoc = userSnapshot.docs[0];
        yield userDoc.ref.update(updates);
        res.status(200).json({ message: "User updated successfully" });
        return;
    }
    catch (error) {
        res.status(500).json({ error: "Error updating user" });
        console.error("Error updating user:", error);
        return;
    }
});
exports.updateUser = updateUser;
const deleteUserByEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield (0, auth_1.requireSignedIn)(req, res);
    if (!user)
        return;
    try {
        const userSnapshot = yield firebase_1.db.collection("users").where("email", "==", user.email).get();
        if (userSnapshot.empty) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        const userDoc = userSnapshot.docs[0];
        const firebaseId = userDoc.id;
        yield userDoc.ref.delete();
        yield firebase_1.auth.deleteUser(firebaseId);
        res.status(200).json({ message: "User deleted successfully" });
        return;
    }
    catch (error) {
        res.status(500).json({ error: "Error deleting user by email" });
        console.error("Error deleting user:", error);
        return;
    }
});
exports.deleteUserByEmail = deleteUserByEmail;
const buildUserProfile = (userEntry, email) => __awaiter(void 0, void 0, void 0, function* () {
    const habitDocs = yield firebase_1.db.collection("habits")
        .where("email", "==", email)
        .select(firestore_1.FieldPath.documentId())
        .get();
    const habitIds = habitDocs.docs.map((doc) => doc.id);
    return Object.assign(Object.assign({}, userEntry), { habitList: habitIds });
});
//# sourceMappingURL=user.js.map