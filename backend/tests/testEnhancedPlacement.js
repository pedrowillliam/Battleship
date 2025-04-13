import Board from "../models/board.js";
import assert from "assert";

console.log("Iniciando Testes de Posicionamento Avançado...");

// Função auxiliar para verificar posições de navios no tabuleiro
function verificarPosicionamentoNavio(tabuleiro, posicoes, tipoNavio) {
  for (const [linha, coluna] of posicoes) {
    assert.strictEqual(
      tabuleiro.grid[linha][coluna], 
      tipoNavio, 
      `Posição [${linha},${coluna}] deveria conter ${tipoNavio}`
    );
  }
}

// Teste 1: Posicionamento horizontal básico de navio
function testarPosicionamentoHorizontal() {
  console.log("Teste 1: Posicionamento horizontal básico de navio");
  const tabuleiro = new Board();
  
  tabuleiro.addShip({
    type: "porta-avioes",
    row: 0,
    column: 0,
    direction: "horizontal"
  });
  
  // Verificar células do grid
  for (let i = 0; i < 6; i++) {
    assert.strictEqual(tabuleiro.grid[0][i], "porta-avioes");
  }
  
  // Verificar registro do navio
  assert.strictEqual(tabuleiro.ships.length, 1);
  assert.strictEqual(tabuleiro.ships[0].type, "porta-avioes");
  assert.strictEqual(tabuleiro.ships[0].positions.length, 6);
  
  console.log("✅ Teste 1 passou");
}

// Teste 2: Posicionamento vertical básico de navio
function testarPosicionamentoVertical() {
  console.log("Teste 2: Posicionamento vertical básico de navio");
  const tabuleiro = new Board();
  
  tabuleiro.addShip({
    type: "navio-de-guerra",
    row: 0,
    column: 0,
    direction: "vertical"
  });
  
  // Verificar células do grid
  for (let i = 0; i < 4; i++) {
    assert.strictEqual(tabuleiro.grid[i][0], "navio-de-guerra");
  }
  
  // Verificar registro do navio
  assert.strictEqual(tabuleiro.ships.length, 1);
  assert.strictEqual(tabuleiro.ships[0].type, "navio-de-guerra");
  assert.strictEqual(tabuleiro.ships[0].positions.length, 4);
  
  console.log("✅ Teste 2 passou");
}

// Teste 3: Validação de posicionamento - verificação de limites
function testarValidacaoLimites() {
  console.log("Teste 3: Validação de limites");
  const tabuleiro = new Board();
  
  // Posicionamento horizontal de navio na borda
  try {
    tabuleiro.addShip({
      type: "porta-avioes",
      row: 0,
      column: 5,
      direction: "horizontal"
    });
    assert.fail("Deveria ter lançado um erro para posicionamento fora dos limites");
  } catch (error) {
    assert.strictEqual(
      error.message, 
      "Posição inválida para o navio.",
      "Deveria lançar mensagem de erro correta"
    );
  }
  
  // Posicionamento vertical de navio na borda
  try {
    tabuleiro.addShip({
      type: "porta-avioes",
      row: 5,
      column: 0,
      direction: "vertical"
    });
    assert.fail("Deveria ter lançado um erro para posicionamento fora dos limites");
  } catch (error) {
    assert.strictEqual(
      error.message, 
      "Posição inválida para o navio.",
      "Deveria lançar mensagem de erro correta"
    );
  }
  
  console.log("✅ Teste 3 passou");
}

// Teste 4: Validação de posicionamento - verificação de sobreposição
function testarValidacaoSobreposicao() {
  console.log("Teste 4: Validação de sobreposição");
  const tabuleiro = new Board();
  
  // Posicionar primeiro navio
  tabuleiro.addShip({
    type: "navio-de-guerra",
    row: 3,
    column: 3,
    direction: "horizontal"
  });
  
  // Tentar posicionar segundo navio sobrepondo
  try {
    tabuleiro.addShip({
      type: "submarino",
      row: 3,
      column: 5,
      direction: "vertical"
    });
    assert.fail("Deveria ter lançado um erro para posicionamento sobreposto");
  } catch (error) {
    assert.strictEqual(
      error.message, 
      "Posição inválida para o navio.",
      "Deveria lançar mensagem de erro correta"
    );
  }
  
  console.log("✅ Teste 4 passou");
}

// Teste 5: Validação de limite de navios
function testarValidacaoLimiteNavios() {
  console.log("Teste 5: Validação de limite de navios");
  const tabuleiro = new Board();
  
  // Posicionar primeiro porta-aviões
  tabuleiro.addShip({
    type: "porta-avioes",
    row: 0,
    column: 0,
    direction: "horizontal"
  });
  
  // Tentar posicionar outro porta-aviões (limite é 1)
  try {
    tabuleiro.addShip({
      type: "porta-avioes",
      row: 2,
      column: 0,
      direction: "horizontal"
    });
    assert.fail("Deveria ter lançado um erro por exceder o limite de navios");
  } catch (error) {
    assert.strictEqual(
      error.message.includes("Limite de porta-avioes atingido"),
      true,
      "Deveria lançar mensagem de erro correta sobre o limite"
    );
  }
  
  console.log("✅ Teste 5 passou");
}

// Teste 6: Posicionamento de múltiplos navios
function testarMultiplosNavios() {
  console.log("Teste 6: Posicionamento de múltiplos navios");
  const tabuleiro = new Board();
  
  // Posicionar múltiplos navios
  tabuleiro.addShip({
    type: "porta-avioes",
    row: 0,
    column: 0,
    direction: "horizontal"
  });
  
  tabuleiro.addShip({
    type: "navio-de-guerra",
    row: 2,
    column: 0,
    direction: "horizontal"
  });
  
  tabuleiro.addShip({
    type: "encouracado",
    row: 4,
    column: 0,
    direction: "horizontal"
  });
  
  tabuleiro.addShip({
    type: "encouracado",
    row: 6,
    column: 0,
    direction: "horizontal"
  });
  
  tabuleiro.addShip({
    type: "submarino",
    row: 8,
    column: 0,
    direction: "horizontal"
  });
  
  // Verificar total de navios
  assert.strictEqual(tabuleiro.ships.length, 5);
  
  // Verificar navios por tipo
  const contagemNavios = tabuleiro.ships.reduce((contagem, navio) => {
    contagem[navio.type] = (contagem[navio.type] || 0) + 1;
    return contagem;
  }, {});
  
  assert.strictEqual(contagemNavios["porta-avioes"], 1);
  assert.strictEqual(contagemNavios["navio-de-guerra"], 1);
  assert.strictEqual(contagemNavios["encouracado"], 2);
  assert.strictEqual(contagemNavios["submarino"], 1);
  
  console.log("✅ Teste 6 passou");
}

// Teste 7: Testando o método resetBoard
function testarResetTabuleiro() {
  console.log("Teste 7: Funcionalidade de reset do tabuleiro");
  const tabuleiro = new Board();
  
  // Adicionar alguns navios
  tabuleiro.addShip({
    type: "porta-avioes",
    row: 0,
    column: 0,
    direction: "horizontal"
  });
  
  tabuleiro.addShip({
    type: "submarino",
    row: 2,
    column: 0,
    direction: "horizontal"
  });
  
  // Verificar que os navios foram adicionados
  assert.strictEqual(tabuleiro.ships.length, 2);
  
  // Resetar o tabuleiro
  tabuleiro.resetBoard();
  
  // Verificar que o tabuleiro está vazio
  assert.strictEqual(tabuleiro.ships.length, 0);
  
  // Verificar que o grid foi limpo
  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
      assert.strictEqual(tabuleiro.grid[i][j], null);
    }
  }
  
  console.log("✅ Teste 7 passou");
}

// Executar todos os testes
try {
  testarPosicionamentoHorizontal();
  testarPosicionamentoVertical();
  testarValidacaoLimites();
  testarValidacaoSobreposicao();
  testarValidacaoLimiteNavios();
  testarMultiplosNavios();
  testarResetTabuleiro();
  
  console.log("\n✅✅✅ Todos os testes de posicionamento avançado passaram! ✅✅✅");
} catch (error) {
  console.error("\n❌ Teste falhou:", error);
  process.exit(1);
}