import { con } from "../db.js";

export const getTypeProductos = async (req, res) => {
  try {
    const [rows] = await con.query("SELECT * FROM digrutt.tipoproducto;");

    res.json(rows);
  } catch (error) {
    return res.status(500).send({ message: "Something wrong" });
  }
};

export const getOneTypeProducto = async (req, res) => {
  try {
    const [rows] = await con.query(
      "SELECT * FROM digrutt.tipoproducto WHERE id = ?;",
      [req.params.id]
    );

    if (rows.length <= 0) return res.status(404).json({ message: "No existe" });

    res.json(rows);
  } catch (error) {
    return res.status(500).send({ message: "Something wrong" });
  }
};

export const createTypeProduct = async (req, res) => {
  try {
    const { nombre } = req.body;
    const [rows] = await con.query(
      "INSERT INTO digrutt.tipoproducto ('tipo') VALUES (?) ;",
      [nombre]
    );

    res.json({
      id: rows.insertId,
      nombre,
    });
  } catch (error) {
    return res.status(500).send({ message: "Something wrong" });
  }
};

export const updateTypeProduct = async (req, res) => {
    try {
      const { nombre } = req.body;
      const id = req.params.id;
      const [result] = await con.query(
        "UPDATE digrutt.tipoproducto SET tipo = IFNULL(?,tipo) WHERE id = ?",
        [nombre,id]
      );

      if (result.affectedRows === 0)
        return res.status(404).json({ message: "tipo producto not found" });

      const [rows] = await con.query("SELECT * FROM digrutt.tipoproducto WHERE id = ?", [id]);
      res.json(rows[0]);
    } catch (error) {
      return res.status(500).send({ message: "Something wrong" });
    }
  };

export const deleteTypeProducto = async (req, res) => {
  try {
    const [result] = await con.query(
      "DELETE FROM `digrutt`.`tipoproducto` WHERE (`id` = ?);",
      [req.params.id]
    );

    if (result.affectedRows <= 0)
      return res.status(404).json({ message: "No se encontro" });

    res.status(200).send({ message: "Eliminado Correctamente" });
  } catch (error) {
    return res.status(500).send({ message: "Something wrong" });
  }
};