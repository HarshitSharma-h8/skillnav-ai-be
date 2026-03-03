import { Router } from "express";
import multer from "multer";
import auth from "../middlewares/auth.middleware.js";
import { analyzeResume } from "../controllers/user.controller.js"
import {
  getProfile,
  updateProfile,
  addSkills,
  removeSkill,
} from "../controllers/user.controller.js";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

router.get("/profile", auth, getProfile);
router.put("/profile", auth, updateProfile);

// optional helpers
router.post("/skills/add", auth, addSkills);
router.delete("/skills/:skill", auth, removeSkill);
router.post("/analyze-resume",upload.single("resume"),analyzeResume);

export default router;
