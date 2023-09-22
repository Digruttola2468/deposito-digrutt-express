import { con } from "../db.js";

const TABLE = "productos";

export const getProductos = async (req, res) => {
  try {
    const [rows] = await con.query(`SELECT * FROM ${TABLE};`);

    res.json(rows);
  } catch (error) {
    return res.status(500).send({ message: "Something wrong" });
  }
};

export const getOneProducto = async (req, res) => {
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

export const createProducto = async (req, res) => {
  try {
    const { produco } = req.body;
    const [rows] = await con.query(
        `INSERT INTO ${TABLE} (produco) VALUES (?) ;`,
      [produco]
    );

    res.json({
      id: rows.insertId,
      color,
    });
  } catch (error) {
    return res.status(500).send({ message: "Something wrong" });
  }
};

export const updateProducto = async (req, res) => {
    try {
      const { produco } = req.body;
      const id = req.params.id;
      
      const [result] = await con.query(
        `UPDATE ${TABLE} SET
            produco = IFNULL(?,produco)
        WHERE id = ?`,
        [produco,id]
      );

      if (result.affectedRows === 0)
        return res.status(404).json({ message: "Produco not found" });

      const [rows] = await con.query(`SELECT * FROM ${TABLE} WHERE id = ?`, [id]);
      res.json(rows[0]);
    } catch (error) {
      return res.status(500).send({ message: "Something wrong" });
    }
  };

export const deleteProducto = async (req, res) => {
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