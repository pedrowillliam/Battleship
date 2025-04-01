document.addEventListener("DOMContentLoaded", () => {
    const username = localStorage.getItem("username");
  
    if (username) {
      console.log("Usuário encontrado no armazenamento local:", username);
    } else {
      console.log("Nenhum usuário logado. Aguardando clique para redirecionar.");
    }
  });
  
  function iniciarJogo() {
    // Independentemente de encontrar ou não um nome de usuário,
    // o usuário será redirecionado para a página de login.
    window.location.href = "/Battleship/frontend/battleship/login/login.html"; 
  }
  