export function smartBotAttack(board) {
    const { hits, misses, sunkShips = [] } = board;
    const boardSize = 10;

    // ESTRATÉGIA 1: Continuar atacando navios já encontrados
    const targetResult = attackExistingTargets(hits, misses, boardSize, sunkShips);
    if (targetResult) return targetResult;

    // ESTRATÉGIA 2: Ataque baseado em probabilidade com espaçamento
    const probabilityResult = attackByProbability(hits, misses, boardSize, sunkShips);
    if (probabilityResult) return probabilityResult;

    // ESTRATÉGIA 3: Padrão de varredura otimizado para requisito de espaçamento
    for (let rowIndex = 0; rowIndex < boardSize; rowIndex++) {
        const startCol = rowIndex % 2; // Alterna entre 0 e 1 para criar padrão xadrez
        for (let colIndex = startCol; colIndex < boardSize; colIndex += 2) {
            if (isCellAvailable(rowIndex, colIndex, boardSize, hits, misses)) {
                return [rowIndex, colIndex];
            }
        }
    }

    // ESTRATÉGIA 4: Qualquer célula disponível
    return findFirstAvailableCell(boardSize, hits, misses);
}

function attackExistingTargets(hits, misses, boardSize, sunkShips) {
    // Encontrar clusters de hits que não pertencem a navios afundados
    const hitClusters = findHitClusters(hits, boardSize, sunkShips);
    if (hitClusters.length === 0) return null;

    // Primeiro tenta clusters com orientação conhecida
    for (const cluster of hitClusters) {
        if (cluster.orientation) {
            const potentialMoves = getNextMovesForCluster(cluster, hits, misses, boardSize);
            if (potentialMoves.length > 0) return potentialMoves[0];
        }
    }

    // Depois tenta clusters sem orientação conhecida
    for (const cluster of hitClusters) {
        if (!cluster.orientation) {
            const remainingShips = getRemainingShips(sunkShips);
            const largestRemainingShipSize = Math.max(...remainingShips.map(ship => ship.size));

            if (cluster.positions.length === 1) {
                // Único acerto: testar as 4 direções com prioridade inteligente
                const [hitRow, hitCol] = cluster.positions[0];
                const prioritizedDirections = getPrioritizedDirections(largestRemainingShipSize);

                for (const [rowDelta, colDelta] of prioritizedDirections) {
                    const newRow = hitRow + rowDelta;
                    const newCol = hitCol + colDelta;
                    if (isCellAvailable(newRow, newCol, boardSize, hits, misses)) {
                        return [newRow, newCol];
                    }
                }
            } else {
                // Múltiplos acertos: tentar ambas orientações
                const horizontalMoves = getNextMovesForCluster(
                    { ...cluster, orientation: 'horizontal' }, hits, misses, boardSize
                );
                const verticalMoves = getNextMovesForCluster(
                    { ...cluster, orientation: 'vertical' }, hits, misses, boardSize
                );

                const allPossibleMoves = [...horizontalMoves, ...verticalMoves];
                if (allPossibleMoves.length > 0) return allPossibleMoves[0];
            }
        }
    }

    return null;
}

function getPrioritizedDirections(largestShipSize) {
    return largestShipSize > 3 ?
        // Prioriza vertical para navios grandes
        [[1, 0], [-1, 0], [0, 1], [0, -1]] :
        // Prioriza horizontal para navios menores
        [[0, 1], [0, -1], [1, 0], [-1, 0]];
}

function attackByProbability(hits, misses, boardSize, sunkShips) {
    const remainingShips = getRemainingShips(sunkShips);
    // Geramos um mapa de probabilidade considerando o espaçamento entre navios
    const probabilityMap = generateProbabilityMap(boardSize, hits, misses, remainingShips, sunkShips);
    const bestMoves = findBestProbabilityMoves(probabilityMap, boardSize, hits, misses);

    if (bestMoves.length === 0) return null;

    // Estratégia para os primeiros tiros
    const totalShotsFired = countTotalShots(hits, misses);
    if (totalShotsFired < 5) {
        // Usar padrão xadrez para os primeiros tiros
        const chessPatternMoves = bestMoves.filter(([row, col]) => (row + col) % 2 === 0);
        if (chessPatternMoves.length > 0) {
            return chessPatternMoves[Math.floor(Math.random() * chessPatternMoves.length)];
        }
    }

    // Escolha aleatória entre as melhores opções
    return bestMoves[Math.floor(Math.random() * bestMoves.length)];
}

function findBestProbabilityMoves(probabilityMap, boardSize, hits, misses) {
    let highestProbability = -1;
    let bestMoves = [];

    for (let rowIndex = 0; rowIndex < boardSize; rowIndex++) {
        for (let colIndex = 0; colIndex < boardSize; colIndex++) {
            if (!isHit(hits, rowIndex, colIndex) && !isMiss(misses, rowIndex, colIndex)) {
                if (probabilityMap[rowIndex][colIndex] > highestProbability) {
                    highestProbability = probabilityMap[rowIndex][colIndex];
                    bestMoves = [[rowIndex, colIndex]];
                } else if (probabilityMap[rowIndex][colIndex] === highestProbability) {
                    bestMoves.push([rowIndex, colIndex]);
                }
            }
        }
    }

    return bestMoves;
}

function findFirstAvailableCell(boardSize, hits, misses) {
    for (let rowIndex = 0; rowIndex < boardSize; rowIndex++) {
        for (let colIndex = 0; colIndex < boardSize; colIndex++) {
            if (isCellAvailable(rowIndex, colIndex, boardSize, hits, misses)) {
                return [rowIndex, colIndex];
            }
        }
    }
    return null;
}

function countTotalShots(hits, misses) {
    const boardSize = hits.length;
    let shotCount = 0;

    for (let rowIndex = 0; rowIndex < boardSize; rowIndex++) {
        for (let colIndex = 0; colIndex < boardSize; colIndex++) {
            if (isHit(hits, rowIndex, colIndex) || isMiss(misses, rowIndex, colIndex)) shotCount++;
        }
    }

    return shotCount;
}

function findHitClusters(hits, boardSize, sunkShips) {
    // Encontra acertos que não pertencem a navios afundados
    const activeHits = [];
    for (let rowIndex = 0; rowIndex < boardSize; rowIndex++) {
        for (let colIndex = 0; colIndex < boardSize; colIndex++) {
            if (isHit(hits, rowIndex, colIndex) && !isPartOfSunkShip(rowIndex, colIndex, sunkShips)) {
                activeHits.push([rowIndex, colIndex]);
            }
        }
    }

    if (activeHits.length === 0) return [];

    // Agrupa acertos adjacentes em clusters
    const visitedCells = new Set();
    const hitClusters = [];

    for (const [hitRow, hitCol] of activeHits) {
        const cellKey = `${hitRow},${hitCol}`;

        if (!visitedCells.has(cellKey)) {
            const cluster = { positions: [], orientation: null };

            // BFS para encontrar acertos conectados
            const cellQueue = [[hitRow, hitCol]];
            visitedCells.add(cellKey);

            while (cellQueue.length > 0) {
                const [currentRow, currentCol] = cellQueue.shift();
                cluster.positions.push([currentRow, currentCol]);

                // Verifica as 4 direções
                const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
                for (const [rowDelta, colDelta] of directions) {
                    const neighborRow = currentRow + rowDelta;
                    const neighborCol = currentCol + colDelta;
                    const neighborKey = `${neighborRow},${neighborCol}`;

                    if (isWithinBoard(neighborRow, neighborCol, boardSize) &&
                        isHit(hits, neighborRow, neighborCol) &&
                        !visitedCells.has(neighborKey)) {
                        cellQueue.push([neighborRow, neighborCol]);
                        visitedCells.add(neighborKey);
                    }
                }
            }

            // Determina orientação se cluster tem múltiplos acertos
            if (cluster.positions.length > 1) {
                cluster.orientation = determineClusterOrientation(cluster.positions);
            }

            hitClusters.push(cluster);
        }
    }

    return hitClusters;
}

function isPartOfSunkShip(rowIndex, colIndex, sunkShips) {
    return sunkShips.some(ship =>
        ship.positions.some(position => position[0] === rowIndex && position[1] === colIndex)
    );
}

function isWithinBoard(rowIndex, colIndex, boardSize) {
    return rowIndex >= 0 && rowIndex < boardSize && colIndex >= 0 && colIndex < boardSize;
}

function determineClusterOrientation(positions) {
    if (positions.length < 2) return null;

    // Verifica se posições estão alinhadas horizontalmente
    const allSameRow = positions.every(position => position[0] === positions[0][0]);
    if (allSameRow) return 'horizontal';

    // Verifica se posições estão alinhadas verticalmente
    const allSameColumn = positions.every(position => position[1] === positions[0][1]);
    if (allSameColumn) return 'vertical';

    return null;
}

function getNextMovesForCluster(cluster, hits, misses, boardSize) {
    const { positions, orientation } = cluster;
    const possibleMoves = [];

    if (!orientation || positions.length === 0) return possibleMoves;

    if (orientation === 'horizontal') {
        const rowIndex = positions[0][0];
        const columnIndices = positions.map(position => position[1]).sort((a, b) => a - b);
        const leftmostColumn = columnIndices[0];
        const rightmostColumn = columnIndices[columnIndices.length - 1];

        // Esquerda
        if (leftmostColumn > 0 && isCellAvailable(rowIndex, leftmostColumn - 1, boardSize, hits, misses)) {
            possibleMoves.push([rowIndex, leftmostColumn - 1]);
        }

        // Direita
        if (rightmostColumn < boardSize - 1 && isCellAvailable(rowIndex, rightmostColumn + 1, boardSize, hits, misses)) {
            possibleMoves.push([rowIndex, rightmostColumn + 1]);
        }
    } else {
        const columnIndex = positions[0][1];
        const rowIndices = positions.map(position => position[0]).sort((a, b) => a - b);
        const topmostRow = rowIndices[0];
        const bottommostRow = rowIndices[rowIndices.length - 1];

        // Cima
        if (topmostRow > 0 && isCellAvailable(topmostRow - 1, columnIndex, boardSize, hits, misses)) {
            possibleMoves.push([topmostRow - 1, columnIndex]);
        }

        // Baixo
        if (bottommostRow < boardSize - 1 && isCellAvailable(bottommostRow + 1, columnIndex, boardSize, hits, misses)) {
            possibleMoves.push([bottommostRow + 1, columnIndex]);
        }
    }

    return possibleMoves;
}

function isHit(hits, rowIndex, colIndex) {
    return hits[rowIndex] && hits[rowIndex][colIndex];
}

function isMiss(misses, rowIndex, colIndex) {
    return misses[rowIndex] && misses[rowIndex][colIndex];
}

function isCellAvailable(rowIndex, colIndex, boardSize, hits, misses) {
    return isWithinBoard(rowIndex, colIndex, boardSize) && !isHit(hits, rowIndex, colIndex) && !isMiss(misses, rowIndex, colIndex);
}

function getRemainingShips(sunkShips = []) {
    const allShipTypes = [
        { name: 'porta-aviões', size: 6, quantity: 1 },
        { name: 'navio de guerra', size: 4, quantity: 1 },
        { name: 'encouraçado', size: 3, quantity: 2 },
        { name: 'submarino', size: 1, quantity: 1 }
    ];

    const remainingShips = JSON.parse(JSON.stringify(allShipTypes));

    // Remove navios afundados
    for (const sunkShip of sunkShips) {
        const shipIndex = remainingShips.findIndex(ship => ship.name === sunkShip.type);
        if (shipIndex !== -1) {
            if (remainingShips[shipIndex].quantity > 1) {
                remainingShips[shipIndex].quantity--;
            } else {
                remainingShips.splice(shipIndex, 1);
            }
        }
    }

    return remainingShips;
}

function generateProbabilityMap(boardSize, hits, misses, remainingShips, sunkShips) {
    const probabilityMap = Array(boardSize).fill().map(() => Array(boardSize).fill(0));

    const exclusionZone = markExclusionZones(boardSize, hits, misses, sunkShips);

    for (const shipType of remainingShips) {
        for (let shipCount = 0; shipCount < shipType.quantity; shipCount++) {
            // Horizontal
            updateProbabilityForOrientation(probabilityMap, boardSize, hits, misses, shipType, 'horizontal', exclusionZone);

            // Vertical
            updateProbabilityForOrientation(probabilityMap, boardSize, hits, misses, shipType, 'vertical', exclusionZone);
        }
    }

    return probabilityMap;
}

function markExclusionZones(boardSize, hits, misses, sunkShips) {
    const exclusionZone = Array(boardSize).fill().map(() => Array(boardSize).fill(false));

    for (let rowIndex = 0; rowIndex < boardSize; rowIndex++) {
        for (let colIndex = 0; colIndex < boardSize; colIndex++) {
            if (isHit(hits, rowIndex, colIndex) && isPartOfSunkShip(rowIndex, colIndex, sunkShips)) {
                markAdjacentCells(exclusionZone, rowIndex, colIndex, boardSize, true);
            }
        }
    }

    return exclusionZone;
}

function markAdjacentCells(exclusionZone, rowIndex, colIndex, boardSize, includeDiagonals) {
    const directions = [
        [-1, 0], [1, 0], [0, -1], [0, 1]  // Cima, baixo, esquerda, direita
    ];

    if (includeDiagonals) {
        directions.push([-1, -1], [-1, 1], [1, -1], [1, 1]); 
    }

    for (const [rowDelta, colDelta] of directions) {
        const newRow = rowIndex + rowDelta;
        const newCol = colIndex + colDelta;

        if (isWithinBoard(newRow, newCol, boardSize)) {
            exclusionZone[newRow][newCol] = true;
        }
    }
}

function updateProbabilityForOrientation(probabilityMap, boardSize, hits, misses, shipType, orientation, exclusionZone) {
    const isHorizontal = orientation === 'horizontal';
    const shipSize = shipType.size;

    for (let primaryIndex = 0; primaryIndex < boardSize; primaryIndex++) {
        for (let secondaryStart = 0; secondaryStart <= boardSize - shipSize; secondaryStart++) {
            let isValidPlacement = true;
            let containsHit = false;
            let adjacentToHit = false;

            for (let shipPosition = 0; shipPosition < shipSize; shipPosition++) {
                const rowIndex = isHorizontal ? primaryIndex : secondaryStart + shipPosition;
                const colIndex = isHorizontal ? secondaryStart + shipPosition : primaryIndex;

                if (isMiss(misses, rowIndex, colIndex) || exclusionZone[rowIndex][colIndex]) {
                    isValidPlacement = false;
                    break;
                }

                if (isHit(hits, rowIndex, colIndex)) {
                    containsHit = true;
                }

                if (!isHit(hits, rowIndex, colIndex)) {
                    const adjacentDirections = [[0, 1], [1, 0], [0, -1], [-1, 0]];
                    for (const [rowDelta, colDelta] of adjacentDirections) {
                        const adjacentRow = rowIndex + rowDelta;
                        const adjacentCol = colIndex + colDelta;

                        if (isWithinBoard(adjacentRow, adjacentCol, boardSize) &&
                            isHit(hits, adjacentRow, adjacentCol) &&
                            !isPartOfCurrentPlacement(adjacentRow, adjacentCol, isHorizontal, primaryIndex, secondaryStart, shipPosition)) {
                            adjacentToHit = true;
                            break;
                        }
                    }
                }
            }

            if (isValidPlacement) {
                const baseProbability = 1;
                const hitBonus = containsHit ? 3 : 0;
                const adjacentBonus = adjacentToHit ? -1 : 0;
                const sizeBonus = shipSize * 0.2;

                const totalProbability = Math.max(0, baseProbability + hitBonus + adjacentBonus + sizeBonus);

                for (let shipPosition = 0; shipPosition < shipSize; shipPosition++) {
                    const rowIndex = isHorizontal ? primaryIndex : secondaryStart + shipPosition;
                    const colIndex = isHorizontal ? secondaryStart + shipPosition : primaryIndex;

                    if (!isHit(hits, rowIndex, colIndex)) {
                        probabilityMap[rowIndex][colIndex] += totalProbability;
                    }
                }
            }
        }
    }
}

function isPartOfCurrentPlacement(row, col, isHorizontal, primaryIndex, secondaryStart, currentPosition) {
    if (isHorizontal) {
        return row === primaryIndex && col === secondaryStart + currentPosition;
    } else {
        return col === primaryIndex && row === secondaryStart + currentPosition;
    }
}