document.addEventListener('DOMContentLoaded', () => {
    const SHIPS = {
        'porta-avioes': { size: 6, remaining: 1, name: 'Porta-aviões' },
        'navio-de-guerra': { size: 4, remaining: 1, name: 'Navio de Guerra' },
        'encouracado': { size: 3, remaining: 2, name: 'Encouraçado' },
        'submarino': { size: 1, remaining: 1, name: 'Submarino' }
    };
    
    const state = {
        shipType: 'porta-avioes',
        direction: 'horizontal',
        isPlacing: true,
        ships: []
    };

    const ROWS = { 'A': 0, 'B': 1, 'C': 2, 'D': 3, 'E': 4, 'F': 5, 'G': 6, 'H': 7, 'I': 8, 'J': 9 };
    const API_URL = 'http://localhost:3000';
    
    const $ = selector => document.querySelector(selector);
    const $$ = selector => document.querySelectorAll(selector);
    
    const element = {
        board: $('#board-component-two'),
        opponent: $('.half.red'),
        get robotInfo() { return this.opponent?.querySelector('.player-info'); }
    };

    async function init() {
        if (element.robotInfo) element.robotInfo.style.display = 'none';
        
        try {
            await loadPlacementCard();
            setupBoardEvents();
        } catch (error) {
            console.error('Erro na inicialização:', error);
        }
    }

    async function loadPlacementCard() {
        const response = await fetch('../components/placeShip.html');
        const html = await response.text();
        
        const tempEl = document.createElement('div');
        tempEl.innerHTML = html;
        
        const card = tempEl.querySelector('#ship-placement-card');
        
        if (card && element.opponent) {
            element.opponent.insertBefore(card, $('#board-component-two'));
            setupCard();
        }
    }

    function setupCard() {
        updateShipVisual($('#ship-visual'), state.shipType);
        
        const dirBtns = {
            horizontal: $('#horizontal-btn'),
            vertical: $('#vertical-btn')
        };
        
        const toggleDir = (active, inactive) => {
            const styles = {
                active: { backgroundColor: '#9ef0af', color: '#333' },
                inactive: { backgroundColor: '#ddd', color: '#333' }
            };
            
            Object.assign(active.style, styles.active);
            Object.assign(inactive.style, styles.inactive);
            state.direction = active === dirBtns.horizontal ? 'horizontal' : 'vertical';
        };
        
        dirBtns.horizontal.addEventListener('click', e => {
            e.preventDefault();
            toggleDir(dirBtns.horizontal, dirBtns.vertical);
        });
        
        dirBtns.vertical.addEventListener('click', e => {
            e.preventDefault();
            toggleDir(dirBtns.vertical, dirBtns.horizontal);
        });
    }

    function setupBoardEvents() {
        if (!element.board) return console.error('Tabuleiro não encontrado!');

        element.board.addEventListener('click', handleCellClick);
        element.board.addEventListener('mouseover', handleCellHover);
        element.board.addEventListener('mouseout', e => {
            if (!state.isPlacing || (e.relatedTarget && element.board.contains(e.relatedTarget))) return;
            $$('.preview-ship, .invalid-placement').forEach(cell => 
                cell.classList.remove('preview-ship', 'invalid-placement'));
        });
    }

    function getCell(rowIndex, colIndex) {
        if (rowIndex < 0 || rowIndex >= 10 || colIndex < 0 || colIndex >= 10) return null;
        
        const rows = $$('#board-component-two .row');
        const row = rows[rowIndex];
        
        if (rowIndex === 0) {
            const firstRowCells = row.querySelector('.row-cells').querySelectorAll('.first-row');
            return colIndex < firstRowCells.length ? firstRowCells[colIndex].querySelector('.cell') : null;
        } else {
            const cells = row.querySelector('div[style*="display: flex"]').querySelectorAll('.cell');
            return colIndex < cells.length ? cells[colIndex] : null;
        }
    }

    function getCellPos(cell, row) {
        const firstRow = cell.closest('.first-row');
        
        if (firstRow) {
            const cells = row.querySelector('.row-cells').querySelectorAll('.first-row');
            return { row: 0, col: Array.from(cells).indexOf(firstRow) };
        } else {
            const rowLetter = row.querySelector('p')?.textContent;
            const cells = row.querySelector('div[style*="display: flex"]').children;
            return { row: ROWS[rowLetter], col: Array.from(cells).indexOf(cell) };
        }
    }

    function getShipCells(rowStart, colStart, shipType, dir) {
        const size = SHIPS[shipType].size;
        return Array.from({length: size}, (_, i) => ({
            row: dir === 'vertical' ? rowStart + i : rowStart,
            col: dir === 'horizontal' ? colStart + i : colStart
        }));
    }

    function validateShip(cells) {
        return cells.every(pos => 
            pos.row >= 0 && pos.row < 10 && pos.col >= 0 && pos.col < 10 &&
            (!getCell(pos.row, pos.col)?.classList.contains('placed-ship'))
        );
    }

    async function handleCellClick(event) {
        if (!state.isPlacing) return;
        
        const cell = event.target.closest('.cell');
        const row = cell?.closest('.row');
        if (!cell || !row) return;
        
        const pos = getCellPos(cell, row);
        
        if (SHIPS[state.shipType].remaining <= 0) {
            return alert(`Não há mais navios do tipo ${SHIPS[state.shipType].name} disponíveis.`);
        }
        
        try {
            const response = await fetch(`${API_URL}/board/add-ship`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: state.shipType,
                    row: pos.row,
                    column: pos.col,
                    direction: state.direction
                }),
            });
            
            if (response.ok) {
                const data = await response.json();
                const shipCells = data.positions || 
                    getShipCells(pos.row, pos.col, state.shipType, state.direction);
                
                shipCells.forEach(pos => {
                    const cell = getCell(pos.row, pos.col);
                    if (cell) {
                        cell.classList.remove('preview-ship', 'invalid-placement');
                        cell.classList.add('placed-ship');
                    }
                });
                
                state.ships.push({ type: state.shipType, positions: shipCells });
                SHIPS[state.shipType].remaining--;
                updateShipSelection();
                
                if (Object.values(SHIPS).every(ship => ship.remaining === 0)) {
                    showGameStartCard();
                }
            } else {
                const error = await response.json().catch(() => ({ 
                    message: 'Erro desconhecido ao posicionar o navio.' 
                }));
                alert(error.message || 'Não foi possível posicionar o navio.');
            }
        } catch (error) {
            console.error('Erro ao posicionar o navio:', error);
            alert('Erro de conexão com o servidor.');
        }
    }

    function handleCellHover(event) {
        if (!state.isPlacing) return;
        
        const cell = event.target.closest('.cell');
        const row = cell?.closest('.row');
        if (!cell || !row) return;
        
        $$('.preview-ship, .invalid-placement').forEach(cell => 
            cell.classList.remove('preview-ship', 'invalid-placement'));
        
        const pos = getCellPos(cell, row);
        const cells = getShipCells(pos.row, pos.col, state.shipType, state.direction);
        const isValid = validateShip(cells);
        
        cells.forEach(pos => {
            const cell = getCell(pos.row, pos.col);
            if (cell) cell.classList.add(isValid ? 'preview-ship' : 'invalid-placement');
        });
    }

    function updateShipVisual(container, shipType) {
        if (!container) return;
        
        container.innerHTML = '';
        container.style.flexDirection = 'row';
        
        const size = SHIPS[shipType].size;
        for (let i = 0; i < size; i++) {
            const segment = document.createElement('div');
            segment.className = 'ship-segment';
            container.appendChild(segment);
        }
    }

    function updateShipSelection() {
        const buttons = $$('.ship-button');
        
        buttons.forEach(btn => {
            const type = btn.dataset.shipType;
            btn.classList.toggle('disabled', SHIPS[type].remaining <= 0);
        });
        
        if (SHIPS[state.shipType].remaining <= 0) {
            const nextShip = Object.entries(SHIPS).find(([_, info]) => info.remaining > 0);
            
            if (nextShip) {
                state.shipType = nextShip[0];
                
                buttons.forEach(btn => {
                    btn.classList.toggle('selected', btn.dataset.shipType === state.shipType);
                });
                
                const nameEl = $('#current-ship-name');
                if (nameEl) nameEl.textContent = SHIPS[state.shipType].name;
                
                updateShipVisual($('#ship-visual'), state.shipType);
            }
        }
    }

    function showGameStartCard() {
        const oldCard = $('#ship-placement-card');
        if (!oldCard) return;
        
        const card = document.createElement('div');
        card.className = 'game-starting';
        card.style.cssText = `
            margin: 20px 0; padding: 15px; border-radius: 10px;
            background-color: white; text-align: center;
            border: 2px solid black; border-bottom: 4px solid black; 
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        `;
        
        card.innerHTML = `
            <h3 style="margin-bottom: 15px; color: #333;">Todos os navios posicionados!</h3>
            <button class="btn restart" style="
                padding: 10px 20px; background-color: #ffc700; color: #333;
                border: 2px solid black; border-bottom: 4px solid black; 
                border-radius: 999px; cursor: pointer;">
                Iniciar Jogo
            </button>
        `;
        
        oldCard.parentNode.replaceChild(card, oldCard);
        card.querySelector('button').addEventListener('click', startGame);
    }

    async function startGame() {
        try {
            const response = await fetch(`${API_URL}/game/start`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            
            if (response.ok) {
                state.isPlacing = false;
                $('.game-starting')?.remove();
                
                if (element.robotInfo) element.robotInfo.style.display = 'flex';
                alert('Jogo iniciado! Sua vez de atacar.');
            } else {
                const error = await response.json().catch(() => ({ 
                    message: 'Erro desconhecido ao iniciar o jogo.' 
                }));
                alert(error.message || 'Não foi possível iniciar o jogo.');
            }
        } catch (error) {
            console.error('Erro ao iniciar o jogo:', error);
            alert('Erro de conexão com o servidor.');
        }
    }

    init();
});