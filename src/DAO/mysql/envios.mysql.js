import con from "../../config/db.js";

export default class EnviosMySql {
  constructor() {
    this.listEnvios = [];
  }

  async get() {
    const [rows] = await con.query(
      "SELECT envios.*, envios.id, vehiculos.modelo, vehiculos.marca, localidad.ciudad FROM envios LEFT JOIN vehiculos ON envios.idVehiculo = vehiculos.id LEFT JOIN localidad ON envios.idLocalidad = localidad.id;"
    );
    this.listEnvios = rows;
    return rows;
  }

  async getOne(idEnvio) {
    return await con.query(
      "SELECT envios.*, envios.id, vehiculos.modelo, vehiculos.marca, localidad.ciudad FROM envios LEFT JOIN vehiculos ON envios.idVehiculo = vehiculos.id LEFT JOIN localidad ON envios.idLocalidad = localidad.id WHERE envios.id = ?;",
      [idEnvio]
    );
  }

  async insert(object) {
    return await con.query(
      "INSERT INTO envios (idVehiculo,ubicacion,descripcion,fecha_date,hora,fecha,idLocalidad,lat,lon) VALUES (?,?,?,?,?,?,?,?,?) ;",
      [
        object.idVehiculo,
        object.ubicacion,
        object.descripcion,
        object.fecha_date,
        object.hora,
        object.fecha,
        object.idLocalidad,
        object.lat,
        object.lon,
      ]
    );
  }

  async update(idEnvio, object) {
    return await con.query(
      `UPDATE envios SET
            idVehiculo = IFNULL(?, idVehiculo),
            ubicacion = IFNULL(?,ubicacion),
            descripcion = IFNULL(?,descripcion),
            fecha_date = IFNULL(?,fecha_date),
            hora = IFNULL(?,hora),
            fecha = IFNULL(?,fecha),
            idLocalidad = IFNULL(?,idLocalidad),
            lat = IFNULL(?, lat),
            lon = IFNULL(?, lon)
        WHERE id = ?`,
      [
        object.idVehiculo,
        object.ubicacion,
        object.descripcion,
        object.fecha_date,
        object.horaObj,
        object.fechaObj,
        object.idLocalidad,
        object.lat,
        object.lon,
        idEnvio,
      ]
    );
  }

  async delete(idEnvio) {
    return await con.query("DELETE FROM envios WHERE (`id` = ?);", [idEnvio]);
  }
}
