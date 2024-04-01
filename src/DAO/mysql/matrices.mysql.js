import con from "../../config/db.js";

export default class MatricesMysql {
  constructor() {
    this.listMatrices = [];
  }

  get = async () => {
    const [rows] = await con.query(
      `SELECT matriz.id, matriz.cod_matriz, matriz.descripcion, matriz.cantPiezaGolpe, matriz.numero_matriz, materiaPrima.material, clientes.cliente, matriz.idcliente
                FROM matriz 
                LEFT JOIN materiaPrima ON matriz.idmaterial = materiaPrima.id
                LEFT JOIN clientes ON matriz.idcliente = clientes.id;`
    );
    this.listMatriz = rows;
    return rows;
  };

  getOne = async (idMatriz) => {
    return await con.query(
      `SELECT matriz.id, matriz.cod_matriz, matriz.descripcion, matriz.cantPiezaGolpe, matriz.numero_matriz, materiaPrima.material, clientes.cliente, matriz.idcliente
                  FROM matriz 
                  LEFT JOIN materiaPrima ON matriz.idmaterial = materiaPrima.id
                  LEFT JOIN clientes ON matriz.idcliente = clientes.id
                WHERE matriz.id = ?;`,
      [idMatriz]
    );
  };

  insert = async (object) => {
    return await con.query(
      "INSERT INTO matriz (`cod_matriz`, `descripcion`, `idmaterial`, `idcliente`, `cantPiezaGolpe`, `ubicacion`, `numero_matriz`) VALUES (?,?,?,?,?,?,?);",
      [
        object.cod_matriz,
        object.descripcion,
        object.idmaterial,
        object.idcliente,
        object.cantPiezaGolpe,
        object.ubicacion,
        object.numero_matriz,
      ]
    );
  };

  update = async (idMatriz, object) => {
    return await con.query(
      `UPDATE matriz
          SET descripcion = IFNULL(?,descripcion),
              idmaterial = IFNULL(?,idmaterial),
              cantPiezaGolpe = IFNULL(?,cantPiezaGolpe),
              ubicacion = IFNULL(?,ubicacion)
          WHERE id = ?;`,
      [
        object.descripcion,
        object.idmaterial,
        object.cantPiezaGolpe,
        object.ubicacion,
        idMatriz,
      ]
    );
  };
  
  delete = async (idMatriz) => {
    return await con.query("DELETE FROM matriz WHERE (`id` = ?);", [idMatriz]);
  };
}
