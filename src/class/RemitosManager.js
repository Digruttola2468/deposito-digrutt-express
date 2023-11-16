import { con } from "../db.js";

import { mercaderiaManager } from "../index.js";

export default class RemitosManager {
  constructor() {
    this.listRemitos = [];
  }

  async getRemitos() {
    if (this.listRemitos.length != 0) return { data: this.listRemitos };

    try {
      const [rows] = await con.query(`SELECT * FROM remitos`);
      this.listRemitos = rows;
      return { data: rows };
    } catch (error) {
      console.log(error);
      return { error: { message: "Something wrong" } };
    }
  }

  getOneRemito(idRemito) {
    const listMercaderiaByIdRemito =
      mercaderiaManager.getMercaderiaByIdRemito(idRemito);
    const findByIdRemito = this.listRemitos.filter(
      (elem) => elem.id == idRemito
    );
    if (findByIdRemito) {
      if (listMercaderiaByIdRemito.length != 0) {
        return {
          remito: findByIdRemito[0],
          mercaderia: listMercaderiaByIdRemito,
        };
      } else return { error: { message: "No se encontro en la mercaderia" } };
    } else return { error: { message: "No se encontro el remito" } };
  }

  existNroRemito(nroRemito) {
    const findNroRemito = this.listRemitos.find(
      (elem) => elem.num_remito == nroRemito
    );
    if (findNroRemito) return true;
    else false;
  }

  async newRemito(object) {
    await this.getRemitos();
    const { fecha, numRemito, idCliente, nroOrden, valorDeclarado, products } =
      object;

    if (fecha && numRemito && idCliente && valorDeclarado && products)
      return { error: { message: "Campos Vacios" } };

    //Validar Campos
    if (fecha == null || fecha == "")
      return { error: { message: "Campo Fecha Vacio" } };

    if (numRemito == null || numRemito == "")
      return { error: { message: "Campo NroRemito Vacio" } };

    if (idCliente == null || idCliente == "")
      return { error: { message: "Campo Cliente Vacio" } };

    if (products == null || products == [])
      return { error: { message: "Campo Products Vacio" } };

    if (valorDeclarado != null)
      if (!Number.isInteger(valorDeclarado))
        return {
          error: { message: "Campo del valor Declarado no es numerico" },
        };

    if (this.existNroRemito(numRemito))
      return { error: { message: "Ya existe ese nro remito" } };

    if (numRemito.length !== 13)
      return { error: { message: "Error en el formato del remito" } };

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