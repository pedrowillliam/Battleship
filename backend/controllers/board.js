import Board from "../models/board.js";
import { smartBotAttack } from "../ia/intelligentAttack.js";
import { intelligentPlacement } from "../ia/intelligentPlacement.js";

const playerBoard = new Board();
let opponentBoard = new Board();

const getBoard = (_, res) => {
    try {
        const grid = playerBoard.getGrid();
        const ships = playerBoard.getShips();

        res.status(200).json({
            message: "Tabuleiro obtido com sucesso!",
            grid,
            ships
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Erro ao obter o tabuleiro!",
            error: error.message
        });
    }
};

const resetBoard = (_, res) => {
    try {
        playerBoard.resetBoard();
        opponentBoard.resetBoard();

        res.status(200).json({
            message: "Tabuleiro resetado com sucesso!",
            grid: playerBoard.getGrid()
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Erro ao resetar o tabuleiro!",
            error: error.message
        });
    }
};

const addShip = (req, res) => {
    const { type, row, column, direction } = req.body;

    if (!type || row === undefined || column === undefined || !direction) {
        return res.status(400).json({ message: "Todos os campos (type, row, column, direction) são obrigatórios!" });
    }

    try {
        playerBoard.addShip({ type, row, column, direction });

        res.status(201).json({
            message: "Navio adicionado com sucesso!",
            grid: playerBoard.getGrid(),
            ships: playerBoard.getShips()
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({
            message: "Erro ao adicionar o navio.",
            error: error.message
        });
    }
};

function initializeOpponentBoard() {
    try {
        // Usar o posicionamento inteligente em vez do mock
        opponentBoard.resetBoard();
        const success = intelligentPlacement(opponentBoard);
        
        if (success) {
            console.log("Tabuleiro do oponente inicializado com sucesso usando IA!");
            return { success: true, message: "Tabuleiro do oponente inicializado com sucesso!" };
        } else {
            console.error("Falha ao inicializar tabuleiro do oponente com IA");
            return { success: false, message: "Falha ao inicializar tabuleiro do oponente" };
        }
    } catch (error) {
        console.error("Erro ao inicializar tabuleiro do oponente:", error);
        return { success: false, message: error.message };
    }
}

const attack = (req, res) => {
    const { row, column } = req.body;

    if (row === undefined || column === undefined) {
        return res.status(400).json({
            message: "As coordenadas do ataque (row, column) são obrigatórias!"
        });
    }

    try {
        // Jogador ataca o oponente
        const playerResult = opponentBoard.placeBomb(row, column);

        // IA ataca o jogador de forma inteligente
        const [botRow, botCol] = smartBotAttack(playerBoard);
        const botResult = playerBoard.placeBomb(botRow, botCol);

        res.status(200).json({
            playerAttack: {
                row, column,
                ...playerResult
            },
            botAttack: {
                row: botRow, column: botCol,
                ...botResult
            }
        });

    } catch (error) {
        console.error(error);
        res.status(400).json({
            message: "Erro ao realizar o ataque.",
            error: error.message
        });
    }
};

const startGame = (_, res) => {
    try {
        playerBoard.resetBoard();
        opponentBoard.resetBoard();

        const opponentResult = initializeOpponentBoard();

        if (!opponentResult.success) {
            return res.status(500).json({
                message: "Erro ao inicializar o jogo",
                error: opponentResult.message
            });
        }

        res.status(200).json({
            message: "Novo jogo iniciado com sucesso!",
            playerGrid: playerBoard.getGrid()
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Erro ao iniciar novo jogo!",
            error: error.message
        });
    }
};

const getGameState = (_, res) => {
    try {
        res.status(200).json({
            playerStatus: {
                fireHits: opponentBoard.hitsTotal,
                fireMisses: opponentBoard.missesTotal,
                totalAttacks: opponentBoard.getAttackTotal(),
                score: opponentBoard.getScore(),
                gridHits: opponentBoard.hits
            },
            opponentStatus: {
                fireHits: playerBoard.hitsTotal,
                fireMisses: playerBoard.missesTotal,
                totalAttacks: playerBoard.getAttackTotal(),
                score: playerBoard.getScore(),
                gridHits: playerBoard.hits
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Erro ao obter o estado do jogo!",
            error: error.message
        });
    }
};


export {
    getBoard,
    resetBoard,
    addShip,
    getGameState,
    attack,
    startGame
};