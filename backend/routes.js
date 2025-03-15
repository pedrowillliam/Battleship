import { Router } from "express";
import { registerUser, loginUser } from "./controllers/user.js";

const router = new Router();

// User Routes
router.post("/register", registerUser);
router.post("/login", loginUser);

export default router;
