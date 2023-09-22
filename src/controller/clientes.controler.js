import { con } from "../db.js";

export const getClientes = async (req, res) => {
  try {
    const [rows] = await con.query("SELECT * FROM clientes;");

    res.json(rows);
  } catch (error) {
    return res.status(500).send({ message: "Something wrong" });
  }
};

export const getOneCliente = async (req, res) => {
  try {
    const [rows] = await con.query(
      "SELECT * FROM clientes WHERE id = ?;",
      [req.params.id]
    );

    if (rows.length <= 0) return res.status(404).json({ message: "No existe" });

    res.json(rows);
  } catch (error) {
    return res.status(500).send({ message: "Something wrong" });
  }
};

export const createCliente = async (req, res) => {
  try {
    const { codigo ,cliente } = req.body;
    const [rows] = await con.query(
      "INSERT INTO clientes (codigo,cliente) VALUES (?,?) ;",
      [codigo,cliente]
    );

    res.json({
      id: rows.insertId,
      color,
    });
  } catch (error) {
    return res.status(500).send({ message: "Something wrong" });
  }
};

export const updateCliente = async (req, res) => {
    try {
      const { cliente,codigo } = req.body;
      const id = req.params.id;
      
      const [result] = await con.query(
        `UPDATE clientes SET
            cliente = IFNULL(?,cliente),
            codigo = IFNULL(?,codigo) 
        WHERE id = ?`,
        [cliente,codigo,id]
      );

      if (result.affectedRows === 0)
        return res.status(404).json({ message: "Cliente not found" });

      const [rows] = await con.query("SELECT * FROM clientes WHERE id = ?", [id]);
      res.json(rows[0]);
    } catch (error) {
      return res.status(500).send({ message: "Something wrong" });
    }
  };

export const deleteCliente = async (req, res) => {
  try {
    const [result] = await con.query(
      "DELETE FROM clientes WHERE (`id` = ?);",
      [req.params.id]
    );

    if (result.affectedRows <= 0)
      return res.status(404).json({ message: "No se encontro" });

    res.status(200).send({ message: "Eliminado Correctamente" });
  } catch (error) {
    return res.status(500).send({ message: "Something wrong" });
  }
};