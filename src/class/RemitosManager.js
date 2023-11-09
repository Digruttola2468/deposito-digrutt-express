import { con } from "../db.js";

import { mercaderiaManager } from "../index.js";

export default class RemitosManager {
  constructor() {
    this.listRemitos = [];
  }

  async newRemito(object) {
    const { fecha, numRemito, idCliente, nroOrden, valorDeclarado, products } =
      object;

    if (fecha && numRemito && idCliente && valorDeclarado && products)
      return { error: { message: "Campos Vacios" } };

    ///////////////
    //Validar Campos
    if (fecha == null || fecha == "")
      return { error: { message: "Campo Fecha Vacio" } };

    if (numRemito == null || numRemito == "")
      return { error: { message: "Campo Stock Vacio" } };

    if (idCliente == null || idCliente == "")
      return { error: { message: "Campo Cliente Vacio" } };

    if (products == null || products == [])
      return { error: { message: "Campo Products Vacio" } };

    if (valorDeclarado != null)
      if (!Number.isInteger(valorDeclarado))
        return {
          error: { message: "Campo del valor Declarado no es numerico" },
        };

    const numRemitoInteger = parseInt(numRemito);

    const idClienteInteger = parseInt(idCliente);

    if (!Number.isInteger(numRemitoInteger))
      return { error: { message: "Campo Remito No es numerico" } };

    if (!Number.isInteger(idClienteInteger))
      return { error: { message: "Algo paso con el cliente" } };

    if (!Array.isArray(products))
      return { error: { message: "Algo paso con la products" } };

    const fechaDate = new Date(fecha);

    if (Number.isNaN(fechaDate.getDate()))
      return { error: { message: "Error en el formato de la Fecha" } };
    //////////////

    let idRemito = null;
    try {
      const [rows] = await con.query(
        "INSERT INTO remitos (`fecha`,`num_remito`,`idCliente`,`num_orden`,`total`) VALUES (?,?,?,?,?);",
        [fechaDate, numRemito, idCliente, nroOrden, parseFloat(valorDeclarado)]
      );
      idRemito = rows.insertId;

      //Agregar todos los products como salida
      try {
        if (idRemito != null) {
          //verificamos si el array esta vacia
          if (products.length > 0) {
            for (let i = 0; i < products.length; i++) {
              const element = products[i];

              const enviar = {
                fecha: fechaDate,
                stock: element.stock,
                idinventario: element.idProduct,
                idcategoria: 1,
                idremito: idRemito,
              };
              const { error } = await mercaderiaManager.createMercaderia(
                enviar
              );

              if (error != null)
                return {
                  error: { message: "Ocurrio un error en agregar mercaderia" },
                };
            }

            return { data: { message: "Operacion exitosa" } };
          }
        }
      } catch (e) {
        console.error(e);
        return { error: { message: "Something wrong" } };
      }
    } catch (e) {
      console.error(e);
      return { error: { message: "Something wrong" } };
    }
  }
}
