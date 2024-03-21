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
    if (this.listRemitos.length != 0) {
      const findByIdRemito = this.listRemitos.find((elem) => elem.id == rid);
      return findByIdRemito;
    } else return [];
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

  async delete(iid) {
    return await con.query("DELETE FROM users WHERE (`id` = ?);", [iid]);
  }
}
