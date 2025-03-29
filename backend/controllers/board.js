import Board from "../models/board.js";
import opponentBoardMock from "../mock/opponentBoard.js";

const playerBoard = new Board();
let opponentBoard = new Board();

const getBoard = (_, res) => {
    try {
        const grid = playerBoard.getGrid();
        const ships = playerBoard.getShips();
        
        // Retorna o tabuleiro com status 200 (sucesso)
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

// 🚨 REMOVER FUNÇÃO DEPOIS QUE IMPLEMENTAR A IA 🚨
function initializeOpponentBoardWithMock() {
    try {
        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 10; j++) {
                if (opponentBoardMock.grid[i][j] !== null) {
                    opponentBoard.grid[i][j] = opponentBoardMock.grid[i][j];
                }
            }
        }
        
        opponentBoardMock.ships.forEach(ship => {
            opponentBoard.ships.push({
                type: ship.type,
                positions: [...ship.positions]
            });
        });
        
        console.log("Tabuleiro do oponente carregado com sucesso a partir do mock!");
        return { success: true, message: "Tabuleiro do oponente inicializado com sucesso!" };
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
        const result = opponentBoard.placeBomb(row, column);
            
        res.status(200).json({
            playerAttack: {
                ...result
            },
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
        
        const opponentResult = initializeOpponentBoardWithMock();
        
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

            // 🚨 RETORNAR OS DADOS DO OPONENTE QUANDO IMPLEMENTAR A IA 🚨

            // opponentStatus: {
            //     hitsTotal: playerBoard.getHitsTotal(),
            //     missesTotal: playerBoard.getMissesTotal(),
            //     hits: playerBoard.getHits(),
            // }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Erro ao obter o estado do jogo!",
            error: error.message
        });
    }
};

export { getBoard, resetBoard, addShip, getGameState, attack, startGame };