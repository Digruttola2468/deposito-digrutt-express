import { con } from "../config/db.js";
import { clientesManager, inventarioManager } from "../index.js";

export default class PedidosManager {
  constructor() {
    this.productsPedidos = [];
  }

  async getPedidos() {
    try {
      const [rows] = await con.query(
        `SELECT pedidos.*,clientes.cliente, clientes.id AS idcliente, inventario.id AS idProduct, inventario.nombre, inventario.descripcion, inventario.url_image, inventario.articulo
                FROM pedidos 
                    LEFT JOIN inventario on pedidos.idProduct = inventario.id
                    LEFT JOIN clientes on pedidos.idcliente = clientes.id
                ORDER BY pedidos.fecha_entrega DESC;`
      );

      this.productsPedidos = rows;

      return { data: rows };
    } catch (error) {
      console.log(error);
      return { error: { message: "Something wrong" } };
    }
  }

  getOne(idPedido) {
    return this.productsPedidos.find((elem) => elem.id == idPedido);
  }

  getproductsByidProduct(idProduct) {
    return this.productsPedidos.filter((elem) => elem.idProduct == idProduct);
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
    const { idProduct, idcliente, cantidadEnviar, fecha_entrega, ordenCompra } =
      object;

    if (fecha_entrega == null || fecha_entrega == "")
      return {
        error: { message: "Campo Fecha Entrega Vacio", campo: "fecha" },
      };

    if (idProduct == null || idProduct == "")
      return {
        error: { message: "Campo Cod Producto Vacio", campo: "idProduct" },
      };

    if (idcliente == null || idcliente == "")
      return {
        error: { message: "Campo Cliente Vacio", campo: "cliente" },
      };

    if (cantidadEnviar == null || cantidadEnviar == "")
      return {
        error: {
          message: "Campo cantidadEnviar Pedido Vacia",
          campo: "cantidadEnviar",
        },
      };

    const cantidadEnviarInteger = parseInt(cantidadEnviar);

    //Verificamos que sean de tipo Integer
    if (!Number.isInteger(cantidadEnviarInteger))
      return {
        error: {
          message: "Campo cantidadEnviar Pedido No es un numero",
          campo: "cantidadEnviar",
        },
      };

    //Convertimos la fecha ingresada a tipo Date
    const fechaDate = new Date(fecha_entrega);

    if (Number.isNaN(fechaDate.getDate()))
      return {
        error: { message: "Error en el formato de la Fecha", campo: "fecha" },
      };

    //Verificar si existe el idProduct
    if (!inventarioManager.existsidProduct(idProduct))
      return {
        error: {
          message: "No existe ese Cod Producto",
          campo: "idProduct",
        },
      };

    //Verificar si existe el idCliente
    if (!clientesManager.existsIdCliente(idcliente))
      return {
        error: {
          message: "No existe ese Cod Producto",
          campo: "idProduct",
        },
      };

    try {
      const [rows] = await con.query(
        "INSERT INTO pedidos (`idProduct`, `idcliente`, `cantidadEnviar`, `fecha_entrega`, `ordenCompra`) VALUES (?,?,?,?,?);",
        [idProduct, idcliente, cantidadEnviar, fecha_entrega, ordenCompra]
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
  /*{
    "cantidadEnviar": "5574",
    "idProduct": 13,
    "id": 13,
    "nombre": "oreja029",
    "descripcion": "oreja (A) grande negro x 400 unid ",
    "idcliente": 1,
    "urlImage": null,
    "entrada": 2400,
    "salida": 0,
    "articulo": "AXE009OGN",
    "cliente": "axel"
},*/
  async postListPedidos(object) {
    const { fechaEntrega, idCliente, nroOrden, products } = object;

    if (fechaEntrega == null || fechaEntrega == "")
      return { error: { message: "Campo Fecha Vacio" } };

    if (idCliente == null || idCliente == "")
      return { error: { message: "Campo Cliente Vacio" } };

    if (products == null || products.length == 0)
      return { error: { message: "No seleccionaste ningun producto" } };

    if (!Array.isArray(products))
      return { error: { message: "Algo paso con la products" } };

    const fechaDate = new Date(fecha);

    if (Number.isNaN(fechaDate.getDate()))
      return { error: { message: "Error en el formato de la Fecha" } };

    //Verificamos que este todo correcto
    for (let i = 0; i < products.length; i++) {
      const { idProduct, idcliente, cantidadEnviar } = products[i];

      if (idProduct == null || idProduct == "")
        return {
          error: {
            message: "Campo Cod Producto Vacio",
            campo: "idProduct",
            index: i,
          },
        };

      if (idcliente == null || idcliente == "")
        return {
          error: { message: "Campo Cliente Vacio", campo: "cliente", index: i },
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

      //Verificar si existe el idProduct
      if (!inventarioManager.existsidProduct(idProduct))
        return {
          error: {
            message: "No existe ese Cod Producto",
            campo: "idProduct",
            index: i,
          },
        };

      //Verificar si existe el idCliente
      if (!clientesManager.existsIdCliente(idcliente))
        return {
          error: {
            message: "No existe ese Cliente",
            campo: "cliente",
            index: i,
          },
        };
    }

    //Agregamos a la base de datos
    for (let i = 0; i < products.length; i++) {
      const element = products[i];
      try {
        const { data, error } = await this.postPedidos({
          fecha_entrega: fechaEntrega,
          idCliente,
          ordenCompra: nroOrden,
          cantidadEnviar: element.cantidadEnviar,
          idProduct: element.id,
        });
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
              campo: "cantidadEnviar",
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

  async updatePedidoscantidadEnviarDisposicion(
    idPedido,
    cantidadEnviarDisposicion
  ) {
    if (cantidadEnviarDisposicion) {
      if (cantidadEnviarDisposicion != "") {
        const cantidadEnviarDisposicionInteger = parseInt(
          cantidadEnviarDisposicion
        );
        if (!Number.isInteger(cantidadEnviarDisposicionInteger)) {
          return {
            error: {
              message: "No es Numerico",
              campo: "cantidadEnviarDisposicion",
            },
          };
        }

        //Validar el tope del cantidadEnviarDisposicion

        const [result] = await con.query(
          `UPDATE pedidos
              SET cantidadEnviarDisposicion = IFNULL(?, cantidadEnviarDisposicion)
              WHERE id = ?;`,
          [cantidadEnviarDisposicionInteger, idPedido]
        );

        if (result.affectedRows === 0)
          return { error: { message: "No se encontro el pedido" } };

        return {
          data: { message: "Se actulizo correctamente la cantidad faltante " },
        };
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
    const {
      idProduct,
      idcliente,
      cantidadEnviar,
      fecha_entrega,
      ordenCompra,
      cantidadEnviada,
    } = object;

    if (
      idProduct == "" &&
      idcliente == "" &&
      cantidadEnviar == "" &&
      fecha_entrega == ""
    ) {
      return {
        error: {
          message: "Campos Vacios",
        },
      };
    }
    if (
      idProduct == null &&
      idcliente == null &&
      cantidadEnviar == null &&
      fecha_entrega == null
    ) {
      return {
        error: {
          message: "Campos Vacios",
        },
      };
    }

    let enviar = {
      idProduct: null,
      idcliente: null,
      cantidadEnviar: null,
      fecha_entrega: null,
      ordenCompra: null,
      cantidadEnviada: null,
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
    if (idProduct) {
      if (idProduct != "") {
        //Verificar si existe el idProduct
        if (!inventarioManager.existsidProduct(idProduct)) {
          return {
            error: {
              message: "No existe ese Cod Producto",
              campo: "idProduct",
            },
          };
        }
        enviar.idProduct = idProduct;
      }
    }

    if (idcliente) {
      if (idcliente != "") {
        if (!clientesManager.existsIdCliente(idcliente)) {
          return {
            error: {
              message: "No existe ese Cod Producto",
              campo: "idProduct",
            },
          };
        }
        enviar.idcliente = idcliente;
      }
    }

    if (cantidadEnviar) {
      if (cantidadEnviar != "") {
        const cantidadEnviarInteger = parseInt(cantidadEnviar);
        if (!Number.isInteger(cantidadEnviarInteger)) {
          return {
            error: {
              message: "Campo cantidadEnviar Pedido No es un numero",
              campo: "cantidadEnviar",
            },
          };
        }
        enviar.cantidadEnviar = cantidadEnviarInteger;
      }
    }

    if (cantidadEnviada && cantidadEnviada != "") {
      const cantidadEnviadaInteger = parseInt(cantidadEnviada);
      if (!Number.isInteger(cantidadEnviadaInteger)) {
        return {
          error: {
            message: "Campo Cantidad Enviada No es un numero",
            campo: "cantidadEnviada",
          },
        };
      }
      enviar.cantidadEnviada = cantidadEnviadaInteger;
    }

    if (ordenCompra && ordenCompra != "") enviar.ordenCompra = ordenCompra;

    const [result] = await con.query(
      `UPDATE pedidos
          SET idProduct = IFNULL(?,idProduct),
              idcliente = IFNULL(?,idcliente),
              cantidadEnviar = IFNULL(?,cantidadEnviar),
              fecha_entrega = IFNULL(?,fecha_entrega),
              ordenCompra = IFNULL(?,ordenCompra),
              cantidad_enviada = IFNULL(?,cantidad_enviada)
          WHERE id = ?;`,
      [
        enviar.idProduct,
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

    const [rows] = await con.query(
      `SELECT pedidos.*,clientes.cliente, clientes.id AS idcliente, inventario.id AS idProduct, inventario.nombre, inventario.descripcion, inventario.url_image, inventario.articulo
                FROM pedidos 
                    LEFT JOIN inventario on pedidos.idProduct = inventario.id
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

    return { data: { message: "Se actualizo con exito", update: rows[0] } };
  }

  /**{
    "fechaEntrega": "2024-01-29",
    "idCliente": 1,
    "nroOrden": "OC 1707",
    "products": [
        {
            "cantidadEnviar": "500",
            "idProduct": 3,
            "id": 3,
            "nombre": "arandela334",
            "descripcion": "arandela plastica nueva axel x 2500",
            "idcliente": 1,
            "urlImage": null,
            "entrada": 23520,
            "salida": 5000,
            "articulo": "AXE043AP0",
            "cliente": "axel"
        },
        {
            "cantidadEnviar": "541",
            "idProduct": 11,
            "id": 11,
            "nombre": "biela020",
            "descripcion": "biela gira motor x 2500 unid",
            "idcliente": 1,
            "urlImage": "https://res.cloudinary.com/dn8bvip6g/image/upload/v1701556826/images/biela020.png",
            "entrada": 50000,
            "salida": 15000,
            "articulo": "AXE032BM0",
            "cliente": "axel"
        },
        {
            "cantidadEnviar": "124",
            "idProduct": 12,
            "id": 12,
            "nombre": "oreja028",
            "descripcion": "oreja (A) grande marron x 400 unid ",
            "idcliente": 1,
            "urlImage": null,
            "entrada": 1200,
            "salida": 0,
            "articulo": "AXE009OGM",
            "cliente": "axel"
        },
        {
            "cantidadEnviar": "5574",
            "idProduct": 13,
            "id": 13,
            "nombre": "oreja029",
            "descripcion": "oreja (A) grande negro x 400 unid ",
            "idcliente": 1,
            "urlImage": null,
            "entrada": 2400,
            "salida": 0,
            "articulo": "AXE009OGN",
            "cliente": "axel"
        },
        {
            "cantidadEnviar": "1547",
            "idProduct": 14,
            "id": 14,
            "nombre": "oreja030",
            "descripcion": "oreja (T) grande blanco  x 500 unid ",
            "idcliente": 1,
            "urlImage": null,
            "entrada": 3600,
            "salida": 600,
            "articulo": "AXE009OGB",
            "cliente": "axel"
        },
        {
            "cantidadEnviar": "5471",
            "idProduct": 15,
            "id": 15,
            "nombre": "oreja031",
            "descripcion": "oreja (T) grande negro x 400 unid ",
            "idcliente": 1,
            "urlImage": null,
            "entrada": 2400,
            "salida": 0,
            "articulo": "AXE009OGT",
            "cliente": "axel"
        },
        {
            "cantidadEnviar": "15474",
            "idProduct": 16,
            "id": 16,
            "nombre": "oreja032",
            "descripcion": "oreja (T) grande marron x 400 unid ",
            "idcliente": 1,
            "urlImage": null,
            "entrada": 1200,
            "salida": 0,
            "articulo": "AXE009OTG",
            "cliente": "axel"
        }
    ]
} */
  async postproductsPedidos(object) {}

  async deletePedido(idPedido) {
    try {
      const [result] = await con.query("DELETE FROM pedidos WHERE (`id` = ?)", [
        idPedido,
      ]);

      const deleteByIdPedido = this.productsPedidos.filter(
        (elem) => elem.id != idPedido
      );
      this.productsPedidos = deleteByIdPedido;

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
