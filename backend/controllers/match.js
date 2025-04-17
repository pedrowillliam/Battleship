import { insertMatch, selectAllMatches, selectMatchById, updateMatch, deleteMatch } from "../models/match.js";

export const createMatch = async (req, res) => {
  try {
    const userId = req.user.id;
    const { score, result, duration, total_hits, total_misses } = req.body;

    const match = await insertMatch(userId, score, result, duration, total_hits, total_misses);
    res.status(201).json(match);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllMatches = async (req, res) => {
  const matches = await selectAllMatches();
  res.json(matches);
};

export const getMatchById = async (req, res) => {
  const match = await selectMatchById(req.params.id);
  match ? res.json(match) : res.status(404).json({ message: "Match not found" });
};

export const updateMatchById = async (req, res) => {
  const match = await updateMatch(req.params.id, ...Object.values(req.body));
  match ? res.json(match) : res.status(404).json({ message: "Match not found" });
};

export const deleteMatchById = async (req, res) => {
  const match = await deleteMatch(req.params.id);
  match ? res.json({ message: "Match deleted" }) : res.status(404).json({ message: "Match not found" });
};
