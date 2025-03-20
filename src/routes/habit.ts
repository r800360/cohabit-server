import express from "express";
import * as HabitController from "../controllers/habit";
import * as HabitValidator from "../validators/habit";

const router = express.Router();

// Fetching habits
router.get("/", HabitValidator.validateEmail, HabitController.getAllHabits);
router.get("/:habitId", HabitValidator.validateHabitId, HabitController.getHabitById);
router.get("/:habitId/streaks", HabitValidator.validateHabitId, HabitController.fetchHabitStreaks);

// Habit operations
router.post("/", HabitValidator.validateHabitCreation, HabitController.createHabit);
router.patch("/:habitId", HabitValidator.validateHabitUpdate, HabitController.updateHabit);
router.delete("/:habitId", HabitValidator.validateHabitDeletion, HabitController.deleteHabit);
router.post("/deleted", HabitValidator.validateTombstoneQuery, HabitController.listDeletedHabits);

// Habit completion tracking
router.post("/complete", HabitValidator.validateCompletionReport, HabitController.markHabitComplete);
router.post("/missed", HabitValidator.validateCompletionReport, HabitController.markHabitMissed);


export default router;
