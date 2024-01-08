import { con } from "../config/db.js";
import { clientesManager, inventarioManager } from "../index.js";

export default class PedidosManager {
  constructor() {
    this.listPedidos = [];
  }

  async getPedidos() {
    try {
      const [rows] = await con.query(
        `SELECT pedidos.*,clientes.cliente, clientes.id AS idcliente, inventario.id AS idinventario, inventario.nombre, inventario.descripcion, inventario.url_image, inventario.articulo
                FROM pedidos 
                    LEFT JOIN inventario on pedidos.idinventario = inventario.id
                    LEFT JOIN clientes on pedidos.idcliente = clientes.id
                ORDER BY pedidos.fecha_entrega DESC;`
      );

      this.listPedidos = rows;

      return { data: rows };
    } catch (error) {
      console.log(error);
      return { error: { message: "Something wrong" } };
    }
  }

  getOne(idPedido) {
    return this.listPedidos.find((elem) => elem.id == idPedido);
  }

  getListByIdInventario(idInventario) {
    return this.listPedidos.filter((elem) => elem.idinventario == idInventario);
  }

  getListByIdCliente(idCliente) {
    return this.listPedidos.filter((elem) => elem.idcliente == idCliente);
  }

  getListByIsDone(done) {
    if (done >= 1) {
      return this.listPedidos.filter((elem) => elem.is_done >= done);
    }
    if (done <= 0) {
      return this.listPedidos.filter((elem) => elem.is_done <= done);
    }
  }

  async postPedidos(object) {
    const { idinventario, idcliente, stock, fecha_entrega } = object;

    if (fecha_entrega == null || fecha_entrega == "")
      return {
        error: { message: "Campo Fecha Entrega Vacio", campo: "fecha" },
      };

    if (idinventario == null || idinventario == "")
      return {
        error: { message: "Campo Cod Producto Vacio", campo: "idinventario" },
      };

    if (idcliente == null || idcliente == "")
      return {
        error: { message: "Campo Cliente Vacio", campo: "cliente" },
      };

    if (stock == null || stock == "")
      return {
        error: {
          message: "Campo Stock Pedido Vacia",
          campo: "stock",
        },
      };

    const stockInteger = parseInt(stock);

    //Verificamos que sean de tipo Integer
    if (!Number.isInteger(stockInteger))
      return {
        error: {
          message: "Campo Stock Pedido No es un numero",
          campo: "stock",
        },
      };

    //Convertimos la fecha ingresada a tipo Date
    const fechaDate = new Date(fecha_entrega);

    if (Number.isNaN(fechaDate.getDate()))
      return {
        error: { message: "Error en el formato de la Fecha", campo: "fecha" },
      };

    //Verificar si existe el idInventario
    if (!inventarioManager.existsIdInventario(idinventario))
      return {
        error: {
          message: "No existe ese Cod Producto",
          campo: "idinventario",
        },
      };

    //Verificar si existe el idCliente
    if (!clientesManager.existsIdCliente(idcliente))
      return {
        error: {
          message: "No existe ese Cod Producto",
          campo: "idinventario",
        },
      };

    try {
      const [rows] = await con.query(
        "INSERT INTO pedidos (`idinventario`, `idcliente`, `stock`, `fecha_entrega`) VALUES (?,?,?,?);",
        [idinventario, idcliente, stock, fecha_entrega]
      );
      if (rows.affectedRows >= 1)
        return {
          data: { message: "Operacion Exitosa", insertId: rows.insertId },
        };
      else return { error: { message: "No se Agrego" } };
    } catch (error) {
      return { error: { message: "Something wrong" } };
    }
  }

  async postListPedidos(list) {
    //Verificamos que este todo correcto
    let verify = [{ idInventario: null }];
    for (let i = 0; i < list.length; i++) {
      const { idinventario, idcliente, stock, fecha_entrega } = list[i];

      if (fecha_entrega == null || fecha_entrega == "")
        return {
          error: {
            message: "Campo Fecha Entrega Vacio",
            campo: "fecha",
            index: i,
          },
        };

      if (idinventario == null || idinventario == "")
        return {
          error: {
            message: "Campo Cod Producto Vacio",
            campo: "idinventario",
            index: i,
          },
        };

      if (idcliente == null || idcliente == "")
        return {
          error: { message: "Campo Cliente Vacio", campo: "cliente", index: i },
        };

      if (stock == null || stock == "")
        return {
          error: {
            message: "Campo Stock Pedido Vacia",
            campo: "stock",
            index: i,
          },
        };

      const stockInteger = parseInt(stock);

      //Verificamos que sean de tipo Integer
      if (!Number.isInteger(stockInteger))
        return {
          error: {
            message: "Campo Stock Pedido No es un numero",
            campo: "stock",
            index: i,
          },
        };

      //Convertimos la fecha ingresada a tipo Date
      const fechaDate = new Date(fecha_entrega);

      if (Number.isNaN(fechaDate.getDate()))
        return {
          error: {
            message: "Error en el formato de la Fecha",
            campo: "fecha",
            index: i,
          },
        };

      //Verificar si existe el idInventario
      if (!inventarioManager.existsIdInventario(idinventario))
        return {
          error: {
            message: "No existe ese Cod Producto",
            campo: "idinventario",
            index: i,
          },
        };

      //Verificar si existe el idCliente
      if (!clientesManager.existsIdCliente(idcliente))
        return {
          error: {
            message: "No existe ese Cod Producto",
            campo: "idinventario",
            index: i,
          },
        };

      const findIdInventario = verify.find(
        (elem) => elem.idInventario == element.idInventario
      );

      if (findIdInventario)
        return {
          error: {
            message: "Se repite el Cod Producto",
            index: i,
            campo: "idinventario",
          },
        };

      //Agregamos el idInventario para luego validar el siguiente
      verify.push({
        idInventario: element.idInventario,
      });
    }

    //Agregamos a la base de datos
    for (let i = 0; i < list.length; i++) {
      const element = list[i];

      try {
        const { data, error } = await this.postPedidos(element);
        if (error) return { error };
      } catch (err) {
        return { error: "something wrong" };
      }
    }

    return {
      data: {
        message: "Operacion Exitosa",
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
              campo: "stock",
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
          return { error: { message: "No se encontro el pedido" } };

        return { data: { message: "Se actulizo correctamente" } };
      }
    }

    return {
      error: {
        message: "Something Wrong",
        campo: "isDone",
      },
    };
  }

  async updatePedidosStockDisposicion(idPedido, stockDisposicion) {
    if (stockDisposicion) {
      if (stockDisposicion != "") {
        const stockDisposicionInteger = parseInt(stockDisposicion);
        if (!Number.isInteger(stockDisposicionInteger)) {
          return {
            error: {
              message: "No es Numerico",
              campo: "stockDisposicion",
            },
          };
        }

        //Validar el tope del stockDisposicion

        const [result] = await con.query(
          `UPDATE pedidos
              SET stockDisposicion = IFNULL(?, stockDisposicion)
              WHERE id = ?;`,
          [stockDisposicionInteger, idPedido]
        );

        if (result.affectedRows === 0)
          return { error: { message: "No se encontro el pedido" } };

        return { data: { message: "Se actulizo correctamente la cantidad faltante " } };
      }
    }

    return {
      error: {
        message: "Something Wrong",
        campo: "isDone",
      },
    };
  }

  async updatePedidos(idPedido, object) {
    const { idinventario, idcliente, stock, fecha_entrega } = object;

    if (idinventario == "" && idcliente == "" && stock == "" && fecha_entrega == "") {
      return {
        error: {
          message: "Campos Vacios"
        },
      };
    }
    if (idinventario == null && idcliente == null && stock == null && fecha_entrega == null) {
      return {
        error: {
          message: "Campos Vacios"
        },
      };
    }

    let enviar = {
      idinventario: null,
      idcliente: null,
      stock: null,
      fecha_entrega: null,
    };

    if (fecha_entrega) {
      if (fecha_entrega != "") {
        const fechaDate = new Date(fecha_entrega);

        if (Number.isNaN(fechaDate.getDate())) {
          return {
            error: {
              message: "Error en el formato de la Fecha",
              campo: "fecha",
            },
          };
        }
        enviar.fecha_entrega = fecha_entrega;
      }
    }
    if (idinventario) {
      if (idinventario != "") {
        //Verificar si existe el idInventario
        if (!inventarioManager.existsIdInventario(idinventario)) {
          return {
            error: {
              message: "No existe ese Cod Producto",
              campo: "idinventario",
            },
          };
        }
        enviar.idinventario = idinventario;
      }
    }

    if (idcliente) {
      if (idcliente != "") {
        if (!clientesManager.existsIdCliente(idcliente)) {
          return {
            error: {
              message: "No existe ese Cod Producto",
              campo: "idinventario",
            },
          };
        }
        enviar.idcliente = idcliente;
      }
    }

    if (stock) {
      if (stock != "") {
        const stockInteger = parseInt(stock);
        if (!Number.isInteger(stockInteger)) {
          return {
            error: {
              message: "Campo Stock Pedido No es un numero",
              campo: "stock",
            },
          };
        }
        enviar.stock = stockInteger;
      }
    }

    const [result] = await con.query(
      `UPDATE pedidos
          SET idinventario = IFNULL(?,idinventario),
              idcliente = IFNULL(?,idcliente),
              stock = IFNULL(?,stock),
              fecha_entrega = IFNULL(?,fecha_entrega)
          WHERE id = ?;`,
      [
        enviar.idinventario,
        enviar.idcliente,
        enviar.stock,
        enviar.fecha_entrega,
        idPedido,
      ]
    );

    if (result.affectedRows === 0)
      return { error: { message: "No se encontro el pedido" } };

    const [rows] = await con.query(
      `SELECT pedidos.*,clientes.cliente, clientes.id AS idcliente, inventario.id AS idinventario, inventario.nombre, inventario.descripcion, inventario.url_image, inventario.articulo
                FROM pedidos 
                    LEFT JOIN inventario on pedidos.idinventario = inventario.id
                    LEFT JOIN clientes on pedidos.idcliente = clientes.id
                WHERE pedidos.id=?;`,
      [idPedido]
    );

    //Update listPedidos
    const updatePedido = this.listPedidos.map((elem) => {
      if (elem.id == idPedido) return rows[0];
      else return elem;
    });

    this.listPedidos = updatePedido;

    return { data: { message: "Se actualizo con exito" } };
  }

  async deletePedido(idPedido) {
    try {
      const [result] = await con.query("DELETE FROM pedidos WHERE (`id` = ?)", [
        idPedido,
      ]);

      const deleteByIdPedido = this.listPedidos.filter(
        (elem) => elem.id != idPedido
      );
      this.listPedidos = deleteByIdPedido;

      if (result.affectedRows >= 1)
        return {
          data: { message: "Se elimino Correctamente" },
        };
      else return { error: { message: "No existe" } };
    } catch (error) {
      console.log(error);
      return { error: { message: "Something Wrong" } };
    }
  }
}
