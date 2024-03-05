import { con } from "../config/db.js";
import CustomError from "../errors/Custom_errors.js";
import { ENUM_ERRORS } from "../errors/enums.js";

export default class ProducionManager {
  constructor() {
    this.listProduccion = [];
  }

  async getProduccion() {
    try {
      const [rows] = await con.query(
        ` SELECT producion.*,
                inventario.nombre,inventario.articulo,inventario.url_image,
                matriz.cod_matriz,matriz.cantPiezaGolpe,matriz.descripcion,
                maquina.numberSerie AS numero_maquina, maquina.nombre AS maquina
          FROM producion 
                LEFT JOIN inventario ON producion.idinventario = inventario.id 
                LEFT JOIN matriz ON producion.idMatriz = matriz.id
                LEFT JOIN maquina ON producion.num_maquina = maquina.numberSerie
                LEFT JOIN turnoProduccion ON producion.idTurno = turnoProduccion.id
          ORDER BY producion.fecha DESC; `
      );
      this.listProduccion = rows;
      return { data: rows };
    } catch (e) {
      return { error: { message: "Something wrong" } };
    }
  }

  getOneProducion(idProduccion) {
    if (this.listProduccion.length != 0) {
      const findProduccionById = this.listProduccion.find(
        (e) => e.id == parseInt(idProduccion)
      );
      return { data: findProduccionById };
    } else
      return { error: { message: "Lista Produccion Vacio", status: "error" } };
  }

  getRangeDateListProduccion(dateInit, dateEnd) {
    return this.listProduccion.filter(
      (elem) =>
        new Date(elem.fecha) >= new Date(dateInit) &&
        new Date(elem.fecha) <= new Date(dateEnd)
    );
  }

  getRangeDateByNumMaquina(numMaquina, dateInit, dateEnd) {
    console.log(dateInit, dateEnd, numMaquina);
    const rangeDateList = this.getRangeDateListProduccion(dateInit, dateEnd);

    const filterByNumMaquina = rangeDateList.filter(
      (elem) => elem.num_maquina == numMaquina
    );

    return filterByNumMaquina;
  }

  getRangeDateListByNumMaquina(dateInit, dateEnd) {
    const result = this.getRangeDateListProduccion(dateInit, dateEnd);

    const numMaquinaSet = new Set();
    result.forEach((elem) => {
      numMaquinaSet.add(elem.num_maquina);
    });

    const numMaquinaList = [];
    numMaquinaSet.forEach((value1, value2, set) => {
      numMaquinaList.push(value2);
    });

    const enviar = [];

    for (let i = 0; i < numMaquinaList.length; i++) {
      const numMaquina = numMaquinaList[i];

      let listEnviar = [];
      result.forEach((elem) => {
        if (elem.num_maquina == numMaquina) {
          listEnviar.push([
            new Date(elem.fecha),
            elem.golpesReales,
            elem.piezasProducidas,
            elem.prom_golpeshora,
          ]);
        }
      });

      enviar.push({
        maquina: numMaquina,
        data: listEnviar,
      });
    }
    return enviar;
  }

  async postListProduccion(list) {
    //Verificamos que este todo correcto
    let verify = [{ numMaquina: null }];
    for (let i = 0; i < list.length; i++) {
      const element = list[i];

      const { error } = this.verifyCampus(element);
      if (error)
        return {
          error: { message: error.message, index: i, campo: error.campo },
        };
      const findNumMaquina = verify.find(
        (elem) => elem.numMaquina == element.numMaquina
      );

      if (findNumMaquina)
        return {
          error: {
            message: "Se repite el numero Maquina",
            index: i,
            campo: "numMaquina",
          },
        };

      //Verificar que no se repita el numMaquina
      verify.push({
        numMaquina: element.numMaquina,
      });
    }

    //Agregamos a la base de datos
    for (let i = 0; i < list.length; i++) {
      const element = list[i];

      try {
        const { data, error } = await this.postProducion(element);
        if (error) return { error };
      } catch (err) {
        return { error: "something wrong", status: "error" };
      }
    }

    return {
      data: {
        message: "Operacion Exitosa",
        status: "success",
      },
    };
  }

  verifyCampus(object) {
    const { numMaquina, fecha, idTurno, golpesReales, piezasProducidas } =
      object;
    //Validar Campos
    if (fecha == null || fecha == "")
      CustomError.createError({
        name: "fecha",
        cause: "Campo Fecha esta vacio",
        code: ENUM_ERRORS.INVALID_TYPE_EMPTY,
        message: "Campo Fecha esta vacio",
      });

    if (numMaquina == null || numMaquina == "")
      CustomError.createError({
        name: "numMaquina",
        cause: "Campo N° Maquina esta vacio",
        code: ENUM_ERRORS.INVALID_TYPE_EMPTY,
        message: "Campo N° Maquina esta vacio",
      });

    if (golpesReales == null || golpesReales == "")
      CustomError.createError({
        name: "golpesReale",
        cause: "Campo Golpes Reales esta vacio",
        code: ENUM_ERRORS.INVALID_TYPE_EMPTY,
        message: "Campo Golpes Reales esta vacio",
      });

    if (piezasProducidas == null || piezasProducidas == "")
      CustomError.createError({
        name: "piezasProducidas",
        cause: "Campo piezas producidas esta vacio",
        code: ENUM_ERRORS.INVALID_TYPE_EMPTY,
        message: "Campo piezas producidas esta vacio",
      });

    if (idTurno == null || idTurno == "")
      CustomError.createError({
        name: "idTurno",
        cause: "Campo turno esta vacio",
        code: ENUM_ERRORS.INVALID_TYPE_EMPTY,
        message: "Campo turno esta vacio",
      });

    //Convertimos la fecha ingresada a tipo Date
    const fechaDate = new Date(fecha);

    if (Number.isNaN(fechaDate.getDate()))
      CustomError.createError({
        name: "fecha",
        cause: "Error en el formato date",
        code: ENUM_ERRORS.INVALID_TYPES_ERROR,
        message: "Error en el formato date",
      });

    const numMaquinaInteger = parseInt(numMaquina);
    const golpesRealesInteger = parseInt(golpesReales);
    const piezasProducidasInteger = parseInt(piezasProducidas);
    const idTurnoInteger = parseInt(idTurno);

    //Verificamos que sean de tipo Integer
    if (!Number.isInteger(numMaquinaInteger))
      CustomError.createError({
        name: "numMaquina",
        cause: "Campo N° Maquina no es numerico",
        code: ENUM_ERRORS.INVALID_TYPES_ERROR,
        message: "Campo N° Maquina no es numerico",
      });
    if (!Number.isInteger(idTurnoInteger))
      CustomError.createError({
        name: "idTurno",
        cause: "Campo Turno no es numerico",
        code: ENUM_ERRORS.INVALID_TYPES_ERROR,
        message: "Campo Turno no es numerico",
      });

    if (!Number.isInteger(golpesRealesInteger))
      CustomError.createError({
        name: "golpesReale",
        cause: "Campo Golpes Reales no es numerico",
        code: ENUM_ERRORS.INVALID_TYPES_ERROR,
        message: "Campo Golpes Reales no es numerico",
      });

    if (!Number.isInteger(piezasProducidasInteger))
      CustomError.createError({
        name: "piezasProducidas",
        cause: "Campo PiezasProducidas No es un numero",
        code: ENUM_ERRORS.INVALID_TYPES_ERROR,
        message: "Campo PiezasProducidas No es un numero",
      });

    return { data: true };
  }

  async postProducion(object, returnOne = false) {
    const {
      numMaquina,
      fecha,
      golpesReales,
      piezasProducidas,
      promGolpesHora,
      idMatriz,
      idTurno,
    } = object;

    this.verifyCampus(object);

    try {
      const [rows] = await con.query(
        "INSERT INTO producion (`fecha`, `num_maquina`, `golpesReales`, `piezasProducidas`, `prom_golpeshora`, `idMatriz`, `idTurno`) VALUES (?,?,?,?,?,?,?);",
        [
          fecha,
          numMaquina,
          golpesReales,
          piezasProducidas,
          promGolpesHora,
          idMatriz,
          idTurno,
        ]
      );
      if (rows.affectedRows >= 1) {
        if (returnOne) {
          const [result] = await con.query(
            ` SELECT producion.*,
                    inventario.nombre,inventario.descripcion,inventario.articulo,inventario.url_image,
                    matriz.cod_matriz,matriz.cantPiezaGolpe,
                    maquina.numberSerie AS numero_maquina, maquina.nombre AS maquina
              FROM producion 
                    LEFT JOIN inventario ON producion.idinventario = inventario.id 
                    LEFT JOIN matriz ON producion.idMatriz = matriz.id
                    LEFT JOIN maquina ON producion.num_maquina = maquina.numberSerie
                    LEFT JOIN turnoProduccion ON producion.idTurno = turnoProduccion.id
              WHERE producion.id = ?; `,
            [rows.insertId]
          );

          return {
            data: {
              message: "Operacion Exitosa",
              status: "success",
              data: result[0],
            },
          };
        } else {
          return {
            data: { message: "Operacion Exitosa", insertId: rows.insertId },
          };
        }
      } else return { error: { message: "No se Agrego", status: "error" } };
    } catch (e) {
      switch (e.code) {
        case "ER_TRUNCATED_WRONG_VALUE_FOR_FIELD":
        case "ER_NO_REFERENCED_ROW_2":
          if (e.sqlMessage.includes("fk_idNumMaquina_producion"))
            CustomError.createError({
              name: "numMaquina",
              cause: "No existe esa maquina",
              code: ENUM_ERRORS.FOREING_KEY_OBJECT_NOT_EXISTS,
              message: "No existe esa maquina",
            });
          if (e.sqlMessage.includes("idinventario"))
            CustomError.createError({
              name: "inventario",
              cause: "No existe esa pieza",
              code: ENUM_ERRORS.FOREING_KEY_OBJECT_NOT_EXISTS,
              message: "No existe esa pieza",
            });
          break;
        case "WARN_DATA_TRUNCATED":
          if (e.sqlMessage.includes("prom_golpeshora"))
            CustomError.createError({
              name: "promGolpeshora",
              cause: "Promedio Golpes hora no es numerico",
              code: ENUM_ERRORS.INVALID_TYPES_ERROR,
              message: "Promedio Golpes hora no es numerico",
            });
          break;
      }
      //return { error: { message: "Something Wrong", status: "error" } };
    }
  }

  async updateProduccion(idProduccion, obj) {
    const {
      fecha,
      num_maquina,
      golpesReales,
      piezasProducidas,
      prom_golpeshora,
      idTurno,
    } = obj;

    let campusEnviar = {
      fecha: null,
      num_maquina: null,
      golpesReales: null,
      piezasProducidas: null,
      prom_golpeshora: null,
      idTurno: null,
    };

    if (fecha != null && fecha != "") {
      const validarDate = new Date(fecha);

      if (Number.isNaN(validarDate.getDate()))
        CustomError.createError({
          name: "fecha",
          cause: "Error en el formato date",
          code: ENUM_ERRORS.INVALID_TYPES_ERROR,
          message: "Error en el formato date",
        });
      campusEnviar.fecha = fecha;
    }
    if (num_maquina != null && num_maquina != "") {
      const numMaquinaInteger = parseInt(num_maquina);

      if (!Number.isInteger(numMaquinaInteger))
        CustomError.createError({
          name: "numMaquina",
          cause: "Campo Num Maquina no es numerico",
          code: ENUM_ERRORS.INVALID_TYPES_ERROR,
          message: "Campo Num Maquina no es numerico",
        });
      campusEnviar.num_maquina = numMaquinaInteger;
    }
    if (golpesReales != null && golpesReales != "") {
      const golpesRealesInteger = parseInt(golpesReales);

      if (!Number.isInteger(golpesRealesInteger))
        CustomError.createError({
          name: "golpesReale",
          cause: "Campo Golpes Reales no es numerico",
          code: ENUM_ERRORS.INVALID_TYPES_ERROR,
          message: "Campo Golpes Reales no es numerico",
        });
      campusEnviar.golpesReales = golpesRealesInteger;
    }
    if (piezasProducidas != null && piezasProducidas != "") {
      const piezasProducidasInteger = parseInt(piezasProducidas);

      if (!Number.isInteger(piezasProducidasInteger))
        CustomError.createError({
          name: "piezasProducidas",
          cause: "Campo Piezas Producidas no es numerico",
          code: ENUM_ERRORS.INVALID_TYPES_ERROR,
          message: "Campo Piezas Producidas no es numerico",
        });

      campusEnviar.piezasProducidas = piezasProducidasInteger;
    }
    if (prom_golpeshora != null && prom_golpeshora != "") {
      const promGolpesHoraInteger = parseInt(prom_golpeshora);

      if (!Number.isInteger(promGolpesHoraInteger))
        CustomError.createError({
          name: "promGolpesHora",
          cause: "Campo promedio golpes hora no es numerico",
          code: ENUM_ERRORS.INVALID_TYPES_ERROR,
          message: "Campo promedio golpes hora no es numerico",
        });
      campusEnviar.prom_golpeshora = prom_golpeshora;
    }
    if (idTurno != null && idTurno != "") {
      const idTurnoInteger = parseInt(idTurno);

      if (!Number.isInteger(idTurnoInteger))
        CustomError.createError({
          name: "idTurno",
          cause: "Campo Turno ocurrio un error",
          code: ENUM_ERRORS.INVALID_TYPES_ERROR,
          message: "Campo Turno ocurrio un error",
        });
      campusEnviar.idTurno = idTurno;
    }

    //Update Produccion
    try {
      await con.query(
        `
      UPDATE producion
        SET fecha = IFNULL(?,fecha),
            num_maquina = IFNULL(?,num_maquina),
            golpesReales = IFNULL(?,golpesReales),
            piezasProducidas = IFNULL(?,piezasProducidas),
            prom_golpeshora = IFNULL(?,prom_golpeshora),
            idTurno = IFNULL(?, idTurno)
        WHERE id = ?;`,
        [
          campusEnviar.fecha,
          campusEnviar.num_maquina,
          campusEnviar.golpesReales,
          campusEnviar.piezasProducidas,
          campusEnviar.prom_golpeshora,
          campusEnviar.idTurno,
          idProduccion,
        ]
      );
    } catch (e) {
      switch (e.code) {
        case "ER_TRUNCATED_WRONG_VALUE_FOR_FIELD":
        case "ER_NO_REFERENCED_ROW_2":
          if (e.sqlMessage.includes("fk_idNumMaquina_producion"))
            CustomError.createError({
              name: "numMaquina",
              cause: "No existe esa maquina",
              code: ENUM_ERRORS.FOREING_KEY_OBJECT_NOT_EXISTS,
              message: "No existe esa maquina",
            });
          if (e.sqlMessage.includes("idinventario"))
            CustomError.createError({
              name: "inventario",
              cause: "No existe esa pieza",
              code: ENUM_ERRORS.FOREING_KEY_OBJECT_NOT_EXISTS,
              message: "No existe esa pieza",
            });
          break;
        case "WARN_DATA_TRUNCATED":
          if (e.sqlMessage.includes("prom_golpeshora"))
            CustomError.createError({
              name: "promGolpeshora",
              cause: "Promedio Golpes hora no es numerico",
              code: ENUM_ERRORS.INVALID_TYPES_ERROR,
              message: "Promedio Golpes hora no es numerico",
            });
          break;
      }
    }

    const [rows] = await con.query(
      ` SELECT producion.*,
              inventario.nombre,inventario.descripcion,inventario.articulo,inventario.url_image,
              matriz.cod_matriz,matriz.cantPiezaGolpe,
              maquina.numberSerie AS numero_maquina, maquina.nombre AS maquina
        FROM producion 
              LEFT JOIN inventario ON producion.idinventario = inventario.id 
              LEFT JOIN matriz ON producion.idMatriz = matriz.id
              LEFT JOIN maquina ON producion.num_maquina = maquina.numberSerie
              LEFT JOIN turnoProduccion ON producion.idTurno = turnoProduccion.id
        WHERE producion.id = ?; `,
      [idProduccion]
    );

    return {
      data: { message: "Operacion Exitosa", status: "success", data: rows[0] },
    };
  }

  async deleteProduccion(idProduccion) {
    try {
      const result = await con.query(
        "DELETE FROM producion WHERE (`id` = ?);",
        [idProduccion]
      );
      if (result.affectedRows <= 0)
        CustomError.createError({
          name: "idProduccion",
          message: "No existe ese registro de produccion",
          cause: "No existe ese registro de produccion",
          code: ENUM_ERRORS.INVALID_OBJECT_NOT_EXISTS,
        });
    } catch (error) {
      return {
        error: {
          message: "No se encontro la produccion seleccionada",
          status: "error",
        },
      };
    }
    return { data: { message: "Operacion Exitosa", status: "success" } };
  }
}
