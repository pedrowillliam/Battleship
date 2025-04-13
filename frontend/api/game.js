async function makeAttack(row, column) {
  try {
    const response = await fetch('http://localhost:3000/game/attack', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ row: row, column: column }),
    });

    const data = await response.json();
    await updateStats();
    return data;
  } catch (error) {
    console.error('Erro na requisição:', error);
  }
}

export async function restartGame() {
  try {
    const response = fetch('http://localhost:3000/game/start', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (response.ok) {
      location.reload();
    }
  } catch (error) {
    console.error('Erro na requisição:', error);
  }
}

export async function resetGame() {
  try {
    const response = await fetch('http://localhost:3000/board/reset', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    if (response.ok) {
      location.reload();
    }
  } catch (error) {
    console.error('Erro na requisição:', error);
  }
}

async function updateStats() {
  try {
    const response = await fetch('http://localhost:3000/game/state');
    if (!response.ok) {
      throw new Error('Falha ao buscar estado do jogo');
    }
    const gameState = await response.json();

    document.getElementById('user-shots').textContent = gameState.opponentStatus.totalAttacks;
    document.getElementById('user-hits').textContent = gameState.opponentStatus.fireHits;
    document.getElementById('user-misses').textContent = gameState.opponentStatus.fireMisses;
    document.getElementById('user-score').textContent = gameState.opponentStatus.score;

    document.getElementById('opponent-shots').textContent = gameState.playerStatus.totalAttacks;
    document.getElementById('opponent-hits').textContent = gameState.playerStatus.fireHits;
    document.getElementById('opponent-misses').textContent = gameState.playerStatus.fireMisses;
    document.getElementById('opponent-score').textContent = gameState.playerStatus.score;

    return gameState;

  } catch (error) {
    console.error('Erro ao atualizar o estado do jogo:', error);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const boardContainer = document.querySelector('#board-component');
  const opponentBoardContainer = document.querySelector('#board-component-two');
  if (!boardContainer && !opponentBoardContainer) {
    console.error('Erro: O tabuleiro não foi encontrado no DOM.');
    return;
  }

  boardContainer.style.opacity = "0.7";
  boardContainer.style.pointerEvents = 'none';

  function getCellByPosition(board, row, column) {
    const rows = board.querySelectorAll('.row');
    if (row === 0) {
      const firstRow = rows[0].querySelector('.row-cells');
      const firstRowCells = firstRow.querySelectorAll('.first-row');
      return firstRowCells[column]?.querySelector('.cell');
    } else {
      const targetRow = rows[row];
      const cells = targetRow.querySelector('div[style*="display: flex"]').querySelectorAll('.cell');
      return cells[column];
    }
  }

  boardContainer.addEventListener('click', async (event) => {
    const cell = event.target.closest('.cell');
    if (!cell) return;
  
    const row = event.target.closest('.row');
    if (!row) return;
  
    let rowIndex, columnIndex;
    const rowLetter = row.querySelector('p').textContent;
  
    const letterToNumber = {
      'A': 0, 'B': 1, 'C': 2, 'D': 3, 'E': 4,
      'F': 5, 'G': 6, 'H': 7, 'I': 8, 'J': 9
    };
  
    const firstRow = cell.closest('.first-row');
  
    if (firstRow) {
      rowIndex = 0;
      const rowCells = row.querySelector('.row-cells');
      const firstRowCells = rowCells.querySelectorAll('.first-row');
      columnIndex = Array.from(firstRowCells).indexOf(firstRow);
    } else {
      rowIndex = letterToNumber[rowLetter];
      const cellsContainer = row.querySelector('div[style*="display: flex"]');
      columnIndex = Array.from(cellsContainer.children).indexOf(cell);
    }
  
    const attack = await makeAttack(rowIndex, columnIndex);
    
    attack.playerAttack.hit ? cell.classList.add('hit') : cell.classList.add('miss');
    
    const botCell = getCellByPosition(opponentBoardContainer, attack.botAttack.row, attack.botAttack.column);
    if (botCell) {
      if (attack.botAttack.hit) {
        botCell.classList.add('hit-ia');
      } else {
        botCell.classList.add('miss');
      }
    }

    if (attack.botAttack.destroyed) {
      alert(`O robô destruiu seu ${attack.botAttack.shipType}!`);
    }
  });
  

  const restartBtn = document.getElementById('restart-btn');
  if (restartBtn) {
    restartBtn.addEventListener('click', function () {
      resetGame();
      restartGame();
    });
  }
});