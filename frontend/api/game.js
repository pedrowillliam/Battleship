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
    console.log(data);
    await updateStats();
    return data.playerAttack;
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

    console.log(response);

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

    document.getElementById('user-shots').textContent = gameState.playerStatus.totalAttacks;
    document.getElementById('user-hits').textContent = gameState.playerStatus.fireHits;
    document.getElementById('user-misses').textContent = gameState.playerStatus.fireMisses;

    document.getElementById('user-score').textContent = gameState.playerStatus.score;

  } catch (error) {
    console.error('Erro ao atualizar o estado do jogo:', error);
  }
}


document.addEventListener('DOMContentLoaded', () => {
  const boardContainer = document.querySelector('#board-component');
  if (!boardContainer) {
    console.error('Erro: O "board" não foi encontrada no DOM.');
    return;
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
    attack.hit ? cell.classList.add('hit') : cell.classList.add('miss');
  });

  const restartBtn = document.getElementById('restart-btn');
  if (restartBtn) {
    restartBtn.addEventListener('click', function () {
      resetGame();
      restartGame();
    });
  }
 
  /* não consegui fazer esse redirecionamento funcionar.
  const desistirBtn = document.getElementById('surrender-btn');
  if (desistirBtn) {
    desistirBtn.addEventListener('click', () => {
      // Remover o usuário do localStorage (fazer o logout)
      localStorage.removeItem('username');
      window.location.href = '/Battleship/index.html';
    });
  }
  */ 
});



