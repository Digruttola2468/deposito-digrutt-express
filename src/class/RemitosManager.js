import { con } from "../config/db.js";
import CustomError from "../errors/Custom_errors.js";
import { ENUM_ERRORS } from "../errors/enums.js";

import { mercaderiaManager } from "../index.js";

export default class RemitosManager {
  constructor() {
    this.listRemitos = [];
  }

  async getRemitos() {
    try {
      const [rows] = await con.query(
        `SELECT remitos.*,idCliente AS idcliente, clientes.cliente, clientes.cuit, clientes.domicilio, clientes.mail FROM remitos 
          LEFT JOIN clientes on remitos.idCliente = clientes.id
        ORDER BY remitos.fecha DESC`
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
    } else return { error: { message: "List Remito Vacio" } };
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

  async newRemito(object) {
    const { fecha, numRemito, idCliente, nroOrden, valorDeclarado, products } =
      object;

    //Validar Campos
    if (fecha == null || fecha == "")
      CustomError.createError({
        name: "fecha",
        cause: "Campo Fecha vacio",
        code: ENUM_ERRORS.INVALID_TYPE_EMPTY,
        message: "Campo Fecha esta vacio",
      });

    if (numRemito == null || numRemito == "")
      CustomError.createError({
        name: "nroRemito",
        cause: "Campo N° Remito vacio",
        code: ENUM_ERRORS.INVALID_TYPE_EMPTY,
        message: "Campo N° Remito esta vacio",
      });

    if (idCliente == null || idCliente == "")
      CustomError.createError({
        name: "cliente",
        cause: "Cliente esta vacio",
        code: ENUM_ERRORS.INVALID_TYPE_EMPTY,
        message: "Cliente esta vacio",
      });

    if (products == null || products.length == 0)
      CustomError.createError({
        name: "product",
        cause: "No seleccionaste ningun producto",
        code: ENUM_ERRORS.INVALID_TYPE_EMPTY,
        message: "No seleccionaste ningun producto",
      });

    const numRemitoInteger = parseInt(numRemito);

    //Validamos que sean de tipo integer
    if (!Number.isInteger(numRemitoInteger))
      CustomError.createError({
        name: "nroRemito",
        cause: "N° Remito no es numerico",
        code: ENUM_ERRORS.INVALID_TYPES_ERROR,
        message: "N° Remito no es numerico",
      });

    if (numRemito.length !== 13)
      CustomError.createError({
        name: "nroRemito",
        cause: "N° Remito no tiene 13 numeros",
        code: ENUM_ERRORS.INVALID_TYPES_ERROR,
        message: "N° Remito no tiene 13 numeros",
      });

    const fechaDate = new Date(fecha);
    if (Number.isNaN(fechaDate.getDate()))
      CustomError.createError({
        name: "fecha",
        cause: "Error en el formato fecha",
        code: ENUM_ERRORS.INVALID_TYPES_ERROR,
        message: "Error en el formato",
      });

    let idRemito = null;
    try {
      const [rows] = await con.query(
        "INSERT INTO remitos (`fecha`,`num_remito`,`idCliente`,`num_orden`,`total`) VALUES (?,?,?,?,?);",
        [fecha, numRemito, idCliente, nroOrden, parseFloat(valorDeclarado)]
      );
      idRemito = rows.insertId;

      //Agregar todos los products como salida
      for (let i = 0; i < products.length; i++) {
        const element = products[i];

        const enviar = {
          fecha: fecha,
          stock: element.stock,
          idinventario: element.idProduct,
          idcategoria: 1,
          idremito: idRemito,
        };
        try {
          await mercaderiaManager.createMercaderia(enviar);
        } catch (e) {
          return {
            error: {
              message: e.cause,
              status: "error",
              index: i,
              campus: e.name,
            },
          };
        }
      }

      this.listRemitos.push({
        id: idRemito,
        fecha: fecha,
        idCliente: idCliente,
        num_remito: numRemito,
        num_orden: nroOrden,
        total: valorDeclarado,
      });

      return {
        data: {
          status: "success",
          message: "Operacion exitosa",
          data: {
            id: idRemito,
            fecha: fecha,
            idCliente: idCliente,
            num_remito: numRemito,
            num_orden: nroOrden,
            total: valorDeclarado,
          },
        },
      };
    } catch (e) {
      switch (e.code) {
        case "ER_DUP_ENTRY":
          if (e.sqlMessage.includes("num_remito"))
            CustomError.createError({
              name: "nroRemito",
              cause: "Ya existe ese N° Remito",
              code: ENUM_ERRORS.THIS_OBJECT_ALREDY_EXISTS,
              message: "Ya existe ese N° Remito",
            });
          break;

        case "ER_BAD_FIELD_ERROR":
          if (e.sqlMessage.includes("NaN"))
            CustomError.createError({
              name: "valorDeclarado",
              cause: "Valor declarado no es numerico",
              code: ENUM_ERRORS.INVALID_TYPES_ERROR,
              message: "Valor declarado no es numerico",
            });
          break;
        case "ER_TRUNCATED_WRONG_VALUE_FOR_FIELD":
          if (e.sqlMessage.includes("idCliente"))
            CustomError.createError({
              name: "idCliente",
              cause: "No existe ese cliente",
              code: ENUM_ERRORS.INVALID_TYPES_ERROR,
              message: "No existe ese cliente",
            });
          break;
        case "ER_NO_REFERENCED_ROW_2":
          if (e.sqlMessage.includes("fk_idcliente"))
            CustomError.createError({
              name: "idCliente",
              cause: "No existe ese cliente",
              code: ENUM_ERRORS.FOREING_KEY_OBJECT_NOT_EXISTS,
              message: "No existe ese cliente",
            });
          break;
      }

      throw e;
    }
  }

  async updateRemito(idRemito, object) {
    let { fecha, numRemito, nroOrden, valorDeclarado, products } = object;

    if (fecha == "") fecha = null;
    if (numRemito == "") numRemito = null;
    if (nroOrden == "") nroOrden = null;
    if (valorDeclarado == "") valorDeclarado = null;

    if (fecha != null && fecha != "") {
      const fechaDate = new Date(fecha);
      if (Number.isNaN(fechaDate.getDate()))
        CustomError.createError({
          name: "fecha",
          cause: "Error en el formato fecha",
          code: ENUM_ERRORS.INVALID_TYPES_ERROR,
          message: "Error en el formato",
        });
    }

    if (numRemito != null && numRemito != "") {
      const numRemitoInteger = parseInt(numRemito);

      //Validamos que sean de tipo integer
      if (!Number.isInteger(numRemitoInteger))
        CustomError.createError({
          name: "nroRemito",
          cause: "N° Remito no es numerico",
          code: ENUM_ERRORS.INVALID_TYPES_ERROR,
          message: "N° Remito no es numerico",
        });

      if (numRemito.length !== 13)
        CustomError.createError({
          name: "nroRemito",
          cause: "N° Remito no tiene 13 numeros",
          code: ENUM_ERRORS.INVALID_TYPES_ERROR,
          message: "N° Remito no tiene 13 numeros",
        });
    }

    try {
      const [result] = await con.query(
        `
        UPDATE remitos SET
          total = IFNULL(?,total),
          fecha = IFNULL(?,fecha),
          num_orden = IFNULL(?,num_orden),
          num_remito = IFNULL(IF(STRCMP(num_remito, ?) = 0, num_remito, ?), num_remito)
          WHERE id = ?
        `,
        [valorDeclarado, fecha, nroOrden, numRemito, numRemito, idRemito]
      );

      if (result.affectedRows === 0)
        CustomError.createError({
          name: "idRemito",
          code: ENUM_ERRORS.INVALID_OBJECT_NOT_EXISTS,
          cause: "No existe ese remito",
          message: "No existe ese remito",
        });

      if (products != null && products != "") {
        if (!Array.isArray(products))
          CustomError.createError({
            name: "remitoProducts",
            code: ENUM_ERRORS.INVALID_TYPES_ERROR,
            cause: "No se actualizo las mercaderias salida del remito",
            message: "No se actualizo las mercaderias salida del remito",
          });

        const listMercaderiaByIdRemito =
          mercaderiaManager.getMercaderiaByIdRemito(idRemito);

        if (listMercaderiaByIdRemito.length == 0) {
          CustomError.createError({
            name: "idMercaderia",
            code: ENUM_ERRORS.INVALID_OBJECT_NOT_EXISTS,
            cause: "No existen mercaderias de salida",
            message: "No existen mercaderias de salida",
          });
        }
        for (let i = 0; i < products.length; i++) {
          const element = products[i];

          let enviar = {
            fecha: null,
            stock: null,
          };

          if (fecha != null && fecha != "") enviar.fecha = fecha;

          enviar.stock = element.stock;

          //Validar si pertenece o no al mismo idRemito ya que podemos colocar cualquier idMercaderia
          const exits = listMercaderiaByIdRemito.find(
            (elem) => elem.id == element.idMercaderia
          );
          if (exits) {
            try {
              await mercaderiaManager.updateMercaderia(
                element.idMercaderia,
                enviar
              );
            } catch (e) {
              console.log(e);
              return {
                error: {
                  message: e.cause,
                  status: "error",
                  index: i,
                  campus: e.name,
                },
              };
            }
          }
        }
      }
    } catch (error) {
      switch (error.code) {
        case "ER_DUP_ENTRY":
          if (error.sqlMessage.includes("remitos.num_remito"))
            CustomError.createError({
              name: "nroRemito",
              cause: "Ya existe ese N° Remito",
              code: ENUM_ERRORS.THIS_OBJECT_ALREDY_EXISTS,
              message: "Ya existe ese N° Remito",
            });
          break;
      }
      throw error;
    }

    const [rows] = await con.query(
      `SELECT remitos.*,idCliente AS idcliente, clientes.cliente, clientes.cuit, clientes.domicilio, clientes.mail FROM remitos 
        LEFT JOIN clientes on remitos.idCliente = clientes.id
      WHERE remitos.id = ?`,
      [idRemito]
    );

    return {
      data: {
        message: "Se actualizo correctamente",
        status: "success",
        data: rows[0],
      },
    };
  }

  async updateRemitoAddNewMercaderia(idRemito, products) {
    //Verificar que exista el idRemito
    const findListRemitos = this.listRemitos.find(
      (elem) => elem.id == idRemito
    );

    if (!findListRemitos)
      return {
        error: { message: "No se encontro el Remito", status: "error" },
      };

    const listMercaderiaByIdRemito =
      mercaderiaManager.getMercaderiaByIdRemito(idRemito);

    if (products != null) {
      if (!Array.isArray(products))
        return {
          error: { message: "Algo paso con los products", status: "error" },
        };
      try {
        let valorDeclarado = 0;
        for (let i = 0; i < products.length; i++) {
          const element = products[i];

          for (let i = 0; i < listMercaderiaByIdRemito.length; i++) {
            const elmMercaderia = listMercaderiaByIdRemito[i];

            if (element.idInventario == elmMercaderia.idinventario) {
              return {
                error: {
                  message: "Ya existe ese producto en el Remito",
                  status: "error",
                },
              };
            }
          }

          const enviar = {
            fecha: findListRemitos.fecha,
            stock: element.stock,
            idinventario: element.idInventario,
            idcategoria: 1,
            idremito: findListRemitos.id,
          };
          const { error } = await mercaderiaManager.createMercaderia(enviar);

          valorDeclarado += parseFloat(element.price);

          if (error != null)
            return {
              error: {
                message: "Ocurrio un error en agregar mercaderia",
                status: "error",
              },
            };
        }

        valorDeclarado += parseFloat(findListRemitos.total);

        //Update el valor declarado
        await con.query(
          `
          UPDATE remitos 
            SET total = IFNULL(?,total)
            WHERE id = ?
        `,
          [valorDeclarado, findListRemitos.id]
        );
        return { data: { message: "Se agrego con exito", status: "success" } };
      } catch (error) {
        return {
          error: { message: "Ocurrio un error al actualizar", status: "error" },
        };
      }
    }
    return { error: { message: "Something wrong", status: "error" } };
  }

  async deleteRemito(idRemito) {
    try {
      const listMercaderiaByIdRemito =
        mercaderiaManager.getMercaderiaByIdRemito(idRemito);

      if (listMercaderiaByIdRemito.length != 0)
        for (let i = 0; i < listMercaderiaByIdRemito.length; i++) {
          const element = listMercaderiaByIdRemito[i];
          try {
            await mercaderiaManager.deleteMercaderia(element.id);
          } catch (e) {
            return {
              error: {
                message: e.cause,
                status: "error",
                index: i,
                campus: e.name,
              },
            };
          }
        }

      const [result] = await con.query(
        "DELETE FROM remitos WHERE (`id` = ?);",
        [idRemito]
      );

      if (result.affectedRows <= 0)
        CustomError.createError({
          name: "idRemito",
          cause: "No se encuentra el remito",
          message: "No existe el remito",
          code: ENUM_ERRORS.INVALID_OBJECT_NOT_EXISTS,
        });
    } catch (error) {
      //console.log(error);
      throw error;
    }

    return { data: { message: "Se elimino Correctamente", status: "success" } };
  }
}
