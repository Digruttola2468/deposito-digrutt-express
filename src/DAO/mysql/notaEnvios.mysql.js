import con from "../../config/db.js";

export default class NotaEnviosMysql {
  constructor() {
    this.notaEnvios = [];
  }

  async get() {
    const [rows] = await con.query(
      `SELECT facturaNegro.id, facturaNegro.*, clientes.cliente, clientes.cuit, clientes.domicilio, clientes.mail, idCliente AS idcliente FROM facturaNegro 
        LEFT JOIN clientes on facturaNegro.idCliente = clientes.id
        ORDER BY fecha DESC`
    );

    this.listFacturaNegro = rows;
    return rows;
  }

  async getOne(nid) {
    return await con.query(
      `SELECT facturaNegro.id, facturaNegro.*, clientes.cliente, clientes.cuit, clientes.domicilio, clientes.mail, idCliente AS idcliente FROM facturaNegro 
          LEFT JOIN clientes on facturaNegro.idCliente = clientes.id
          WHERE facturaNegro.id = ?`,
      nid
    );
  }

  insert = async (data) => {
    return await con.query(
      "INSERT INTO facturaNegro (`nro_envio`,`idCliente`,`valorDeclarado`,`fecha`) VALUES (?,?,?,?);",
      [data.nro_envio, data.idCliente, data.valorTotal, data.fecha]
    );
  };

  update = async (nid, data) => {
    return await con.query(
        `
            UPDATE facturaNegro 
            SET fecha = IFNULL(?,fecha),
                idCliente = IFNULL(?,idCliente),
                nro_envio = IFNULL(IF(STRCMP(nro_envio, ?) = 0, nro_envio, ?), nro_envio)
            WHERE id = ?
        `,
        [data.fecha, data.cliente, data.nro_envio, data.nro_envio, nid]
      );
  };

  delete = async (nid) => {
    return await con.query(
      "DELETE FROM facturaNegro WHERE (`id` = ?);",
      [nid]
    );
  };
}
