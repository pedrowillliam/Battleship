import Board from "../models/board.js";
import { intelligentPlacement } from "../ia/intelligentPlacement.js";

// Função para exibir o tabuleiro no console de forma visual
function printBoard(board) {
    const grid = board.getGrid();
    const ships = board.getShips();
    
    console.log("\n----- Tabuleiro IA -----");
    
    // Imprimir cabeçalho de colunas
    process.stdout.write("   ");
    for (let i = 0; i < 10; i++) {
        process.stdout.write(`${i} `);
    }
    console.log("\n  ---------------------");
    
    // Imprimir cada linha do tabuleiro
    for (let row = 0; row < 10; row++) {
        process.stdout.write(`${row} |`);
        
        for (let col = 0; col < 10; col++) {
            const cell = grid[row][col];
            if (cell === null) {
                process.stdout.write("  ");
            } else if (cell === 'porta-avioes') {
                process.stdout.write("P ");
            } else if (cell === 'navio-de-guerra') {
                process.stdout.write("G ");
            } else if (cell === 'encouracado') {
                process.stdout.write("E ");
            } else if (cell === 'submarino') {
                process.stdout.write("S ");
            }
        }
        console.log("|");
    }
    console.log("  ---------------------");
    
    // Imprimir resumo dos navios posicionados
    console.log("\nNavios posicionados:");
    ships.forEach(ship => {
        console.log(`- ${ship.type} nas posições: ${JSON.stringify(ship.positions)}`);
    });
}

// Testar o posicionamento inteligente dos navios
function testIntelligentPlacement() {
    console.log("Iniciando teste de posicionamento inteligente de navios...");
    
    const board = new Board();
    
    try {
        // Posicionar navios de forma inteligente
        const result = intelligentPlacement(board);
        
        if (result) {
            console.log("✅ Posicionamento inteligente concluído com sucesso!");
            printBoard(board);
            
            // Verificar se todos os navios foram posicionados corretamente
            const ships = board.getShips();
            console.log(`\nTotal de navios posicionados: ${ships.length}`);
            
            const shipCounts = {
                'porta-avioes': 0,
                'navio-de-guerra': 0,
                'encouracado': 0,
                'submarino': 0
            };
            
            ships.forEach(ship => {
                shipCounts[ship.type]++;
            });
            
            console.log("Contagem por tipo:");
            console.log(`- Porta-aviões: ${shipCounts['porta-avioes']} (esperado: 1)`);
            console.log(`- Navio de guerra: ${shipCounts['navio-de-guerra']} (esperado: 1)`);
            console.log(`- Encouraçado: ${shipCounts['encouracado']} (esperado: 2)`);
            console.log(`- Submarino: ${shipCounts['submarino']} (esperado: 1)`);
        } else {
            console.log("❌ Falha no posicionamento inteligente!");
        }
    } catch (error) {
        console.error("❌ Erro durante o teste:", error);
    }
}

// Executar o teste
testIntelligentPlacement();