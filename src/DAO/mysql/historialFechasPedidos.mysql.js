import con from "../../config/db.js";

export default class HistorialFechasPedidosMysql {
  constructor() {
    this.listHistorialFechasPedidos = [];
  }

  async get() {
    const [rows] = await con.query(
      `SELECT historialFechasPedidos.*, pedidos.ordenCompra, pedidos.idinventario, inventario.descripcion
            FROM historialFechasPedidos 
                LEFT JOIN pedidos on historialFechasPedidos.idPedido = pedidos.id
                LEFT JOIN inventario on pedidos.idinventario = inventario.id
            ORDER BY historialFechasPedidos.fecha_enviada DESC;`
    );
    this.historialFechasPedidos = rows;
    return rows;
  }

  async getOne(idHistorial) {
    return await con.query(
      `SELECT historialFechasPedidos.*, pedidos.ordenCompra, pedidos.idinventario, inventario.descripcion
              FROM historialFechasPedidos 
                  LEFT JOIN pedidos on historialFechasPedidos.idPedido = pedidos.id
                  LEFT JOIN inventario on pedidos.idinventario = inventario.id
              WHERE historialFechasPedidos.id = ?`,
      [idHistorial]
    );
  }

  async getByIdPedido(idPedido) {
    return await con.query(
      `SELECT * FROM historialFechasPedidos WHERE idPedido = ?;`,
      [idPedido]
    );
  }

  async insert(object) {
    return await con.query(
      "INSERT INTO historialFechasPedidos (`idPedido`, `fecha_enviada`, `hora`, `cantidad_enviada`, `numRemito`, `numNotaEnvio`) VALUES (?,?,?,?,?,?);",
      [
        object.idPedido,
        object.stringDate,
        object.horaString,
        object.cantidad_enviada,
        object.numRemito,
        object.numNotaEnvio,
      ]
    );
  }

  async update(idHistorial, object) {
    return await con.query(
      `UPDATE historialFechasPedidos SET
              fecha_enviada = IFNULL(?,fecha_enviada),
              hora = IFNULL(?,hora),
              cantidad_enviada = IFNULL(?,cantidad_enviada),
              numRemito = IFNULL(?,numRemito),
              numNotaEnvio = IFNULL(?,numNotaEnvio)
          WHERE id = ?`,
      [
        object.fechaString,
        object.horaString,
        object.cantidad_enviada,
        object.numRemito,
        object.numNotaEnvio,
        idHistorial,
      ]
    );
  }

  async delete(idHistorial) {
    return await con.query(
      "DELETE FROM historialFechasPedidos WHERE (`id` = ?);",
      [idHistorial]
    );
  }
}
