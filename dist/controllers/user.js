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
exports.deleteUser = exports.createUser = exports.checkUserExists = void 0;
const firebase_1 = require("../config/firebase");
const checkUserExists = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const { firebaseId, name, email } = req.body;
        if (!email.endsWith("@ucsd.edu")) {
            res.status(403).json({ message: "Only UCSD emails allowed" });
            return;
        }
        const userDoc = firebase_1.db.collection("users").doc(firebaseId);
        yield userDoc.set({
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
    }
    catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ error: "Internal server error create user" });
    }
});
exports.createUser = createUser;
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { firebaseId } = req.body;
    if (!firebaseId) {
        return res.status(400).json({ message: "User ID is required" });
    }
    try {
        // Delete from Firestore
        yield firebase_1.db.collection("users").doc(firebaseId).delete();
        // Delete from Firebase Authentication
        yield firebase_1.auth.deleteUser(firebaseId);
        return res.status(200).json({ message: "User deleted successfully" });
    }
    catch (error) {
        return res.status(500).json({ error: "Error in deleting user!" });
    }
});
exports.deleteUser = deleteUser;
//# sourceMappingURL=user.js.map