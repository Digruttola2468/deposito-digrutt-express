import { con } from "../db.js";

export const getUnidadMedida = async (req, res) => {
  try {
    const [rows] = await con.query("SELECT * FROM unidadMedida;");

    res.json(rows);
  } catch (error) {
    return res.status(500).send({ message: "Something wrong" });
  }
};

export const getOneUnidadMedida = async (req, res) => {
  try {
    const [rows] = await con.query(
      "SELECT * FROM unidadMedida WHERE id = ?;",
      [req.params.id]
    );

    if (rows.length <= 0) return res.status(404).json({ message: "No existe" });

    res.json(rows);
  } catch (error) {
    return res.status(500).send({ message: "Something wrong" });
  }
};

export const createUnidadMedida = async (req, res) => {
  try {
    const { unidad } = req.body;
    const [rows] = await con.query(
      "INSERT INTO unidadMedida (unidad) VALUES (?) ;",
      [unidad]
    );

    res.json({
      id: rows.insertId,
      unidad,
    });
  } catch (error) {
    return res.status(500).send({ message: "Something wrong" });
  }
};

export const updateUnidadMedida = async (req, res) => {
    try {
      const { unidad } = req.body;
      const id = req.params.id;
      
      const [result] = await con.query(
        "UPDATE unidadMedida SET unidad = IFNULL(?,unidad) WHERE id = ?",
        [unidad,id]
      );

      if (result.affectedRows === 0)
        return res.status(404).json({ message: "Unidad Medida not found" });

      const [rows] = await con.query("SELECT * FROM unidadMedida WHERE id = ?", [id]);
      res.json(rows[0]);
    } catch (error) {
      return res.status(500).send({ message: "Something wrong" });
    }
  };

export const deleteUnidadMedida = async (req, res) => {
  try {
    const [result] = await con.query(
      "DELETE FROM unidadMedida WHERE (`id` = ?);",
      [req.params.id]
    );

    if (result.affectedRows <= 0)
      return res.status(404).json({ message: "No se encontro" });

    res.status(200).send({ message: "Eliminado Correctamente" });
  } catch (error) {
    return res.status(500).send({ message: "Something wrong" });
  }
};