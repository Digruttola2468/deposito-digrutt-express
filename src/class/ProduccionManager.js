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

  async postProducion(object) {
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
      return { error: { message: "Campo Fecha Vacio" } };

    if (numMaquina == null || numMaquina == "")
      return { error: { message: "Campo N° Maquina Vacio" } };

    if (golpesReales == null || golpesReales == "")
      return { error: { message: "Campo Golpes Reales Vacio" } };

    if (piezasProducidas == null || piezasProducidas == "")
      return { error: { message: "Campo PiezasProducidas Vacia" } };

    if (promGolpesHora == null || promGolpesHora == "")
      return { error: { message: "Campo Promedio Golpes/hr Vacia" } };

    //Convertimos la fecha ingresada a tipo Date
    const fechaDate = new Date(fecha);

    if (Number.isNaN(fechaDate.getDate()))
      return { error: { message: "Error en el formato de la Fecha" } };

    const numMaquinaInteger = parseInt(numMaquina);
    const golpesRealesInteger = parseInt(golpesReales);
    const piezasProducidasInteger = parseInt(piezasProducidas);
    const promGolpesRealesInteger = parseFloat(promGolpesHora);

    //Verificamos que sean de tipo Integer
    if (!Number.isInteger(numMaquinaInteger))
      return { error: { message: "Campo N° Maquina No es un numero" } };

    if (!Number.isInteger(golpesRealesInteger))
      return { error: { message: "Campo Golpes Reales No es un numero" } };

    if (!Number.isInteger(piezasProducidasInteger))
      return { error: { message: "Campo PiezasProducidas No es un numero" } };

    if (!Number.isInteger(promGolpesRealesInteger))
      return { error: { message: "Campo Promedio Golpes/hr No es un numero" } };

    try {
      const [rows] = await con.query(
        "INSERT INTO producion (`fecha`, `num_maquina`, `idinventario`, `golpesReales`, `piezasProducidas`, `prom_golpeshora`) VALUES (?,?,?,?,?,?);",
        [
          fecha,
          numMaquinaInteger,
          idInventario,
          golpesRealesInteger,
          piezasProducidasInteger,
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
