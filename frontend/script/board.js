//Lógica do tabuleiro (posicionamento aleatorio dos navios, grid 10x10, etc)

document.querySelectorAll(".cell").forEach((cell) => {
  cell.addEventListener("click", () => {
    cell.classList.toggle("miss");
  });
});