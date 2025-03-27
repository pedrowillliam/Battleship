import { insertUser, selectUserByUsername } from "../models/user.js";
import bcrypt from "bcryptjs";

const registerUser = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Usuário e senha são obrigatórios!" });
  }

  try {
    const userExists = await selectUserByUsername(username);
    if (userExists) {
      return res.status(400).json({ message: "Usuário já existe" });
    }

    const user = await insertUser(username, password);
    res.status(201).json({ message: "Usuário registrado com sucesso!", user });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erro ao registrar usuário!", error: error.message });
  }
};

const loginUser = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Usuário e senha são obrigatórios!" });
  }

  try {
    const user = await selectUserByUsername(username);

    if (!user) {
      return res.status(400).json({ message: "Usuário não encontrado!" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Senha incorreta!" });
    }

    res.status(200).json({
      message: "Login bem-sucedido!",
      user: { id: user.id, username: user.username },
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erro ao fazer login!", error: error.message });
  }
};

export { registerUser, loginUser };
