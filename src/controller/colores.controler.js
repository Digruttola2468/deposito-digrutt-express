import { con } from "../db.js";

export const getColores = async (req, res) => {
  try {
    const [rows] = await con.query("SELECT * FROM digrutt.colores;");

    res.json(rows);
  } catch (error) {
    return res.status(500).send({ message: "Something wrong" });
  }
};

export const getOneColor = async (req, res) => {
  try {
    const [rows] = await con.query(
      "SELECT * FROM digrutt.colores WHERE id = ?;",
      [req.params.id]
    );

    if (rows.length <= 0) return res.status(404).json({ message: "No existe" });

    res.json(rows);
  } catch (error) {
    return res.status(500).send({ message: "Something wrong" });
  }
};

export const createColor = async (req, res) => {
  try {
    const { color } = req.body;
    const [rows] = await con.query(
      "INSERT INTO digrutt.colores (color) VALUES (?) ;",
      [color]
    );

    res.json({
      id: rows.insertId,
      color,
    });
  } catch (error) {
    return res.status(500).send({ message: "Something wrong" });
  }
};

export const updateColor = async (req, res) => {
    try {
      const { color } = req.body;
      const id = req.params.id;
      
      const [result] = await con.query(
        "UPDATE digrutt.colores SET color = IFNULL(?,color) WHERE id = ?",
        [color,id]
      );

      if (result.affectedRows === 0)
        return res.status(404).json({ message: "Color not found" });

      const [rows] = await con.query("SELECT * FROM digrutt.colores WHERE id = ?", [id]);
      res.json(rows[0]);
    } catch (error) {
      return res.status(500).send({ message: "Something wrong" });
    }
  };

export const deleteColor = async (req, res) => {
  try {
    const [result] = await con.query(
      "DELETE FROM `digrutt`.`colores` WHERE (`id` = ?);",
      [req.params.id]
    );

    if (result.affectedRows <= 0)
      return res.status(404).json({ message: "No se encontro" });

    res.status(200).send({ message: "Eliminado Correctamente" });
  } catch (error) {
    return res.status(500).send({ message: "Something wrong" });
  }
};