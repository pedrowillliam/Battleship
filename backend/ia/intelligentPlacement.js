// Função que posiciona estrategicamente os navios da IA
export function intelligentPlacement(board) {
    // Configuração dos navios (igual à do model Board)
    const shipConfigs = {
        'porta-avioes': { length: 6, limit: 1 },
        'navio-de-guerra': { length: 4, limit: 1 },
        'encouracado': { length: 3, limit: 2 },
        'submarino': { length: 1, limit: 1 }
    };
    
    // Tentativa de posicionar cada tipo de navio
    try {
        // Porta-aviões (6 células) - estratégia para posicionar longe das bordas
        placeShipStrategically(board, 'porta-avioes', shipConfigs['porta-avioes'].length, {
            preferCenter: true,
            avoidBorders: true
        });
        
        // Navio de guerra (4 células) - distribuir em áreas diferentes do porta-aviões
        placeShipStrategically(board, 'navio-de-guerra', shipConfigs['navio-de-guerra'].length, {
            avoidBorders: true,
            preferOppositeArea: true  // Tenta posicionar em área oposta ao porta-aviões
        });
        
        // Navios encouraçados (3 células cada, 2 navios) - distribuir pelo tabuleiro
        placeShipStrategically(board, 'encouracado', shipConfigs['encouracado'].length, {
            spreadOut: true
        });
        placeShipStrategically(board, 'encouracado', shipConfigs['encouracado'].length, {
            spreadOut: true,
            avoidSimilarShips: true  // Tenta evitar áreas onde já tem encouraçados
        });
        
        // Submarino (1 célula) - posicionar estrategicamente
        placeShipStrategically(board, 'submarino', shipConfigs['submarino'].length, {
            preferCorners: false,  // Evita cantos que são mais fáceis de adivinhar
            hideBetweenLargerShips: true  // Tenta esconder entre navios maiores
        });
        
        console.log("Todos os navios posicionados com sucesso pela IA!");
        return true;
    } catch (error) {
        console.error("Erro ao posicionar navios da IA:", error);
        return false;
    }
}

// Função para posicionar um navio estrategicamente
function placeShipStrategically(board, type, length, options = {}) {
    // Contador para evitar loop infinito
    let attempts = 0;
    const maxAttempts = 150;
    
    // Identificar onde estão os navios existentes para estratégias específicas
    const existingShips = board.getShips();
    const occupiedCells = getOccupiedCells(board);
    
    while (attempts < maxAttempts) {
        attempts++;
        
        // Gerar posição com base nas estratégias
        const [row, column, direction] = generateStrategicPosition(length, options, existingShips, occupiedCells);
        
        try {
            // Tenta adicionar o navio no tabuleiro
            board.addShip({ type, row, column, direction });
            // Se chegou aqui, navio adicionado com sucesso
            return;
        } catch (error) {
            // Posição inválida, tentar novamente
            continue;
        }
    }
    
    // Último recurso: tentar posicionar aleatoriamente sem restrições
    const finalAttempts = 50;
    for (let i = 0; i < finalAttempts; i++) {
        const row = Math.floor(Math.random() * 10);
        const column = Math.floor(Math.random() * 10);
        const direction = Math.random() < 0.5 ? 'horizontal' : 'vertical';
        
        try {
            board.addShip({ type, row, column, direction });
            return;
        } catch (error) {
            continue;
        }
    }
    
    // Se chegou aqui, não conseguiu posicionar após várias tentativas
    throw new Error(`Não foi possível posicionar ${type} após ${maxAttempts + finalAttempts} tentativas.`);
}

// Auxiliar: gerar posição estratégica com base nas opções
function generateStrategicPosition(length, options, existingShips, occupiedCells) {
    let row, column, direction;
    
    // Decidir a direção com base na estratégia
    if (options.preferHorizontal) {
        direction = Math.random() < 0.7 ? 'horizontal' : 'vertical';  // 70% chance horizontal
    } else if (options.preferVertical) {
        direction = Math.random() < 0.7 ? 'vertical' : 'horizontal';  // 70% chance vertical
    } else {
        direction = Math.random() < 0.5 ? 'horizontal' : 'vertical';  // 50/50
    }
    
    // Determinar posição com base nas estratégias
    if (options.preferCenter && Math.random() < 0.7) {
        // Posicionar mais próximo ao centro
        row = 2 + Math.floor(Math.random() * 6);
        column = 2 + Math.floor(Math.random() * 6);
    } else if (options.preferCorners && Math.random() < 0.6) {
        // Posicionar próximo a um dos cantos
        const corner = Math.floor(Math.random() * 4);
        switch(corner) {
            case 0: row = Math.floor(Math.random() * 3); column = Math.floor(Math.random() * 3); break; // Canto superior esquerdo
            case 1: row = Math.floor(Math.random() * 3); column = 7 + Math.floor(Math.random() * 3); break; // Canto superior direito
            case 2: row = 7 + Math.floor(Math.random() * 3); column = Math.floor(Math.random() * 3); break; // Canto inferior esquerdo
            case 3: row = 7 + Math.floor(Math.random() * 3); column = 7 + Math.floor(Math.random() * 3); break; // Canto inferior direito
        }
    } else if (options.avoidBorders && Math.random() < 0.8) {
        // Evitar bordas para navios grandes
        const borderMargin = Math.min(2, 10 - length);
        row = borderMargin + Math.floor(Math.random() * (10 - 2 * borderMargin));
        column = borderMargin + Math.floor(Math.random() * (10 - 2 * borderMargin));
    } else if (options.preferOppositeArea && existingShips.length > 0) {
        // Posicionar em área oposta a navios existentes
        const oppositeSector = getOppositeSector(existingShips[0].positions[0]);
        
        // Dentro do setor oposto
        switch(oppositeSector) {
            case 0: row = Math.floor(Math.random() * 5); column = Math.floor(Math.random() * 5); break; // Superior esquerdo
            case 1: row = Math.floor(Math.random() * 5); column = 5 + Math.floor(Math.random() * 5); break; // Superior direito
            case 2: row = 5 + Math.floor(Math.random() * 5); column = Math.floor(Math.random() * 5); break; // Inferior esquerdo
            case 3: row = 5 + Math.floor(Math.random() * 5); column = 5 + Math.floor(Math.random() * 5); break; // Inferior direito
        }
    } else if (options.spreadOut && existingShips.length > 0) {
        // Distribuir no tabuleiro, longe de outros navios
        let maxDistance = 0;
        let bestPosition = [Math.floor(Math.random() * 10), Math.floor(Math.random() * 10)];
        
        // Tenta várias posições e escolhe a mais distante de outros navios
        for (let i = 0; i < 20; i++) {
            const testRow = Math.floor(Math.random() * 10);
            const testCol = Math.floor(Math.random() * 10);
            
            const minDist = getMinDistanceToShips(testRow, testCol, existingShips);
            if (minDist > maxDistance) {
                maxDistance = minDist;
                bestPosition = [testRow, testCol];
            }
        }
        
        row = bestPosition[0];
        column = bestPosition[1];
    } else if (options.avoidSimilarShips) {
        // Encontrar os navios do mesmo tipo
        const sameTypeShips = existingShips.filter(ship => ship.type === 'encouracado');
        
        if (sameTypeShips.length > 0) {
            // Evitar posicionar próximo a navios do mesmo tipo
            let maxDistance = 0;
            let bestPosition = [Math.floor(Math.random() * 10), Math.floor(Math.random() * 10)];
            
            for (let i = 0; i < 20; i++) {
                const testRow = Math.floor(Math.random() * 10);
                const testCol = Math.floor(Math.random() * 10);
                
                const minDist = getMinDistanceToShips(testRow, testCol, sameTypeShips);
                if (minDist > maxDistance) {
                    maxDistance = minDist;
                    bestPosition = [testRow, testCol];
                }
            }
            
            row = bestPosition[0];
            column = bestPosition[1];
        } else {
            row = Math.floor(Math.random() * 10);
            column = Math.floor(Math.random() * 10);
        }
    } else if (options.hideBetweenLargerShips && occupiedCells.length > 10) {
        // Para o submarino: tentar esconder próximo a um navio maior, mas não muito óbvio
        const largeShipCells = [...occupiedCells];
        
        // Escolher uma célula aleatória próxima a um navio maior
        const nearIndex = Math.floor(Math.random() * largeShipCells.length);
        const [nearRow, nearCol] = largeShipCells[nearIndex];
        
        // Ficar a uma distância de 2-3 células 
        const distanceOffset = 1 + Math.floor(Math.random() * 2);
        const dirOffset = Math.floor(Math.random() * 4);
        
        switch(dirOffset) {
            case 0: row = Math.max(0, Math.min(9, nearRow - distanceOffset)); column = nearCol; break;
            case 1: row = Math.max(0, Math.min(9, nearRow + distanceOffset)); column = nearCol; break;
            case 2: row = nearRow; column = Math.max(0, Math.min(9, nearCol - distanceOffset)); break;
            case 3: row = nearRow; column = Math.max(0, Math.min(9, nearCol + distanceOffset)); break;
        }
    } else {
        // Posicionamento aleatório padrão
        row = Math.floor(Math.random() * 10);
        column = Math.floor(Math.random() * 10);
    }
    
    // Último ajuste: verificar se o navio ficaria fora do tabuleiro
    if (direction === 'horizontal' && column + length > 10) {
        column = Math.max(0, 10 - length);
    } else if (direction === 'vertical' && row + length > 10) {
        row = Math.max(0, 10 - length);
    }
    
    return [row, column, direction];
}

// Função auxiliar: obter setor oposto do tabuleiro
function getOppositeSector([row, col]) {
    // Determinar setor: 0=superior-esquerdo, 1=superior-direito, 2=inferior-esquerdo, 3=inferior-direito
    const sector = (row < 5 ? 0 : 2) + (col < 5 ? 0 : 1);
    
    // Retornar setor oposto
    return 3 - sector;
}

// Função auxiliar: calcular distância mínima a outros navios
function getMinDistanceToShips(row, col, ships) {
    if (!ships || ships.length === 0) return 10; // Distância máxima se não houver navios
    
    let minDistance = 20; // Valor alto inicial
    
    for (const ship of ships) {
        for (const [shipRow, shipCol] of ship.positions) {
            const distance = Math.abs(row - shipRow) + Math.abs(col - shipCol);
            minDistance = Math.min(minDistance, distance);
        }
    }
    
    return minDistance;
}

// Função auxiliar: obter todas as células ocupadas por navios
function getOccupiedCells(board) {
    const occupiedCells = [];
    const ships = board.getShips();
    
    for (const ship of ships) {
        for (const position of ship.positions) {
            occupiedCells.push(position);
        }
    }
    
    return occupiedCells;
}