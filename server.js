const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const config = require("./config.js"); // Importar o arquivo de configuração

// Configuração do banco de dados usando as credenciais do config.js
const pool = new Pool(config.db);

const app = express();
app.use(cors());
app.use(express.json());

// Rota principal
app.get("/", (req, res) => {
    res.send("Servidor do Batalha Naval está rodando! ⚓🚢");
});

// Rota para testar a conexão com o banco de dados
app.get("/test-db", async (req, res) => {
    try {
        const client = await pool.connect();
        const result = await client.query("SELECT NOW();");
        client.release();
        res.send({
            message: "Conexão com o banco de dados bem-sucedida!",
            data: result.rows[0],
        });
    } catch (err) {
        res.status(500).send({
            message: "Erro ao conectar ao banco de dados",
            error: err.message,
        });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

// Testar a conexão com o banco de dados ao iniciar o servidor
pool.connect()
    .then(() => console.log("Banco de dados conectado com sucesso!"))
    .catch(err => console.error("Erro ao conectar no banco de dados:", err));