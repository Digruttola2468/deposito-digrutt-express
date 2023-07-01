import { con } from "../db.js";

export const getAllInventario = async (req, res) => {
  try {
    const [rows] = await con.query("SELECT * FROM inventario;");

    res.json(rows);
  } catch (error) {
    return res.status(500).send({ message: "Something wrong" });
  }
};

export const getAllInventarioSelect = async () => {
  try {
    const [rows] = await con.query("SELECT nombre,descripcion,entrada,salida FROM inventario;");
    return rows;
  } catch (error) {
    return [];
  }
}

export const getOneInventario = async (req, res) => {
  try {
    const [rows] = await con.query("SELECT * FROM inventario WHERE id = ?;", [
      req.params.id,
    ]);

    if (rows.length <= 0) return res.status(404).json({ message: "No existe" });

    res.json(rows);
  } catch (error) {
    return res.status(500).send({ message: "Something wrong" });
  }
};

export const createInventario = async (req, res) => {
  try {
    const { nombre, precio, descripcion, idcolor, idtipoproducto } = req.body;
    const [rows] = await con.query(
      "INSERT INTO inventario (nombre,precio,descripcion,idcolor,idtipoproducto) VALUES (?,?,?,?,?) ;",
      [nombre, precio, descripcion, idcolor, idtipoproducto]
    );

    res.json({
      id: rows.insertId,
      nombre,
      precio,
      descripcion,
      idcolor,
      idtipoproducto,
    });
  } catch (error) {
    return res.status(500).send({ message: "Something wrong" });
  }
};

export const updateInventario = async (req, res) => {
  try {
    const { nombre, precio, descripcion, idcolor, idtipoproducto } = req.body;
    const id = req.params.id;

    const [result] = await con.query(
      `UPDATE inventario 
            SET nombre = IFNULL(?,nombre),
                precio = IFNULL(?,precio),
                descripcion = IFNULL(?,descripcion),
                idcolor = IFNULL(?,idcolor),
                idtipoproducto = IFNULL(?,idtipoproducto)
            WHERE id = ?`,
      [nombre, precio, descripcion, idcolor, idtipoproducto, id]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Inventario not found" });

    const [rows] = await con.query("SELECT * FROM inventario WHERE id = ?", [
      id,
    ]);
    res.json(rows[0]);
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Something wrong" });
  }
};

export const deleteInventario = async (req, res) => {
  try {
    const [result] = await con.query(
      "DELETE FROM inventario WHERE (`id` = ?);",
      [req.params.id]
    );

    if (result.affectedRows <= 0)
      return res.status(404).json({ message: "No se encontro" });

    res.status(200).send({ message: "Eliminado Correctamente" });
  } catch (error) {
    return res.status(500).send({ message: "Something wrong" });
  }
};

export const getInventariosSelectNombres = async (req, res) => {
  try {
    const [rows] = await con.query(
      "SELECT id,nombre,descripcion FROM inventario;"
    );
    res.json(rows);
  } catch (error) {
    return res.status(500).send({ message: "Something wrong" });
  }
};