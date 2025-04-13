import { pool } from "../config/database.js";

pool.on("error", (err, client) => {
  console.error(`Error, ${err}, on idle client ${client}`);
});

const createRankingView = async () => {
    const query = `
      CREATE OR REPLACE VIEW ranking AS
      SELECT
          u.id AS user_id,
          u.username,
          COUNT(m.id) AS total_matches,
          COUNT(m.id) FILTER (WHERE m.result = 'win') AS total_wins,
          SUM(m.score) AS total_score
      FROM users u
      LEFT JOIN matches m ON u.id = m.user_id
      GROUP BY u.id
      HAVING SUM(m.score) IS NOT NULL
      ORDER BY total_score DESC;
    `;
    try {
      await pool.query(query);
      console.log("View 'ranking' criada com sucesso.");
    } catch (error) {
      console.error("Erro ao criar a View 'ranking':", error);
    }
  };  

const getRanking = async () => {
  const query = `SELECT * FROM ranking`;
  try {
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    throw error;
  }
};

export { createRankingView, getRanking };
