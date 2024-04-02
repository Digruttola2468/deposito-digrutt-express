import con from "../../config/db.js";

export default class PedidosMysql {
  constructor() {
    this.productsPedidos = [];
  }

  get = async () => {
    const [rows] = await con.query(
      `SELECT pedidos.*,clientes.cliente, clientes.id AS idcliente, inventario.id AS idInventario, inventario.nombre, inventario.descripcion, inventario.url_image, inventario.articulo
            FROM pedidos 
                LEFT JOIN inventario on pedidos.idinventario = inventario.id
                LEFT JOIN clientes on pedidos.idcliente = clientes.id
            ORDER BY pedidos.fecha_entrega DESC;`
    );
    this.productsPedidos = rows;

    return rows;
  };

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

  getOne = async (idPedido) => {
    return await con.query(
      `SELECT pedidos.*,clientes.cliente, clientes.id AS idcliente, inventario.id AS idInventario, inventario.nombre, inventario.descripcion, inventario.url_image, inventario.articulo
              FROM pedidos 
                  LEFT JOIN inventario on pedidos.idinventario = inventario.id
                  LEFT JOIN clientes on pedidos.idcliente = clientes.id
              WHERE pedidos.id = ?;`,
      [idPedido]
    );
  };

  insert = async (pedido) => {
    return await con.query(
      "INSERT INTO pedidos (`idInventario`, `idcliente`, `cantidadEnviar`, `fecha_entrega`, `ordenCompra`) VALUES (?,?,?,?,?);",
      [
        pedido.idInventario,
        pedido.idcliente,
        pedido.cantidadEnviar,
        pedido.fecha_entrega,
        pedido.ordenCompra,
      ]
    );
  };

  update = async (idPedido, object) => {
    return await con.query(
      `UPDATE pedidos
            SET idinventario = IFNULL(?,idinventario),
                idcliente = IFNULL(?,idcliente),
                cantidadEnviar = IFNULL(?,cantidadEnviar),
                fecha_entrega = IFNULL(?,fecha_entrega),
                ordenCompra = IFNULL(?,ordenCompra),
                cantidad_enviada = IFNULL(?,cantidad_enviada)
            WHERE id = ?;`,
      [
        object.idInventario,
        object.idcliente,
        object.cantidadEnviar,
        object.fecha_entrega,
        object.ordenCompra,
        object.cantidadEnviada,
        idPedido,
      ]
    );
  };

  updatePedidosIsDone = async (idPedido, isDone) => {
    return await con.query(
      `UPDATE pedidos
            SET is_done = IFNULL(?,is_done)
        WHERE id = ?;`,
      [isDone, idPedido]
    );
  };

  delete = async (idPedido) => {
    return await con.query("DELETE FROM pedidos WHERE (`id` = ?)", [idPedido]);
  };
}
