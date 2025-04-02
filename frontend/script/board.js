//Lógica do tabuleiro (posicionamento aleatorio dos navios, grid 10x10, etc)

import { resetGame } from "../api/game.js";

document.addEventListener("DOMContentLoaded", () => {
  loadComponent("../components/board.html", "board-component");
});

document.addEventListener("DOMContentLoaded", () => {
  loadComponent("../components/board.html", "board-component-two");
});

function loadComponent(url, elementId, callback) {
  fetch(url)
    .then((response) => response.text())
    .then((data) => {
      document.getElementById(elementId).innerHTML = data;
      if (callback) callback();
    })
    .catch((error) => console.error(error));
}

document.getElementById("surrender-btn").addEventListener("click", () => {
  localStorage.removeItem("username");
  resetGame();
  window.location.href = "../../index.html";
});

document.addEventListener("DOMContentLoaded", () => {
  const username = localStorage.getItem("username");
  if (!username) {
    window.location.href = "../../index.html";
    return;
  } 
  document.querySelector(".half.blue .username").textContent = '@' + username;
});