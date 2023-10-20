import jwt from "jsonwebtoken";
import { con } from "../db.js";
import { compare, hash, hashSync } from "bcrypt";
import { JWT_SECRET } from "../config.js";

const exitsUser = async (gmail) => {
  try {
    const [rows] = await con.query("SELECT * FROM users WHERE gmail = ?;", [
      gmail,
    ]);

    if (rows.length <= 0) return false;
    else return true;
  } catch (error) {
    console.error(error);
    return true;
  }
};

export const createNewUser = async (req, res) => {
  //sign in
  try {
    const { nombre, apellido, password, gmail } = req.body;

    const exitsUserWithGmail = await exitsUser(gmail);

    if (!exitsUserWithGmail) {
      hash(password, 10, async function (err, hash) {
        const [rows] = await con.query(
          "INSERT INTO users (nombre,apellido,password,gmail) VALUES (?,?,?,?) ;",
          [nombre, apellido, hash, gmail]
        );

        const userForToken = {
          id: rows.insertId,
          nombre, 
          apellido, 
          gmail, 
          isAdmin: false,
          isMercaderia: false,
          isInventario: false,
          isOficina: false,
          isProduccion: false,
        };

        const token = jwt.sign(userForToken, JWT_SECRET);

        res.json({
          ...userForToken,
          token,
        });
      });
    } else
      res
        .status(401)
        .send({ message: "this user already exits , plis log in" });
  } catch (error) {
    return res.status(500).send({ message: "Something wrong" });
  }
};

export const iniciarSesion = async (req, res) => {
  const { body } = req;
  const { gmail, password } = body;

  //search
  try {
    const [rows] = await con.query("SELECT * FROM users WHERE gmail = ?;", [
      gmail,
    ]);

    if (rows.length <= 0)
      return res.status(404).json({ message: "invalid user or password" });

    const passwordCorrect = await compare(password, rows[0].password);

    if (!passwordCorrect)
      return res.status(401).json({ error: "invalid user or password" });

    let isAdmin = false;
    if (rows[0].isAdmin != 0) isAdmin = true;

    let isMercaderia = false;
    if (rows[0].is_mercaderia != 0) isMercaderia = true;

    let isInventario = false;
    if (rows[0].is_inventario != 0) isInventario = true;

    let isOficina = false;
    if (rows[0].is_oficina != 0) isOficina = true;

    let isProduccion = false;
    if (rows[0].is_produccion != 0) isProduccion = true;

    const userForToken = {
      id: rows[0].id,
      nombre: rows[0].nombre,
      apellido: rows[0].apellido,
      gmail: rows[0].gmail,
      isAdmin,
      isMercaderia,
      isInventario,
      isOficina,
      isProduccion,
    };

    const token = jwt.sign(userForToken, JWT_SECRET);

    res.json({
      ...userForToken,
      token,
    });
  } catch (error) {
    return res.status(500).send({ message: "Something wrong" });
  }
};
