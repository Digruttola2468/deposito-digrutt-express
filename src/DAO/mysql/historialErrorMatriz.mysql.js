import con from "../../config/db.js";

export default class HistorialErrorMatrizMysql {
  constructor() {
    this.listHistorialErrorMatriz = [];
  }

  get = async () => {
    const [rows] = await con.query(
      `SELECT historialFallosMatriz.id,historialFallosMatriz.idMatriz, historialFallosMatriz.descripcion_deterioro, historialFallosMatriz.fecha, historialFallosMatriz.isSolved, historialFallosMatriz.fechaTerminado , matriz.cod_matriz, matriz.descripcion, categoria.categoria
                FROM historialFallosMatriz 
                LEFT JOIN matriz ON historialFallosMatriz.idMatriz = matriz.id
                LEFT JOIN categoria ON historialFallosMatriz.idCategoria = categoria.id
                ORDER BY historialFallosMatriz.fecha DESC;`
    );

    this.listHistorial = rows;
    return rows;
  };

  getOne = async (idHistorial) => {
    return await con.query(
      `SELECT historialFallosMatriz.id,historialFallosMatriz.idMatriz, historialFallosMatriz.descripcion_deterioro, historialFallosMatriz.fecha, historialFallosMatriz.isSolved, historialFallosMatriz.fechaTerminado , matriz.cod_matriz, matriz.descripcion, categoria.categoria
                  FROM historialFallosMatriz 
                  LEFT JOIN matriz ON historialFallosMatriz.idMatriz = matriz.id
                  LEFT JOIN categoria ON historialFallosMatriz.idCategoria = categoria.id
                  WHERE historialFallosMatriz.id = ?;`,
      [idHistorial]
    );
  };

  getByMatriz = async (idMatriz) => {
    return await con.query(
      `SELECT historialFallosMatriz.id,historialFallosMatriz.idMatriz, historialFallosMatriz.descripcion_deterioro, historialFallosMatriz.fecha, historialFallosMatriz.isSolved, historialFallosMatriz.fechaTerminado , matriz.cod_matriz, matriz.descripcion, categoria.categoria
                  FROM historialFallosMatriz 
                  LEFT JOIN matriz ON historialFallosMatriz.idMatriz = matriz.id
                  LEFT JOIN categoria ON historialFallosMatriz.idCategoria = categoria.id
                  WHERE historialFallosMatriz.idMatriz = ?;`,
      [idMatriz]
    );
  };

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

  insert = async (object) => {
    return await con.query(
      "INSERT INTO historialFallosMatriz (`idMatriz`, `descripcion_deterioro`, `fecha`, `idCategoria`) VALUES (?,?,?,?);",
      [
        object.idMatriz,
        object.descripcion_deterioro,
        object.stringDate,
        object.idCategoria,
      ]
    );
  };

  update = async (idHistorial, object) => {
    return await con.query(
      `
        UPDATE historialFallosMatriz
        SET descripcion_deterioro = IFNULL(?,descripcion_deterioro),
            fecha = IFNULL(?,fecha),
            idCategoria = IFNULL(?,idCategoria)
        WHERE id = ?;`,
      [
        object.descripcion_deterioro,
        object.stringDate,
        object.idCategoria,
        idHistorial,
      ]
    );
  };

  updateIsSolved = async (idHistorial, fechaTerminado, isSolved) => {
    return await con.query(
      `
        UPDATE historialFallosMatriz
        SET isSolved = ?,
            fechaTerminado = ?
        WHERE id = ?;`,
      [isSolved, fechaTerminado, idHistorial]
    );
  };

  async deleteByIdMatriz(idMatriz) {
    const [rows] = await con.query(
      `SELECT id, idMatriz FROM historialFallosMatriz WHERE idMatriz = ?;`,
      [idMatriz]
    );

    try {
      for (let i = 0; i < rows.length; i++) {
        await this.delete(rows[i].id);
      }
      return true;
    } catch (error) {
      return false;
    }
  }

  delete = async (idHistorial) => {
    return await con.query(
      "DELETE FROM historialFallosMatriz WHERE (`id` = ?);",
      [idHistorial]
    );
  };
}
