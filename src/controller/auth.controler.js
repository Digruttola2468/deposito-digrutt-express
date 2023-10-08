import jwt from "jsonwebtoken";
import { con } from "../db.js";
import { compare, hash, hashSync } from "bcrypt";
import {JWT_SECRET} from '../config.js';

const exitsUser = async (username) => {
  try {
    const [rows] = await con.query("SELECT * FROM users WHERE username = ?;", [
      username,
    ]);

    if (rows.length <= 0) return false;
    else return true;
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Something wrong" });
  }
};

export const createNewUser = async (req, res) => {
  //sign in
  try {
    const { username, password, gmail } = req.body;
    if (!exitsUser(username)) {
      hash(password, 10, async function (err, hash) {
        const [rows] = await con.query(
          "INSERT INTO users (username,password,gmail) VALUES (?,?,?) ;",
          [username, hash, gmail]
        );

        res.json({
          id: rows.insertId,
          username,
          password,
          gmail,
        });
      });
    } else
      res
        .status(401)
        .send({ message: "this user already exits , plis log in" });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Something wrong" });
  }
};

export const iniciarSesion = async (req, res) => {
  const { body } = req;
  const { username, password } = body;

  //search
  try {
    const [rows] = await con.query("SELECT * FROM users WHERE username = ?;", [
      username,
    ]);

    if (rows.length <= 0)
      return res.status(404).json({ message: "invalid user or password" });

    const passwordCorrect = await compare(password, rows[0].password);

    if (!passwordCorrect)
      return res.status(401).json({ error: "invalid user or password" });

    const userForToken = {
      id: rows[0].id,
      username,
      gmail: rows[0].gmail,
      isAdmin: rows[0].isAdmin
    };

    const token = jwt.sign(userForToken, JWT_SECRET);

    res.json({
      ...userForToken,
      token
    });
  } catch (error) {
    return res.status(500).send({ message: "Something wrong" });
  }
};
