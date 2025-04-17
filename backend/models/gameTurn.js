import Board from './board.js';
//acho que isso nao ta servindo de nada.
class GameTurn {
    constructor() {
        this.playerBoard = new Board();
        this.botBoard = new Board();
        this.currentTurn = 'PLAYER'; // ou 'BOT'
        this.gameOver = false;
    }

    isPlayerTurn() {
        return this.currentTurn === 'PLAYER';
    }

    switchTurn() {
        this.currentTurn = this.currentTurn === 'PLAYER' ? 'BOT' : 'PLAYER';
    }

    playerAttack(row, column) {
        if (!this.isPlayerTurn()) {
            return { error: 'Não é sua vez!' };
        }

        const result = this.botBoard.placeBomb(row, column);

        if (!result.hit) {
            this.switchTurn(); // passou a vez pro bot
        }

        return { ...result, nextTurn: this.currentTurn };
    }

    botAttack() {
        if (this.isPlayerTurn()) {
            return { error: 'É a vez do jogador.' };
        }

        let row, col, result;
        do {
            row = Math.floor(Math.random() * 10);
            col = Math.floor(Math.random() * 10);
            try {
                result = this.playerBoard.placeBomb(row, col);
            } catch (err) {
                result = null;
            }
        } while (!result);

        if (!result.hit) {
            this.switchTurn(); // volta pro player
        }

        return { ...result, row, col, nextTurn: this.currentTurn };
    }
}

export default GameTurn;
