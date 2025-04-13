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
        // Porta-aviões (6 células)
        placeShipRandomly(board, 'porta-avioes', shipConfigs['porta-avioes'].length);
        
        // Navio de guerra (4 células)
        placeShipRandomly(board, 'navio-de-guerra', shipConfigs['navio-de-guerra'].length);
        
        // Navios encouraçados (3 células cada, 2 navios)
        placeShipRandomly(board, 'encouracado', shipConfigs['encouracado'].length);
        placeShipRandomly(board, 'encouracado', shipConfigs['encouracado'].length);
        
        // Submarino (1 célula)
        placeShipRandomly(board, 'submarino', shipConfigs['submarino'].length);
        
        console.log("Todos os navios posicionados com sucesso pela IA!");
        return true;
    } catch (error) {
        console.error("Erro ao posicionar navios da IA:", error);
        return false;
    }
}

// Função para posicionar um navio aleatoriamente
function placeShipRandomly(board, type, length) {
    // Contador para evitar loop infinito
    let attempts = 0;
    const maxAttempts = 100;
    
    while (attempts < maxAttempts) {
        attempts++;
        
        // Gerar posição e direção aleatórias
        const row = Math.floor(Math.random() * 10);
        const column = Math.floor(Math.random() * 10);
        const direction = Math.random() < 0.5 ? 'horizontal' : 'vertical';
        
        // Estratégia: evitar bordas para navios maiores (aumenta dificuldade de acerto)
        // Para navios maiores que 3, tentar evitar as bordas
        if (length > 3) {
            if ((direction === 'horizontal' && column > 7) || 
                (direction === 'vertical' && row > 7)) {
                continue; // Tentar novamente
            }
        }
        
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
    
    // Se chegou aqui, não conseguiu posicionar após várias tentativas
    throw new Error(`Não foi possível posicionar ${type} após ${maxAttempts} tentativas.`);
}