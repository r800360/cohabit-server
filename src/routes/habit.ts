import express from "express";
import * as HabitController from "../controllers/habit";
import * as HabitValidator from "../validators/habit";

const router = express.Router();

router.get("/", HabitValidator.validateEmail, HabitController.getAllHabits);
router.get("/:habitId", HabitValidator.validateHabitId, HabitController.getHabitById);
router.post("/", HabitValidator.validateHabitCreation, HabitController.createHabit);
router.put("/", HabitValidator.validateHabitUpdate, HabitController.updateHabit);
router.delete("/", HabitValidator.validateHabitDeletion, HabitController.deleteHabit);

export default router;
