import express from "express";
import cors from "cors";
import routes from "./routes.js";
import { createTable as createUserTable } from "./models/user.js";
import { createTable as createMatchTable } from "./models/match.js"; // Agora importando corretamente a função
import { pool } from "./config/database.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use(routes);

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  
  // Conexão ao banco de dados e criação das tabelas
  pool.connect()
    .then(() => {
      console.log("Banco de dados conectado com sucesso!");
      
      // Criação das tabelas de usuários e partidas
      createUserTable();
      createMatchTable();  // Garantir que a tabela de partidas também seja criada
    })
    .catch(err => console.error("Erro ao conectar no banco de dados:", err));
});
