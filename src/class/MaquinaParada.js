import { con } from "../config/db.js";

export default class MaquinaParada {
  constructor() {
    this.listMaquinaParada = [];
  }

  /**
                    Maquina
                    N° Maquina
                    Hrs Parada
                    Motivo Maquina Parada
                    Fecha */
  async getMaquinaParada() {
    try {
      const [rows] = await con.query(
        `SELECT maquinaParada.id, maquinaParada.hrs, maquinaParada.fecha, maquina.nombre, maquina.numberSerie, motivoMaquinaParada.descripcion
            FROM maquinaParada 
            LEFT JOIN motivoMaquinaParada ON maquinaParada.idMotivoMaquinaParada = motivoMaquinaParada.id
            LEFT JOIN maquina ON maquinaParada.idMaquina = maquina.id;`
      );
      this.listMaquinaParada = rows;
      return { data: rows };
    } catch (e) {
      console.error(e);
      return { error: { message: "Something wrong" } };
    }
  }

  getOneMaquinaParada() {}

  getLength = () => this.listMaquinaParada.length;

  async postProducion(object) {
    const { idMotivoMaquinaParada, hrs, idMaquina, fecha } = object;

    if (idMotivoMaquinaParada == null || idMotivoMaquinaParada == "")
      return { error: { message: "Campo Motivo de Maquina Parada Vacio" } };

    if (hrs == null || hrs == "")
      return { error: { message: "Campo de Horas Maquina Parada Vacio" } };

    if (idMaquina == null || idMaquina == "")
      return { error: { message: "Campo Maquina Vacio" } };

    if (fecha == null || fecha == "")
      return { error: { message: "Campo fecha Vacio" } };

    //Convertimos la fecha ingresada a tipo Date
    const fechaDate = new Date(fecha);

    if (Number.isNaN(fechaDate.getDate()))
      return { error: { message: "Error en el formato de la Fecha" } };

    if (fechaDate.getFullYear() < 2023) 
        return { error: { message: "Error en el año agregado" } };

    const idMotivoMaquinaParadaInteger = parseInt(idMotivoMaquinaParada);
    const hrsInteger = parseInt(hrs);
    const idMaquinaInteger = parseInt(idMaquina);

    //Verificamos que sean de tipo Integer
    if (!Number.isInteger(idMotivoMaquinaParadaInteger))
      return { error: { message: "Ocurrio un error en motivo de maquina" } };

    if (!Number.isInteger(hrsInteger))
      return { error: { message: "Campo Hrs Maquina Parada No es un numero" } };

    if (!Number.isInteger(idMaquinaInteger))
      return { error: { message: "Ocurrio un error en maquina" } };

    try {
      const [rows] = await con.query(
        "INSERT INTO maquinaParada (`fecha`, `idMotivoMaquinaParada`, `hrs`, `idMaquina`) VALUES (?,?,?,?);",
        [fecha, idMotivoMaquinaParadaInteger, hrsInteger, idMaquinaInteger]
      );
      if (rows.affectedRows >= 1)
        return {
          data: { message: "Operacion Exitosa", insertId: rows.insertId },
        };
      else return { error: { message: "No se Agrego" } };
    } catch (error) {
      console.log(error);
      if (error.errno == 1452)
        return { error: { message: "No existe tanto como maquina o motivo maquina parada" } };
      return { error: { message: "Something Wrong" } };
    }
  }

  async deleteMaquinaParada(idMaquinaParada) {
    try {
      const [result] = await con.query("DELETE FROM maquinaParada WHERE (`id` = ?);", [
        idMaquinaParada,
      ]);

      if (result.affectedRows >= 1)
        return {
          data: { message: "Se elimino Correctamente" },
        };
      else return { error: { message: "No existe" } };
    } catch (error) {
      console.log(error);
      return { error: { message: "Something Wrong" } };
    }

  }
}
