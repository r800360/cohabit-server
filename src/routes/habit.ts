import express from "express";
import * as HabitController from "../controllers/habit";
import * as HabitValidator from "../validators/habit";

const router = express.Router();

// Fetching habits
router.get("/", HabitValidator.validateEmail, HabitController.getAllHabits);
router.get("/:id", HabitValidator.validateHabitId, HabitController.getHabitById);
router.get("/:id/streaks", HabitValidator.validateHabitId, HabitController.fetchHabitStreaks);

// Habit operations
router.post("/", HabitValidator.validateHabitCreation, HabitController.createHabit);
router.put("/", HabitValidator.validateHabitUpdate, HabitController.updateHabit);
router.put("/update", HabitValidator.validateHabitUpdate, HabitController.updateHabit);
router.post("/delete", HabitValidator.validateHabitDeletion, HabitController.deleteHabit);
router.delete("/", HabitValidator.validateHabitDeletion, HabitController.deleteHabit);

// Habit completion tracking
router.post("/complete", HabitValidator.validateHabitId, HabitController.markHabitComplete);
router.post("/missed", HabitValidator.validateHabitId, HabitController.markHabitMissed);


export default router;
