import con from "../../config/db.js";

export default class RelacionMaquinaMatrizMysql {
  constructor() {
    this.listClientes = [];
  }

  async get() {
    const [rows] = await con.query(
      ` SELECT *, matrices_maquinas.id FROM matrices_maquinas 
                    LEFT JOIN matriz ON matrices_maquinas.idMatriz = matriz.id
                    LEFT JOIN maquina ON matrices_maquinas.idMaquina = maquina.id `
    );
    this.listRelacionMaquinaMatriz = rows;
    return rows;
  }

  async getMatrizByIdMaquina(idMaquina) {
    return await con.query(
      ` SELECT * FROM matrices_maquinas 
                    LEFT JOIN matriz ON matrices_maquinas.idMatriz = matriz.id
                    LEFT JOIN maquina ON matrices_maquinas.idMaquina = maquina.id 
                WHERE matrices_maquinas.idMaquina = ?`,
      [idMaquina]
    );
  }

  async getMaquinaByIdMatriz(idMatriz) {
    return await con.query(
      ` SELECT * FROM matrices_maquinas 
                    LEFT JOIN matriz ON matrices_maquinas.idMatriz = matriz.id
                    LEFT JOIN maquina ON matrices_maquinas.idMaquina = maquina.id 
                WHERE matrices_maquinas.idMatriz = ?`,
      [idMatriz]
    );
  }
}
