import { con } from "../config/db.js";
import CustomError from "../errors/Custom_errors.js";
import { ENUM_ERRORS } from "../errors/enums.js";
import { clientesManager, mercaderiaManager } from "../index.js";

export default class FacturaNegroManager {
  constructor() {
    this.listFacturaNegro = [];
  }

  getNroEnvio() {
    if (this.listFacturaNegro.length != 0) {
      const last = this.listFacturaNegro[this.listFacturaNegro.length - 1];
      const nroEnvio = parseInt(last.nro_envio);
      const numeroUnico = nroEnvio + 1;
      return numeroUnico;
    } else return -1;
  }

  async getFacturaNegro() {
    try {
      const [rows] = await con.query(
        `SELECT facturaNegro.id, facturaNegro.*, clientes.cliente, clientes.cuit, clientes.domicilio, clientes.mail, idCliente AS idcliente FROM facturaNegro 
        LEFT JOIN clientes on facturaNegro.idCliente = clientes.id
        ORDER BY fecha DESC`
      );

      this.listFacturaNegro = rows;
      return { data: rows };
    } catch (e) {
      console.error(e);
      return { error: { message: "Something wrong" } };
    }
  }

  getOne(idFacturaNegro) {
    if (this.listFacturaNegro.length != 0) {
      const findByIdNotaEnvio = this.listFacturaNegro.find(
        (elem) => elem.id == idFacturaNegro
      );
      return { data: findByIdNotaEnvio };
    } else return { error: { message: "List Nota Envio Vacio" } };
  }

  getOneNotaEnvio(idFacturaNegro) {
    const listMercaderiaByIdFacturaNegro =
      mercaderiaManager.getMercaderiaByIdFacturaNegro(idFacturaNegro);
    const findByIdFacturaNegro = this.listFacturaNegro.filter(
      (elem) => elem.id == idFacturaNegro
    );
    if (findByIdFacturaNegro) {
      if (listMercaderiaByIdFacturaNegro.length != 0) {
        return {
          notaEnvio: findByIdFacturaNegro[0],
          mercaderia: listMercaderiaByIdFacturaNegro,
        };
      } else return { error: { message: "No se encontro en la mercaderia" } };
    } else return { error: { message: "No se encontro la nota envio" } };
  }

  async createFacturaNegro(object) {
    const { fecha, nro_envio, products, idCliente, valorDeclarado } = object;

    //Validacion de campos
    if (fecha == null || fecha == "")
      CustomError.createError({
        name: "fecha",
        cause: "Campo Fecha esta vacio",
        code: ENUM_ERRORS.INVALID_TYPE_EMPTY,
        message: "Campo Fecha esta vacio",
      });

    if (nro_envio == null || nro_envio == "")
      CustomError.createError({
        name: "nroEnvio",
        cause: "Campo Nro Envio esta vacio",
        code: ENUM_ERRORS.INVALID_TYPE_EMPTY,
        message: "Campo Nro Envio esta vacio",
      });

    if (idCliente == null || idCliente == 0 || idCliente == "")
      CustomError.createError({
        name: "cliente",
        cause: "Campo Cliente esta vacio",
        code: ENUM_ERRORS.INVALID_TYPE_EMPTY,
        message: "Campo Cliente esta vacio",
      });

    if (products == null || products.length == 0)
      CustomError.createError({
        name: "products",
        cause: "No se selecciono ningun producto",
        code: ENUM_ERRORS.INVALID_TYPE_EMPTY,
        message: "No se selecciono ningun producto",
      });

    if (!Array.isArray(products))
      CustomError.createError({
        name: "products",
        cause: "No se selecciono ningun producto",
        code: ENUM_ERRORS.INVALID_TYPE_EMPTY,
        message: "No se selecciono ningun producto",
      });

    const fechaDate = new Date(fecha);
    if (Number.isNaN(fechaDate.getDate()))
      CustomError.createError({
        name: "fecha",
        cause: "Error en el formato fecha",
        code: ENUM_ERRORS.INVALID_TYPES_ERROR,
        message: "Error en el formato",
      });

    let valorTotal = 0;
    if (valorDeclarado != null) {
      const valorFloat = parseFloat(valorDeclarado);
      if (!Number.isInteger(valorFloat))
        CustomError.createError({
          name: "valorDeclarado",
          cause: "El valor declarado no es numerico",
          code: ENUM_ERRORS.INVALID_TYPES_ERROR,
          message: "El valor declarado no es numerico",
        });

      valorTotal = valorFloat;
    }

    let idFacturaNegro = null;
    try {
      const [rows] = await con.query(
        "INSERT INTO facturaNegro (`nro_envio`,`idCliente`,`valorDeclarado`,`fecha`) VALUES (?,?,?,?);",
        [nro_envio, idCliente, valorTotal, fecha]
      );
      idFacturaNegro = rows.insertId;

      //Agregar todos los products como salida
      if (idFacturaNegro != null) {
        //verificamos si el array esta vacia
        if (products.length > 0) {
          for (let i = 0; i < products.length; i++) {
            const element = products[i];

            const enviar = {
              fecha: fecha,
              stock: element.stock,
              idinventario: element.idProduct,
              idcategoria: 1,
              idFacturaNegro: idFacturaNegro,
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

          const obj_cliente = clientesManager.getOneCliente(idCliente);

          this.listFacturaNegro.push({
            id: idFacturaNegro,
            nro_envio: parseInt(nro_envio),
            idCliente: idCliente,
            valorDeclarado: valorTotal,
            fecha: fecha,
            ...obj_cliente,
          });

          return {
            data: {
              status: "success",
              message: "Operacion exitosa",
              data: {
                id: idFacturaNegro,
                nro_envio: parseInt(nro_envio),
                idCliente: idCliente,
                valorDeclarado: valorTotal,
                fecha: fecha,
                ...obj_cliente,
              },
            },
          };
        }
      } else
        CustomError.createError({
          name: "idFacturaNegro",
          cause: "Algo salio mal al crear",
          code: ENUM_ERRORS.INVALID_TYPES_ERROR,
          message: "Algo salio mal al crear",
        });
    } catch (e) {
      switch (e.code) {
        case "ER_DUP_ENTRY":
          if (e.sqlMessage.includes("facturaNegro.nro_envio"))
            CustomError.createError({
              name: "nroEnvio",
              cause: "Ya existe esa Nota Envio",
              code: ENUM_ERRORS.THIS_OBJECT_ALREDY_EXISTS,
              message: "Ya existe esa Nota Envio",
            });
          break;
        case "ER_TRUNCATED_WRONG_VALUE_FOR_FIELD":
          if (e.sqlMessage.includes("nro_envio"))
            CustomError.createError({
              name: "nroEnvio",
              cause: "No existe esa Nota Envio",
              code: ENUM_ERRORS.INVALID_TYPES_ERROR,
              message: "No existe esa Nota Envio",
            });
          if (e.sqlMessage.includes("idCliente"))
            CustomError.createError({
              name: "idCliente",
              cause: "No existe ese cliente",
              code: ENUM_ERRORS.INVALID_TYPES_ERROR,
              message: "No existe ese cliente",
            });
          break;
        case "ER_NO_REFERENCED_ROW_2":
          if (e.sqlMessage.includes("fk_idcliente_facturaNegro"))
            CustomError.createError({
              name: "idCliente",
              cause: "No existe ese cliente",
              code: ENUM_ERRORS.FOREING_KEY_OBJECT_NOT_EXISTS,
              message: "No existe ese cliente",
            });
          break;
      }
      return { error: { message: "Something wrong" } };
    }
  }

  async updateRemito(idNotaEnvio, object) {
    let { fecha, nro_envio, cliente, products } = object;

    if (fecha == "") fecha = null;
    if (nro_envio == "") nro_envio = null;
    if (cliente == "") cliente = null;

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

    if (nro_envio != null && nro_envio != "") {
      const nroEnvioInteger = parseInt(nro_envio);

      //Validamos que sean de tipo integer
      if (!Number.isInteger(nroEnvioInteger))
        CustomError.createError({
          name: "nroEnvio",
          cause: "Nro Envio no es numerico",
          code: ENUM_ERRORS.INVALID_TYPES_ERROR,
          message: "Nro Envio no es numerico",
        });
    }

    try {
      const [result] = await con.query(
        `
        UPDATE facturaNegro 
        SET fecha = IFNULL(?,fecha),
            idCliente = IFNULL(?,idCliente),
            nro_envio = IFNULL(IF(STRCMP(nro_envio, ?) = 0, nro_envio, ?), nro_envio)
          WHERE id = ?
        `,
        [fecha, cliente, nro_envio, nro_envio, idNotaEnvio]
      );

      if (result.affectedRows === 0)
        CustomError.createError({
          name: "idNotaEnvio",
          code: ENUM_ERRORS.INVALID_OBJECT_NOT_EXISTS,
          cause: "No existe esa nota de envio",
          message: "No existe esa nota de envio",
        });

      if (products != null && products != "") {
        if (!Array.isArray(products))
          CustomError.createError({
            name: "products",
            code: ENUM_ERRORS.INVALID_TYPES_ERROR,
            cause: "No se actualizo las mercaderias salida de la nota de envio",
            message:
              "No se actualizo las mercaderias salida de la nota de envio",
          });

        const listMercaderiaByIdFacturaNegro =
          mercaderiaManager.getMercaderiaByIdFacturaNegro(idNotaEnvio);

        if (listMercaderiaByIdFacturaNegro.length == 0) {
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

          //Validar si pertenece o no al mismo idFacturaNegro ya que podemos colocar cualquier idMercaderia
          const exits = listMercaderiaByIdFacturaNegro.find(
            (elem) => elem.id == element.idMercaderia
          );
          if (exits) {
            try {
              await mercaderiaManager.updateMercaderia(
                element.idMercaderia,
                enviar
              );
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
        }
      }
    } catch (error) {
      console.log(error);
      switch (error.code) {
        case 'ER_TRUNCATED_WRONG_VALUE_FOR_FIELD':
          if (error.sqlMessage.includes("idCliente"))
            CustomError.createError({
              name: "cliente",
              cause: "No existe ese cliente",
              code: ENUM_ERRORS.INVALID_TYPES_ERROR,
              message: "No existe ese cliente",
            });
          break;
        case 'ER_NO_REFERENCED_ROW_2':
          if (error.sqlMessage.includes("fk_idcliente_facturaNegro"))
            CustomError.createError({
              name: "cliente",
              cause: "No existe ese cliente",
              code: ENUM_ERRORS.FOREING_KEY_OBJECT_NOT_EXISTS,
              message: "No existe ese cliente",
            });
          break;
        case "ER_DUP_ENTRY":
          if (error.sqlMessage.includes("facturaNegro.nro_envio"))
            CustomError.createError({
              name: "nroEnvio",
              cause: "Ya existe ese nro envio",
              code: ENUM_ERRORS.THIS_OBJECT_ALREDY_EXISTS,
              message: "Ya existe ese nro envio",
            });
          break;
      }
      throw error;
    }

    const [rows] = await con.query(
      ` SELECT facturaNegro.id, facturaNegro.*, clientes.cliente, clientes.cuit, clientes.domicilio, clientes.mail, idCliente AS idcliente FROM facturaNegro 
          LEFT JOIN clientes on facturaNegro.idCliente = clientes.id
        WHERE facturaNegro.id = ? `,
      [idNotaEnvio]
    );

    return {
      data: {
        message: "Se actualizo correctamente",
        status: "success",
        data: rows[0],
      },
    };
  }

  async updateNotaEnvioAddNewMercaderia(idFacturaNegro, products) {
    //Verificar que exista el idFacturaNegro
    const findListFacturaNegro = this.listFacturaNegro.find(
      (elem) => elem.id == idFacturaNegro
    );

    if (!findListFacturaNegro)
      return {
        error: { message: "No existe esa nota de envio", status: "error" },
      };

    const listMercaderiaByIdFacturaNegro =
      mercaderiaManager.getMercaderiaByIdFacturaNegro(idFacturaNegro);

    if (products != null) {
      if (!Array.isArray(products))
        return {
          error: { message: "Algo paso con los products", status: "error" },
        };
      try {
        let valorDeclarado = 0;
        for (let i = 0; i < products.length; i++) {
          const element = products[i];

          for (let i = 0; i < listMercaderiaByIdFacturaNegro.length; i++) {
            const elmMercaderia = listMercaderiaByIdFacturaNegro[i];

            if (element.idInventario == elmMercaderia.idinventario) {
              return {
                error: {
                  message: "Ya existe ese producto en la nota de envio",
                  status: "error",
                  index: i,
                },
              };
            }
          }

          const enviar = {
            fecha: findListFacturaNegro.fecha,
            stock: element.stock,
            idinventario: element.idInventario,
            idcategoria: 1,
            idFacturaNegro: findListFacturaNegro.id,
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

        valorDeclarado += parseFloat(findListFacturaNegro.valorDeclarado);

        //Update el valor declarado
        await con.query(
          `
          UPDATE facturaNegro 
            SET valorDeclarado = IFNULL(?,valorDeclarado)
            WHERE id = ?
        `,
          [valorDeclarado, findListFacturaNegro.id]
        );
        return { data: { message: "Se agrego con exito", status: "success" } };
      } catch (error) {
        console.log(error);
        return {
          error: { message: "Ocurrio un error al actualizar", status: "error" },
        };
      }
    }
    return { error: { message: "Something wrong", status: "error" } };
  }

  async deleteNotaEnvio(idNotaEnvio) {
    try {
      const listMercaderiaByIdNotaEnvio =
        mercaderiaManager.getMercaderiaByIdFacturaNegro(idNotaEnvio);

      if (listMercaderiaByIdNotaEnvio.length != 0)
        for (let i = 0; i < listMercaderiaByIdNotaEnvio.length; i++) {
          const element = listMercaderiaByIdNotaEnvio[i];
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
        "DELETE FROM facturaNegro WHERE (`id` = ?);",
        [idNotaEnvio]
      );

      if (result.affectedRows <= 0)
        CustomError.createError({
          name: "idNotaEnvio",
          cause: "No existe esa nota de envio",
          message: "No existe esa nota de envio",
          code: ENUM_ERRORS.INVALID_OBJECT_NOT_EXISTS,
        });
    } catch (error) {
      throw error;
    }

    return { data: { message: "Se elimino Correctamente", status: "success" } };
  }
}
