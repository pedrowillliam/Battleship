import express from "express";
import cors from "cors";
import routes from "./routes.js";
import { createTable } from "./models/user.js";
import { pool } from "./config/database.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use(routes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  pool.connect()
    .then(() => {
      console.log("Banco de dados conectado com sucesso!");
      createTable(); 
    })
    .catch(err => console.error("Erro ao conectar no banco de dados:", err));
});