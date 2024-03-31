import con from "../../config/db.js";

export default class RemitosMysql {
  constructor() {
    this.remitos = [];
  }

  async get() {
    const [rows] = await con.query(
      `SELECT remitos.*,idCliente AS idcliente, clientes.cliente, clientes.cuit, clientes.domicilio, clientes.mail FROM remitos 
          LEFT JOIN clientes on remitos.idCliente = clientes.id
        ORDER BY remitos.fecha DESC`
    );
    this.remitos = rows;
    return rows;
  }

  async getOne(rid) {
    return await con.query(
      `SELECT remitos.*,idCliente AS idcliente, clientes.cliente, clientes.cuit, clientes.domicilio, clientes.mail FROM remitos 
          LEFT JOIN clientes on remitos.idCliente = clientes.id
        WHERE remitos.id = ?`,
      [rid]
    );
  }

  async insert(data) {
    return await con.query(
      "INSERT INTO remitos (`fecha`,`num_remito`,`idCliente`,`num_orden`,`total`) VALUES (?,?,?,?,?);",
      [
        data.fecha,
        data.numRemito,
        data.idCliente,
        data.nroOrden,
        parseFloat(data.valorDeclarado),
      ]
    );
  }

  async update(rid, data) {
    return await con.query(
      `
      UPDATE remitos SET
        total = IFNULL(?,total),
        fecha = IFNULL(?,fecha),
        num_orden = IFNULL(?,num_orden),
        num_remito = IFNULL(IF(STRCMP(num_remito, ?) = 0, num_remito, ?), num_remito)
        WHERE id = ?
      `,
      [
        data.valorDeclarado,
        data.fecha,
        data.nroOrden,
        data.numRemito,
        data.numRemito,
        rid,
      ]
    );
  }

  async delete(rid) {
    return await con.query("DELETE FROM remitos WHERE (`id` = ?);", [rid]);
  }
}
