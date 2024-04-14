import con from "../../config/db.js";

export default class atencionReclamoSQL {
  constructor() {
    this.listControlCalidad = [];
  }

  get = async () => {
    const [rows] = await con.query(
      `SELECT *,clientes.id 
        FROM atencion_reclamos 
          LEFT JOIN inventario ON atencion_reclamos.idInventario = inventario.id
          LEFT JOIN clientes ON atencion_reclamos.idCliente = clientes.id`
    );
    this.listControlCalidad = rows;
    return rows;
  };

  getOne = async (idControlCalidad) => {
    return await con.query(
      `SELECT *,atencion_reclamos.id
            FROM atencion_reclamos 
                LEFT JOIN inventario ON atencion_reclamos.idInventario = inventario.id
                LEFT JOIN clientes ON atencion_reclamos.idCliente = clientes.id
            WHERE atencion_reclamos.id = ?`,
      [idControlCalidad]
    );
  };

  getByIdCliente = async (idCliente) => {
    return await con.query(
      `SELECT *,atencion_reclamos.id
            FROM atencion_reclamos 
                LEFT JOIN inventario ON atencion_reclamos.idInventario = inventario.id
                LEFT JOIN clientes ON atencion_reclamos.idCliente = clientes.id
            WHERE atencion_reclamos.idCliente = ?`,
      [idCliente]
    );
  };

  getByIdInventario = async (idInventario) => {
    return await con.query(
      `SELECT *,atencion_reclamos.id
            FROM atencion_reclamos 
                LEFT JOIN inventario ON atencion_reclamos.idInventario = inventario.id
                LEFT JOIN clientes ON atencion_reclamos.idCliente = clientes.id
            WHERE atencion_reclamos.idInventario = ?`,
      [idInventario]
    );
  };

  insert = async (object) => {
    return await con.query(
      `INSERT INTO atencion_reclamos (fecha,idCliente,descripcion,analisis_causa,observaciones,fecha_cierre,idInventario) VALUES (?,?,?,?,?,?,?)`,
      [
        object.fecha,
        object.idCliente,
        object.descripcion,
        object.analisisCausa,
        object.observaciones,
        object.fechaCierre,
        object.idInventario,
      ]
    );
  };

  update = async (idControlCalidad, object) => {
    return await con.query(
      `UPDATE atencion_reclamos SET
            fecha = IFNULL(?, fecha),
            idInventario = IFNULL(?,idInventario),
            descripcion = IFNULL(?,descripcion),
            idCliente = IFNULL(?,idCliente),
            analisis_causa = IFNULL(?,analisis_causa),
            observaciones = IFNULL(?,observaciones),
            fecha_cierre = IFNULL(?,fecha_cierre)
        WHERE id = ?`,
      [
        object.fecha,
        object.idInventario,
        object.descripcion,
        object.idCliente,
        object.analisisCausa,
        object.observaciones,
        object.fechaCierre,
        idControlCalidad,
      ]
    );
  };

  delete = async (idControlCalidad) => {
    return await con.query("DELETE FROM atencion_reclamos WHERE (`id` = ?);", [
      idControlCalidad,
    ]);
  };
}
