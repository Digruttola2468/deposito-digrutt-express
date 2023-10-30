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

export const getRemitos = (req, res) => {
  try {
  } catch (error) {
    return res.status(500).send({ message: "Something wrong" });
  }
};

export const getRemiteFromMercaderiaByIdRemito = (req, res) => {
  try {
  } catch (error) {
    return res.status(500).send({ message: "Something wrong" });
  }
};

export const newRemito = async (req, res) => {
  const { fecha, numRemito, idCliente, nroOrden, valorDeclarado, products } =
    req.body;

  /*if (fecha || numRemito || idCliente || valorDeclarado || products)
    return res.status(404).json({ message: "Error campos vacios" });*/

  const fechaDate = new Date(fecha);

  let idRemito = null;
  try {
    const [rows] = await con.query(
      "INSERT INTO remitos (`fecha`,`num_remito`,`idCliente`,`num_orden`,`total`) VALUES (?,?,?,?,?);",
      [
        fechaDate,
        numRemito,
        idCliente,
        nroOrden,
        parseFloat(valorDeclarado),
      ]
    );
    idRemito = rows.insertId;

    //Agregar todos los products como salida
    try {
      if (idRemito != null) {
        //verificamos si el array esta vacia
        if (products.length > 0) {
          for (let i = 0; i < products.length; i++) {
            const element = products[i];

            //Agregar a mercaderia
            const [rows] = await con.query(
              "INSERT INTO mercaderia (`fecha`, `stock`, `idcategoria`, `idinventario`, `idremito`) VALUES (?,?,?,?,?);",
              [fechaDate, element.stock, 1, element.idProduct, idRemito]
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
