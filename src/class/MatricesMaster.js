import { con } from "../config/db.js";
import CustomError from "../errors/Custom_errors.js";
import { ENUM_ERRORS } from "../errors/enums.js";

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
        `SELECT matriz.id, matriz.cod_matriz, matriz.descripcion, matriz.cantPiezaGolpe, matriz.numero_matriz, materiaPrima.material, clientes.cliente, matriz.idcliente
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
    return this.listMatriz.find((elem) => {
      return elem.id == idMatriz;
    }) != null
      ? true
      : false;
  }

  getOneMatriz(idMatriz) {
    return this.listMatriz.find((elem) => {
      return elem.id == idMatriz;
    });
  }

  verifyCampus(object) {
    //Object importants
    const { cod_matriz, descripcion, cantPiezaGolpe } = object;

    //Validar Campos
    if (cod_matriz == null || cod_matriz == "")
      CustomError.createError({
        name: "cod_matriz",
        message: "Campo cod_matriz esta vacio",
        cause: "Campo cod_matriz esta vacio",
        code: ENUM_ERRORS.INVALID_TYPE_EMPTY,
      });

    if (descripcion == null || descripcion == "")
      CustomError.createError({
        name: "descripcion",
        message: "Campo Descripcion Matriz esta vacio",
        cause: "Campo Descripcion Matriz esta vacio",
        code: ENUM_ERRORS.INVALID_TYPE_EMPTY,
      });

    if (cantPiezaGolpe == null || cantPiezaGolpe == "")
      CustomError.createError({
        name: "cantPiezaxGolpe",
        message: "Campo cantidad Pieza x Golpe esta vacio",
        cause: "Campo cantidad Pieza x Golpe esta vacio",
        code: ENUM_ERRORS.INVALID_TYPE_EMPTY,
      });

    // Verificar que sea de 6 codigos el CodMatriz
    if (cod_matriz.length !== 6)
      CustomError.createError({
        name: "cod_matriz",
        message: "No contiene 6 digitos, EJ: AXE001",
        cause: "No contiene 6 digitos, EJ: AXE001",
        code: ENUM_ERRORS.INVALID_TYPES_ERROR,
      });

    const objectString = new String(cod_matriz);

    // Verificar que los primeros 3 digitos no sean numericos
    const primeros = objectString.slice(0, 3);

    const primerosInteger = parseInt(primeros);
    if (Number.isInteger(primerosInteger))
      CustomError.createError({
        name: "cod_matriz",
        message: "Los primeros 3 son del codigo cliente",
        cause: "Los primeros 3 son del codigo cliente",
        code: ENUM_ERRORS.INVALID_TYPES_ERROR,
      });

    // Verificar que los ultimo 3 digitos sean Number
    const ultimos = objectString.slice(3);
    const ultimosInteger = parseInt(ultimos);
    if (!Number.isInteger(ultimosInteger))
      CustomError.createError({
        name: "cod_matriz",
        message: "Los ultimos 3 son del numero matriz",
        cause: "Los ultimos 3 son del numero matriz",
        code: ENUM_ERRORS.INVALID_TYPES_ERROR,
      });

    const cantPiezaGolpeInteger = parseInt(cantPiezaGolpe);

    //Verificamos que sean de tipo Integer
    if (!Number.isInteger(cantPiezaGolpeInteger))
      CustomError.createError({
        name: "cantPiezaGolpe",
        message: "Campo cantidad Pieza x Golpe no es numerico",
        cause: "Campo cantidad Pieza x Golpe no es numerico",
        code: ENUM_ERRORS.INVALID_TYPES_ERROR,
      });

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

    this.verifyCampus(object);

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
        const [result] = await con.query(
          `SELECT matriz.id, matriz.cod_matriz, matriz.descripcion, matriz.cantPiezaGolpe, matriz.numero_matriz, materiaPrima.material, clientes.cliente, matriz.idcliente
            FROM matriz 
              LEFT JOIN materiaPrima ON matriz.idmaterial = materiaPrima.id
              LEFT JOIN clientes ON matriz.idcliente = clientes.id
            WHERE matriz.id = ?;`,
          [rows.insertId]
        );

        return {
          data: {
            message: "Operacion Exitosa",
            data: result[0],
            status: "success",
          },
        };
      } else
        return {
          error: { message: "No se Agrego la matriz", status: "error" },
        };
    } catch (e) {
      console.log(e);
      switch (e.code) {
        case "ER_NO_REFERENCED_ROW_2":
          if (e.sqlMessage.includes("idmaterial"))
            CustomError.createError({
              name: "idmaterial",
              message: "No existe ese material en la BBDD",
              cause: "No existe ese material en el BBDD",
              code: ENUM_ERRORS.INVALID_OBJECT_NOT_EXISTS,
            });
          if (e.sqlMessage.includes("idcliente"))
            CustomError.createError({
              name: "idcliente",
              message: "No existe ese cliente",
              cause: "No existe ese cliente",
              code: ENUM_ERRORS.INVALID_OBJECT_NOT_EXISTS,
            });
          break;
        case "ER_DUP_ENTRY":
          if (e.sqlMessage.includes("cod_matriz")) {
            CustomError.createError({
              name: "cod_matriz",
              message: "Ya existe esa matriz",
              cause: "Ya existe esa matriz",
              code: ENUM_ERRORS.THIS_OBJECT_ALREDY_EXISTS,
            });
          }
          break;
      }
      return { error: { message: "Something Wrong" } };
    }
  }

  async updateMatriz(idMatriz, object) {
    const {
      descripcion,
      idmaterial,
      idcliente,
      cantPiezaGolpe,
      ubicacion,
      numero_matriz,
    } = object;

    let enviar = {
      codMatriz: null, //
      descripcion: null, //
      idmaterial: null, //
      idcliente: null, //
      cantPiezaGolpe: null, //
      ubicacion: null, //
      numMatriz: null, //
    };

    if (descripcion != null && descripcion != "")
      enviar.descripcion = descripcion;
    if (idmaterial != null && idmaterial != "") enviar.idmaterial = idmaterial;
    if (idcliente != null && idcliente != "") enviar.idcliente = idcliente;
    if (ubicacion != null && ubicacion != "") enviar.ubicacion = ubicacion;

    if (numero_matriz && numero_matriz != "") {
      const numMatriz = parseInt(numero_matriz);

      if (!Number.isInteger(numMatriz))
        CustomError.createError({
          name: "numMatriz",
          message: "Campo Numero Matriz no es numerico",
          cause: "Campo Numero Matriz no es numerico",
          code: ENUM_ERRORS.INVALID_TYPES_ERROR,
        });

      enviar.numMatriz = numMatriz;
    }
    if (cantPiezaGolpe && cantPiezaGolpe != "") {
      const cantPiezaGolpeInteger = parseInt(cantPiezaGolpe);

      if (!Number.isInteger(cantPiezaGolpeInteger))
        CustomError.createError({
          name: "cantPiezaGolpe",
          message: "Campo cantidad Pieza x Golpe no es numerico",
          cause: "Campo cantidad Pieza x Golpe no es numerico",
          code: ENUM_ERRORS.INVALID_TYPES_ERROR,
        });

      enviar.cantPiezaGolpe = cantPiezaGolpe;
    }

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
          enviar.descripcion,
          enviar.idmaterial,
          enviar.idcliente,
          enviar.cantPiezaGolpe,
          enviar.ubicacion,
          enviar.numMatriz,
          idMatriz,
        ]
      );
      if (result.affectedRows === 0)
        return {
          error: { message: "No existe esa matriz", status: "error" },
        };

      const [rows] = await con.query(
        ` SELECT matriz.id, matriz.cod_matriz, matriz.descripcion, matriz.cantPiezaGolpe, matriz.numero_matriz, materiaPrima.material, clientes.cliente
          FROM matriz 
            LEFT JOIN materiaPrima ON matriz.idmaterial = materiaPrima.id
            LEFT JOIN clientes ON matriz.idcliente = clientes.id
          WHERE matriz.id=?; `,
        idMatriz
      );

      return {
        data: {
          data: rows[0],
          message: "Operacion Exitosa",
          status: "success",
        },
      };
    } catch (e) {
      switch (e.code) {
        case "ER_TRUNCATED_WRONG_VALUE_FOR_FIELD":
        case "ER_NO_REFERENCED_ROW_2":
          if (e.sqlMessage.includes("idmaterial"))
            CustomError.createError({
              name: "idmaterial",
              message: "No existe ese material en la BBDD",
              cause: "No existe ese material en la BBDD",
              code: ENUM_ERRORS.FOREING_KEY_OBJECT_NOT_EXISTS,
            });

          if (e.sqlMessage.includes("idcliente"))
            CustomError.createError({
              name: "idcliente",
              message: "No existe ese cliente",
              cause: "No existe ese cliente",
              code: ENUM_ERRORS.FOREING_KEY_OBJECT_NOT_EXISTS,
            });
          break;
      }

      return { error: { message: "Something Wrong", status: "error" } };
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
          data: { message: "Se elimino Correctamente", status: "success" },
        };
      else return { error: { message: "No existe", status: "error" } };
    } catch (error) {
      return { error: { message: "Something Wrong", status: "error" } };
    }
  }
}
