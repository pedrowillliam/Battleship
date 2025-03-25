import { pool } from "../config/database.js";

// Criação da tabela
export const createTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS matches (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,  -- Alterado para UUID
      score INT,
      result VARCHAR(4),
      duration INT,
      total_hits INT,
      total_misses INT,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
  `;
  try {
    await pool.query(query);
    console.log("Tabela 'matches' criada com sucesso.");
  } catch (error) {
    console.error("Erro ao criar tabela 'matches':", error);
  }
};

// Funções CRUD
export const insertMatch = async (user_id, score, result, duration, total_hits, total_misses) => {
  const query = `
    INSERT INTO matches (user_id, score, result, duration, total_hits, total_misses)
    VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;
  `;
  const { rows } = await pool.query(query, [user_id, score, result, duration, total_hits, total_misses]);
  return rows[0];
};

export const selectAllMatches = async () => {
  const { rows } = await pool.query("SELECT * FROM matches;");
  return rows;
};

export const selectMatchById = async (id) => {
  const { rows } = await pool.query("SELECT * FROM matches WHERE id = $1;", [id]);
  return rows[0];
};

export const updateMatch = async (id, score, result, duration, total_hits, total_misses) => {
  const query = `
    UPDATE matches
    SET score = $1, result = $2, duration = $3, total_hits = $4, total_misses = $5
    WHERE id = $6 RETURNING *;
  `;
  const { rows } = await pool.query(query, [score, result, duration, total_hits, total_misses, id]);
  return rows[0];
};

export const deleteMatch = async (id) => {
  const { rows } = await pool.query("DELETE FROM matches WHERE id = $1 RETURNING *;", [id]);
  return rows[0];
};
