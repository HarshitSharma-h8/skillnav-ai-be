import { Router } from "express";
import auth from "../middlewares/auth.middleware.js";
import {
  getProfile,
  updateProfile,
  addSkills,
  removeSkill,
} from "../controllers/user.controller.js";

const router = Router();

router.get("/profile", auth, getProfile);
router.put("/profile", auth, updateProfile);

// optional helpers
router.post("/skills/add", auth, addSkills);
router.delete("/skills/:skill", auth, removeSkill);

export default router;