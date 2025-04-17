import { salvarPartida } from "./matches.js";

async function makeAttack(row, column) {
  try {
    const response = await fetch('http://localhost:3000/game/attack', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ row, column }),
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

    document.getElementById('user-shots').textContent = gameState.playerStatus.totalAttacks;
    document.getElementById('user-hits').textContent = gameState.playerStatus.fireHits;
    document.getElementById('user-misses').textContent = gameState.playerStatus.fireMisses;
    document.getElementById('user-score').textContent = gameState.playerStatus.score;

    document.getElementById('opponent-shots').textContent = gameState.opponentStatus.totalAttacks;
    document.getElementById('opponent-hits').textContent = gameState.opponentStatus.fireHits;
    document.getElementById('opponent-misses').textContent = gameState.opponentStatus.fireMisses;
    document.getElementById('opponent-score').textContent = gameState.opponentStatus.score;

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

    if (attack.gameState.winner) {
      alert(attack.gameState.message);
      boardContainer.style.pointerEvents = 'none';
      opponentBoardContainer.style.pointerEvents = 'none';
      boardContainer.style.opacity = "0.7";
      opponentBoardContainer.style.opacity = "0.7";
      const match = await updateStats();
      // ⚡ salvar a partida no backend
      const partida = {
        user_id: localStorage.getItem('user_id'),
        score: match.playerStatus.score,
        result: match.winner === "player" ? "WIN" : "LOSS",
        duration: 0,
        total_hits: match.playerStatus.fireHits,
        total_misses: match.playerStatus.fireMisses
      };

      await salvarPartida(partida);

    }


    // Mostra resultado do ataque do jogador
    attack.playerAttack.hit ? cell.classList.add('hit') : cell.classList.add('miss');

    // Trata todos os ataques do bot (pode ser múltiplos)
    if (Array.isArray(attack.botAttacks)) {
      for (let i = 0; i < attack.botAttacks.length; i++) {
        const botAttack = attack.botAttacks[i];
    
        await new Promise(resolve => setTimeout(resolve, 1000)); // Delay de 1segundo
        const botCell = getCellByPosition(opponentBoardContainer, botAttack.row, botAttack.column);
        if (botCell) {
          if (botAttack.hit) {
            botCell.classList.add('hit-ia');
          } else {
            botCell.classList.add('miss');
          }
        }

        if (botAttack.destroyed) {
          alert(`O robô destruiu seu ${botAttack.shipType}!`);
        }
      }
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
