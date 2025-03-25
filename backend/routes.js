import { Router } from "express";
import { registerUser, loginUser } from "./controllers/user.js";
import { getBoard,resetBoard,addShip } from "./controllers/board.js";

const router = new Router();

// User Routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Board Routes
router.get("/board", getBoard); 
router.post("/board/reset", resetBoard); 
router.post("/board/add-ship", addShip); 

export default router;
