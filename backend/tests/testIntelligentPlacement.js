import { intelligentPlacement } from "../ia/intelligentPlacement.js";
import Board from "../models/board.js";

// Função para exibir o tabuleiro no console de forma visual com cores
function printBoard(board) {
    const grid = board.getGrid();
    const ships = board.getShips();
    
    console.log("\n----- Tabuleiro IA (Posicionamento Estratégico) -----");
    
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

// Função para analisar a distribuição dos navios pelo tabuleiro
function analyzeDistribution(board) {
    const ships = board.getShips();
    
    // Verificar quantos navios em cada quadrante
    const quadrants = [0, 0, 0, 0]; // TL, TR, BL, BR
    
    ships.forEach(ship => {
        ship.positions.forEach(([row, col]) => {
            if (row < 5 && col < 5) quadrants[0]++;
            else if (row < 5 && col >= 5) quadrants[1]++;
            else if (row >= 5 && col < 5) quadrants[2]++;
            else quadrants[3]++;
        });
    });
    
    console.log("\nDistribuição por quadrante:");
    console.log(`- Superior esquerdo: ${quadrants[0]} células`);
    console.log(`- Superior direito: ${quadrants[1]} células`);
    console.log(`- Inferior esquerdo: ${quadrants[2]} células`);
    console.log(`- Inferior direito: ${quadrants[3]} células`);
    
    // Calcular o desvio padrão para ver quão uniforme é a distribuição
    const mean = quadrants.reduce((acc, val) => acc + val, 0) / 4;
    const variance = quadrants.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / 4;
    const stdDev = Math.sqrt(variance);
    
    console.log(`\nDesvio padrão da distribuição: ${stdDev.toFixed(2)}`);
    if (stdDev < 2) {
        console.log("✅ Distribuição bastante uniforme pelo tabuleiro!");
    } else if (stdDev < 4) {
        console.log("⚠️ Distribuição razoavelmente uniforme");
    } else {
        console.log("❌ Distribuição muito desigual");
    }
}

// Testar o posicionamento inteligente várias vezes para validar a estratégia
function testEnhancedPlacement(iterations = 3) {
    console.log("Iniciando teste do posicionamento estratégico aprimorado...");
    
    for (let i = 0; i < iterations; i++) {
        console.log(`\n\n=== Iteração ${i+1}/${iterations} ===`);
        
        const board = new Board();
        
        try {
            // Posicionar navios de forma inteligente
            const startTime = Date.now();
            const result = intelligentPlacement(board);
            const endTime = Date.now();
            
            if (result) {
                console.log(`✅ Posicionamento concluído em ${endTime - startTime}ms`);
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
                
                // Analisar distribuição
                analyzeDistribution(board);
            } else {
                console.log("❌ Falha no posicionamento estratégico!");
            }
        } catch (error) {
            console.error("❌ Erro durante o teste:", error);
        }
    }
}

// Executar os testes com 3 iterações
testEnhancedPlacement(3);