import { con } from "../db.js";
import { getMercaderiaWhereIdInventario } from "./mercaderia.controler.js";

export const getAllInventario = async (req, res) => {
  try {
    const [rows] = await con.query(`
    SELECT inventario.id,nombre,precio,descripcion,idcolor,idtipoproducto,entrada,salida,pesoUnidad,stockCaja,unidad FROM inventario 
    INNER JOIN unidadMedida 
      on unidadMedida.id = inventario.idUnidadMedida ORDER BY inventario.id ASC`);

    res.json(rows);
  } catch (error) {
    return res.status(500).send({ message: "Something wrong" });
  }
};

export const getAllInventarioSelect = async (req, res) => {
  try {
    const [rows] = await con.query(
      `SELECT * FROM inventario ORDER BY inventario.id ASC;`
    );
    res.json(rows);
  } catch (error) {
    return res.status(500).send({ message: "Something wrong" });;
  }
};

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
    const { nombre, precio, descripcion, idcolor, idtipoproducto,pesoUnidad,stockCaja,idUnidadMedida,idCliente } = req.body;
    const [rows] = await con.query(
      "INSERT INTO inventario (nombre,precio,descripcion,idcolor,idtipoproducto,pesoUnidad,stockCaja,idUnidadMedida,idCliente) VALUES (?,?,?,?,?,?,?,?,?) ;",
      [nombre, precio, descripcion, idcolor, idtipoproducto, pesoUnidad,stockCaja, idUnidadMedida,idCliente]
    );

    res.json({
      id: rows.insertId,
      nombre,
      precio,
      descripcion,
      idcolor,
      idtipoproducto,
      pesoUnidad,
      stockCaja, 
      idUnidadMedida,
      idCliente
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Something wrong" });
  }
};

export const updateInventario = async (req, res) => {
  try {
    const { nombre, precio, descripcion, idcolor, idtipoproducto, pesoUnidad,stockCaja, idUnidadMedida, idCliente } = req.body;
    const id = req.params.id;

    const [result] = await con.query(
      `UPDATE inventario 
            SET nombre = IFNULL(?,nombre),
                precio = IFNULL(?,precio),
                descripcion = IFNULL(?,descripcion),
                idcolor = IFNULL(?,idcolor),
                idtipoproducto = IFNULL(?,idtipoproducto),
                pesoUnidad = IFNULL(?,pesoUnidad),
                stockCaja = IFNULL(?,stockCaja), 
                idUnidadMedida = IFNULL(?,idUnidadMedida),
                idCliente = IFNULL(?,idCliente)
            WHERE id = ?`,
      [nombre, precio, descripcion, idcolor, idtipoproducto, pesoUnidad,stockCaja, idUnidadMedida, idCliente, id]
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

const deleteMercaderiaWhereIdinventario = async (idinventario) => {
  const list = await getMercaderiaWhereIdInventario(idinventario);

  if (list != []) {
    for (let i = 0; i < list.length; i++) {
      const id = list[i];

      const [result] = await con.query(
        "DELETE FROM mercaderia WHERE (`id` = ?);",
        [id]
      );
    }
  }
};

export const deleteInventario = async (req, res) => {
  try {
    await deleteMercaderiaWhereIdinventario(req.params.id);

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
      "SELECT id,nombre,descripcion,idCliente FROM inventario;"
    );
    res.json(rows);
  } catch (error) {
    return res.status(500).send({ message: "Something wrong" });
  }
};
