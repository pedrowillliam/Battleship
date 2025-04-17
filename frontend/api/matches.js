export async function salvarPartida(partida) {
    const token = localStorage.getItem('token');
  
    try {
      const response = await fetch("http://localhost:3000/matches", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(partida)
      });
  
      if (!response.ok) {
        throw new Error("Erro ao salvar partida");
      }
  
      return await response.json();
    } catch (error) {
      console.error("Erro ao salvar partida:", error);
    }
  }  