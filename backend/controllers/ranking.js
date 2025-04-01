import { getRanking } from "../models/ranking.js";

const fetchRanking = async (req, res) => {
  try {
    const ranking = await getRanking();

    if (!ranking || ranking.length === 0) {
      return res.status(404).json({ message: "Nenhum ranking encontrado!" });
    }

    res.status(200).json({ message: "Ranking obtido com sucesso!", ranking });
  } catch (error) {
    console.error("Erro ao buscar o ranking:", error);
    res
      .status(500)
      .json({ message: "Erro ao buscar o ranking!", error: error.message });
  }
};

export { fetchRanking };
