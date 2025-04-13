export function smartBotAttack(board) {
    const { hits, misses } = board;
    const size = 10;

    // 1. Procurar qualquer acerto anterior e tentar seguir naquela direção
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            if (hits[r][c]) {
                const directions = [
                    [0, 1], [0, -1], [1, 0], [-1, 0]
                ];

                for (const [dr, dc] of directions) {
                    let nr = r + dr;
                    let nc = c + dc;

                    // Enquanto dentro do tabuleiro e ainda não foi tentado
                    while (nr >= 0 && nr < size && nc >= 0 && nc < size) {
                        if (!hits[nr][nc] && !misses[nr][nc]) {
                            return [nr, nc];
                        }
                        if (!hits[nr][nc]) break; // parou de acertar
                        nr += dr;
                        nc += dc;
                    }
                }
            }
        }
    }

    // 2. Estratégia tipo "xadrez"
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            if ((r + c) % 2 === 0 && !hits[r][c] && !misses[r][c]) {
                return [r, c];
            }
        }
    }

    // 3. Plano B: varredura total
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            if (!hits[r][c] && !misses[r][c]) {
                return [r, c];
            }
        }
    }

    return null;
}
