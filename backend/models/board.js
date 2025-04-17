class Board {
    constructor() {
        this.grid = Array(10).fill(null).map(() => Array(10).fill(null));
        this.ships = [];
        this.hitsTotal = 0;
        this.missesTotal = 0;
        this.attackTotal = 0;
        this.scoreTotal = 0;

        this.shipConfigs = {
            'porta-avioes': { length: 6, limit: 1 },
            'navio-de-guerra': { length: 4, limit: 1 },
            'encouracado': { length: 3, limit: 2 },
            'submarino': { length: 1, limit: 1 }
        };

        this.hits = Array(10).fill(null).map(() => Array(10).fill(false));
        this.misses = Array(10).fill(null).map(() => Array(10).fill(false));
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
        if (!config) throw new Error(`Tipo de navio inválido: ${type}`);

        const naviosUsados = this.ships.filter(s => s.type === type).length;
        if (naviosUsados >= config.limit) {
            throw new Error(`Limite de ${type} atingido (${config.limit}).`);
        }
    }

    getShipLength(type) {
        const config = this.shipConfigs[type];
        if (!config) throw new Error(`Tipo de navio inválido: ${type}`);
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

        if(!this.hasMinimumDistanceFromOtherShips(row, column, length, direction)) {
            throw new Error('Navios devem ter pelo menos uma célula de distância entre si.');
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

    hasMinimumDistanceFromOtherShips(row, column, length, direction) {
        const boardSize = this.grid.length;
        
        const startRow = Math.max(0, row - 1);
        const endRow = direction === 'horizontal' 
          ? Math.min(boardSize - 1, row + 1)
          : Math.min(boardSize - 1, row + length);
        
        const startCol = Math.max(0, column - 1);
        const endCol = direction === 'horizontal' 
          ? Math.min(boardSize - 1, column + length)
          : Math.min(boardSize - 1, column + 1);
        
        for (let r = startRow; r <= endRow; r++) {
          for (let c = startCol; c <= endCol; c++) {
            if (this.grid[r][c] !== null && this.grid[r][c] !== undefined) {
              return false;
            }
          }
        }
        
        return true;
    }
    
    placeBomb(row, column) {
        if (row < 0 || row >= 10 || column < 0 || column >= 10) {
            throw new Error('Coordenadas inválidas. Escolha valores entre 0 e 9.');
        }
    
        console.log(`Atirou em (${row}, ${column})`);
    
        if (this.hits[row][column] || this.misses[row][column]) {
            throw new Error('Esta célula já foi bombardeada anteriormente.');
        }
    
        if (this.grid[row][column] !== null) {
            this.hits[row][column] = true;
            this.hitsTotal++;
    
            const shipType = this.grid[row][column];
            console.log(`Acertou um navio do tipo: ${shipType}`);
    
            const shipIndex = this.ships.findIndex(s =>
                s.type === shipType &&
                s.positions.some(p => p[0] === row && p[1] === column)
            );
    
            if (shipIndex === -1) {
                console.error(`Erro: Navio não encontrado na posição (${row}, ${column})`);
                return {
                    hit: true,
                    continueTurn: true, // mantém turno porque foi acerto
                    message: `Você acertou um ${shipType}!`,
                    shipType,
                    destroyed: false
                };
            }
    
            const ship = this.ships[shipIndex];
    
            const allPositionsHit = ship.positions.every(([r, c]) => {
                const isHit = this.hits[r][c];
                console.log(`Posição (${r}, ${c}) atingida: ${isHit}`);
                return isHit;
            });
    
            if (allPositionsHit) {
                return {
                    hit: true,
                    continueTurn: true, // ainda é turno do player, ele destruiu
                    message: `Você acertou e destruiu um ${shipType}!`,
                    shipType,
                    destroyed: true
                };
            } else {
                return {
                    hit: true,
                    continueTurn: true, // acertou, então continua o turno
                    message: `Você acertou um ${shipType}!`,
                    shipType,
                    destroyed: false
                };
            }
        } else {
            this.misses[row][column] = true;
            this.missesTotal++;
            return {
                hit: false,
                continueTurn: false, // errou, passa o turno
                message: 'Você errou o tiro. Vez do oponente!',
            };
        }
    }

    getGrid() {
        return this.grid;
    }

    getShips() {
        return this.ships;
    }

    getAttackTotal() {
        return this.hitsTotal + this.missesTotal;
    }

    getScore() {
        const attackTotal = this.getAttackTotal();

        if (attackTotal === 0) return 0;
        
        const accuracy = this.hitsTotal / attackTotal;
        const basePoints = 1000;

        const destroyedShips = this.ships.filter(ship => 
            ship.positions.every(([r, c]) => this.hits[r][c])
        ).length;
        
        const destroyedBonus = destroyedShips * 200;
        const missedPenalty = this.missesTotal * 10;
        
        this.scoreTotal = Math.round((basePoints * accuracy) + destroyedBonus - missedPenalty);
        return Math.max(0, this.scoreTotal);
    }

    resetBoard() {
        this.grid = Array(10).fill(null).map(() => Array(10).fill(null));
        this.ships = [];
        this.hitsTotal = 0;
        this.missesTotal = 0;
        this.attackTotal = 0;
        this.scoreTotal = 0;
        this.hits = Array(10).fill(null).map(() => Array(10).fill(false));
        this.misses = Array(10).fill(null).map(() => Array(10).fill(false));
    }

}

export default Board;
