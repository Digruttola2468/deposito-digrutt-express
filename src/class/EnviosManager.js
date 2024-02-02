import { con } from "../config/db.js";
import moment from "moment";

export default class EnviosManager {
  constructor() {
    this.listEnvios = [];
  }

  async getEnvios() {
    try {
      const [rows] = await con.query(
        "SELECT envios.*, envios.id, vehiculos.modelo, vehiculos.marca FROM envios LEFT JOIN vehiculos ON envios.idVehiculo = vehiculos.id;"
        //"SHOW CREATE TABLE envios"
      );
      this.listEnvios = rows;
      return { data: rows };
    } catch (e) {
      console.error(e);
      return { error: { message: "Something wrong" } };
    }
  }

  async getOneEnvio(idEnvio) {
    try {
      const [rows] = await con.query(
        "SELECT envios.*, envios.id, vehiculos.modelo, vehiculos.marca FROM envios LEFT JOIN vehiculos ON envios.idVehiculo = vehiculos.id WHERE envios.id == ?;",
        [idEnvio]
      );
      return { data: rows };
    } catch (e) {
      console.error(e);
      return { error: { message: "Something wrong" } };
    }
  }

  generateStringDateAndHours(date) {
    const hours = date.getHours();
    const minutes = date.getMinutes();

    const year = date.getFullYear();
    const mes = date.getMonth() + 1;
    const dia = date.getDate();

    const hora = `${hours < 10 ? `0${hours}` : hours}:${
      minutes < 10 ? `0${minutes}` : minutes
    }`;
    const fecha = `${year}/${mes < 10 ? `0${mes}` : mes}/${
      dia < 10 ? `0${dia}` : dia
    }`;

    return [fecha, hora];
  }

  async createEnvio(obj) {
    const { idVehiculo, ubicacion, descripcion, fechaDate } = obj;

    if (idVehiculo == null || idVehiculo == "")
      return {
        error: {
          message: "Campo vehiculo Vacio",
          campus: "idVehiculo",
          status: "error",
        },
      };

    if (ubicacion == "" || ubicacion == null)
      return {
        error: {
          message: "Campo Ubicacion Vacio",
          campus: "ubicacion",
          status: "error",
        },
      };

    let date = new Date();
    if (fechaDate != "" && fechaDate != null) {
      date = moment(fechaDate).toDate();
    }

    const [fecha, hora] = this.generateStringDateAndHours(date);

    try {
      const [result] = await con.query(
        "INSERT INTO envios (idVehiculo,ubicacion,descripcion,fecha_date,hora,fecha) VALUES (?,?,?,?,?,?) ;",
        [idVehiculo, ubicacion, descripcion, date, hora, fecha]
      );

      try {
        const [rows] = await con.query(
          "SELECT envios.*, envios.id, vehiculos.modelo, vehiculos.marca FROM envios LEFT JOIN vehiculos ON envios.idVehiculo = vehiculos.id WHERE envios.id = ?;",
          [result.insertId]
        );
        return { data: rows[0] };
      } catch (e) {
        console.log(e);
        return { error: { message: "No se obtuvo el objeto actualizado" } };
      }
    } catch (e) {
      if (e.code == "ER_NO_REFERENCED_ROW_2")
        return {
          error: {
            message: "No existe ese vehiculo",
            campus: "idVehiculo",
            status: "error",
          },
        };

      return { error: { message: "Something wrong" } };
    }
  }

  async updateEnvio(idEnvio, obj) {
    let { idVehiculo, ubicacion, descripcion, fechaDate, fechaObj, horaObj } =
      obj;

    if (idVehiculo == "") idVehiculo = null;
    if (ubicacion == "") ubicacion = null;
    if (descripcion == "") descripcion = null;
    if (fechaDate == "") fechaDate = null;

    let date = null;
    if (fechaDate != null) {
      date = new Date(fechaDate);

      const [fecha, hora] = this.generateStringDateAndHours(date);
      horaObj = hora;
      fechaObj = fecha;
    }

    try {
      const [result] = await con.query(
        `UPDATE envios SET
            idVehiculo = IFNULL(?, idVehiculo),
            ubicacion = IFNULL(?,ubicacion),
            descripcion = IFNULL(?,descripcion),
            fecha_date = IFNULL(?,fecha_date),
            hora = IFNULL(?,hora),
            fecha = IFNULL(?,fecha)
        WHERE id = ?`,
        [idVehiculo, ubicacion, descripcion, date, horaObj, fechaObj, idEnvio]
      );
      if (result.affectedRows == 0)
        return { error: { message: "No se actualizo" } };

      try {
        const [rows] = await con.query(
          "SELECT envios.*, envios.id, vehiculos.modelo, vehiculos.marca FROM envios LEFT JOIN vehiculos ON envios.idVehiculo = vehiculos.id WHERE envios.id = ?;",
          [idEnvio]
        );
        return { data: rows[0] };
      } catch (e) {
        console.log(e);
        return { error: { message: "No se obtuvo el objeto actualizado" } };
      }
    } catch (e) {
      if (e.errno == 1452)
        return { error: { message: "No existe ese vehiculo" } };

      return { error: { message: "Something wrong" } };
    }
  }

  async deleteEnvio(idEnvio) {
    try {
      const [result] = await con.query("DELETE FROM envios WHERE (`id` = ?);", [
        idEnvio,
      ]);

      if (result.affectedRows == 0)
        return { error: { message: "No existe ese envio" } };

      return { data: { message: "Operacion Exitosa" } };
    } catch (e) {
      console.error(e);
      return { error: { message: "Something wrong" } };
    }
  }
}
