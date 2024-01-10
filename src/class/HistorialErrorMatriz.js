import { con } from "../config/db.js";
import { matricesManager } from "../index.js";

export default class HistorialMatriz {
  constructor() {
    this.listHistorial = [];
  }

  async getHistorial() {
    try {
      const [rows] = await con.query(
        `SELECT historialFallosMatriz.id,historialFallosMatriz.idMatriz, historialFallosMatriz.descripcion_deterioro, historialFallosMatriz.fecha, historialFallosMatriz.isSolved, historialFallosMatriz.fechaTerminado , matriz.cod_matriz, matriz.descripcion
            FROM historialFallosMatriz 
            LEFT JOIN matriz ON historialFallosMatriz.idMatriz = matriz.id
            ORDER BY historialFallosMatriz.fecha DESC;`
      );
      this.listHistorial = rows;
      return { data: rows };
    } catch (e) {
      console.error(e);
      return { error: { message: "Something wrong" } };
    }
  }

  getList() {
    return this.listHistorial;
  }

  getOne(id) {
    return this.listHistorial.find((elem) => {
      return elem.id == id;
    });
  }

  getIsSolvedTrue() {
    return this.listHistorial.filter((elem) => {
      return elem.isSolved >= 1;
    });
  }

  getIsSolvedFalse() {
    return this.listHistorial.filter((elem) => {
      return elem.isSolved <= 0;
    });
  }

  getListByIdMatriz(idMatriz) {
    return this.listHistorial.filter((elem) => {
      return elem.idMatriz == idMatriz;
    });
  }

  async postHistorialMatriz(object) {
    const { idMatriz, descripcion_deterioro } = object;

    if (idMatriz == null || idMatriz == "")
      return { error: { message: "Campo Cod Matriz Vacio" } };

    if (descripcion_deterioro == null || descripcion_deterioro == "")
      return { error: { message: "Campo Descripcion del Deterioro Vacio" } };

    //Obtenemos la fecha actual
    const fechaDate = new Date();
    const stringDate = `${fechaDate.getFullYear()}-${
      fechaDate.getMonth() + 1
    }-${fechaDate.getDate()}`;

    //Validar si existe ese idMatriz
    if (!matricesManager.exitsMatriz(parseInt(idMatriz)))
      return { error: { message: "No existe esa Matriz" } };

    try {
      const [rows] = await con.query(
        "INSERT INTO historialFallosMatriz (`idMatriz`, `descripcion_deterioro`, `fecha`) VALUES (?,?,?);",
        [idMatriz, descripcion_deterioro, stringDate]
      );
      if (rows.affectedRows >= 1) {
        const getOneMatriz = matricesManager.getOneMatriz(idMatriz);
        this.listHistorial.push({
          id: rows.insertId,
          idMatriz,
          cod_matriz: getOneMatriz.cod_matriz,
          descripcion: getOneMatriz.descripcion,
          descripcion_deterioro,
          isSolved: 0,
          fecha: stringDate,
          fechaTerminado: null,
        });
        return {
          data: {
            message: "Operacion Exitosa",
            insert: {
              id: rows.insertId,
              idMatriz,
              cod_matriz: getOneMatriz.cod_matriz,
              descripcion: getOneMatriz.descripcion,
              descripcion_deterioro,
              isSolved: 0,
              fecha: stringDate,
              fechaTerminado: null,
            },
          },
        };
      } else return { error: { message: "No se Agrego" } };
    } catch (error) {
      return { error: { message: "Something Wrong" } };
    }
  }

  async updateHistorialMatriz(idHistorial, object) {
    const { descripcion_deterioro, fecha } = object;
    let enviar = { descripcion_deterioro: null, fecha: null };

    const findIdHistorial = this.getOne(idHistorial);

    if (descripcion_deterioro && descripcion_deterioro != "")
      enviar.descripcion_deterioro = descripcion_deterioro;

    if (fecha && fecha != "") {
      //Convertimos la fecha ingresada a tipo Date
      const fechaDate = new Date(fecha);
      if (Number.isNaN(fechaDate.getDate()))
        return { error: { message: "Error en el formato de la Fecha" } };
      if (fechaDate.getFullYear() < 2024)
        return { error: { message: "Error en el año agregado" } };
      enviar.fecha = fecha;
    }

    const [result] = await con.query(
      `
      UPDATE historialFallosMatriz
      SET descripcion_deterioro = IFNULL(?,descripcion_deterioro),
          fecha = IFNULL(?,fecha)
      WHERE id = ?;`,
      [enviar.descripcion_deterioro, enviar.fecha, idHistorial]
    );

    if (result.affectedRows === 0)
      return { error: { message: "No se encontro la Matriz" } };

    const [rows] = await con.query(
      `SELECT historialFallosMatriz.id,historialFallosMatriz.idMatriz, historialFallosMatriz.descripcion_deterioro, historialFallosMatriz.fecha, historialFallosMatriz.isSolved, historialFallosMatriz.fechaTerminado , matriz.cod_matriz, matriz.descripcion
        FROM historialFallosMatriz 
        LEFT JOIN matriz ON historialFallosMatriz.idMatriz = matriz.id
        WHERE historialFallosMatriz.id=?;`,
      idHistorial
    );

    const update = this.listHistorial.map((elem) => {
      if (elem.id == idHistorial) return rows[0];
      else return elem;
    });

    this.listHistorial = update;

    return { data: rows[0] };
  }

  async updateIsSolved(idHistorial, isSolved) {
    const findIdHistorial = this.getOne(idHistorial);

    let enviar = { fechaTerminado: null };

    if (findIdHistorial) {
      const date = new Date();
      const formatDate = `${date.getFullYear()}-${
        date.getMonth() + 1
      }-${date.getDate()}`;

      //Falso => no esta terminado
      if (isSolved <= 0) {
        enviar.fechaTerminado = null;
      }
      //True => esta terminado
      if (isSolved >= 1) {
        enviar.fechaTerminado = formatDate;
      }

      const [result] = await con.query(
        `
        UPDATE historialFallosMatriz
        SET isSolved = ?,
            fechaTerminado = ?
        WHERE id = ?;`,
        [isSolved, enviar.fechaTerminado, idHistorial]
      );

      if (result.affectedRows === 0)
        return { error: { message: "No se encontro la Matriz" } };

      const updateList = this.listHistorial.map((elem) => {
        if (elem.id == idHistorial)
          return {
            ...findIdHistorial,
            isSolved,
            fechaTerminado: enviar.fechaTerminado,
          };
        else return elem;
      });

      this.listHistorial = updateList;

      return {
        data: {
          ...findIdHistorial,
          isSolved,
          fechaTerminado: enviar.fechaTerminado,
        },
      };
    } else return { error: { message: "No se encontro el historial" } };
  }

  async deleteHistorialMatriz(idHistorial) {
    try {
      const [result] = await con.query(
        "DELETE FROM historialFallosMatriz WHERE (`id` = ?);",
        [idHistorial]
      );

      if (result.affectedRows >= 1) {
        const filter = this.listHistorial.filter(
          (elem) => elem.id != idHistorial
        );
        this.listHistorial = filter;
        return {
          data: { message: "Se elimino Correctamente" },
        };
      } else return { error: { message: "No existe" } };
    } catch (error) {
      console.log(error);
      return { error: { message: "Something Wrong" } };
    }
  }
}
