//estrutura geral do navio
class Board {
    constructor() {
        this.grid = Array(10).fill(null).map(() => Array(10).fill(null));
        this.ships = [];
        
        this.shipConfigs = {
            'porta-avioes': { length: 6, limit: 1 },
            'navio-de-guerra': { length: 4, limit: 1 },
            'encouracado': { length: 3, limit: 2 },
            'submarino': { length: 1, limit: 1 }
        };
    }

    // verifica se é possível posicionar o navio
    isValidPosition(row, column, length, direction) {
        if (direction !== 'horizontal' && direction !== 'vertical') {
            throw new Error('Direção inválida. Use "horizontal" ou "vertical".');
        }

        if (direction === 'horizontal') {
            if (column + length > 10) return false;
            for (let i = 0; i < length; i++) {
                if (this.grid[row][column + i] !== null) return false;
            }
        } else {
            if (row + length > 10) return false;    
            for (let i = 0; i < length; i++) {
                if (this.grid[row + i][column] !== null) return false;
            }
        }

        return true;
    }

    validateShipLimit(type) {
        const config = this.shipConfigs[type];
        if (!config) throw new Error('Tipo de navio inválido.');

        const naviosUsados = this.ships.filter(s => s.type === type).length;
        if (naviosUsados >= config.limit) {
            throw new Error(`Limite de ${type} atingido.`);
        }
    }

    getShipLength(type) {
        const config = this.shipConfigs[type];
        if (!config) throw new Error('Tipo de navio inválido.');
        return config.length;
    }

    //adicionar navio no tabuleiro
    addShip({ type, row, column, direction }) {
        const typeLower = type.toLowerCase();
        
        this.validateShipLimit(typeLower)
        const length = this.getShipLength(typeLower);

        if (!this.isValidPosition(row, column, length, direction)) {
            throw new Error('Posição inválida para o navio.');
        }

        const ship = {
            type: typeLower,
            positions: []
        };

        for (let i = 0; i < length; i++) {
            let rowIndex, colIndex;

            if (direction === 'horizontal') {
                rowIndex = row;
                colIndex = column + i;
            } else {
                rowIndex = row + i;
                colIndex = column;
            }

            this.grid[rowIndex][colIndex] = typeLower;
            ship.positions.push([rowIndex, colIndex]);
        }

        this.ships.push(ship);
    }

    getGrid() {
        return this.grid;
    }

    getShips() {
        return this.ships;
    }

    resetBoard() {
        this.grid = Array(10).fill(null).map(() => Array(10).fill(null));
        this.ships = [];
    }

}

export default Board;
