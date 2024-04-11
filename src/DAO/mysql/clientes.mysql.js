import con from "../../config/db.js";

export default class ClientesMySql {
  constructor() {
    this.listClientes = [];
  }

  async get() {
    const [rows] = await con.query(
      "SELECT *,clientes.id FROM clientes LEFT JOIN localidad ON clientes.idLocalidad = localidad.id;"
    );
    this.listClientes = rows;
    return rows;
  }

  async getOne(idCliente) {
    return await con.query(
      "SELECT *,clientes.id FROM clientes LEFT JOIN localidad ON clientes.idLocalidad = localidad.id WHERE clientes.id = ?;",
      [idCliente]
    );
  }

  async insert(object) {
    return await con.query(
      "INSERT INTO clientes (cliente,domicilio,idLocalidad,mail,cuit) VALUES (?,?,?,?,?) ;",
      [
        object.cliente.trim(),
        object.domicilio,
        object.idLocalidad,
        object.mail,
        object.cuit,
      ]
    );
  }

  async update(cid, object) {
    return await con.query(
      `UPDATE clientes SET
              cliente = IFNULL(IF(STRCMP(cliente, ?) = 0, cliente, ?), cliente),
              domicilio = IFNULL(?,domicilio),
              idLocalidad = IFNULL(?,idLocalidad),
              mail = IFNULL(?,mail),
              cuit = IFNULL(?,cuit)
          WHERE id = ?`,
      [
        object.cliente,
        object.cliente,
        object.domicilio,
        object.idLocalidad,
        object.mail,
        object.cuit,
        cid,
      ]
    );
  }

  async delete(cid) {
    return await con.query("DELETE FROM clientes WHERE (`id` = ?);", [cid]);
  }
}
