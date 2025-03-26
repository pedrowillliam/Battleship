import { pool } from "../config/database.js";
import bcrypt from "bcryptjs";

pool.on("error", (err, client) => {
  console.error(`Error, ${err}, on idle client ${client}`);
});

// Criação da tabela users com UUID
const createTable = async () => {
  const query = `
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";

    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      username VARCHAR(50) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL
    );
  `;
  try {
    await pool.query(query);
    console.log("Tabela 'users' criada com sucesso ou já existe.");
  } catch (error) {
    console.error("Erro ao criar a tabela 'users':", error);
  }
};

const selectUsers = async (columns = "*", clause = "") => {
  const query = `SELECT ${columns} FROM users ${clause}`;
  try {
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    throw error;
  }
};

const selectUserByUsername = async (username) => {
  const query = `SELECT * FROM users WHERE username = $1`;
  try {
    const result = await pool.query(query, [username]);
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

const insertUser = async (username, password) => {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = `
      INSERT INTO users (username, password)
      VALUES ($1, $2)
      RETURNING id, username
    `;
    const result = await pool.query(query, [username, hashedPassword]);
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

const updateUserPassword = async (username, newPassword) => {
  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const query = `
      UPDATE users SET password = $1 WHERE username = $2 RETURNING id, username
    `;
    const result = await pool.query(query, [hashedPassword, username]);
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

const deleteUser = async (username) => {
  const query = `DELETE FROM users WHERE username = $1 RETURNING id, username`;
  try {
    const result = await pool.query(query, [username]);
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

export {
  createTable,
  selectUsers,
  selectUserByUsername,
  insertUser,
  updateUserPassword,
  deleteUser,
};
