import { con } from "../db.js";

export const getAllMateriaPrima = async (req, res) => {
  try {
    const [rows] = await con.query("SELECT * FROM materiaPrima;");

    res.json(rows);
  } catch (error) {
    return res.status(500).send({ message: "Something wrong" });
  }
};

export const getOneMateriaPrima = async (req, res) => {
  try {
    const [rows] = await con.query(
      "SELECT * FROM materiaPrima WHERE id = ?;",
      [req.params.id]
    );

    if (rows.length <= 0) return res.status(404).json({ message: "No existe" });

    res.json(rows);
  } catch (error) {
    return res.status(500).send({ message: "Something wrong" });
  }
};

export const createMateriaPrima = async (req, res) => {
  try {
    const { material ,descripcion } = req.body;
    const [rows] = await con.query(
      "INSERT INTO materiaPrima (material,descripcion) VALUES (?,?) ;",
      [material,descripcion]
    );

    res.json({
      id: rows.insertId,
      color,
    });
  } catch (error) {
    return res.status(500).send({ message: "Something wrong" });
  }
};

export const updateMateriaPrima = async (req, res) => {
    try {
      const { material,descripcion } = req.body;
      const id = req.params.id;
      
      const [result] = await con.query(
        `UPDATE materiaPrima SET
            material = IFNULL(?,material),
            descripcion = IFNULL(?,descripcion) 
        WHERE id = ?`,
        [material,descripcion,id]
      );

      if (result.affectedRows === 0)
        return res.status(404).json({ message: "Materia Prima not found" });

      const [rows] = await con.query("SELECT * FROM materiaPrima WHERE id = ?", [id]);
      res.json(rows[0]);
    } catch (error) {
      return res.status(500).send({ message: "Something wrong" });
    }
  };

export const deleteMateriaPrima = async (req, res) => {
  try {
    const [result] = await con.query(
      "DELETE FROM materiaPrima WHERE (`id` = ?);",
      [req.params.id]
    );

    if (result.affectedRows <= 0)
      return res.status(404).json({ message: "No se encontro" });

    res.status(200).send({ message: "Eliminado Correctamente" });
  } catch (error) {
    return res.status(500).send({ message: "Something wrong" });
  }
};