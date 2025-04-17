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

  function showNotification(message, duration = 3000) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.style.display = 'block';
    notification.style.opacity = '1';
  
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => {
        notification.style.display = 'none';
      }, 300);
    }, duration);
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

  function disablePlayerBoard() {
    boardContainer.style.pointerEvents = 'none';
    boardContainer.style.opacity = '0.7';
    document.getElementById('bot-waiting-message').style.display = 'block';
  }

  function enablePlayerBoard() {
    boardContainer.style.pointerEvents = 'auto';
    boardContainer.style.opacity = '1';
    document.getElementById('bot-waiting-message').style.display = 'none';
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
  
    // 🎯 Mostra resultado do ataque do jogador
    let acertou = false;
if (Array.isArray(attack.playerAttacks)) {
  for (let i = 0; i < attack.playerAttacks.length; i++) {
    const playerAttack = attack.playerAttacks[i];
    const cell = getCellByPosition(boardContainer, playerAttack.row, playerAttack.column);
    if (cell) {
      if (playerAttack.hit) {
        cell.classList.add('hit');
        acertou = true;
      } else {
        cell.classList.add('miss');
      }
      if (playerAttack.destroyed) {
        setTimeout(() => {
          showNotification(`🎯 Você destruiu o ${playerAttack.shipType} do robô!`);
        }, 1000); // 1000 ms = 1 segundo
      }
    }
  }
}

// ✅ Se o jogo terminou
if (attack.gameState?.winner) {
  const messageBox = document.getElementById('game-over-message');
  messageBox.textContent = attack.gameState.message;
  
  messageBox.classList.remove('hidden');
  messageBox.classList.add(
    attack.gameState.winner === 'player' ? 'win' : 'lose'
  );

  // Desativa tabuleiros
  boardContainer.style.pointerEvents = 'none';
  opponentBoardContainer.style.pointerEvents = 'none';
  boardContainer.style.opacity = "0.7";
  opponentBoardContainer.style.opacity = "0.7";
}

// ⛔ Se o bot vai jogar, desativa o tabuleiro e mostra a mensagem
if (Array.isArray(attack.botAttacks) && attack.botAttacks.length > 0) {
  disablePlayerBoard();
}
// 🤖 Mostra resultado dos ataques do bot
if (Array.isArray(attack.botAttacks)) {
  for (let i = 0; i < attack.botAttacks.length; i++) {
    const botAttack = attack.botAttacks[i];

    await new Promise(resolve => setTimeout(resolve, 1000)); // Delay de 1 segundo
    const botCell = getCellByPosition(opponentBoardContainer, botAttack.row, botAttack.column);
    if (botCell) {
      if (botAttack.hit) {
        botCell.classList.add('hit-ia');
      } else {
        botCell.classList.add('miss');
      }
    }

    if (botAttack.destroyed) {
      showNotification(`💥 O robô destruiu seu ${botAttack.shipType}!`);
    }
  }
}

// ✅ Alerta se acertou e o bot não jogou
if (acertou && (!attack.botAttacks || attack.botAttacks.length === 0)) {
  showNotification('🎯 Você acertou, pode jogar novamente!');
}

enablePlayerBoard(); // ✅ Reativa tabuleiro após o turno do bot // ✅ Reativa tabuleiro após o turno do bot
  });

  const restartBtn = document.getElementById('restart-btn');
  if (restartBtn) {
    restartBtn.addEventListener('click', function () {
      resetGame();
      restartGame();
    });
  }
});

