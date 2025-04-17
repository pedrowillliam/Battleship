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

let isPlayerTurn = true; 

const attack = (req, res) => {
    const { row, column } = req.body;

    if (row === undefined || column === undefined) {
        return res.status(400).json({
            message: "As coordenadas do ataque (row, column) são obrigatórias!"
        });
    }

    if (!isPlayerTurn) {
        return res.status(403).json({
            message: "Ainda não é sua vez!"
        });
    }

    try {
        let playerAttacks = [];
        let continuePlayer = true;
        let currentRow = row;
        let currentColumn = column;

        // Enquanto o jogador acertar, ele continua
        while (continuePlayer) {
            const result = opponentBoard.placeBomb(currentRow, currentColumn);

            playerAttacks.push({
                row: currentRow,
                column: currentColumn,
                ...result
            });

            console.log(`Jogador atacou (${currentRow}, ${currentColumn}): ${result.hit ? 'ACERTOU' : 'ERROU'}`);

            if (result.destroyed) {
                console.log(`Jogador DESTRUIU um ${result.shipType}!`);
            }

            if (!result.hit) {
                continuePlayer = false;
                isPlayerTurn = false;
            } else {
                // Aqui, para só 1 ataque por vez no front — remova isso se quiser encadear no front
                break;
            }
        }

        // Bot joga apenas se o jogador errar
        let botAttacks = [];
        if (!isPlayerTurn) {
            let botContinueAttacking = true;
            const MAX_BOT_ATTACKS = 100;
            let botAttackCount = 0;

            while (botContinueAttacking && botAttackCount < MAX_BOT_ATTACKS) {
                const [botRow, botCol] = smartBotAttack(playerBoard);
                const botResult = playerBoard.placeBomb(botRow, botCol);

                botAttacks.push({
                    row: botRow,
                    column: botCol,
                    ...botResult
                });

                console.log(`Bot atacou (${botRow}, ${botCol}): ${botResult.hit ? 'ACERTOU' : 'ERROU'}`);
                if (botResult.destroyed) {
                    console.log(`Bot DESTRUIU um ${botResult.shipType}!`);
                }

                botContinueAttacking = botResult.hit;
                botAttackCount++;
            }

            isPlayerTurn = true; // volta pro jogador
        }

        if (botAttacks.length === 0) {
            console.log("Vez do jogador continua!");
        }

        res.status(200).json({
            playerAttacks,
            botAttacks
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

export { getBoard, resetBoard, addShip, getGameState, attack, startGame };
