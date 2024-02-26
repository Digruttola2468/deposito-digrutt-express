import { con } from "../config/db.js";

export default class RelacionMatrizMaquina {
  constructor() {
    this.listRelacionMaquinaMatriz = [];
  }

  async getAll() {
    try {
      const [rows] = await con.query(
        ` SELECT *, matrices_maquinas.id FROM matrices_maquinas 
                    LEFT JOIN matriz ON matrices_maquinas.idMatriz = matriz.id
                    LEFT JOIN maquina ON matrices_maquinas.idMaquina = maquina.id `
      );
      this.listRelacionMaquinaMatriz = rows;
      return { data: rows };
    } catch (e) {
        console.log(e);
      return { error: { message: "Something wrong" } };
    }
  }

  async getMatrizByIdMaquina(idMaquina) {
    try {
      const [rows] = await con.query(
        ` SELECT * FROM matrices_maquinas 
                    LEFT JOIN matriz ON matrices_maquinas.idMatriz = matriz.id
                    LEFT JOIN maquina ON matrices_maquinas.idMaquina = maquina.id 
                WHERE matrices_maquinas.idMaquina = ?`,
        [idMaquina]
      );
      this.listRelacionMaquinaMatriz = rows;
      return { data: rows };
    } catch (e) {
      return { error: { message: "Something wrong" } };
    }
  }

  async getListMaquinaByIdMatriz(idMatriz) {
    try {
      const [rows] = await con.query(
        ` SELECT * FROM matrices_maquinas 
                    LEFT JOIN matriz ON matrices_maquinas.idMatriz = matriz.id
                    LEFT JOIN maquina ON matrices_maquinas.idMaquina = maquina.id 
                WHERE matrices_maquinas.idMatriz = ?`,
        [idMatriz]
      );
      this.listRelacionMaquinaMatriz = rows;
      return { data: rows };
    } catch (e) {
      return { error: { message: "Something wrong" } };
    }
  }
}
