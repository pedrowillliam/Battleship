import Board from "../models/board.js";
import { smartBotAttack } from "../robot/intelligentAttack.js";
import { randomizeOpponentShips } from "../robot/randomShipPlacement.js";

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

function initializeOpponentBoardRandomly() {
    return randomizeOpponentShips(opponentBoard);
}

function checkAllShipsSunk(board) {
    return board.ships.every(ship => 
        ship.positions.every(([row, col]) => board.hits[row][col])
    );
}

const attack = (req, res) => { 
    const { row, column } = req.body;

    if (row === undefined || column === undefined) {
        return res.status(400).json({
            message: "As coordenadas do ataque (row, column) são obrigatórias!"
        });
    }

    try {

        if (playerBoard.gameOver || opponentBoard.gameOver) {
            return res.status(400).json({
                message: "O jogo já terminou! Inicie um novo jogo."
            });
        }

        const playerResult = opponentBoard.placeBomb(row, column);

        const playerWon = checkAllShipsSunk(opponentBoard);
        if (playerWon) {
            opponentBoard.gameOver = true;
            playerBoard.gameOver = true;
        }
        
        // Array para armazenar os ataques do bot
        let botAttacks = [];
        let botContinueAttacking = true;
        let botWon = false;

        const MAX_BOT_ATTACKS = 100; // Limite para evitar loop infinito
        let botAttackCount = 0;

        // Bot continua atacando enquanto acertar
        while (botContinueAttacking && botAttackCount < MAX_BOT_ATTACKS) {
            const [botRow, botCol] = smartBotAttack(playerBoard);
            const botResult = playerBoard.placeBomb(botRow, botCol);

            botAttacks.push({
                row: botRow,
                column: botCol,
                ...botResult
            });

            // Agora o bot continua atacando enquanto acertar, independente de destruir
            botContinueAttacking = botResult.hit;
            botAttackCount++;

            console.log(`Bot atacou (${botRow}, ${botCol}): ${botResult.hit ? 'ACERTOU' : 'ERROU'}`);
            if (botResult.destroyed) {
                console.log(`Bot DESTRUIU um ${botResult.shipType}!`);
            }

            botWon = checkAllShipsSunk(playerBoard);
            if (botWon) {
                opponentBoard.gameOver = true;
                playerBoard.gameOver = true;
                break;
            }
        }

        if (botAttackCount >= MAX_BOT_ATTACKS) {
            console.warn("⚠️ Limite máximo de ataques do bot atingido! Possível loop evitado.");
        }

        res.status(200).json({
            playerAttack: {
                row, column,
                ...playerResult
            },
            botAttacks, 
            gameState: {
                isGameOver: playerWon || botWon,
                winner: playerWon ? 'player' : (botWon ? 'bot' : null),
                message: playerWon ? 'Você venceu! Todos os navios inimigos foram destruídos!' : 
                        (botWon ? 'Você perdeu! Todos os seus navios foram destruídos!' : null)
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
        opponentBoard.resetBoard();

        playerBoard.gameOver = false;
        opponentBoard.gameOver = false;
        
        const opponentResult = initializeOpponentBoardRandomly();
        
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
        const playerWon = checkAllShipsSunk(opponentBoard);
        const botWon = checkAllShipsSunk(playerBoard);
        res.status(200).json({
            winner: playerWon ? 'player' : (botWon ? 'bot' : null),
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

export { getBoard, resetBoard, addShip, getGameState, attack, startGame };
