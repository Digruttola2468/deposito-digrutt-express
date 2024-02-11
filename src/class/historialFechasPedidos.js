import moment from "moment";
import { con } from "../config/db.js";
import CustomError from "../errors/Custom_errors.js";
import { ENUM_ERRORS } from "../errors/enums.js";

export default class HistorialFechasPedidosManager {
  constructor() {
    this.historialFechasPedidos = [];
  }

  async getHistorialFechasPedidos() {
    try {
      const [rows] = await con.query(
        `SELECT historialFechasPedidos.*, pedidos.ordenCompra, pedidos.idinventario, inventario.descripcion
            FROM historialFechasPedidos 
                LEFT JOIN pedidos on historialFechasPedidos.idPedido = pedidos.id
                LEFT JOIN inventario on pedidos.idinventario = inventario.id
            ORDER BY historialFechasPedidos.fecha_enviada DESC;`
      );
      this.historialFechasPedidos = rows;
      return { data: rows };
    } catch (error) {
      return { error: { message: "Something wrong", status: "error" } };
    }
  }

  getOne(idPedido) {
    return this.productsPedidos.find((elem) => elem.id == idPedido);
  }

  generateStringDateAndHours(date) {
    const hours = date.getHours();
    const minutes = date.getMinutes();

    const year = date.getFullYear();
    const mes = date.getMonth() + 1;
    const dia = date.getDate();

    const hora = `${hours < 10 ? `0${hours}` : hours}:${
      minutes < 10 ? `0${minutes}` : minutes
    }`;
    const fecha = `${year}-${mes < 10 ? `0${mes}` : mes}-${
      dia < 10 ? `0${dia}` : dia
    }`;

    return [fecha, hora];
  }

  async postHistorialFechasPedidos(object) {
    const { idPedido, cantidad_enviada, numRemito, numNotaEnvio } = object;

    if (idPedido == null || idPedido == "")
      CustomError.createError({
        cause: "Campo Pedido esta Vacio",
        message: "Campo Pedido esta Vacio",
        code: ENUM_ERRORS.INVALID_TYPE_EMPTY,
        name: "idPedido",
      });

    if (cantidad_enviada == null || cantidad_enviada == "")
      CustomError.createError({
        cause: "Campo Cantidad Enviada esta Vacio",
        message: "Campo Cantidad Enviada esta Vacio",
        code: ENUM_ERRORS.INVALID_TYPE_EMPTY,
        name: "cantidadEnviada",
      });

    if (numRemito != null && numRemito != "") {
      const numRemitoInteger = parseInt(numRemito);
      if (!Number.isInteger(numRemitoInteger))
        CustomError.createError({
          cause: "El campo Remito tiene que ser Numerico",
          message: "El campo Remito tiene que ser Numerico",
          code: ENUM_ERRORS.INVALID_TYPES_ERROR,
          name: "numRemito",
        });

      if (numRemito.length != 13)
        CustomError.createError({
          cause: "El remito tiene 13 numeros, ej: 0000100001473",
          message: "El remito tiene 13 numeros, ej: 0000100001473",
          code: ENUM_ERRORS.INVALID_TYPES_ERROR,
          name: "numRemito",
        });
    }

    const fechaDate = new Date();

    const stringDate = `${fechaDate.getFullYear()}-${
      fechaDate.getMonth() + 1
    }-${fechaDate.getDate()}`;

    const horaString = `${fechaDate.getHours()}:${fechaDate.getMinutes()}`;

    try {
      const [rows] = await con.query(
        "INSERT INTO historialFechasPedidos (`idPedido`, `fecha_enviada`, `hora`, `cantidad_enviada`, `numRemito`, `numNotaEnvio`) VALUES (?,?,?,?,?,?);",
        [
          idPedido,
          stringDate,
          horaString,
          cantidad_enviada,
          numRemito != "" ? numRemito : null,
          numNotaEnvio != "" ? numNotaEnvio : null,
        ]
      );

      if (rows.affectedRows >= 1) {
        const [result] = await con.query(
          `SELECT historialFechasPedidos.*, pedidos.ordenCompra, pedidos.idinventario, inventario.descripcion
                FROM historialFechasPedidos 
                    LEFT JOIN pedidos on historialFechasPedidos.idPedido = pedidos.id
                    LEFT JOIN inventario on pedidos.idinventario = inventario.id
                WHERE historialFechasPedidos.id = ?;`,
          [rows.insertId]
        );

        return { data: { status: "success", data: result[0] } };
      } else return { error: { message: "No se agrego", status: "error" } };
    } catch (error) {
      switch (error.code) {
        case "ER_TRUNCATED_WRONG_VALUE_FOR_FIELD":
          if (error.sqlMessage.includes("cantidad_enviada"))
            CustomError.createError({
              cause: "Campo Cantidad Enviar tiene que ser numerico",
              message: "Campo Cantidad Enviar tiene que ser numerico",
              code: ENUM_ERRORS.INVALID_TYPES_ERROR,
              name: "cantidadEnviada",
            });

          if (error.sqlMessage.includes("numNotaEnvio"))
            CustomError.createError({
              cause: "Campo Nota Envio tiene que ser numerico",
              message: "Campo Nota Envio tiene que ser numerico",
              code: ENUM_ERRORS.INVALID_TYPES_ERROR,
              name: "numNotaEnvio",
            });

        case "ER_NO_REFERENCED_ROW_2":
          if (error.sqlMessage.includes("idPedido"))
            CustomError.createError({
              cause: "No existe ese pedido",
              message: "No existe ese pedido",
              code: ENUM_ERRORS.FOREING_KEY_OBJECT_NOT_EXISTS,
              name: "idPedido",
            });

          break;
      }
      return { error: { message: "No se agrego", status: "error" } };
    }
  }

  async updateHistorialFechasPedidos(idHistorial, object) {
    let { fechaDate, cantidad_enviada, numRemito, numNotaEnvio } = object;

    if (fechaDate == "") fechaDate = null;
    if (cantidad_enviada == "") cantidad_enviada = null;
    if (numRemito == "") numRemito = null;
    if (numNotaEnvio == "") numNotaEnvio = null;

    let horaString = null;
    let fechaString = null;
    if (fechaDate != null && fechaDate != "") {
      let date = new Date();

      if (fechaDate != "" && fechaDate != null)
        date = moment(fechaDate).toDate();

      if (Number.isNaN(date.getDate()))
        CustomError.createError({
          name: "fecha",
          cause: "Error en el formato",
          code: ENUM_ERRORS.INVALID_TYPES_ERROR,
          message: "Error en el formato",
        });

      const [fecha, hora] = this.generateStringDateAndHours(date);

      fechaString = fecha;
      horaString = hora;
    }
    if (cantidad_enviada != null && cantidad_enviada != "") {
      const cantidadEnviadaInteger = parseInt(cantidad_enviada);
      if (!Number.isInteger(cantidadEnviadaInteger))
        CustomError.createError({
          cause: "Campo Cantidad Enviar tiene que ser numerico",
          message: "Campo Cantidad Enviar tiene que ser numerico",
          code: ENUM_ERRORS.INVALID_TYPES_ERROR,
          name: "cantidadEnviada",
        });
    }
    if (numRemito != null && numRemito != "") {
      const numRemitoInteger = parseInt(numRemito);
      if (!Number.isInteger(numRemitoInteger))
        CustomError.createError({
          cause: "Campo Num Remito tiene que ser numerico",
          message: "Campo Num Remito tiene que ser numerico",
          code: ENUM_ERRORS.INVALID_TYPES_ERROR,
          name: "numRemito",
        });
      if (numRemito.length != 13)
        CustomError.createError({
          cause: "El remito tiene 13 numeros, ej: 0000100001473",
          message: "El remito tiene 13 numeros, ej: 0000100001473",
          code: ENUM_ERRORS.INVALID_TYPES_ERROR,
          name: "numRemito",
        });
    }

    try {
      const [result] = await con.query(
        `UPDATE historialFechasPedidos SET
              fecha_enviada = IFNULL(?,fecha_enviada),
              hora = IFNULL(?,hora),
              cantidad_enviada = IFNULL(?,cantidad_enviada),
              numRemito = IFNULL(?,numRemito),
              numNotaEnvio = IFNULL(?,numNotaEnvio)
          WHERE id = ?`,
        [
          fechaString,
          horaString,
          cantidad_enviada,
          numRemito,
          numNotaEnvio,
          idHistorial,
        ]
      );
      if (result.affectedRows == 0)
        return { error: { message: "No se actualizo", status: "error" } };

      try {
        const [result] = await con.query(
          `SELECT historialFechasPedidos.*, pedidos.ordenCompra, pedidos.idinventario, inventario.descripcion
                  FROM historialFechasPedidos 
                      LEFT JOIN pedidos on historialFechasPedidos.idPedido = pedidos.id
                      LEFT JOIN inventario on pedidos.idinventario = inventario.id
                  WHERE historialFechasPedidos.id = ?;`,
          [idHistorial]
        );

        return { data: { status: "success", data: result[0] } };
      } catch (e) {
        return {
          error: {
            message: "No se obtuvo el objeto actualizado",
            status: "error",
          },
        };
      }
    } catch (error) {
      switch (error.code) {
        case "ER_TRUNCATED_WRONG_VALUE_FOR_FIELD":
          if (error.sqlMessage.includes("cantidad_enviada"))
            CustomError.createError({
              cause: "Campo Cantidad Enviar tiene que ser numerico",
              message: "Campo Cantidad Enviar tiene que ser numerico",
              code: ENUM_ERRORS.INVALID_TYPES_ERROR,
              name: "cantidadEnviada",
            });

          if (error.sqlMessage.includes("numNotaEnvio"))
            CustomError.createError({
              cause: "Campo Nota Envio tiene que ser numerico",
              message: "Campo Nota Envio tiene que ser numerico",
              code: ENUM_ERRORS.INVALID_TYPES_ERROR,
              name: "numNotaEnvio",
            });

        case "ER_NO_REFERENCED_ROW_2":
          if (error.sqlMessage.includes("idPedido"))
            CustomError.createError({
              cause: "No existe ese pedido",
              message: "No existe ese pedido",
              code: ENUM_ERRORS.FOREING_KEY_OBJECT_NOT_EXISTS,
              name: "idPedido",
            });

          break;
      }
      return { error: { message: "No se agrego", status: "error" } };
    }
  }

  async deleteHistorialFechasPedidos(idHistorial) {
    try {
      const [result] = await con.query(
        "DELETE FROM historialFechasPedidos WHERE (`id` = ?);",
        [idHistorial]
      );

      if (result.affectedRows == 0)
        CustomError.createError({
          cause: "No se elimino",
          message: "No se elimino",
          code: ENUM_ERRORS.INVALID_OBJECT_NOT_EXISTS,
          name: "idHistorial",
        });

      const filter = this.historialFechasPedidos.filter(
        (elem) => elem.id != idHistorial
      );
      this.historialFechasPedidos = filter;

      return {
        data: { status: "success", message: "Eliminado Correctamente" },
      };
    } catch (error) {
      throw error;
    }
  }

  async deleteByIdPedido(idPedido) {
    try {
      const [rows] = await con.query(
        `SELECT id, idPedido FROM historialFechasPedidos WHERE idPedido = ?;`,
        [idPedido]
      );

      for (let i = 0; i < rows.length; i++) {
        const { id } = rows[i];
        try {
          await this.deleteHistorialFechasPedidos(id);
        } catch (error) {
        }
      }
    } catch (error) {
    }
  }
}
