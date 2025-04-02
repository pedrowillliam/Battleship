document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".login-form");
  const rankingBtn = document.querySelector(".ranking-btn");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = form.querySelector('input[type="text"]').value;
    const password = form.querySelector('input[type="password"]').value;

    if (!username || !password) {
      alert("Preencha todos os campos!");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        console.log("Registro realizado com sucesso", data);
        localStorage.setItem("username", username);
        window.location.href = "../../battleship/game.html";
      } else {
        alert(data.message || "Erro no login!");
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
      alert("Erro na conexão com o servidor.");
    }
  });
  if (rankingBtn) {
    rankingBtn.addEventListener("click", () => {
      window.location.href = "../../../index.html"; 
    });
  }
});
