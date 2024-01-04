import { con } from "../config/db.js";

export default class ProducionManager {
  constructor() {
    this.listProduccion = [];
  }

  async getProduccion() {
    try {
      const [rows] = await con.query(
        "SELECT producion.*,inventario.nombre,inventario.descripcion,inventario.articulo,inventario.url_image  FROM producion LEFT JOIN inventario ON producion.idinventario = inventario.id;"
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
      (elem) => new Date(elem.fecha) >= new Date(dateInit) && new Date(elem.fecha) <= new Date(dateEnd)
    );
  }

  getRangeDateListByNumMaquina(dateInit, dateEnd) {
    const result = this.getRangeDateListProduccion(
      dateInit,
      dateEnd
    );
  
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
    return enviar
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
            message: "Se repite el idInventario",
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
      promGolpesHora,
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

    if (promGolpesHora == null || promGolpesHora == "")
      return {
        error: {
          message: "Campo Promedio Golpes/hr Vacia",
          campo: "promGolpHr",
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
    const promGolpesRealesInteger = parseFloat(promGolpesHora);

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

    if (!Number.isInteger(promGolpesRealesInteger))
      return {
        error: {
          message: "Campo Promedio Golpes/hr No es un numero",
          campo: "promGolpHr",
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
}
