// 🚨 REMOVER ESSA PASTA AO IMPLEMENTAR A IA 🚨
const opponentBoard = {
    grid: [
      [null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, 'porta-avioes', 'porta-avioes', 'porta-avioes', 'porta-avioes'],
      [null, null, null, null, null, null, 'porta-avioes', 'porta-avioes', null, null],
      [null, null, null, null, null, null, null, null, null, null],
      [null, null, 'submarino', null, null, null, null, null, null, null],
      ['navio-de-guerra', 'navio-de-guerra', 'navio-de-guerra', 'navio-de-guerra', null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, 'encouracado', 'encouracado', 'encouracado', null, null, null],
      [null, null, null, null, null, null, null, null, null, null],
      [null, 'encouracado', 'encouracado', 'encouracado', null, null, null, null, null, null]
    ],
    
    ships: [
      {
        type: 'porta-avioes',
        positions: [[1, 6], [1, 7], [1, 8], [1, 9], [2, 6], [2, 7]]
      },
      {
        type: 'navio-de-guerra',
        positions: [[5, 0], [5, 1], [5, 2], [5, 3]]
      },
      {
        type: 'encouracado',
        positions: [[7, 4], [7, 5], [7, 6]]
      },
      {
        type: 'encouracado',
        positions: [[9, 1], [9, 2], [9, 3]]
      },
      {
        type: 'submarino',
        positions: [[4, 2]]
      }
    ],
    
    hits: Array(10).fill(null).map(() => Array(10).fill(false)),
    misses: Array(10).fill(null).map(() => Array(10).fill(false)),
    hitsTotal: 0,
    missesTotal: 0,
    attackTotal: 0
  };
  
  export default opponentBoard;