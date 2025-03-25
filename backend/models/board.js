//estrutura geral do navio
class Board {
    constructor() {
        this.grid = Array(10).fill(null).map(() => Array(10).fill(null));
        this.ships = [];
        
        this.shipConfigs = {
            'porta-avioes': { length: 6, limite: 1 },
            'navio-de-guerra': { length: 4, limite: 1 },
            'encouracado': { length: 3, limite: 2 },
            'submarino': { length: 1, limite: 1 }
        };
    }

    // verifica se é possível posicionar o navio
    isValidPosition(x, y, length, direcao) {
        if (direcao !== 'horizontal' && direcao !== 'vertical') {
            throw new Error('Direção inválida. Use "horizontal" ou "vertical".');
        }

        if (direcao === 'horizontal') {
            if (y + length > 10) return false;
            for (let i = 0; i < length; i++) {
                if (this.grid[x][y + i] !== null) return false;
            }
        } else {
            if (x + length > 10) return false;
            for (let i = 0; i < length; i++) {
                if (this.grid[x + i][y] !== null) return false;
            }
        }

        return true;
    }

    validateShipLimit(tipo) {
        const config = this.shipConfigs[tipo];
        if (!config) throw new Error('Tipo de navio inválido.');

        const naviosUsados = this.ships.filter(s => s.tipo === tipo).length;
        if (naviosUsados >= config.limite) {
            throw new Error(`Limite de ${tipo} atingido.`);
        }
    }

    getShipLength(tipo) {
        const config = this.shipConfigs[tipo];
        if (!config) throw new Error('Tipo de navio inválido.');
        return config.length;
    }

    //adicionar navio no tabuleiro
    addShip({ tipo, x, y, direcao }) {
        const tipoLower = tipo.toLowerCase();
        
        this.validateShipLimit(tipoLower)
        const length = this.getShipLength(tipoLower);

        if (!this.isValidPosition(x, y, length, direcao)) {
            throw new Error('Posição inválida para o navio.');
        }

        const ship = {
            tipo: tipoLower,
            posicoes: []
        };

        for (let i = 0; i < length; i++) {
            let posX, posY;

            if (direcao === 'horizontal') {
                posX = x;
                posY = y + i;
            } else {
                posX = x + i;
                posY = y;
            }

            this.grid[posX][posY] = tipoLower;
            ship.posicoes.push([posX, posY]);
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
