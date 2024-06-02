import con from "../../config/db.js";

export default class ProduccionMysql {
  constructor() {
    this.listProduccion = [];
  }

  get = async () => {
    const [rows] = await con.query(
      ` SELECT producion.*,
                matriz.cod_matriz,matriz.cantPiezaGolpe,
                maquina.numberSerie AS numero_maquina, maquina.nombre AS maquina
          FROM producion 
                LEFT JOIN matriz ON producion.idMatriz = matriz.id
                LEFT JOIN maquina ON producion.num_maquina = maquina.numberSerie
          ORDER BY producion.fecha DESC; `
    );
    this.listProduccion = rows;
    return rows;
  };

  getOne = async (idProduccion) => {
    return await con.query(
      ` SELECT producion.*,
                  matriz.cod_matriz,matriz.cantPiezaGolpe,
                  maquina.numberSerie AS numero_maquina, maquina.nombre AS maquina
            FROM producion 
                  LEFT JOIN matriz ON producion.idMatriz = matriz.id
                  LEFT JOIN maquina ON producion.num_maquina = maquina.numberSerie
            WHERE producion.id = ?;`,
      [idProduccion]
    );
  };

  getRangeDateListProduccion(dateInit, dateEnd) {
    return this.listProduccion.filter(
      (elem) =>
        new Date(elem.fecha) >= new Date(dateInit) &&
        new Date(elem.fecha) <= new Date(dateEnd)
    );
  }

  getRangeDateByNumMaquina(numMaquina, dateInit, dateEnd) {
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

  insert = async (object) => {
    return await con.query(
      "INSERT INTO producion (`fecha`, `num_maquina`, `golpesReales`, `piezasProducidas`, `prom_golpeshora`, `idMatriz`) VALUES (?,?,?,?,?,?);",
      [
        object.fecha,
        object.numMaquina,
        object.golpesReales,
        object.piezasProducidas,
        object.promGolpesHora,
        object.idMatriz,
      ]
    );
  };

  update = async (idProduccion, object) => {
    return await con.query(
      `
      UPDATE producion
        SET fecha = IFNULL(?,fecha),
            num_maquina = IFNULL(?,num_maquina),
            golpesReales = IFNULL(?,golpesReales),
            piezasProducidas = IFNULL(?,piezasProducidas),
            prom_golpeshora = IFNULL(?,prom_golpeshora),
            idMatriz = IFNULL(?, idMatriz)
        WHERE id = ?;`,
      [
        object.fecha,
        object.numMaquina,
        object.golpesReales,
        object.piezasProducidas,
        object.promGolpesHora,
        object.idMatriz,
        idProduccion,
      ]
    );
  };

  delete = async (idProduccion) => {
    return await con.query("DELETE FROM producion WHERE (`id` = ?);", [
      idProduccion,
    ]);
  };
}
