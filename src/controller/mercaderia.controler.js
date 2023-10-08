import { con } from "../db.js";

const suminventario = async (idinventario) => {
  try {
    const listaEnviar = [];

    const [rows] = await con.query(
      `SELECT *, 
                    SUM(CASE WHEN idcategoria = 1 THEN stock ELSE 0 END ) as salida,
                    SUM(CASE WHEN idcategoria = 2 THEN stock ELSE 0 END ) as entrada
                    FROM mercaderia 
                    INNER JOIN inventario ON inventario.id = mercaderia.idinventario 
                    WHERE idinventario = ?;`, [idinventario]
    );
    if (rows[0].entrada == null) rows[0].entrada = 0;

    if (rows[0].salida == null) rows[0].salida = 0;

    listaEnviar.push({ ...rows[0] });

    return listaEnviar;
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const getMercaderias = async (req, res) => {
  try {
    const [rows] = await con.query(
      `SELECT mercaderia.id,fecha,stock,proveedor,nombre,descripcion,categoria,idinventario
            FROM mercaderia 
            INNER JOIN inventario on mercaderia.idinventario = inventario.id
            INNER JOIN categoria on mercaderia.idcategoria = categoria.id 
            ORDER BY mercaderia.fecha DESC;`
    );
    const listaEnviar = [];
    for (let i = 0; i < rows.length; i++) {
      const element = new Date(rows[i].fecha);

      const year = element.getFullYear();
      const mounth = element.getMonth() + 1;
      const day = element.getDate();

      const format = `${day}-${mounth}-${year}`;
      listaEnviar.push({ ...rows[i], fecha: format });
    }

    res.json(listaEnviar);
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
      const mounth = element.getMonth() + 1;
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
      const mounth = element.getMonth() + 1;
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
      const mounth = element.getMonth() + 1;
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
      const mounth = element.getMonth() + 1;
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

    try {
      const resultado = await suminventario(idinventario);

      const [result] = await con.query(
        ` UPDATE inventario 
          SET salida  = IFNULL(?,salida),
              entrada = IFNULL(?,entrada)
          WHERE id = ?
        `,
        [
          parseInt(resultado[0].salida),
          parseInt(resultado[0].entrada),
          resultado[0].id,
        ]
      );
      if (result.affectedRows === 0)
        return res.status(404).json({ message: "Inventario not found" });
    } catch (error) {
      console.log(error);
    }

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
    console.log(error);
    return res.status(500).json({ message: "something goes wrong" });
  }
};

export const updateMercaderia = async (req, res) => {
  try {
    const { fecha, factura, stock, proveedor, idinventario, idcategoria } =
      req.body;
    const id = req.params.id;

    const newFecha = fecha.split("-").reverse().join("-");
    const fechaDate = new Date(newFecha);

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

    if (stock != undefined) {
      try {
        const resultado = await suminventario(rows[0].idinventario);

        const [result] = await con.query(
          `UPDATE inventario 
          SET salida  = IFNULL(?,salida),
              entrada = IFNULL(?,entrada)
         WHERE id = ?`,
          [
            parseInt(resultado[0].salida),
            parseInt(resultado[0].entrada),
            resultado[0].id,
          ]
        );
        if (result.affectedRows === 0)
          return res.status(404).json({ message: "Inventario not found" });
      } catch (error) {
        console.log(error);
      }
    }

    const element = new Date(rows[0].fecha);

    const year = element.getFullYear();
    const mounth = element.getMonth() + 1;
    const day = element.getDate();

    const format = `${day}-${mounth}-${year}`;
    res.json({ ...rows[0], fecha: format });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "something goes wrong" });
  }
};

export const deleteMercaderia = async (req, res) => {
  try {
    const [rows] = await con.query("SELECT * FROM mercaderia WHERE id = ?", [
      req.params.id,
    ]);

    const [result] = await con.query(
      "DELETE FROM mercaderia WHERE (`id` = ?);",
      [req.params.id]
    );

    if (result.affectedRows <= 0)
      return res.status(404).json({ message: "No se encontro" });

    try {
      const resultado = await suminventario(rows[0].idinventario);

      const [result] = await con.query(
        `UPDATE inventario 
        SET salida  = IFNULL(?,salida),
            entrada = IFNULL(?,entrada)
       WHERE id = ?`,
        [
          parseInt(resultado[0].salida),
          parseInt(resultado[0].entrada),
          resultado[0].id,
        ]
      );
      if (result.affectedRows === 0)
        return res.status(404).json({ message: "Inventario not found" });
    } catch (error) {
      console.log(error);
    }

    res.status(200).send({ message: "Eliminado Correctamente" });
  } catch (error) {
    return res.status(500).json({ message: "something goes wrong" });
  }
};

export const getMercaderiaWhereIdInventario = async (idinventario) => {
  try {
    const [rows] = await con.query(
      `SELECT * FROM mercaderia WHERE idinventario = ?`,
      [idinventario]
    );

    const listIdMercaderia = [];
    for (let i = 0; i < rows.length; i++) {
      const element = rows[i];
      listIdMercaderia.push(element.id);
    }

    return listIdMercaderia;
  } catch (error) {
    return [];
  }
};
