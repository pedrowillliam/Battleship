import cors from "cors";
import express from "express";
import { pool } from "./config/database.js";
import { createTable as createMatchTable } from "./models/match.js";
import { createRankingView } from "./models/ranking.js";
import { createTable as createUserTable } from "./models/user.js";
import routes from "./routes.js";

const app = express();  
app.use(cors());  
app.use(express.json());  
app.use(routes);  

const PORT = 3000;  

app.listen(PORT, async () => {  
  console.log(`Servidor rodando na porta ${PORT}`);  

  try {  
    await pool.query("SELECT 1"); // teste simples de conexão  
    console.log("Banco de dados conectado com sucesso!");  

    // Ordem correta de criação  
    await createUserTable();       // Primeiro: tabela users  
    await createMatchTable();      // Depois: tabela matches (depende de users)  
    await createRankingView();     // Por fim: view ranking (depende das duas)  

    console.log("Todas as tabelas e views criadas com sucesso!");  
  } catch (err) {  
    console.error("Erro ao conectar no banco de dados:", err.message || err);  
  }  
});