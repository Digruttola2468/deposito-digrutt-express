import { con } from "../db.js";

const TABLE = "motivoMaquinaParada";

export const getCodMaquinaParada = async (req, res) => {
  try {
    const [rows] = await con.query(`SELECT * FROM ${TABLE};`);

    res.json(rows);
  } catch (error) {
    return res.status(500).send({ message: "Something wrong" });
  }
};

export const getOneCodMaquinaParada = async (req, res) => {
  try {
    const [rows] = await con.query(
        `SELECT * FROM ${TABLE} WHERE id = ?;`,
      [req.params.id]
    );

    if (rows.length <= 0) return res.status(404).json({ message: "No existe" });

    res.json(rows);
  } catch (error) {
    return res.status(500).send({ message: "Something wrong" });
  }
};

export const createCodMaquinaParada = async (req, res) => {
  try {
    const { cod_causa ,descripcion } = req.body;
    const [rows] = await con.query(
        `INSERT INTO ${TABLE} (cod_causa,descripcion) VALUES (?,?) ;`,
      [cod_causa,descripcion]
    );

    res.json({
      id: rows.insertId,
      color,
    });
  } catch (error) {
    return res.status(500).send({ message: "Something wrong" });
  }
};

export const updateCodMaquinaParada = async (req, res) => {
    try {
      const { cod_causa,descripcion } = req.body;
      const id = req.params.id;
      
      const [result] = await con.query(
        `UPDATE ${TABLE} SET
            cod_causa = IFNULL(?,cod_causa),
            descripcion = IFNULL(?,descripcion) 
        WHERE id = ?`,
        [cod_causa,descripcion,id]
      );

      if (result.affectedRows === 0)
        return res.status(404).json({ message: "Cod Maquina Parada not found" });

      const [rows] = await con.query(`SELECT * FROM ${TABLE} WHERE id = ?`, [id]);
      res.json(rows[0]);
    } catch (error) {
      return res.status(500).send({ message: "Something wrong" });
    }
  };

export const deleteCodMaquinaParada = async (req, res) => {
  try {
    const [result] = await con.query(
      `DELETE FROM ${TABLE} WHERE ('id' = ?);`,
      [req.params.id]
    );

    if (result.affectedRows <= 0)
      return res.status(404).json({ message: "No se encontro" });

    res.status(200).send({ message: "Eliminado Correctamente" });
  } catch (error) {
    return res.status(500).send({ message: "Something wrong" });
  }
};