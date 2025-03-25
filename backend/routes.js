import { Router } from "express";
import { registerUser, loginUser } from "./controllers/user.js";
import { createMatch, getAllMatches, getMatchById, updateMatchById, deleteMatchById } from "./controllers/match.js";

const router = new Router();

// User Routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Match Routes
router.post("/matches", createMatch);
router.get("/matches", getAllMatches);
router.get("/matches/:id", getMatchById);
router.put("/matches/:id", updateMatchById);
router.delete("/matches/:id", deleteMatchById);

export default router;
