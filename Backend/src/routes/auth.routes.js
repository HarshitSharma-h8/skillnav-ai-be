import { Router } from "express";
import { register, login, me, googleLogin } from "../controllers/auth.controller.js";
import auth from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", auth, me);

router.post("/google", googleLogin);

export default router;