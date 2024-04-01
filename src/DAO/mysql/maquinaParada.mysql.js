import con from "../../config/db.js";

export default class MaquinaParadaMySql {
  constructor() {
    this.listMaquinaParada = [];
  }

  async get() {
    const [rows] = await con.query(
      `SELECT maquinaParada.id, maquinaParada.hrs, maquinaParada.fecha, maquina.nombre, maquina.numberSerie, motivoMaquinaParada.descripcion
            FROM maquinaParada 
            LEFT JOIN motivoMaquinaParada ON maquinaParada.idMotivoMaquinaParada = motivoMaquinaParada.id
            LEFT JOIN maquina ON maquinaParada.idMaquina = maquina.id;`
    );
    this.listMaquinaParada = rows;
    return rows;
  }

  async getOne(idMaquinaParada) {
    return await con.query(
      `SELECT maquinaParada.id, maquinaParada.hrs, maquinaParada.fecha, maquina.nombre, maquina.numberSerie, motivoMaquinaParada.descripcion
              FROM maquinaParada 
              LEFT JOIN motivoMaquinaParada ON maquinaParada.idMotivoMaquinaParada = motivoMaquinaParada.id
              LEFT JOIN maquina ON maquinaParada.idMaquina = maquina.id
              WHERE maquinaParada.id = ?`,
      [idMaquinaParada]
    );
  }

  async insert(object) {
    return await con.query(
      "INSERT INTO maquinaParada (`fecha`, `idMotivoMaquinaParada`, `hrs`, `idMaquina`) VALUES (?,?,?,?);",
      [object.fecha, object.idMotivoMaquinaParada, object.hrs, object.idMaquina]
    );
  }

  async update(idMaquinaParada, object) {
    return await con.query(
      `
        UPDATE maquinaParada
          SET idMotivoMaquinaParada = IFNULL(?,idMotivoMaquinaParada),
              hrs = IFNULL(?,hrs),
              idMaquina = IFNULL(?,idMaquina),
              fecha = IFNULL(?,fecha)
          WHERE id = ?;
        `,
      [
        object.idMotivoMaquinaParada,
        object.hrs,
        object.idMaquina,
        object.fecha,
        idMaquinaParada,
      ]
    );
  }

  async delete(idMaquinaParada) {
    return await con.query("DELETE FROM maquinaParada WHERE (`id` = ?);", [
      idMaquinaParada,
    ]);
  }
}
