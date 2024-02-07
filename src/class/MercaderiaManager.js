import { con } from "../config/db.js";
import CustomError from "../errors/Custom_errors.js";
import { ENUM_ERRORS } from "../errors/enums.js";

import { inventarioManager } from "../index.js";
import { remitosManager } from "../index.js";
import { facturaNegroManager } from "../index.js";

export default class MercaderiaManager {
  constructor() {
    this.listMercaderia = [];
  }

  async getMercaderia() {
    try {
      const [rows] = await con.query(
        `SELECT mercaderia.id,fecha,stock,nombre,descripcion,categoria,idinventario,articulo,idremito,idFacturaNegro,idCliente AS idcliente
              FROM mercaderia 
                  LEFT JOIN inventario on mercaderia.idinventario = inventario.id
                  LEFT JOIN categoria on mercaderia.idcategoria = categoria.id
              ORDER BY mercaderia.fecha DESC;`
      );

      this.listMercaderia = rows;

      return { data: rows };
    } catch (error) {
      console.log(error);
      return { error: { message: "Something wrong" } };
    }
  }

  //
  getOneMercaderia(idMercaderia) {
    if (this.listMercaderia.length != 0) {
      const findInventarioById = this.listMercaderia.find(
        (e) => e.id == idMercaderia
      );
      if (findInventarioById) {
        if (findInventarioById.idremito) {
          const { data } = remitosManager.getOne(findInventarioById.idremito);

          return { data: { ...findInventarioById, remito: data.num_remito } };
        }
        if (findInventarioById.idFacturaNegro) {
          const { data } = facturaNegroManager.getOne(
            findInventarioById.idFacturaNegro
          );

          return { data: { ...findInventarioById, nroEnvio: data.nro_envio } };
        }
        return { data: findInventarioById };
      } else return { error: { message: "No existe" } };
    } else return { error: { message: "Mercaderia Vacia" } };
  }

  async createMercaderia(object) {
    let { fecha, stock, idinventario, idcategoria, idFacturaNegro, idremito, observacion } =
      object;

    //Validar Campos
    if (fecha == null || fecha == "")
      CustomError.createError({
        name: "fecha",
        cause: "Campo Fecha Vacio",
        code: ENUM_ERRORS.INVALID_TYPE_EMPTY,
        message: "Campo Fecha esta vacio",
      });

    if (stock == null || stock == "")
      CustomError.createError({
        name: "stock",
        cause: "Campo Cantidad Vacio",
        code: ENUM_ERRORS.INVALID_TYPE_EMPTY,
        message: "Campo Cantidad Entrada esta vacio",
      });

    if (idinventario == null || idinventario == "")
      CustomError.createError({
        name: "codProducto",
        cause: "Campo cod.Producto Vacio",
        code: ENUM_ERRORS.INVALID_TYPE_EMPTY,
        message: "Campo cod.Producto esta vacio",
      });

    if (idcategoria == null || idcategoria == "")
      CustomError.createError({
        name: "categoria",
        cause: "BBDD: Ocurrio un error",
        code: ENUM_ERRORS.INVALID_TYPE_EMPTY,
        message: "BBDD: Ocurrio un error",
      });

    //
    if (idFacturaNegro == "") idFacturaNegro = null;
    if (idremito == "") idremito = null;
    if (observacion == "") observacion = null;

    //Verificamos que sea de tipo Entrada - Salida , si no es ninguna de las dos saltar un error
    if (idcategoria != "1" && idcategoria != "2")
      CustomError.createError({
        name: "categoria",
        cause: "Categoria fuera de rango ",
        code: ENUM_ERRORS.ROUTING_ERROR,
        message: "Categoria fuera de rango (Entrada o Salida)",
      });

    //Convertimos la fecha ingresada a tipo Date
    const fechaDate = new Date(fecha);

    if (Number.isNaN(fechaDate.getDate()))
      CustomError.createError({
        name: "fecha",
        cause: "Error en el formato date",
        code: ENUM_ERRORS.INVALID_TYPES_ERROR,
        message: "Error en el formato date",
      });

    try {
      const [rows] = await con.query(
        "INSERT INTO mercaderia (`fecha`, `stock`, `idcategoria`, `idinventario`, `idremito`, `idFacturaNegro`, `observacion`) VALUES (?,?,?,?,?,?,?);",
        [fecha, stock, idcategoria, idinventario, idremito, idFacturaNegro, observacion]
      );

      //get one listInventario
      const getOneInventario = inventarioManager.getOneInventario(idinventario);

      const { nombre, descripcion, articulo } = getOneInventario.data;

      let categoria = "";
      if (idcategoria == "1") categoria = "Salida";

      if (idcategoria == "2") categoria = "Entrada";

      const enviar = {
        id: rows.insertId,
        nombre: nombre,
        descripcion: descripcion,
        articulo: articulo,
        fecha: fecha,
        stock: parseInt(stock),
        idinventario,
        categoria: categoria,
        idFacturaNegro: idFacturaNegro,
        idremito: idremito,
        observacion: observacion
      };

      //add this.listMercaderia
      this.listMercaderia.push(enviar);

      try {
        await inventarioManager.suminventario(idinventario);
      } catch (e) {
        return {
          error: {
            status: "error",
            message: "something wrong",
          },
        };
      }

      return {
        status: "success",
        data: enviar,
      };
    } catch (e) {
      console.error(e);

      switch (e.code) {
        case "ER_NO_REFERENCED_ROW_2":
          if (e.sqlMessage.includes("idinventario")) {
            CustomError.createError({
              cause: "No existe ese cod.producto",
              message: "No existe en la tabla productos",
              code: ENUM_ERRORS.FOREING_KEY_OBJECT_NOT_EXISTS,
              name: "idinventario",
            });
          }
          break;
        case "ER_TRUNCATED_WRONG_VALUE_FOR_FIELD":
          if (e.sqlMessage.includes("idinventario")) {
            CustomError.createError({
              cause: "No existe ese cod.producto",
              message: "Error tipo de dato",
              code: ENUM_ERRORS.INVALID_TYPES_ERROR,
              name: "idinventario",
            });
          }
          if (e.sqlMessage.includes("stock")) {
            CustomError.createError({
              cause: "Stock tiene que ser numerico",
              message: "Error tipo de dato",
              code: ENUM_ERRORS.INVALID_TYPES_ERROR,
              name: "stock",
            });
          }
          break;
      }

      return {
        error: {
          status: "error",
          message: "something wrong",
        },
      };
    }
  }

  async postMercaderiaList(object) {
    const { fecha, data } = object;

    if (!Array.isArray(data))
      return {
        error: { status: "error", message: "Algo paso al agregar mercaderia" },
      };

    if (data.length == 0)
      return { error: { status: "error", message: "Lista vacia" } };

    //Validar Campos
    if (fecha == null || fecha == "")
      return { error: { status: "error", message: "Campo Fecha Vacio" } };

    //Validar los campos de la lista sean correctas
    for (let i = 0; i < data.length; i++) {
      const element = data[i];
      const stockInteger = parseInt(element.stock);
      const idInventarioInteger = parseInt(element.idinventario);

      //Validamos que sean de tipo integer
      if (!Number.isInteger(stockInteger))
        return {
          error: {
            status: "error",
            message: "Campo Stock No es un numero",
            index: i,
          },
        };

      if (!Number.isInteger(idInventarioInteger))
        return {
          error: {
            status: "error",
            message: "Algo paso al agregar mercaderia",
            index: i,
          },
        };

      //Validar que el idinventario exista
      const existsIdInventario =
        inventarioManager.existsIdInventario(idInventarioInteger);
      if (existsIdInventario != null) {
        if (!existsIdInventario)
          return {
            error: {
              status: "error",
              message: "No existe ese cod.producto",
              index: i,
            },
          };
      } else
        return {
          error: {
            status: "error",
            message: "Algo paso con la idInventario",
            index: i,
          },
        };
    }

    //Agregamos a la mercaderia
    for (let i = 0; i < data.length; i++) {
      const element = data[i];

      await this.createMercaderia({
        fecha: fecha,
        stock: element.stock,
        idinventario: element.idinventario,
        idcategoria: 2,
      });
    }

    return { data: { isDone: true, status: "success" } };
  }

  async updateMercaderia(idMercaderia, object) {
    let enviar = {
      fecha: null,
      stock: null,
    };
    const { fecha, stock } = object;
    const id = idMercaderia;

    //Si se agrega los siguientes campos , validar q sean correctos
    if (fecha) {
      const validarDate = new Date(fecha);

      if (Number.isNaN(validarDate.getDate()))
        CustomError.createError({
          name: "fecha",
          cause: "Error en el formato",
          code: ENUM_ERRORS.INVALID_TYPES_ERROR,
          message: "Error en el formato",
        });

      enviar.fecha = fecha;
    }
    if (stock) {
      const stockInteger = parseInt(stock);

      if (!Number.isInteger(stockInteger))
        CustomError.createError({
          name: "stock",
          cause: "Stock tiene que ser numerico",
          code: ENUM_ERRORS.INVALID_TYPES_ERROR,
          message: "Error en el tipo de dato",
        });

      enviar.stock = stockInteger;
    }
    try {
      const [result] = await con.query(
        `UPDATE mercaderia
            SET fecha = IFNULL(?,fecha),
                stock = IFNULL(?,stock)
            WHERE id = ?;`,
        [enviar.fecha, enviar.stock, id]
      );

      if (result.affectedRows === 0)
        CustomError.createError({
          name: "idMercaderia",
          cause: "No se encontro la mercaderia",
          code: ENUM_ERRORS.INVALID_OBJECT_NOT_EXISTS,
          message: "No se encontro",
        });

      const { data } = this.getOneMercaderia(id);

      if (enviar.fecha == null) enviar.fecha = data.fecha;

      if (enviar.stock == null) enviar.stock = data.stock;

      const enviarUpdateList = {
        fecha: enviar.fecha,
        stock: enviar.stock,
      };

      //Update this.listMercaderia
      const mapListMercaderia = this.listMercaderia.map((elem) => {
        if (elem.id == id) return { ...data, ...enviarUpdateList };
        else return elem;
      });

      this.listMercaderia = mapListMercaderia;

      if (stock) {
        try {
          await inventarioManager.suminventario(data.idinventario);
        } catch (e) {
          return { error: { message: "Something Wrong" } };
        }
      }

      return { data: { ...data, ...enviarUpdateList } };
    } catch (e) {
      throw e
    }
  }

  async deleteMercaderia(idMercaderia) {
    const { data } = this.getOneMercaderia(idMercaderia);
    try {
      const [result] = await con.query(
        "DELETE FROM mercaderia WHERE (`id` = ?);",
        [idMercaderia]
      );

      if (result.affectedRows <= 0)
        CustomError.createError({
          name: "idMercaderia",
          cause: "No se encuentra mercaderia",
          message: "No existe",
          code: ENUM_ERRORS.INVALID_OBJECT_NOT_EXISTS,
        });

      //Delete from listInventario
      const filterListMercaderia = this.listMercaderia.filter(
        (elem) => elem.id != idMercaderia
      );
      this.listMercaderia = filterListMercaderia;

      try {
        await inventarioManager.suminventario(data.idinventario);
      } catch (e) {
        CustomError.createError({
          name: "update inventario stock",
          cause: "No se actualizo el inventario",
          message: "No se actualizo el inventario",
          code: ENUM_ERRORS.DATABASE_ERROR,
        });
      }

      return { status: "success", message: "Eliminado Correctamente" };
    } catch (error) {
      throw error;
    }
  }

  async deleteMercaderiaWhereIdinventario(idinventario) {
    try {
      const [rows] = await con.query(
        `SELECT mercaderia.id,fecha,stock,nombre,descripcion,categoria,idinventario,articulo,idremito,idFacturaNegro,idCliente AS idcliente
                  FROM mercaderia 
                    LEFT JOIN inventario on mercaderia.idinventario = inventario.id
                    LEFT JOIN categoria on mercaderia.idcategoria = categoria.id
                  WHERE mercaderia.idinventario = ?`,
        [idinventario]
      );

      if (rows.length != 0) {
        for (let i = 0; i < rows.length; i++) {
          const { id } = rows[i];

          const [result] = await con.query(
            "DELETE FROM mercaderia WHERE (`id` = ?);",
            [id]
          );
        }

        return { data: { message: "Eliminado Correctamente", done: true } };
      } else
        CustomError.createError({
          name: "idInventario",
          message: "No existe ese cod.producto",
          cause: "No existe ese cod.producto",
          code: ENUM_ERRORS.FOREING_KEY_OBJECT_NOT_EXISTS,
        });
    } catch (error) {
      throw error;
    }
  }

  getMercaderiaWhereIdInventario(idinventario) {
    if (this.listMercaderia.length != 0) {
      try {
        const filterListMercaderiaByIdInventario = this.listMercaderia.filter(
          (elem) => elem.idinventario == idinventario
        );

        const listIdMercaderia = [];
        for (let i = 0; i < filterListMercaderiaByIdInventario.length; i++) {
          const element = filterListMercaderiaByIdInventario[i];
          listIdMercaderia.push(element.id);
        }

        return listIdMercaderia;
      } catch (error) {
        return [];
      }
    } else return [];
  }

  getMercaderiaIdInventario(idinventario) {
    if (this.listMercaderia.length != 0) {
      try {
        const filterListMercaderiaByIdInventario = this.listMercaderia.filter(
          (elem) => elem.idinventario == idinventario
        );

        return filterListMercaderiaByIdInventario;
      } catch (error) {
        return [];
      }
    } else return [];
  }

  getMercaderiaByIdRemito(idRemito) {
    if (this.listMercaderia.length != 0) {
      const filterByIdRemito = this.listMercaderia.filter(
        (elem) => elem.idremito == idRemito
      );
      if (filterByIdRemito) return filterByIdRemito;
      else return [];
    } else return [];
  }

  getMercaderiaByIdFacturaNegro(idFactura) {
    if (this.listMercaderia.length != 0) {
      const filterByIdFacturaNegro = this.listMercaderia.filter(
        (elem) => elem.idFacturaNegro == idFactura
      );
      if (filterByIdFacturaNegro) return filterByIdFacturaNegro;
      else return [];
    } else return [];
  }
}
