import con from "../../config/db.js";

export default class controlCalidadMysql {
  constructor() {
    this.listControlCalidad = [];
  }

  get = async () => {
    return await con.query(
      `SELECT *,clientes.id 
      FROM controlCalidad 
      LEFT JOIN inventario ON controlCalidad.idInventario = inventario.id
      LEFT JOIN clientes ON controlCalidad.idCliente = clientes.id`
    );
  };
  getOne = async (idControlCalidad) => {
    return await con.query(
      `SELECT *,controlCalidad.id
            FROM controlCalidad 
                LEFT JOIN inventario ON controlCalidad.idInventario = inventario.id
                LEFT JOIN clientes ON controlCalidad.idCliente = clientes.id
            WHERE controlCalidad.id = ?`,
      [idControlCalidad]
    );
  };
  getByCliente = async (idCliente) => {
    return await con.query(
      `SELECT *,controlCalidad.id
            FROM controlCalidad 
                LEFT JOIN inventario ON controlCalidad.idInventario = inventario.id
                LEFT JOIN clientes ON controlCalidad.idCliente = clientes.id
            WHERE controlCalidad.idCliente = ?`,
      [idCliente]
    );
  };

  insert = async (object) => {
    return await con.query(
      `INSERT INTO controlCalidad (fecha,idInventario,critica,idCliente,stockMal) VALUES (?,?,?,?,?)`,
      [
        object.fecha,
        object.idinventario,
        object.critica,
        object.idcliente,
        object.stockMal,
      ]
    );
  };
  update = async (idControlCalidad, object) => {
    return await con.query(
      `UPDATE controlCalidad SET
            fecha = IFNULL(?, fecha),
            idInventario = IFNULL(?,idInventario),
            critica = IFNULL(?,critica),
            idCliente = IFNULL(?,idCliente),
            stockMal = IFNULL(?,stockMal)
        WHERE id = ?`,
      [
        object.fecha,
        object.idinventario,
        object.critica,
        object.idcliente,
        object.stockMal,
        idControlCalidad,
      ]
    );
  };
  delete = async (idControlCalidad) => {
    return await con.query("DELETE FROM controlCalidad WHERE (`id` = ?);", [
      idControlCalidad,
    ]);
  };
}
