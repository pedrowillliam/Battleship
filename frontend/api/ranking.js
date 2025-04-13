export async function carregarRanking() {
    try {
      const response = await fetch("http://localhost:3000/ranking");
      const data = await response.json();
  
      const rankingList = document.getElementById("rankingList");
      rankingList.innerHTML = "";
  
      if (data.ranking && data.ranking.length > 0) {
        const top10 = data.ranking
          .filter(jogador => jogador.total_score !== null)
          .slice(0, 10);
  
        if (top10.length === 0) {
          rankingList.innerHTML = "<li>Nenhum jogador com pontuação válida encontrado.</li>";
          return;
        }
  
        top10.forEach((jogador, index) => {
          const li = document.createElement("li");
          const posicaoClass = index < 3 ? "posicao destaque" : "posicao";
  
          li.innerHTML = `
            <span class="${posicaoClass}">${index + 1}</span>
            <span class="nome">${jogador.username}</span>
            <span class="pontuacao">${jogador.total_score}</span>
          `;
  
          rankingList.appendChild(li);
        });
      } else {
        rankingList.innerHTML = "<li>Nenhum ranking encontrado.</li>";
      }
  
    } catch (error) {
      console.error("Erro ao carregar o ranking:", error);
      document.getElementById("rankingList").innerHTML = "<li>Erro ao carregar ranking.</li>";
    }
  }
  
  carregarRanking();
  