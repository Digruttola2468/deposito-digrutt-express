import { con } from "../config/db.js";

export default class MaquinaParada {
  constructor() {
    this.listMaquinaParada = [];
  }

  async getMaquinaParada() {
    try {
      const [rows] = await con.query(
        `SELECT maquinaParada.id, maquinaParada.hrs, maquinaParada.fecha, maquina.nombre, maquina.numberSerie, motivoMaquinaParada.descripcion
            FROM maquinaParada 
            LEFT JOIN motivoMaquinaParada ON maquinaParada.idMotivoMaquinaParada = motivoMaquinaParada.id
            LEFT JOIN maquina ON maquinaParada.idMaquina = maquina.id;`
      );
      this.listMaquinaParada = rows;
      return { data: rows, status: "success" };
    } catch (e) {
      return { error: { message: "Something wrong", status: "error" } };
    }
  }

  getOneMaquinaParada(id) {
    return this.listMaquinaParada.find((elem) => elem.id === id);
  }

  getLength = () => this.listMaquinaParada.length;

  async postProducion(object) {
    const { idMotivoMaquinaParada, hrs, idMaquina, fecha } = object;

    if (idMotivoMaquinaParada == null || idMotivoMaquinaParada == "")
      return {
        error: {
          message: "Campo Motivo de Maquina Parada Vacio",
          status: "error",
        },
      };

    if (hrs == null || hrs == "")
      return {
        error: {
          message: "Campo de Horas Maquina Parada Vacio",
          status: "error",
        },
      };

    if (idMaquina == null || idMaquina == "")
      return { error: { message: "Campo Maquina Vacio", status: "error" } };

    if (fecha == null || fecha == "")
      return { error: { message: "Campo fecha Vacio", status: "error" } };

    //Convertimos la fecha ingresada a tipo Date
    const fechaDate = new Date(fecha);

    if (Number.isNaN(fechaDate.getDate()))
      return {
        error: { message: "Error en el formato de la Fecha", status: "error" },
      };

    if (fechaDate.getFullYear() < 2023)
      return {
        error: { message: "Error en el año agregado", status: "error" },
      };

    const idMotivoMaquinaParadaInteger = parseInt(idMotivoMaquinaParada);
    const hrsInteger = parseInt(hrs);
    const idMaquinaInteger = parseInt(idMaquina);

    //Verificamos que sean de tipo Integer
    if (!Number.isInteger(idMotivoMaquinaParadaInteger))
      return {
        error: {
          message: "Ocurrio un error en motivo de maquina",
          status: "error",
        },
      };

    if (!Number.isInteger(hrsInteger))
      return {
        error: {
          message: "Campo Hrs Maquina Parada No es un numero",
          status: "error",
        },
      };

    if (!Number.isInteger(idMaquinaInteger))
      return {
        error: { message: "Ocurrio un error en maquina", status: "error" },
      };

    try {
      const [rows] = await con.query(
        "INSERT INTO maquinaParada (`fecha`, `idMotivoMaquinaParada`, `hrs`, `idMaquina`) VALUES (?,?,?,?);",
        [fecha, idMotivoMaquinaParadaInteger, hrsInteger, idMaquinaInteger]
      );
      if (rows.affectedRows >= 1) {
        const [result] = await con.query(
          `SELECT maquinaParada.id, maquinaParada.hrs, maquinaParada.fecha, maquina.nombre, maquina.numberSerie, motivoMaquinaParada.descripcion
              FROM maquinaParada 
              LEFT JOIN motivoMaquinaParada ON maquinaParada.idMotivoMaquinaParada = motivoMaquinaParada.id
              LEFT JOIN maquina ON maquinaParada.idMaquina = maquina.id
              WHERE maquinaParada.id = ?;`,
          [rows.insertId]
        );

        return {
          data: {
            message: "Operacion Exitosa",
            data: result[0],
            status: "success",
          },
        };
      } else return { error: { message: "No se Agrego", status: "error" } };
    } catch (error) {
      if (error.errno == 1452)
        return {
          error: {
            message: "No existe tanto como maquina o motivo maquina parada",
            status: "error",
          },
        };
      return { error: { message: "Something Wrong", status: "error" } };
    }
  }

  async updateMaquinaParada(idMaquinaParada, obj) {
    const { hrs, fecha, idMotivoMaquinaParada, idMaquina } = obj;

    let enviar = {
      hrs: null,
      fecha: null,
      idMotivoMaquinaParada: null,
      idMaquina: null,
    };

    if (hrs != null && hrs != "") {
      const hrsInteger = parseInt(hrs);
      if (!Number.isInteger(hrsInteger)) {
        return {
          error: {
            message: "Campo hrs maquina parada no es numerico",
            campo: "hrs",
            status: "error",
          },
        };
      }
      enviar.hrs = hrsInteger;
    }
    if (fecha != null && fecha != "") {
      const fechaDate = new Date(fecha);

      if (Number.isNaN(fechaDate.getDate()))
        return {
          error: {
            message: "Error en el formato de la Fecha",
            campo: "fecha",
            status: "error",
          },
        };

      enviar.fecha = fecha;
    }
    if (idMotivoMaquinaParada != null && idMotivoMaquinaParada != "") {
      const motivoMaquinaParada = parseInt(idMotivoMaquinaParada);
      if (!Number.isInteger(motivoMaquinaParada)) {
        return {
          error: {
            message: "Ocurrio un error",
            campo: "motivomaquinaparada",
            status: "error",
          },
        };
      }
      enviar.idMotivoMaquinaParada = motivoMaquinaParada;
    }

    if (idMaquina != null && idMaquina != "") {
      const idMaquinaInteger = parseInt(idMaquina);
      if (!Number.isInteger(idMaquinaInteger)) {
        return {
          error: {
            message: "Ocurrio un error",
            campo: "maquina",
            status: "error",
          },
        };
      }
      enviar.idMaquina = idMaquinaInteger;
    }

    //Update
    try {
      await con.query(
        `
      UPDATE maquinaParada
        SET idMotivoMaquinaParada = IFNULL(?,idMotivoMaquinaParada),
            hrs = IFNULL(?,hrs),
            idMaquina = IFNULL(?,idMaquina),
            fecha = IFNULL(?,fecha)
        WHERE id = ?;`,
        [
          enviar.idMotivoMaquinaParada,
          enviar.hrs,
          enviar.idMaquina,
          enviar.fecha,
          idMaquinaParada,
        ]
      );

      const [result] = await con.query(
        `SELECT maquinaParada.id, maquinaParada.hrs, maquinaParada.fecha, maquina.nombre, maquina.numberSerie, motivoMaquinaParada.descripcion
            FROM maquinaParada 
            LEFT JOIN motivoMaquinaParada ON maquinaParada.idMotivoMaquinaParada = motivoMaquinaParada.id
            LEFT JOIN maquina ON maquinaParada.idMaquina = maquina.id
            WHERE maquinaParada.id = ?;`,
        [idMaquinaParada]
      );

      return { data: { message: "Operacion exitosa", data: result[0] } };
    } catch (error) {
      return {
        error: {
          message: "No se logro actualizar",
          status: "error",
        },
      };
    }
  }

  async deleteMaquinaParada(idMaquinaParada) {
    try {
      const [result] = await con.query(
        "DELETE FROM maquinaParada WHERE (`id` = ?);",
        [idMaquinaParada]
      );

      if (result.affectedRows >= 1)
        return {
          data: { message: "Se elimino Correctamente", status: "success" },
        };
      else return { error: { message: "No existe", status: "error" } };
    } catch (error) {
      return { error: { message: "Something Wrong", status: "error" } };
    }
  }
}
