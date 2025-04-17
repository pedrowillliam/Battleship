import { Router } from "express";
import { registerUser, loginUser } from "./controllers/user.js";
import { createMatch, getAllMatches, getMatchById, updateMatchById, deleteMatchById } from "./controllers/match.js";
import { getBoard, resetBoard, addShip, attack, getGameState, startGame } from "./controllers/board.js";
import { fetchRanking } from "./controllers/ranking.js";

const router = new Router();

// User Routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Match Routes
router.post("/matches", authMiddleware, createMatch);
router.get("/matches", authMiddleware, getAllMatches);
router.get("/matches/:id", authMiddleware, getMatchById);
router.put("/matches/:id", authMiddleware, updateMatchById);
router.delete("/matches/:id", authMiddleware, deleteMatchById);


// Board Routes
router.get("/board", getBoard);
router.post("/board/reset", resetBoard);
router.post("/board/add-ship", addShip);

// Game
router.post("/game/attack", attack);
router.post("/game/start", startGame);
router.get("/game/state", getGameState);
router.get("/ranking", fetchRanking);

export default router;
