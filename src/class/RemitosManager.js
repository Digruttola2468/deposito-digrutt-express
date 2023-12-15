import { con } from "../config/db.js";

import { mercaderiaManager } from "../index.js";

export default class RemitosManager {
  constructor() {
    this.listRemitos = [];
  }

  async getRemitos() {
    try {
      const [rows] = await con.query(
        `SELECT * FROM remitos ORDER BY fecha DESC`
      );
      this.listRemitos = rows;
      return { data: rows };
    } catch (error) {
      console.log(error);
      return { error: { message: "Something wrong" } };
    }
  }

  getOne(idRemito) {
    if (this.listRemitos.length != 0) {
      const findByIdRemito = this.listRemitos.find(
        (elem) => elem.id == idRemito
      );
      return { data: findByIdRemito };
    }else return { error: { message: "List Remito Vacio" } };
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
    const { fecha, numRemito, idCliente, nroOrden, valorDeclarado, products } =
      object;

    //Validar Campos
    if (fecha == null || fecha == "")
      return { error: { message: "Campo Fecha Vacio" } };

    if (numRemito == null || numRemito == "")
      return { error: { message: "Campo NroRemito Vacio" } };

    if (idCliente == null || idCliente == "")
      return { error: { message: "Campo Cliente Vacio" } };

    if (products == null || products.length == 0)
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
        [fecha, numRemito, idCliente, nroOrden, parseFloat(valorDeclarado)]
      );
      idRemito = rows.insertId;

      //Agregar todos los products como salida
      try {
        if (idRemito != null) {
          for (let i = 0; i < products.length; i++) {
            const element = products[i];

            const enviar = {
              fecha: fecha,
              stock: element.stock,
              idinventario: element.idProduct,
              idcategoria: 1,
              idremito: idRemito,
            };
            const { error } = await mercaderiaManager.createMercaderia(enviar);

            if (error != null)
              return {
                error: { message: "Ocurrio un error en agregar mercaderia" },
              };
          }

          this.listRemitos.push({
            id: idRemito,
            fecha: fecha,
            idCliente: idCliente,
            num_remito: numRemito,
            num_orden: nroOrden,
            total: valorDeclarado,
          });

          return { data: { message: "Operacion exitosa", insertId: idRemito } };
        }
        return { error: { message: "No se agrego el remito" } };
      } catch (e) {
        console.error(e);
        return { error: { message: "Something wrong" } };
      }
    } catch (e) {
      console.error(e);
      return { error: { message: "Something wrong" } };
    }
  }

  async updateRemito(object) {
    const { fecha, numRemito, nroOrden, products } = object;
    let valorDeclarado = 0;

    if (fecha != null && fecha != "") {
      const fechaDate = new Date(fecha);
      if (Number.isNaN(fechaDate.getDate()))
        return { error: { message: "Error en el formato de la Fecha" } };

      //Si se modifica la fecha , se tiene que modificar la fecha para todas las mercaderia salida
    }

    if (numRemito != null && numRemito != "") {
      if (this.existNroRemito(numRemito))
        return { error: { message: "Ya existe ese nro remito" } };

      if (numRemito.length !== 13)
        return { error: { message: "Error en el formato del remito" } };
    }

    if (products != null) {
      if (!Array.isArray(products))
        return { error: { message: "Algo paso con la products" } };

      //Validar que el products tenga contendio correcto ya que despues se agregan

      for (let i = 0; i < products.length; i++) {
        const element = products[i];

        let enviar = {};

        if (fecha != null && fecha != "") enviar.fecha = fecha;

        enviar.stock = element.stock;

        const { error } = await mercaderiaManager.updateMercaderia(
          element.idMercaderia,
          enviar
        );

        valorDeclarado += parseFloat(element.price);

        if (error != null)
          return {
            error: { message: "Ocurrio un error en agregar mercaderia" },
          };
      }
    }
    //Update el valor declarado
    try {
      await con.query(
        `
        UPDATE remitos SET
          total = IFNULL(?,total),
          fecha = IFNULL(?,fecha),
          num_orden = IFNULL(?,num_orden),
          num_remito = IFNULL(?,num_remito)
          WHERE id = ?
        `,
        [valorDeclarado, fecha, nroOrden, numRemito]
      );
    } catch (error) {
      return {
        error: { message: "Ocurrio un error al actualizar" },
      };
    }

    return {data: {message: 'Se actualizo correctamente'}}
  }

  async updateRemitoAddNewMercaderia(idRemito, products) {
    //Verificar que exista el idRemito
    const findListRemitos = this.listRemitos.find(
      (elem) => elem.id == idRemito
    );
    if (!findListRemitos)
      return { error: { message: "No se encontro el Remito" } };

    if (products != null) {
      if (!Array.isArray(products))
        return { error: { message: "Algo paso con la products" } };

      let valorDeclarado = 0;
      for (let i = 0; i < products.length; i++) {
        const element = products[i];

        const enviar = {
          fecha: findListRemitos.fecha,
          stock: element.stock,
          idinventario: element.idProduct,
          idcategoria: 1,
          idremito: findListRemitos.id,
        };
        const { error } = await mercaderiaManager.createMercaderia(enviar);

        valorDeclarado += parseFloat(element.price);

        if (error != null)
          return {
            error: { message: "Ocurrio un error en agregar mercaderia" },
          };
      }

      valorDeclarado += parseFloat(findListRemitos.valorDeclarado);

      //Update el valor declarado
      try {
        await con.query(
          `
          UPDATE remitos 
            SET total = IFNULL(?,total)
            WHERE id = ?
        `,
          [valorDeclarado]
        );
      } catch (error) {
        return {
          error: { message: "Ocurrio un error al actualizar" },
        };
      }
    }

    return { data: { message: "Se agrego con exito" } };
  }

  async deleteRemito(idRemito) {
    //Verificar que exista el idRemito
    const existRemito = this.listRemitos.find((elem) => elem.id == idRemito);
    if (!existRemito) return { error: { message: "No se encontro el Remito" } };

    const listMercaderiaByIdRemito =
      mercaderiaManager.getMercaderiaByIdRemito(idRemito);
    if (listMercaderiaByIdRemito.length === 0)
      return { error: { message: "Ocurrio un error" } };

    for (let i = 0; i < listMercaderiaByIdRemito.length; i++) {
      const element = listMercaderiaByIdRemito[i];

      //
      console.log("List Mercaderia By Id Remito: ", element);
      //await mercaderiaManager.deleteMercaderia(element.id)
    }

    try {
      await con.query("DELETE FROM remitos WHERE (`id` = ?);", [idRemito]);
    } catch (error) {
      console.log(error);
      return { error: { message: "No se elimino el Remito" } };
    }

    return { data: { message: "Se elimino Correctamente" } };
  }
}
