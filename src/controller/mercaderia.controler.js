import { con } from "../db.js";

export const getMercaderias = async (req, res) => {
  try {
    const [rows] = await con.query(
      `SELECT mercaderia.id,fecha,stock,proveedor,nombre,descripcion,categoria,idinventario
            FROM mercaderia 
            INNER JOIN inventario on mercaderia.idinventario = inventario.id
            INNER JOIN categoria on mercaderia.idcategoria = categoria.id;`
    );
    res.json(rows);
  } catch (error) {
    return res.status(500).json({ message: "something goes wrong" });
  }
};

export const getEntradaMercaderias = async (req, res) => {
  try {
    const [rows] = await con.query(
      `SELECT mercaderia.id,fecha,stock,proveedor,nombre,descripcion,idinventario
            FROM mercaderia 
            INNER JOIN inventario on mercaderia.idinventario = inventario.id 
            WHERE idcategoria = 2;`
    );

    const listaEnviar = [];

    for (let i = 0; i < rows.length; i++) {
      const element = new Date(rows[i].fecha);

      const year = element.getFullYear();
      const mounth = (element.getMonth() + 1);
      const day = element.getDate();

      const format = `${day}-${mounth}-${year}`;
      listaEnviar.push({ ...rows[i], fecha: format });
    }

    res.json(listaEnviar);
  } catch (error) {
    return res.status(500).json({ message: "something goes wrong" });
  }
};

export const getSalidaMercaderias = async (req, res) => {
  try {
    const [rows] = await con.query(
      `SELECT mercaderia.id,fecha,stock,proveedor,nombre,descripcion,idinventario
            FROM mercaderia 
            INNER JOIN inventario on mercaderia.idinventario = inventario.id 
            WHERE idcategoria = 1;`
    );
    const listaEnviar = [];

    for (let i = 0; i < rows.length; i++) {
      const element = new Date(rows[i].fecha);

      const year = element.getFullYear();
      const mounth = (element.getMonth() + 1);
      const day = element.getDate();

      const format = `${day}-${mounth}-${year}`;
      listaEnviar.push({ ...rows[i], fecha: format });
    }

    res.json(listaEnviar);
  } catch (error) {
    return res.status(500).json({ message: "something goes wrong" });
  }
};

export const getEntradaMercaderiasWhereNombre = async (req, res) => {
  try {
    const [rows] = await con.query(
      `SELECT mercaderia.id,fecha,stock,proveedor,nombre,descripcion,idinventario
            FROM mercaderia 
            INNER JOIN inventario ON mercaderia.idinventario = inventario.id 
            WHERE nombre = ? and idcategoria = 2`,
      [req.params.nombre]
    );

    if (rows.length <= 0) return res.status(404).json({ message: "No existe" });

    const listaEnviar = [];

    for (let i = 0; i < rows.length; i++) {
      const element = new Date(rows[i].fecha);

      const year = element.getFullYear();
      const mounth = (element.getMonth() + 1);
      const day = element.getDate();

      const format = `${day}-${mounth}-${year}`;
      listaEnviar.push({ ...rows[i], fecha: format });
    }

    res.json(listaEnviar);
  } catch (error) {
    return res.status(500).json({ message: "something goes wrong" });
  }
};

export const getSalidaMercaderiasWhereNombre = async (req, res) => {
  try {
    const [rows] = await con.query(
      `SELECT mercaderia.id,fecha,stock,proveedor,nombre,descripcion,idinventario
                FROM mercaderia 
                INNER JOIN inventario ON mercaderia.idinventario = inventario.id 
                WHERE nombre = ? and idcategoria = 1`,
      [req.params.nombre]
    );

    if (rows.length <= 0) return res.status(404).json({ message: "No existe" });

    const listaEnviar = [];

    for (let i = 0; i < rows.length; i++) {
      const element = new Date(rows[i].fecha);

      const year = element.getFullYear();
      const mounth = (element.getMonth() + 1);
      const day = element.getDate();

      const format = `${day}-${mounth}-${year}`;
      listaEnviar.push({ ...rows[i], fecha: format });
    }

    res.json(listaEnviar);
  } catch (error) {
    return res.status(500).json({ message: "something goes wrong" });
  }
};

export const createMercaderia = async (req, res) => {
  try {
    const { fecha, factura, stock, proveedor, idinventario, idcategoria } =
      req.body;

    const fechaDate = new Date(fecha);

    const [rows] = await con.query(
      "INSERT INTO mercaderia (`factura`, `fecha`, `stock`, `proveedor`, `idcategoria`, `idinventario`) VALUES (?,?,?,?,?,?);",
      [factura, fechaDate, stock, proveedor, idcategoria, idinventario]
    );

    res.send({
      id: rows.insertId,
      fecha,
      factura,
      stock,
      proveedor,
      idcategoria,
      idinventario,
    });
  } catch (error) {
    return res.status(500).json({ message: "something goes wrong" });
  }
};

export const updateMercaderia = async (req, res) => {
  try {
    const { fecha, factura, stock, proveedor, idinventario, idcategoria } =
      req.body;
    const id = req.params.id;

    const fechaDate = new Date(fecha);

    const [result] = await con.query(
      `UPDATE mercaderia
        SET factura = IFNULL(?,factura), 
            fecha = IFNULL(?,fecha),
            stock = IFNULL(?,stock),
            proveedor = IFNULL(?,proveedor),
            idcategoria = IFNULL(?,idcategoria),
            idinventario = IFNULL(?,idinventario)
        WHERE id = ?;`,
      [factura, fechaDate, stock, proveedor, idcategoria, idinventario, id]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "mercaderia not found" });

    const [rows] = await con.query("SELECT * FROM mercaderia WHERE id = ?", [
      id,
    ]);

    const element = new Date(rows[0].fecha);

    const year = element.getFullYear();
    const mounth = (element.getMonth() + 1);
    const day = element.getDate();

    const format = `${day}-${mounth}-${year}`;
    res.json({...rows[0], fecha: format});
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "something goes wrong" });
  }
};

export const deleteMercaderia = async (req, res) => {
  try {
    const [result] = await con.query(
      "DELETE FROM mercaderia WHERE (`id` = ?);",
      [req.params.id]
    );

    if (result.affectedRows <= 0)
      return res.status(404).json({ message: "No se encontro" });

    res.status(200).send({ message: "Eliminado Correctamente" });
  } catch (error) {
    return res.status(500).json({ message: "something goes wrong" });
  }
};
