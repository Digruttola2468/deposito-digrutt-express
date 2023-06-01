import { con } from "../db.js";

export const getMercaderias = async (req, res) => {
  try {
    const [rows] = await con.query(
      `SELECT mercaderia.id,fecha,stock,proveedor,nombre,descripcion,categoria,idinventario
            FROM digrutt.mercaderia 
            INNER JOIN digrutt.inventario on digrutt.mercaderia.idinventario = digrutt.inventario.id
            INNER JOIN digrutt.categoria on digrutt.mercaderia.idcategoria = digrutt.categoria.id;`
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
            FROM digrutt.mercaderia 
            INNER JOIN digrutt.inventario on mercaderia.idinventario = digrutt.inventario.id 
            WHERE idcategoria = 2;`
    );
    res.json(rows);
  } catch (error) {
    return res.status(500).json({ message: "something goes wrong" });
  }
};

export const getSalidaMercaderias = async (req, res) => {
  try {
    const [rows] = await con.query(
      `SELECT mercaderia.id,fecha,stock,proveedor,nombre,descripcion,idinventario
            FROM digrutt.mercaderia 
            INNER JOIN digrutt.inventario on digrutt.mercaderia.idinventario = digrutt.inventario.id 
            WHERE idcategoria = 1;`
    );
    res.json(rows);
  } catch (error) {
    return res.status(500).json({ message: "something goes wrong" });
  }
};

export const getEntradaMercaderiasWhereNombre = async (req, res) => {
  try {
    const [rows] = await con.query(
      `SELECT mercaderia.id,fecha,stock,proveedor,nombre,descripcion,idinventario
            FROM digrutt.mercaderia 
            INNER JOIN digrutt.inventario ON digrutt.mercaderia.idinventario = digrutt.inventario.id 
            WHERE nombre = ? and idcategoria = 2`,[req.params.nombre]
    );

    if (rows.length <= 0) return res.status(404).json({ message: "No existe" });

    res.json(rows);
  } catch (error) {
    return res.status(500).json({ message: "something goes wrong" });
  }
};

export const getSalidaMercaderiasWhereNombre = async (req, res) => {
    try {
        const [rows] = await con.query(
          `SELECT mercaderia.id,fecha,stock,proveedor,nombre,descripcion,idinventario
                FROM digrutt.mercaderia 
                INNER JOIN digrutt.inventario ON digrutt.mercaderia.idinventario = digrutt.inventario.id 
                WHERE nombre = ? and idcategoria = 1`,[req.params.nombre]
        );
    
        if (rows.length <= 0) return res.status(404).json({ message: "No existe" });
          
        res.json(rows);
      } catch (error) {
        return res.status(500).json({ message: "something goes wrong" });;
      }
};

export const createMercaderia = async (req,res) => {
  try {
    const { fecha,factura,stock,proveedor,idinventario,idcategoria } = req.body;

    const fechaDate = new Date(fecha);
    
    const [rows] = await con.query(
      'INSERT INTO `digrutt`.`mercaderia` (`factura`, `fecha`, `stock`, `proveedor`, `idcategoria`, `idinventario`) VALUES (?,?,?,?,?,?);',
      [factura,fechaDate,stock,proveedor,idcategoria,idinventario]);
    
      res.send({
        id: rows.insertId,
        fecha,
        factura,
        stock,
        proveedor,
        idcategoria,
        idinventario
      });

  } catch (error) {
    return res.status(500).json({ message: "something goes wrong" });
  }
}


export const updateMercaderia = async (req,res) => {
  try {
    const { fecha,factura,stock,proveedor,idinventario,idcategoria } = req.body;
    const id = req.params.id;

    const fechaDate = new Date(fecha);

    const [result] = await con.query(
      `UPDATE digrutt.mercaderia
        SET factura = IFNULL(?,factura), 
            fecha = IFNULL(?,fecha),
            stock = IFNULL(?,stock),
            proveedor = IFNULL(?,proveedor),
            idcategoria = IFNULL(?,idcategoria),
            idinventario = IFNULL(?,idinventario)
        WHERE id = ?;`,
      [factura,fechaDate,stock,proveedor,idcategoria,idinventario,id]);
      
      if (result.affectedRows === 0)
      return res.status(404).json({ message: "mercaderia not found" });

      const [rows] = await con.query("SELECT * FROM digrutt.mercaderia WHERE id = ?", [id]);
      res.json(rows[0]);

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "something goes wrong" });
  }
}

export const deleteMercaderia = async (req,res) => {
  try {
    const [result] = await con.query('DELETE FROM `digrutt`.`mercaderia` WHERE (`id` = ?);', [req.params.id]);

    if (result.affectedRows <= 0)
      return res.status(404).json({ message: "No se encontro" });

      res.status(200).send({ message: "Eliminado Correctamente" });
  } catch (error) {
    return res.status(500).json({ message: "something goes wrong" });
  }
}