import GameTurn from '../models/gameTurn.js';

const gameTurn = new GameTurn(); // instancia única para este jogo

const playerAttack = (req, res) => {
    const { row, column } = req.body;

    if (row === undefined || column === undefined) {
        return res.status(400).json({ message: "Coordenadas (row, column) são obrigatórias!" });
    }

    const result = gameTurn.playerAttack(row, column);

    if (result.error) {
        return res.status(403).json({ message: result.error });
    }

    return res.status(200).json(result);
};

const botAttack = (_, res) => {
    const result = gameTurn.botAttack();

    if (result.error) {
        return res.status(403).json({ message: result.error });
    }

    return res.status(200).json(result);
};

const getTurn = (_, res) => {
    return res.status(200).json({ currentTurn: gameTurn.currentTurn });
};

export { playerAttack, botAttack, getTurn };
