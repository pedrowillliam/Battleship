import { Router } from "express";
import { registerUser, loginUser } from "./controllers/user.js";
import { createMatch, getAllMatches, getMatchById, updateMatchById, deleteMatchById } from "./controllers/match.js";
import { getBoard, resetBoard, addShip, attack, getGameState, startGame } from "./controllers/board.js";
import { fetchRanking } from "./controllers/ranking.js";
import { playerAttack, botAttack, getTurn } from "./controllers/gameTurn.js";

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

// Board Routes
router.get("/board", getBoard);
router.post("/board/reset", resetBoard);
router.post("/board/add-ship", addShip);

// Game
router.post("/game/attack", attack);
router.post("/game/start", startGame);
router.get("/game/state", getGameState);
router.get("/ranking", fetchRanking);

// Game Turn Routes 👇
router.post("/game/player-attack", playerAttack);
router.get("/game/bot-attack", botAttack);
router.get("/game/turn", getTurn);

export default router;
