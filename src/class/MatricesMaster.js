import { con } from "../config/db.js";

export default class Matrices {
  constructor() {
    this.listMatriz = [];
    this.enumCampos = {
      COD_MATRIZ: "codMatriz",
      DESCRIPCION: "descripcion",
      ID_MATERIAL: "material",
      ID_CLIENTE: "cliente",
      CANT_PIEZA_GOLPE: "cantPiezaGolpe",
      UBICACION: "ubicacion",
      NUM_MATRIZ: "numMatriz",
    };
  }

  async getMatrices() {
    try {
      const [rows] = await con.query(
        `SELECT matriz.id, matriz.cod_matriz, matriz.descripcion, matriz.cantPiezaGolpe, matriz.numero_matriz, materiaPrima.material, clientes.cliente
            FROM matriz 
            LEFT JOIN materiaPrima ON matriz.idmaterial = materiaPrima.id
            LEFT JOIN clientes ON matriz.idcliente = clientes.id;`
      );
      this.listMatriz = rows;
      return { data: rows };
    } catch (e) {
      console.error(e);
      return { error: { message: "Something wrong" } };
    }
  }

  exitsMatriz(idMatriz) {
    return this.listMatriz.find(elem => {
      return elem.id == idMatriz
    }) != null ? true : false
  }

  getOneMatriz(idMatriz) {
    return this.listMatriz.find(elem => {
      return elem.id == idMatriz
    });
  }

  getLength = () => this.listMatriz.length;

  verifyCampus(object) {
    //Object importants
    const { cod_matriz, descripcion, cantPiezaGolpe } = object;

    //Validar Campos
    if (cod_matriz == null || cod_matriz == "")
      return {
        error: {
          message: "Campo Cod Matriz Vacio",
          campo: this.enumCampos.COD_MATRIZ,
        },
      };

    if (descripcion == null || descripcion == "")
      return {
        error: {
          message: "Campo Descripcion Vacio",
          campo: this.enumCampos.DESCRIPCION,
        },
      };

    if (cantPiezaGolpe == null || cantPiezaGolpe == "")
      return {
        error: {
          message: "Campo Cantidad Piezas x Golpe Vacio",
          campo: this.enumCampos.CANT_PIEZA_GOLPE,
        },
      };

    // Verificar que no se repita el Cod Matriz
    const findSameCodMatriz = this.listMatriz.find((elem) => {
      const resultCodMatriz =
        cod_matriz.slice(0, 3).toUpperCase() + "-" + cod_matriz.slice(3);
      return elem.cod_matriz == resultCodMatriz;
    });
    if (findSameCodMatriz)
      return {
        error: {
          message: "Ya existe ese codigo matriz",
          campo: this.enumCampos.COD_MATRIZ,
        },
      };

    // Verificar que sea de 6 codigos el CodMatriz
    if (cod_matriz.length !== 6)
      return {
        error: {
          message: "No contiene 6 digitos el codigo matriz",
          campo: this.enumCampos.COD_MATRIZ,
        },
      };

    const objectString = new String(cod_matriz);

    // Verificar que los primeros 3 digitos no sean numericos
    const primeros = objectString.slice(0, 3);

    const primerosInteger = parseInt(primeros);
    if (Number.isInteger(primerosInteger)) {
      return {
        error: {
          message: "Error en el formato de enviar codProducto",
          campo: this.enumCampos.NUM_MATRIZ,
        },
      };
    }

    // Verificar que los ultimo 3 digitos sean Number
    const ultimos = objectString.slice(3);
    const ultimosInteger = parseInt(ultimos);
    if (!Number.isInteger(ultimosInteger))
      return {
        error: {
          message: "Error en el formato de enviar codProducto",
          campo: this.enumCampos.NUM_MATRIZ,
        },
      };

    const cantPiezaGolpeInteger = parseInt(cantPiezaGolpe);

    //Verificamos que sean de tipo Integer
    if (!Number.isInteger(cantPiezaGolpeInteger))
      return {
        error: {
          message: "Campo Cantidad Pieza x Golpe No es un numero",
          campo: this.enumCampos.CANT_PIEZA_GOLPE,
        },
      };

    return { data: true };
  }

  async postMatriz(object) {
    const {
      cod_matriz, //Importante
      descripcion, //Importante
      idmaterial,
      idcliente,
      cantPiezaGolpe, //Importante
      ubicacion,
    } = object;

    const { error } = this.verifyCampus(object);
    if (error) return { error };

    // Colocar un '-' entre los 3 digitos
    const objectString = new String(cod_matriz);
    const resultCodMatriz =
      objectString.slice(0, 3).toUpperCase() + "-" + objectString.slice(3);

    const numMatriz = parseInt(objectString.slice(3));

    try {
      const [rows] = await con.query(
        "INSERT INTO matriz (`cod_matriz`, `descripcion`, `idmaterial`, `idcliente`, `cantPiezaGolpe`, `ubicacion`, `numero_matriz`) VALUES (?,?,?,?,?,?,?);",
        [
          resultCodMatriz,
          descripcion,
          idmaterial,
          idcliente,
          cantPiezaGolpe,
          ubicacion,
          numMatriz,
        ]
      );
      if (rows.affectedRows >= 1) {
        //Tengo que agregar ya para el futuro poder verificar que no se repita el codProducto
        this.listMatriz.push({});
        return {
          data: { message: "Operacion Exitosa", insertId: rows.insertId },
        };
      } else return { error: { message: "No se Agrego" } };
    } catch (error) {
      console.log(error);
      return { error: { message: "Something Wrong" } };
    }
  }

  async updateMatriz(idMatriz, object) {
    const {
      cod_matriz, //Importante
      descripcion, //Importante
      idmaterial,
      idcliente,
      cantPiezaGolpe, //Importante
      ubicacion,
      numero_matriz, //Importante
    } = object;

    let enviar = {};

    const findMatrizById = this.listMatriz.find((elem) => elem.id == idMatriz);

    if (cod_matriz) {
      if (cod_matriz != "") {
        // Verificar que no se repita el Cod Matriz
        const findSameCodMatriz = this.listMatriz.find((elem) => {
          const resultCodMatriz =
            cod_matriz.slice(0, 3).toUpperCase() + "-" + cod_matriz.slice(3);
          return elem.cod_matriz.toLowerCase() == resultCodMatriz.toLowerCase();
        });
        if (findSameCodMatriz) {
          if (findSameCodMatriz.cod_matriz != findMatrizById.cod_matriz)
            return {
              error: {
                message: "Ya existe ese Cod Matriz",
                campo: this.enumCampos.COD_MATRIZ,
              },
            };
        }

        // Verificar que sea de 6 codigos el CodMatriz
        if (cod_matriz.length !== 6)
          return {
            error: {
              message: "No contiene 6 digitos el codigo matriz",
              campo: this.enumCampos.COD_MATRIZ,
            },
          };

        const objectString = new String(cod_matriz);

        // Verificar que los primeros 3 digitos no sean numericos
        const primeros = objectString.slice(0, 3);

        const primerosInteger = parseInt(primeros);
        if (Number.isInteger(primerosInteger))
          return {
            error: {
              message: "Error en el formato de enviar codProducto",
              campo: this.enumCampos.NUM_MATRIZ,
            },
          };

        // Verificar que los ultimo 3 digitos sean Number
        const ultimos = objectString.slice(3);
        if (!Number.isInteger(ultimos))
          return {
            error: {
              message: "Error en el formato de enviar codProducto",
              campo: this.enumCampos.NUM_MATRIZ,
            },
          };
        // Colocar un '-' entre los 3 digitos
        const resultCodMatriz =
          objectString.slice(0, 3).toUpperCase() + "-" + objectString.slice(3);

        enviar.codMatriz = resultCodMatriz;
      } else return { error: { message: "Campo cod Matriz Vacio" } };
    }
    if (numero_matriz) {
      const numMatriz = parseInt(numero_matriz);

      if (!Number.isInteger(numMatriz))
        return { error: { message: "Campo Numero Matriz No es un numero" } };

      enviar.numMatriz = numMatriz;
    }
    if (cantPiezaGolpe) {
      const cantPiezaGolpeInteger = parseInt(cantPiezaGolpe);

      if (!Number.isInteger(cantPiezaGolpeInteger))
        return {
          error: { message: "Campo Cantidad Pieza x Golpe No es un numero" },
        };

      enviar.cantPiezaGolpe = cantPiezaGolpe;
    }

    //Verificar que existan el cliente y el material

    try {
      const [result] = await con.query(
        `UPDATE matriz
          SET cod_matriz = IFNULL(?,cod_matriz),
              descripcion = IFNULL(?,descripcion),
              idmaterial = IFNULL(?,idmaterial),
              idcliente = IFNULL(?,idcliente),
              cantPiezaGolpe = IFNULL(?,cantPiezaGolpe),
              ubicacion = IFNULL(?,ubicacion),
              numero_matriz = IFNULL(?,numero_matriz)
          WHERE id = ?;`,
        [
          enviar.codMatriz,
          descripcion,
          idmaterial,
          idcliente,
          enviar.cantPiezaGolpe,
          ubicacion,
          enviar.numMatriz,
          idMatriz,
        ]
      );
      if (result.affectedRows === 0)
        return { error: { message: "No se encontro la Matriz" } };

      const [rows] = await con.query(
        ` SELECT matriz.id, matriz.cod_matriz, matriz.descripcion, matriz.cantPiezaGolpe, matriz.numero_matriz, materiaPrima.material, clientes.cliente
          FROM matriz 
            LEFT JOIN materiaPrima ON matriz.idmaterial = materiaPrima.id
            LEFT JOIN clientes ON matriz.idcliente = clientes.id
          WHERE matriz.id=?; `,
        idMatriz
      );

      return { data: rows[0] };
    } catch (error) {
      console.log(error);
      return { error: { message: "Something Wrong" } };
    }
  }

  async deleteMatriz(idMatriz) {
    try {
      const [result] = await con.query("DELETE FROM matriz WHERE (`id` = ?);", [
        idMatriz,
      ]);

      //Eliminar todo lo relacionado con el historial de matriz de errores

      if (result.affectedRows >= 1)
        return {
          data: { message: "Se elimino Correctamente" },
        };
      else return { error: { message: "No existe" } };
    } catch (error) {
      console.log(error);
      return { error: { message: "Something Wrong" } };
    }
  }
}
