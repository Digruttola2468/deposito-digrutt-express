import { con } from "../config/db.js";
import CustomError from "../errors/Custom_errors.js";
import { ENUM_ERRORS } from "../errors/enums.js";
import { matricesManager } from "../index.js";

export default class HistorialMatriz {
  constructor() {
    this.listHistorial = [];
  }

  async getHistorial() {
    try {
      const [rows] = await con.query(
        `SELECT historialFallosMatriz.id,historialFallosMatriz.idMatriz, historialFallosMatriz.descripcion_deterioro, historialFallosMatriz.fecha, historialFallosMatriz.isSolved, historialFallosMatriz.fechaTerminado , matriz.cod_matriz, matriz.descripcion, categoria.categoria
            FROM historialFallosMatriz 
            LEFT JOIN matriz ON historialFallosMatriz.idMatriz = matriz.id
            LEFT JOIN categoria ON historialFallosMatriz.idCategoria = categoria.id
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
    const { idMatriz, descripcion_deterioro, idCategoria } = object;

    if (idMatriz == null || idMatriz == "")
      CustomError.createError({
        cause: "Campo Matriz esta Vacio",
        message: "Campo Matriz esta Vacio",
        code: ENUM_ERRORS.INVALID_TYPE_EMPTY,
        name: "matriz",
      });

    if (idCategoria == null || idCategoria == "")
      CustomError.createError({
        cause: "Campo Categoria esta Vacio",
        message: "Campo Categoria esta Vacio",
        code: ENUM_ERRORS.INVALID_TYPE_EMPTY,
        name: "categoria",
      });

    if (descripcion_deterioro == null || descripcion_deterioro == "")
      CustomError.createError({
        cause: "Campo descripcion esta Vacio",
        message: "Campo descripcion esta Vacio",
        code: ENUM_ERRORS.INVALID_TYPE_EMPTY,
        name: "descripcion",
      });

    if (idCategoria != "3" && idCategoria != "4")
      CustomError.createError({
        name: "categoria",
        cause: "Categoria fuera de rango ",
        code: ENUM_ERRORS.ROUTING_ERROR,
        message: "Categoria fuera de rango (Mantenimiento o Falla)",
      });

    //Obtenemos la fecha actual
    const fechaDate = new Date();
    const stringDate = `${fechaDate.getFullYear()}-${
      fechaDate.getMonth() + 1
    }-${fechaDate.getDate()}`;

    try {
      const [rows] = await con.query(
        "INSERT INTO historialFallosMatriz (`idMatriz`, `descripcion_deterioro`, `fecha`, `idCategoria`) VALUES (?,?,?,?);",
        [idMatriz, descripcion_deterioro, stringDate, idCategoria]
      );
      if (rows.affectedRows >= 1) {
        const getOneMatriz = matricesManager.getOneMatriz(idMatriz);

        let categoria = "";
        if (idCategoria == "3") categoria = "Mantenimiento";

        if (idCategoria == "4") categoria = "Falla";

        this.listHistorial.push({
          id: rows.insertId,
          idMatriz,
          cod_matriz: getOneMatriz.cod_matriz,
          descripcion: getOneMatriz.descripcion,
          descripcion_deterioro,
          isSolved: 0,
          fecha: stringDate,
          fechaTerminado: null,
          categoria: categoria,
        });
        return {
          data: {
            status: "success",
            message: "Operacion Exitosa",
            data: {
              id: rows.insertId,
              idMatriz,
              cod_matriz: getOneMatriz.cod_matriz,
              descripcion: getOneMatriz.descripcion,
              descripcion_deterioro,
              isSolved: 0,
              fecha: stringDate,
              fechaTerminado: null,
              categoria: categoria,
            },
          },
        };
      } else return { error: { message: "No se Agrego" } };
    } catch (error) {
      console.log(error);
      return { error: { message: "Something Wrong" } };
    }
  }

  async updateHistorialMatriz(idHistorial, object) {
    const { descripcion_deterioro, fecha, idCategoria } = object;
    let enviar = { descripcion_deterioro: null, fecha: null, categoria: null };

    if (descripcion_deterioro && descripcion_deterioro != "")
      enviar.descripcion_deterioro = descripcion_deterioro;

    if (fecha && fecha != "") {
      //Convertimos la fecha ingresada a tipo Date
      const fechaDate = new Date(fecha);
      if (Number.isNaN(fechaDate.getDate()))
        CustomError.createError({
          name: "fecha",
          cause: "Error en el formato date",
          code: ENUM_ERRORS.INVALID_TYPES_ERROR,
          message: "Error en el formato date",
        });
      if (fechaDate.getFullYear() < 2024)
        CustomError.createError({
          name: "fecha",
          cause: "Error en el Año agregado",
          code: ENUM_ERRORS.INVALID_TYPES_ERROR,
          message: "Error en el Año agregado",
        });
      enviar.fecha = fecha;
    }

    if (idCategoria && idCategoria != "") {
      if (idCategoria != "3" && idCategoria != "4")
        CustomError.createError({
          name: "categoria",
          cause: "Categoria fuera de rango ",
          code: ENUM_ERRORS.ROUTING_ERROR,
          message: "Categoria fuera de rango (Mantenimiento o Falla)",
        });

      enviar.categoria = idCategoria;
    }

    try {
      const [result] = await con.query(
        `
        UPDATE historialFallosMatriz
        SET descripcion_deterioro = IFNULL(?,descripcion_deterioro),
            fecha = IFNULL(?,fecha),
            idCategoria = IFNULL(?,idCategoria)
        WHERE id = ?;`,
        [
          enviar.descripcion_deterioro,
          enviar.fecha,
          enviar.categoria,
          idHistorial,
        ]
      );

      if (result.affectedRows === 0)
        CustomError.createError({
          name: "historialMatriz",
          cause: "No se encontro el historial de dicha matriz",
          code: ENUM_ERRORS.INVALID_OBJECT_NOT_EXISTS,
          message: "No se encontro el historial de dicha matriz",
        });

      const [rows] = await con.query(
        `SELECT historialFallosMatriz.id,historialFallosMatriz.idMatriz, historialFallosMatriz.descripcion_deterioro, historialFallosMatriz.fecha, historialFallosMatriz.isSolved, historialFallosMatriz.fechaTerminado , matriz.cod_matriz, matriz.descripcion, categoria.categoria
          FROM historialFallosMatriz 
          LEFT JOIN matriz ON historialFallosMatriz.idMatriz = matriz.id LEFT JOIN categoria ON historialFallosMatriz.idCategoria = categoria.id
          WHERE historialFallosMatriz.id = ?;`,
        idHistorial
      );

      const update = this.listHistorial.map((elem) => {
        if (elem.id == idHistorial) return rows[0];
        else return elem;
      });

      this.listHistorial = update;

      return {
        data: {
          status: "success",
          data: rows[0],
          message: "Operacion Exitosa",
        },
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
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
          data: { message: "Se elimino Correctamente", status: "success" },
        };
      } else
        CustomError.createError({
          name: "idHistorialMatriz",
          cause: "No existe ese historial",
          message: "No existe ese historial",
          code: ENUM_ERRORS.INVALID_OBJECT_NOT_EXISTS,
        });
    } catch (error) {
      throw error;
    }
  }

  async deleteByIdMatriz(idMatriz) {
    try {
      const [rows] = await con.query(
        `SELECT id, idMatriz FROM historialFallosMatriz WHERE idMatriz = ?;`,
        [idMatriz]
      );

      for (let i = 0; i < rows.length; i++) {
        const { id } = rows[i];
        try {
          await this.deleteHistorialMatriz(id);
        } catch (error) {}
      }
    } catch (error) {}
  }
}
