import { pool } from './config/database.js';

async function testConnection() {
  try {
    await pool.connect();
    console.log("✅ Banco de dados conectado com sucesso!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Erro ao conectar no banco de dados:", err);
    process.exit(1);
  }
}

testConnection();
