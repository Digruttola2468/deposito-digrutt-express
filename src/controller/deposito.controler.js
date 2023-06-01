import { con } from "../db.js";

export const getDepositos = async (req, res) => {
  try {
    const [rows] = await con.query("SELECT * FROM digrutt.deposito;");

    res.json(rows);
  } catch (error) {
    return res.status(500).send({ message: "Something wrong" });
  }
};

export const getOneDeposito = async (req, res) => {
  try {
    const [rows] = await con.query(
      "SELECT * FROM digrutt.deposito WHERE id = ?;",
      [req.params.id]
    );

    if (rows.length <= 0) return res.status(404).json({ message: "No existe" });

    res.json(rows);
  } catch (error) {
    return res.status(500).send({ message: "Something wrong" });
  }
};

export const createDeposito = async (req, res) => {
  try {
    const { ubicacion } = req.body;
    const [rows] = await con.query(
      "INSERT INTO digrutt.deposito (ubicacion) VALUES (?) ;",
      [ubicacion]
    );

    res.json({
      id: rows.insertId,
      ubicacion,
    });
  } catch (error) {
    return res.status(500).send({ message: "Something wrong" });
  }
};

export const updateDeposito = async (req, res) => {
    try {
      const { ubicacion } = req.body;
      const id = req.params.id;
      
      const [result] = await con.query(
        "UPDATE digrutt.deposito SET ubicacion = IFNULL(?,ubicacion) WHERE id = ?",
        [ubicacion,id]
      );

      if (result.affectedRows === 0)
        return res.status(404).json({ message: "Color not found" });

      const [rows] = await con.query("SELECT * FROM digrutt.deposito WHERE id = ?", [id]);
      res.json(rows[0]);
    } catch (error) {
      return res.status(500).send({ message: "Something wrong" });
    }
  };

export const deleteDeposito = async (req, res) => {
  try {
    const [result] = await con.query(
      "DELETE FROM `digrutt`.`deposito` WHERE (`id` = ?);",
      [req.params.id]
    );

    if (result.affectedRows <= 0)
      return res.status(404).json({ message: "No se encontro" });

    res.status(200).send({ message: "Eliminado Correctamente" });
  } catch (error) {
    return res.status(500).send({ message: "Something wrong" });
  }
};