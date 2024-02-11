import { con } from "../config/db.js";
import CustomError from "../errors/Custom_errors.js";
import { ENUM_ERRORS } from "../errors/enums.js";
import { clientesManager, historialPedidosManager, inventarioManager } from "../index.js";

export default class PedidosManager {
  constructor() {
    this.productsPedidos = [];
  }

  async getPedidos() {
    try {
      const [rows] = await con.query(
        `SELECT pedidos.*,clientes.cliente, clientes.id AS idcliente, inventario.id AS idInventario, inventario.nombre, inventario.descripcion, inventario.url_image, inventario.articulo
                FROM pedidos 
                    LEFT JOIN inventario on pedidos.idinventario = inventario.id
                    LEFT JOIN clientes on pedidos.idcliente = clientes.id
                ORDER BY pedidos.fecha_entrega DESC;`
      );
      this.productsPedidos = rows;

      return { data: rows };
    } catch (error) {
      return { error: { message: "Something wrong" } };
    }
  }

  getOne(idPedido) {
    return this.productsPedidos.find((elem) => elem.id == idPedido);
  }

  getproductsByidInventario(idInventario) {
    return this.productsPedidos.filter(
      (elem) => elem.idInventario == idInventario
    );
  }

  getproductsByIdCliente(idCliente) {
    return this.productsPedidos.filter((elem) => elem.idcliente == idCliente);
  }

  getproductsByIsDone(done) {
    if (done >= 1) {
      return this.productsPedidos.filter((elem) => elem.is_done >= done);
    }
    if (done <= 0) {
      return this.productsPedidos.filter((elem) => elem.is_done <= done);
    }
  }

  async postPedidos(object) {
    const {
      idInventario,
      idcliente,
      cantidadEnviar,
      fecha_entrega,
      ordenCompra,
    } = object;

    if (fecha_entrega == null || fecha_entrega == "")
      CustomError.createError({
        cause: "Campo Fecha Entrega esta Vacia",
        message: "Campo fecha entrega vacio",
        code: ENUM_ERRORS.INVALID_TYPE_EMPTY,
        name: "fechaEntrega",
      });

    if (idInventario == null || idInventario == "")
      CustomError.createError({
        cause: "Campo Cod.Producto esta Vacio",
        message: "Campo Cod.Producto vacio",
        code: ENUM_ERRORS.INVALID_TYPE_EMPTY,
        name: "idInventario",
      });

    if (idcliente == null || idcliente == "")
      CustomError.createError({
        cause: "Campo Cliente esta Vacio",
        message: "Campo Cliente esta vacio",
        code: ENUM_ERRORS.INVALID_TYPE_EMPTY,
        name: "cliente",
      });

    if (cantidadEnviar == null || cantidadEnviar == "")
      CustomError.createError({
        cause: "Campo Cantidad a Enviar esta Vacio",
        message: "Campo Cantidad a Enviar esta vacio",
        code: ENUM_ERRORS.INVALID_TYPE_EMPTY,
        name: "cantidadEnviar",
      });

    //Convertimos la fecha ingresada a tipo Date
    const fechaDate = new Date(fecha_entrega);

    if (Number.isNaN(fechaDate.getDate()))
      CustomError.createError({
        name: "fecha",
        cause: "Error en el formato",
        code: ENUM_ERRORS.INVALID_TYPES_ERROR,
        message: "Error en el formato",
      });

    try {
      const [rows] = await con.query(
        "INSERT INTO pedidos (`idInventario`, `idcliente`, `cantidadEnviar`, `fecha_entrega`, `ordenCompra`) VALUES (?,?,?,?,?);",
        [idInventario, idcliente, cantidadEnviar, fecha_entrega, ordenCompra]
      );

      try {
        const [result] = await con.query(
          `SELECT pedidos.*,clientes.cliente, clientes.id AS idcliente, inventario.id AS idInventario, inventario.nombre, inventario.descripcion, inventario.url_image, inventario.articulo
            FROM pedidos 
              LEFT JOIN inventario on pedidos.idinventario = inventario.id
              LEFT JOIN clientes on pedidos.idcliente = clientes.id
            WHERE pedidos.id = ?;`,
          [rows.insertId]
        );

        return {
          data: {
            message: "Operacion Exitosa",
            data: result[0],
            status: "success",
          },
        };
      } catch (error) {
        throw error;
      }
    } catch (error) {
      switch (error.code) {
        case "ER_NO_REFERENCED_ROW_2":
        case "ER_TRUNCATED_WRONG_VALUE_FOR_FIELD":
          if (error.sqlMessage.includes("idinventario")) {
            CustomError.createError({
              name: "idinventario",
              cause: "No existe ese cod.producto",
              message: "No existe ese cod.producto",
              code: ENUM_ERRORS.FOREING_KEY_OBJECT_NOT_EXISTS,
            });
          }
          if (error.sqlMessage.includes("idcliente")) {
            CustomError.createError({
              name: "idcliente",
              cause: "No existe ese cliente",
              message: "No existe ese cliente",
              code: ENUM_ERRORS.FOREING_KEY_OBJECT_NOT_EXISTS,
            });
          }
          if (error.sqlMessage.includes("cantidadEnviar")) {
            CustomError.createError({
              name: "cantidadEnviar",
              cause: "Cantidad Enviar no es numerico",
              message: "Cantidad Enviar no es numerico",
              code: ENUM_ERRORS.INVALID_TYPES_ERROR,
            });
          }
          break;
      }

      return { error: { message: "Something wrong" } };
    }
  }

  async postListPedidos(object) {
    const { fechaEntrega, idCliente, nroOrden, products } = object;

    if (fechaEntrega == null || fechaEntrega == "")
      CustomError.createError({
        cause: "Campo Fecha Entrega esta Vacio",
        message: "Campo Fecha Entrega esta vacio",
        code: ENUM_ERRORS.INVALID_TYPE_EMPTY,
        name: "fechaEntrega",
      });

    if (idCliente == null || idCliente == "")
      CustomError.createError({
        cause: "Campo Cliente esta Vacio",
        message: "Campo Cliente esta vacio",
        code: ENUM_ERRORS.INVALID_TYPE_EMPTY,
        name: "cliente",
      });

    if (products == null || products.length == 0)
      CustomError.createError({
        cause: "No seleccionaste ningun producto",
        message: "No seleccionaste ningun producto",
        code: ENUM_ERRORS.INVALID_TYPE_EMPTY,
        name: "products",
      });

    if (!Array.isArray(products))
      CustomError.createError({
        cause: "Algo paso en la lista products",
        message: "Algo paso en la lista products",
        code: ENUM_ERRORS.INVALID_TYPES_ERROR,
        name: "products",
      });

    const fechaDate = new Date(fechaEntrega);
    if (Number.isNaN(fechaDate.getDate()))
      CustomError.createError({
        name: "fecha",
        cause: "Error en el formato",
        code: ENUM_ERRORS.INVALID_TYPES_ERROR,
        message: "Error en el formato",
      });

    //Verificamos que este todo correcto
    for (let i = 0; i < products.length; i++) {
      const { idProduct, cantidadEnviar } = products[i];

      if (idProduct == null || idProduct == "")
        return {
          error: {
            message: "Campo Cod Producto Vacio",
            campo: "idInventario",
            index: i,
          },
        };

      if (cantidadEnviar == null || cantidadEnviar == "")
        return {
          error: {
            message: "Campo cantidadEnviar Pedido Vacia",
            campo: "cantidadEnviar",
            index: i,
          },
        };

      const cantidadEnviarInteger = parseInt(cantidadEnviar);

      //Verificamos que sean de tipo Integer
      if (!Number.isInteger(cantidadEnviarInteger))
        return {
          error: {
            message: "Campo Cantidad Enviar No es un numerico",
            campo: "cantidadEnviar",
            index: i,
          },
        };
    }

    //Agregamos a la base de datos
    for (let i = 0; i < products.length; i++) {
      const element = products[i];
      try {
        await this.postPedidos({
          fecha_entrega: fechaEntrega,
          idcliente: idCliente,
          ordenCompra: nroOrden,
          cantidadEnviar: element.cantidadEnviar,
          idInventario: element.id,
        });
      } catch (err) {
        throw err;
      }
    }

    return {
      data: {
        message: "Operacion Exitosa",
        status: "success",
      },
    };
  }

  async updatePedidosIsDone(idPedido, isDone) {
    if (isDone) {
      if (isDone != "") {
        const isDoneInteger = parseInt(isDone);
        if (!Number.isInteger(isDoneInteger)) {
          return {
            error: {
              message: "No es Numerico",
              campo: "cantidadEnviar",
              status: "error",
            },
          };
        }

        const isDoneCheck = isDoneInteger >= 1 ? 1 : 0;

        const [result] = await con.query(
          `UPDATE pedidos
              SET is_done = IFNULL(?,is_done)
              WHERE id = ?;`,
          [isDoneCheck, idPedido]
        );

        if (result.affectedRows === 0)
          return {
            error: { message: "No se encontro el pedido", status: "error" },
          };

        return {
          data: { message: "Se actulizo correctamente", status: "success" },
        };
      }
    }

    return {
      error: {
        status: "error",
        message: "Something Wrong",
        campo: "isDone",
      },
    };
  }

  async updatePedidos(idPedido, object) {
    const {
      idInventario,
      idcliente,
      cantidadEnviar,
      fecha_entrega,
      ordenCompra,
      cantidadEnviada,
    } = object;

    let enviar = {
      idInventario: null,
      idcliente: null,
      cantidadEnviar: null,
      fecha_entrega: null,
      ordenCompra: null,
      cantidadEnviada: null,
    };

    if (fecha_entrega && fecha_entrega != "") {
      const fechaDate = new Date(fecha_entrega);

      if (Number.isNaN(fechaDate.getDate()))
        CustomError.createError({
          name: "fecha",
          cause: "Error en el formato",
          code: ENUM_ERRORS.INVALID_TYPES_ERROR,
          message: "Error en el formato",
        });

      enviar.fecha_entrega = fecha_entrega;
    }

    if (idInventario && idInventario != "") enviar.idInventario = idInventario;

    if (idcliente && idcliente != "") enviar.idcliente = idcliente;

    if (cantidadEnviar != null && cantidadEnviar != "") {
      const cantidadEnviarInteger = parseInt(cantidadEnviar);
      if (!Number.isInteger(cantidadEnviarInteger))
        CustomError.createError({
          name: "cantidadEnviar",
          cause: "Cantidad a Enviar no es numerico",
          code: ENUM_ERRORS.INVALID_TYPES_ERROR,
          message: "Cantidad a Enviar no es numerico",
        });

      enviar.cantidadEnviar = cantidadEnviarInteger;
    }

    if (cantidadEnviada && cantidadEnviada != "") {
      const cantidadEnviadaInteger = parseInt(cantidadEnviada);
      if (!Number.isInteger(cantidadEnviadaInteger))
        CustomError.createError({
          name: "cantidadEnviada",
          cause: "Cantidad Enviada no es numerico",
          code: ENUM_ERRORS.INVALID_TYPES_ERROR,
          message: "Cantidad Enviada no es numerico",
        });

      enviar.cantidadEnviada = cantidadEnviadaInteger;
    }

    if (ordenCompra && ordenCompra != "") enviar.ordenCompra = ordenCompra;

    try {
      const [result] = await con.query(
        `UPDATE pedidos
            SET idinventario = IFNULL(?,idinventario),
                idcliente = IFNULL(?,idcliente),
                cantidadEnviar = IFNULL(?,cantidadEnviar),
                fecha_entrega = IFNULL(?,fecha_entrega),
                ordenCompra = IFNULL(?,ordenCompra),
                cantidad_enviada = IFNULL(?,cantidad_enviada)
            WHERE id = ?;`,
        [
          enviar.idInventario,
          enviar.idcliente,
          enviar.cantidadEnviar,
          enviar.fecha_entrega,
          enviar.ordenCompra,
          enviar.cantidadEnviada,
          idPedido,
        ]
      );

      if (result.affectedRows === 0)
        return { error: { message: "No se encontro el pedido" } };

      // Agregando en la parte de historial la parte enviada
      if (enviar.cantidadEnviada != null) {
        try {
          await historialPedidosManager.postHistorialFechasPedidos({ idPedido: idPedido, cantidad_enviada: enviar.cantidadEnviada })
        } catch (error) {
          throw error
        }
      }

      const [rows] = await con.query(
        `SELECT pedidos.*,clientes.cliente, clientes.id AS idcliente, inventario.id AS idInventario, inventario.nombre, inventario.descripcion, inventario.url_image, inventario.articulo
                  FROM pedidos 
                      LEFT JOIN inventario on pedidos.idInventario = inventario.id
                      LEFT JOIN clientes on pedidos.idcliente = clientes.id
                  WHERE pedidos.id=?;`,
        [idPedido]
      );

      //Update productsPedidos
      const updatePedido = this.productsPedidos.map((elem) => {
        if (elem.id == idPedido) return rows[0];
        else return elem;
      });

      this.productsPedidos = updatePedido;

      return {
        data: {
          message: "Se actualizo con exito",
          update: rows[0],
          status: "success",
        },
      };
    } catch (error) {
      switch (error.code) {
        case "ER_NO_REFERENCED_ROW_2":
        case "ER_TRUNCATED_WRONG_VALUE_FOR_FIELD":
          if (error.sqlMessage.includes("idinventario")) {
            CustomError.createError({
              name: "idinventario",
              cause: "No existe ese cod.producto",
              message: "No existe ese cod.producto",
              code: ENUM_ERRORS.FOREING_KEY_OBJECT_NOT_EXISTS,
            });
          }
          if (error.sqlMessage.includes("idcliente")) {
            CustomError.createError({
              name: "idcliente",
              cause: "No existe ese cliente",
              message: "No existe ese cliente",
              code: ENUM_ERRORS.FOREING_KEY_OBJECT_NOT_EXISTS,
            });
          }
          if (error.sqlMessage.includes("cantidadEnviar")) {
            CustomError.createError({
              name: "cantidadEnviar",
              cause: "Cantidad Enviar no es numerico",
              message: "Cantidad Enviar no es numerico",
              code: ENUM_ERRORS.INVALID_TYPES_ERROR,
            });
          }
          break;
      }
    }
  }

  async deletePedido(idPedido) {
    try {
      try {
        await historialPedidosManager.deleteByIdPedido(idPedido);
      } catch (error) {
        throw error
      }

      const [result] = await con.query("DELETE FROM pedidos WHERE (`id` = ?)", [
        idPedido,
      ]);

      const deleteByIdPedido = this.productsPedidos.filter(
        (elem) => elem.id != idPedido
      );
      this.productsPedidos = deleteByIdPedido;

      if (result.affectedRows >= 1)
        return {
          data: { message: "Se elimino Correctamente", status: "success" },
        };
      else
        CustomError.createError({
          name: "idPedido",
          cause: "No se encuentra el pedido",
          message: "No existe pedido",
          code: ENUM_ERRORS.INVALID_OBJECT_NOT_EXISTS,
        });
    } catch (error) {
      throw error;
    }
  }
}
