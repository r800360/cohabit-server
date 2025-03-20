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
exports.listDeletedHabits = exports.markHabitMissed = exports.markHabitComplete = exports.fetchHabitStreaks = exports.deleteHabit = exports.updateHabit = exports.createHabit = exports.getHabitById = exports.getAllHabits = void 0;
const firebase_1 = require("../config/firebase");
const firestore_1 = require("firebase-admin/firestore");
const auth_1 = require("../utils/auth");
const getAllHabits = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = yield (0, auth_1.requireSignedIn)(req, res);
    if (token === null)
        return;
    const { email } = req.query;
    if (!email || typeof email !== "string") {
        res.status(400).json({ error: "Email is required" });
        return;
    }
    try {
        // TODO restrict visibility
        const habitSnapshot = yield firebase_1.db.collection("habits").where("email", "==", email).get();
        if (habitSnapshot.empty) {
            res.status(404).json({ error: "No habits found for this user" });
            return;
        }
        const habits = habitSnapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
        res.status(200).json(habits);
        return;
    }
    catch (error) {
        res.status(500).json({ error: "Error retrieving habits" });
        return;
    }
});
exports.getAllHabits = getAllHabits;
const getHabitById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield (0, auth_1.requireSignedIn)(req, res);
    if (user === null)
        return;
    const { habitId } = req.params;
    if (!habitId) {
        res.status(400).json({ error: "Habit ID is required" });
        return;
    }
    try {
        const habitDoc = yield firebase_1.db.collection("habits").doc(habitId).get();
        if (!habitDoc.exists) {
            res.status(404).json({ error: "Habit not found" });
            return;
        }
        const habitData = habitDoc.data();
        res.status(200).json(Object.assign(Object.assign({ id: habitDoc.id }, habitData), { startDate: habitData === null || habitData === void 0 ? void 0 : habitData.startDate.toDate(), endDate: habitData === null || habitData === void 0 ? void 0 : habitData.endDate.toDate(), reminderTime: habitData === null || habitData === void 0 ? void 0 : habitData.reminderTime.toDate() }));
        return;
    }
    catch (error) {
        res.status(500).json({ error: "Error retrieving habit" });
        return;
    }
});
exports.getHabitById = getHabitById;
const createHabit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield (0, auth_1.requireSignedIn)(req, res);
    if (!user)
        return;
    const { firebaseId, title, description, startDate, endDate, reminderTime, reminderDays, streaks, privacy, lastModified, } = req.body;
    if (!title) {
        res.status(400).json({ error: "Title are required" });
        return;
    }
    try {
        const newHabit = {
            firebaseId: firebaseId || firebase_1.db.collection("habits").doc().id,
            email: user.email,
            title,
            description: description || "",
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            reminderTime: new Date(reminderTime),
            lastModified: new Date(lastModified),
            reminderDays: reminderDays || [],
            streaks: streaks || [],
            privacy: privacy || "Private",
        };
        yield firebase_1.db.collection("habits").doc(newHabit.firebaseId).set(newHabit);
        res.status(201).json({ success: true, habit: newHabit });
        return;
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error creating habit" });
        return;
    }
});
exports.createHabit = createHabit;
const updateHabit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield (0, auth_1.requireSignedIn)(req, res);
    if (!user)
        return;
    const { updates } = req.body;
    const { habitId } = req.params;
    if (!habitId || !updates) {
        res.status(400).json({ error: "Habit ID and updates are required" });
        return;
    }
    try {
        const habitRef = firebase_1.db.collection("habits").doc(habitId);
        const habitDoc = yield habitRef.get();
        if (!habitDoc.exists || habitDoc.get("email") !== user.email) {
            // The user should not even be aware that another user's habit exists with this ID
            res.status(404).json({ error: "Habit not found" });
            return;
        }
        yield habitRef.update(updates);
        res.status(200).json({ success: true, message: "Habit updated successfully" });
        return;
    }
    catch (error) {
        res.status(500).json({ error: "Error updating habit" });
        return;
    }
});
exports.updateHabit = updateHabit;
const deleteHabit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield (0, auth_1.requireSignedIn)(req, res);
    if (!user)
        return;
    const { habitId } = req.params;
    if (!habitId) {
        res.status(400).json({ error: "Habit ID is required" });
        return;
    }
    try {
        const habitRef = firebase_1.db.collection("habits").doc(habitId);
        const habitDoc = yield habitRef.get();
        if (!habitDoc.exists || habitDoc.get("email") !== user.email) {
            res.status(404).json({ error: "Habit not found" });
            return;
        }
        yield habitRef.delete();
        yield firebase_1.db.collection("tombstones").doc(habitId).create({ email: user.email });
        res.status(200).json({ success: true, message: "Habit deleted successfully" });
        return;
    }
    catch (error) {
        res.status(500).json({ error: "Error deleting habit" });
        return;
    }
});
exports.deleteHabit = deleteHabit;
/** Fetch habit streaks */
const fetchHabitStreaks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { habitId } = req.params;
    if (!habitId) {
        res.status(400).json({ error: "Habit ID is required" });
        return;
    }
    try {
        const habitDoc = yield firebase_1.db.collection("habits").doc(habitId).get();
        if (!habitDoc.exists) {
            res.status(404).json({ error: "Habit not found" });
            return;
        }
        const habitData = habitDoc.data();
        res.status(200).json((habitData === null || habitData === void 0 ? void 0 : habitData.streaks) || []);
        return;
    }
    catch (error) {
        res.status(500).json({ error: "Error retrieving habit streaks" });
        return;
    }
});
exports.fetchHabitStreaks = fetchHabitStreaks;
/** Mark habit as complete */
const markHabitComplete = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield (0, auth_1.requireSignedIn)(req, res);
    if (!user)
        return;
    const { id, date } = req.body;
    if (!id || !date) {
        res.status(400).json({ error: "Habit ID and date are required" });
        return;
    }
    try {
        const habitRef = firebase_1.db.collection("habits").doc(id);
        const habitDoc = yield habitRef.get();
        if (!habitDoc.exists || habitDoc.get("email") !== user.email) {
            res.status(404).json({ error: "Habit not found" });
            return;
        }
        const habitData = habitDoc.data();
        const updatedStreaks = [...((habitData === null || habitData === void 0 ? void 0 : habitData.streaks) || []), date];
        yield habitRef.update({ streaks: updatedStreaks });
        res.status(200).json({ message: "Habit marked as complete", streaks: updatedStreaks });
        return;
    }
    catch (error) {
        res.status(500).json({ error: "Error marking habit complete" });
        return;
    }
});
exports.markHabitComplete = markHabitComplete;
/** Mark habit as missed */
const markHabitMissed = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield (0, auth_1.requireSignedIn)(req, res);
    if (!user)
        return;
    const { id, date } = req.body;
    if (!id || !date) {
        res.status(400).json({ error: "Habit ID and date are required" });
        return;
    }
    try {
        const habitRef = firebase_1.db.collection("habits").doc(id);
        const habitDoc = yield habitRef.get();
        if (!habitDoc.exists || habitDoc.get("email") !== user.email) {
            res.status(404).json({ error: "Habit not found" });
            return;
        }
        const habitData = habitDoc.data();
        const updatedStreaks = ((habitData === null || habitData === void 0 ? void 0 : habitData.streaks) || []).filter((streakDate) => streakDate !== date);
        yield habitRef.update({ streaks: updatedStreaks });
        res.status(200).json({ message: "Habit marked as missed", streaks: updatedStreaks });
        return;
    }
    catch (error) {
        res.status(500).json({ error: "Error marking habit missed" });
        return;
    }
});
exports.markHabitMissed = markHabitMissed;
const listDeletedHabits = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield (0, auth_1.requireSignedIn)(req, res);
    if (!user)
        return;
    const { ids } = req.body;
    try {
        const tombstones = yield firebase_1.db.collection("tombstones")
            .where(firestore_1.FieldPath.documentId(), "in", ids)
            .where("email", "==", user.email)
            .get();
        // Response format: { [habitId: string]: number /* UNIX epoch in seconds */ }
        res.status(200).json(Object.fromEntries(tombstones.docs.map((doc) => ([doc.id, doc.createTime.seconds]))));
    }
    catch (error) {
        res.status(500).json({ error: "Error fetching tombstones from Firebase" });
    }
});
exports.listDeletedHabits = listDeletedHabits;
//# sourceMappingURL=habit.js.map