import { con } from "../config/db.js";
import moment from "moment";
import { ENUM_ERRORS } from "../errors/enums.js";
import CustomError from "../errors/Custom_errors.js";

export default class EnviosManager {
  constructor() {
    this.listEnvios = [];
  }

  async getEnvios() {
    try {
      const [rows] = await con.query(
        "SELECT envios.*, envios.id, vehiculos.modelo, vehiculos.marca, localidad.ciudad FROM envios LEFT JOIN vehiculos ON envios.idVehiculo = vehiculos.id LEFT JOIN localidad ON envios.idLocalidad = localidad.id;"
      );
      this.listEnvios = rows;
      return { data: rows };
    } catch (e) {
      return { error: { message: "Something wrong", status: "error" } };
    }
  }

  async getOneEnvio(idEnvio) {
    try {
      const [rows] = await con.query(
        "SELECT envios.*, envios.id, vehiculos.modelo, vehiculos.marca, localidad.ciudad FROM envios LEFT JOIN vehiculos ON envios.idVehiculo = vehiculos.id LEFT JOIN localidad ON envios.idLocalidad = localidad.id WHERE envios.id == ?;",
        [idEnvio]
      );
      return { data: rows };
    } catch (e) {
      return { error: { message: "Something wrong", status: "error" } };
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
    const {
      idVehiculo,
      ubicacion,
      descripcion,
      fechaDate,
      idLocalidad,
      lat,
      lon,
    } = obj;

    if (idVehiculo == null || idVehiculo == "")
      CustomError.createError({
        name: "idVehiculo",
        message: "No seleccionaste el auto",
        cause: "No seleccionaste el auto",
        code: ENUM_ERRORS.INVALID_TYPE_EMPTY,
      });

    if (ubicacion == "" || ubicacion == null)
      CustomError.createError({
        name: "ubicacion",
        message: "La ubicacion esta vacio",
        cause: "La ubicacion esta vacio",
        code: ENUM_ERRORS.INVALID_TYPE_EMPTY,
      });

    let date = new Date();
    if (fechaDate != "" && fechaDate != null) {
      date = moment(fechaDate).toDate();
    }

    const [fecha, hora] = this.generateStringDateAndHours(date);

    try {
      const [result] = await con.query(
        "INSERT INTO envios (idVehiculo,ubicacion,descripcion,fecha_date,hora,fecha,idLocalidad,lat,lon) VALUES (?,?,?,?,?,?,?,?,?) ;",
        [
          idVehiculo,
          ubicacion,
          descripcion,
          date,
          hora,
          fecha,
          idLocalidad,
          lat,
          lon,
        ]
      );

      try {
        const [rows] = await con.query(
          "SELECT envios.*, envios.id, vehiculos.modelo, vehiculos.marca, localidad.ciudad FROM envios LEFT JOIN vehiculos ON envios.idVehiculo = vehiculos.id LEFT JOIN localidad ON envios.idLocalidad = localidad.id WHERE envios.id = ?;",
          [result.insertId]
        );
        return { data: rows[0] };
      } catch (e) {
        return {
          error: {
            message: "No se obtuvo el objeto actualizado",
            status: "error",
          },
        };
      }
    } catch (e) {
      switch (e.code) {
        case "ER_TRUNCATED_WRONG_VALUE_FOR_FIELD":
        case "ER_NO_REFERENCED_ROW_2":
          if (e.sqlMessage.includes("idVehiculo"))
            CustomError.createError({
              name: "idVehiculo",
              message: "No existe ese auto",
              cause: "No existe ese auto",
              code: ENUM_ERRORS.FOREING_KEY_OBJECT_NOT_EXISTS,
            });
          if (e.sqlMessage.includes("idLocalidad"))
            CustomError.createError({
              name: "idLocalidad",
              message: "No existe esa localidad",
              cause: "No existe esa localidad",
              code: ENUM_ERRORS.FOREING_KEY_OBJECT_NOT_EXISTS,
            });
          break;
        case "WARN_DATA_TRUNCATED":
          if (e.sqlMessage.includes("lat"))
            CustomError.createError({
              name: "lat",
              message: "Campo lat tiene que ser numerico",
              cause: "Campo lat tiene que ser numerico",
              code: ENUM_ERRORS.INVALID_TYPES_ERROR,
            });

          if (e.sqlMessage.includes("lon"))
            CustomError.createError({
              name: "lon",
              message: "Campo lon tiene que ser numerico",
              cause: "Campo lat tiene que ser numerico",
              code: ENUM_ERRORS.INVALID_TYPES_ERROR,
            });

          break;
      }

      return { error: { message: "Something wrong", status: "error" } };
    }
  }

  async updateEnvio(idEnvio, obj) {
    let {
      idVehiculo,
      ubicacion,
      descripcion,
      fechaDate,
      fechaObj,
      horaObj,
      idLocalidad,
      lat,
      lon,
    } = obj;

    if (idVehiculo == "") idVehiculo = null;
    if (ubicacion == "") ubicacion = null;
    if (descripcion == "") descripcion = null;
    if (fechaDate == "") fechaDate = null;
    if (idLocalidad == "") idLocalidad = null;
    if (lat == "") lat = null;
    if (lon == "") lon = null;

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
            fecha = IFNULL(?,fecha),
            idLocalidad = IFNULL(?,idLocalidad),
            lat = IFNULL(?, lat),
            lon = IFNULL(?, lon)
        WHERE id = ?`,
        [
          idVehiculo,
          ubicacion,
          descripcion,
          date,
          horaObj,
          fechaObj,
          idLocalidad,
          lat,
          lon,
          idEnvio,
        ]
      );
      if (result.affectedRows == 0)
        return { error: { message: "No se actualizo", status: "error" } };

      try {
        const [rows] = await con.query(
          "SELECT envios.*, envios.id, vehiculos.modelo, vehiculos.marca, localidad.ciudad FROM envios LEFT JOIN vehiculos ON envios.idVehiculo = vehiculos.id LEFT JOIN localidad ON envios.idLocalidad = localidad.id WHERE envios.id = ?;",
          [idEnvio]
        );
        return { data: rows[0] };
      } catch (e) {
        return {
          error: {
            message: "No se obtuvo el objeto actualizado",
            status: "error",
          },
        };
      }
    } catch (e) {
      switch (e.code) {
        case "ER_TRUNCATED_WRONG_VALUE_FOR_FIELD":
        case "ER_NO_REFERENCED_ROW_2":
          if (e.sqlMessage.includes("idVehiculo"))
            CustomError.createError({
              name: "idVehiculo",
              message: "No existe ese auto",
              cause: "No existe ese auto",
              code: ENUM_ERRORS.FOREING_KEY_OBJECT_NOT_EXISTS,
            });
          if (e.sqlMessage.includes("idLocalidad"))
            CustomError.createError({
              name: "idLocalidad",
              message: "No existe esa localidad",
              cause: "No existe esa localidad",
              code: ENUM_ERRORS.FOREING_KEY_OBJECT_NOT_EXISTS,
            });
          break;
        case "WARN_DATA_TRUNCATED":
          if (e.sqlMessage.includes("lat"))
            CustomError.createError({
              name: "lat",
              message: "Campo lat tiene que ser numerico",
              cause: "Campo lat tiene que ser numerico",
              code: ENUM_ERRORS.INVALID_TYPES_ERROR,
            });

          if (e.sqlMessage.includes("lon"))
            CustomError.createError({
              name: "lon",
              message: "Campo lon tiene que ser numerico",
              cause: "Campo lon tiene que ser numerico",
              code: ENUM_ERRORS.INVALID_TYPES_ERROR,
            });

          break;
      }

      return { error: { message: "Something wrong", status: "error" } };
    }
  }

  async deleteEnvio(idEnvio) {
    try {
      const [result] = await con.query("DELETE FROM envios WHERE (`id` = ?);", [
        idEnvio,
      ]);

      if (result.affectedRows == 0)
        return { error: { message: "No existe ese envio", status: "error" } };

      return { data: { message: "Operacion Exitosa", status: "success" } };
    } catch (e) {
      return { error: { message: "Something wrong", status: "error" } };
    }
  }
}
