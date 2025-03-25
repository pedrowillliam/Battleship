import Board from "../models/board.js";

const board = new Board();

const getBoard = (req, res) => {
    try {
        const grid = board.getGrid();
        const ships = board.getShips();
        
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

const resetBoard = (req, res) => {
    try {
        board.resetBoard();
        
        // Resposta de sucesso ao resetar o tabuleiro
        res.status(200).json({
            message: "Tabuleiro resetado com sucesso!",
            grid: board.getGrid()
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
    const { tipo, x, y, direcao } = req.body;
    
    if (!tipo || x === undefined || y === undefined || !direcao) {
        return res.status(400).json({ message: "Todos os campos (tipo, x, y, direcao) são obrigatórios!" });
    }

    try {
        board.addShip({ tipo, x, y, direcao });
        
        // Resposta de sucesso ao adicionar o navio
        res.status(201).json({
            message: "Navio adicionado com sucesso!",
            grid: board.getGrid(),
            ships: board.getShips()
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({
            message: "Erro ao adicionar o navio.",
            error: error.message
        });
    }
};

export { getBoard, resetBoard, addShip };