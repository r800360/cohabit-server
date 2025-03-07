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
exports.createHabit = exports.habitInfo = void 0;
const firebase_1 = require("../config/firebase");
const firebase_admin_1 = require("firebase-admin");
const habitInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.body;
    try {
        const habitRef = firebase_1.db.collection("habits").where("firebaseId", "==", id);
        const snapshot = yield habitRef.get();
        if (!snapshot.empty) {
            const habitDoc = snapshot.docs[0];
            const habitData = habitDoc.data();
            const habit = Object.assign(Object.assign({}, habitData), { startDate: habitData.startDate.toDate(), endDate: habitData.endDate.toDate(), reminderTime: habitData.reminderTime.toDate() });
            res.status(200).json({ exists: true, habit });
            return;
        }
        else {
            res.status(404).json({ exists: false });
            return;
        }
    }
    catch (error) {
        res.status(500).json({ error: "Internal server error describe habit" });
        return;
    }
});
exports.habitInfo = habitInfo;
const createHabit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, title, description, startDate, endDate, reminderTime, reminderDays, streaks, privacy } = req.body;
    if (!email || !title) {
        res.status(400).json({ error: "Email and title are required" });
        return;
    }
    try {
        const userRef = firebase_1.db.collection("users").where("email", "==", email);
        const userSnapshot = yield userRef.get();
        if (userSnapshot.empty) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        const userDoc = userSnapshot.docs[0];
        const userData = userDoc.data();
        const firebaseId = userData.firebaseId;
        const newHabit = {
            firebaseId: firebase_1.db.collection("habits").doc().id,
            title,
            description,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            reminderTime: new Date(reminderTime),
            reminderDays,
            streaks,
            privacy,
        };
        const userDocRef = firebase_1.db.collection("users").doc(firebaseId);
        yield userDocRef.update({
            habitList: firebase_admin_1.firestore.FieldValue.arrayUnion(newHabit),
        });
        res.status(201).json({ success: true, habit: newHabit });
        return;
    }
    catch (error) {
        res.status(500).json({ error: "Internal server error creating habit" });
        return;
    }
});
exports.createHabit = createHabit;
//# sourceMappingURL=habit.js.map