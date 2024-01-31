import { con } from "../config/db.js";

export default class ProducionManager {
  constructor() {
    this.listProduccion = [];
  }

  async getProduccion() {
    try {
      const [rows] = await con.query(
        `SELECT producion.*,inventario.nombre,inventario.descripcion,inventario.articulo,inventario.url_image 
        FROM producion 
        LEFT JOIN inventario ON producion.idinventario = inventario.id 
        ORDER BY producion.fecha DESC;`
      );
      this.listProduccion = rows;
      return { data: rows };
    } catch (e) {
      console.error(e);
      return { error: { message: "Something wrong" } };
    }
  }

  getOneProducion() {}

  getLength() {
    return this.listProduccion.length;
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
    let verify = [{ idInventario: null, numMaquina: null }];
    for (let i = 0; i < list.length; i++) {
      const element = list[i];

      const { error } = this.verifyCampus(element);
      if (error)
        return {
          error: { message: error.message, index: i, campo: error.campo },
        };

      const findIdInventario = verify.find(
        (elem) => elem.idInventario == element.idInventario
      );
      const findNumMaquina = verify.find(
        (elem) => elem.numMaquina == element.numMaquina
      );

      if (findIdInventario)
        return {
          error: {
            message: "Se repite el Cod Producto",
            index: i,
            campo: "idInventario",
          },
        };
      if (findNumMaquina)
        return {
          error: {
            message: "Se repite el numero Maquina",
            index: i,
            campo: "numMaquina",
          },
        };

      //Verificar que no se repita el idInventario y el numMaquina
      verify.push({
        numMaquina: element.numMaquina,
        idInventario: element.idInventario,
      });
    }

    //Agregamos a la base de datos
    for (let i = 0; i < list.length; i++) {
      const element = list[i];

      try {
        const { data, error } = await this.postProducion(element);
        if (error) return { error };
      } catch (err) {
        return { error: "something wrong" };
      }
    }

    return {
      data: {
        message: "Operacion Exitosa",
      },
    };
  }

  verifyCampus(object) {
    const {
      numMaquina,
      fecha,
      idInventario,
      golpesReales,
      piezasProducidas,
    } = object;
    //Validar Campos
    if (fecha == null || fecha == "")
      return { error: { message: "Campo Fecha Vacio", campo: "fecha" } };

    if (numMaquina == null || numMaquina == "")
      return {
        error: { message: "Campo N° Maquina Vacio", campo: "numMaquina" },
      };

    if (golpesReales == null || golpesReales == "")
      return {
        error: { message: "Campo Golpes Reales Vacio", campo: "golpeReale" },
      };

    if (piezasProducidas == null || piezasProducidas == "")
      return {
        error: {
          message: "Campo PiezasProducidas Vacia",
          campo: "piezasProducidas",
        },
      };

    //Convertimos la fecha ingresada a tipo Date
    const fechaDate = new Date(fecha);

    if (Number.isNaN(fechaDate.getDate()))
      return {
        error: { message: "Error en el formato de la Fecha", campo: "fecha" },
      };

    const numMaquinaInteger = parseInt(numMaquina);
    const golpesRealesInteger = parseInt(golpesReales);
    const piezasProducidasInteger = parseInt(piezasProducidas);

    //Verificamos que sean de tipo Integer
    if (!Number.isInteger(numMaquinaInteger))
      return {
        error: {
          message: "Campo N° Maquina No es un numero",
          campo: "numMaquina",
        },
      };

    if (!Number.isInteger(golpesRealesInteger))
      return {
        error: {
          message: "Campo Golpes Reales No es un numero",
          campo: "golpeReale",
        },
      };

    if (!Number.isInteger(piezasProducidasInteger))
      return {
        error: {
          message: "Campo PiezasProducidas No es un numero",
          campo: "piezasProducidas",
        },
      };

    return { data: true };
  }

  async postProducion(object) {
    const {
      numMaquina,
      fecha,
      idInventario,
      golpesReales,
      piezasProducidas,
      promGolpesHora,
    } = object;

    const { error } = this.verifyCampus(object);
    if (error) return { error };

    try {
      const [rows] = await con.query(
        "INSERT INTO producion (`fecha`, `num_maquina`, `idinventario`, `golpesReales`, `piezasProducidas`, `prom_golpeshora`) VALUES (?,?,?,?,?,?);",
        [
          fecha,
          numMaquina,
          idInventario,
          golpesReales,
          piezasProducidas,
          promGolpesHora,
        ]
      );
      if (rows.affectedRows >= 1)
        return {
          data: { message: "Operacion Exitosa", insertId: rows.insertId },
        };
      else return { error: { message: "No se Agrego" } };
    } catch (error) {
      console.log(error);
      return { error: { message: "Something Wrong" } };
    }
  }

  async updateProduccion(idProduccion, obj) {
    const {
      fecha,
      num_maquina,
      golpesReales,
      piezasProducidas,
      prom_golpeshora,
    } = obj;

    //Validamos que exista el de produccion
    /*try {
      const [rows] = await con.query("SELECT * FROM producion WHERE id=?", [
        idProduccion,
      ]);
      if (!rows.length != 0)
        return {
          error: { message: "No se encontro la produccion seleccionada" },
        };
    } catch (error) {
      return {
        error: { message: "No se encontro la produccion seleccionada" },
      };
    }*/

    let campusEnviar = {
      fecha: null,
      num_maquina: null,
      golpesReales: null,
      piezasProducidas: null,
      prom_golpeshora: null,
    };

    if (fecha != null && fecha != "") {
      const validarDate = new Date(fecha);

      if (Number.isNaN(validarDate.getDate()))
        return { error: { message: "Error en el formato de la Fecha" } };

      campusEnviar.fecha = fecha;
    }
    if (num_maquina != null && num_maquina != "") {
      const numMaquinaInteger = parseInt(num_maquina);

      if (!Number.isInteger(numMaquinaInteger))
        return { error: { message: "Campo Num Maquina No es un numero" } };

      campusEnviar.num_maquina = numMaquinaInteger;
    }
    if (golpesReales != null && golpesReales != "") {
      const golpesRealesInteger = parseInt(golpesReales);

      if (!Number.isInteger(golpesRealesInteger))
        return { error: { message: "Campo Golpes Reales No es un numero" } };

      campusEnviar.golpesReales = golpesRealesInteger;
    }
    if (piezasProducidas != null && piezasProducidas != "") {
      const piezasProducidasInteger = parseInt(piezasProducidas);

      if (!Number.isInteger(piezasProducidasInteger))
        return {
          error: { message: "Campo Piezas Producidas No es un numero" },
        };

      campusEnviar.piezasProducidas = piezasProducidasInteger;
    }
    if (prom_golpeshora != null && prom_golpeshora != "") {
      const promGolpesHoraInteger = parseInt(prom_golpeshora);

      if (!Number.isInteger(promGolpesHoraInteger))
        return { error: { message: "Campo Prom Golpes Hora No es un numero" } };

      campusEnviar.prom_golpeshora = promGolpesHoraInteger;
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
            prom_golpeshora = IFNULL(?,prom_golpeshora)
        WHERE id = ?;`,
        [
          campusEnviar.fecha,
          campusEnviar.num_maquina,
          campusEnviar.golpesReales,
          campusEnviar.piezasProducidas,
          campusEnviar.prom_golpeshora,
          idProduccion,
        ]
      );
    } catch (error) {
      return { error: { message: "Ocurrio un error al actualizar" } };
    }

    return {data: {message: 'Operacion Exitosa'}}
  }

  async deleteProduccion(idProduccion) {
    //Validar si existe el idProduccion
    try {
      const [rows] = await con.query("SELECT * FROM producion WHERE id=?", [
        idProduccion,
      ]);
      if (rows.length != 0) {
        try {
          await con.query("DELETE FROM producion WHERE (`id` = ?);", [
            idProduccion,
          ]);
        } catch (error) {
          return { error: { message: "Ocurrio un error al eliminar" } };
        }
      } else
        return {
          error: { message: "No se encontro la produccion seleccionada" },
        };
    } catch (error) {
      return {
        error: { message: "No se encontro la produccion seleccionada" },
      };
    }

    //Eliminar

    return { data: { message: "Operacion Exitosa" } };
  }
}
