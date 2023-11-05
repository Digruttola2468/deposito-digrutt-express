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
                    WHERE idinventario = ?;`,
      [idinventario]
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

export const getFacturaNegro = async (req, res) => {
  try {
    const [rows] = await con.query('SELECT * FROM facturaNegro');
    
    return res.json(rows);
  } catch (error) {
    return res.status(500).send({ message: "Something wrong" });
  }
};

export const newFacturaNegro = async (req, res) => {
  const { fecha, nro_envio, products, idCliente, valorDeclarado } = req.body;

  /*if (fecha || numRemito || idCliente || valorDeclarado || products)
    return res.status(404).json({ message: "Error campos vacios" });*/

  const fechaDate = new Date(fecha);

  let idFacturaNegro = null;
  try {
    const [rows] = await con.query(
      "INSERT INTO facturaNegro (`nro_envio`,`idCliente`,`valorDeclarado`) VALUES (?,?,?);",
      [parseInt(nro_envio),idCliente,parseFloat(valorDeclarado)]
    );
    idFacturaNegro = rows.insertId;

    //Agregar todos los products como salida
    try {
      if (idFacturaNegro != null) {
        //verificamos si el array esta vacia
        if (products.length > 0) {
          for (let i = 0; i < products.length; i++) {
            const element = products[i];

            //Agregar a mercaderia
            const [rows] = await con.query(
              "INSERT INTO mercaderia (`fecha`, `stock`, `idcategoria`, `idinventario`, `idFacturaNegro`) VALUES (?,?,?,?,?);",
              [fechaDate, element.stock, 1, element.idProduct, idFacturaNegro]
            );

            //Update Inventario
            const resultado = await suminventario(element.idProduct);

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
          }

          return res.json({ menssage: "success" });
        }
      }
    } catch (error) {
      console.log(error);
      return res.status(500).send({ message: "Something wrong" });
    }
  } catch (error) {
    return res.status(500).send({ message: "Something wrong" });
  }
};
