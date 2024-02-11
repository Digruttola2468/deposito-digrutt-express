import { con } from "../config/db.js";
import CustomError from "../errors/Custom_errors.js";
import { ENUM_ERRORS } from "../errors/enums.js";
import { clientesManager, historialErrorMatrizManager } from "../index.js";

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
    const { descripcion, idcliente, cantPiezaGolpe, numero_matriz } = object;

    if (idcliente == null || idcliente == "")
      CustomError.createError({
        name: "idcliente",
        message: "Campo Cliente esta vacio",
        cause: "Campo Cliente esta vacio",
        code: ENUM_ERRORS.INVALID_TYPE_EMPTY,
      });

    if (numero_matriz == null || numero_matriz == "")
      CustomError.createError({
        name: "numeroMatriz",
        message: "El numero matriz esta vacio",
        cause: "El numero matriz esta vacio",
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

    const cantPiezaGolpeInteger = parseInt(cantPiezaGolpe);
    //Verificamos que sean de tipo Integer
    if (!Number.isInteger(cantPiezaGolpeInteger))
      CustomError.createError({
        name: "cantPiezaGolpe",
        message: "Campo cantidad Pieza x Golpe no es numerico",
        cause: "Campo cantidad Pieza x Golpe no es numerico",
        code: ENUM_ERRORS.INVALID_TYPES_ERROR,
      });

    const numeroMatrizInteger = parseInt(numero_matriz);
    //Verificamos que sean de tipo Integer
    if (!Number.isInteger(numeroMatrizInteger))
      CustomError.createError({
        name: "numMatriz",
        message: "El numero de la matriz no es numerico",
        cause: "El numero de la matriz no es numerico",
        code: ENUM_ERRORS.INVALID_TYPES_ERROR,
      });

    const idclienteInteger = parseInt(idcliente);
    //Verificamos que sean de tipo Integer
    if (!Number.isInteger(idclienteInteger))
      CustomError.createError({
        name: "idcliente",
        message: "No existe ese cliente",
        cause: "No existe ese cliente",
        code: ENUM_ERRORS.INVALID_TYPES_ERROR,
      });

    if (numero_matriz.length > 3) 
      CustomError.createError({
        name: "numeroMatriz",
        message: "No tiene que superar los 3 digitos",
        cause: "No tiene que superar los 3 digitos",
        code: ENUM_ERRORS.INVALID_TYPES_ERROR,
      });
    

    return { data: true };
  }

  async postMatriz(object) {
    const {
      descripcion, //Importante
      idcliente, //Importante
      cantPiezaGolpe, //Importante
      numero_matriz, //Importante
      idmaterial,
      ubicacion,
    } = object;

    this.verifyCampus(object);

    const { data } = clientesManager.getOneCliente(idcliente);

    let cod_matriz = null;
    if (numero_matriz < 10 && numero_matriz >= 1)
      cod_matriz = `${data.codigo.toUpperCase()}-00${numero_matriz}`;
    else if (numero_matriz < 100 && numero_matriz >= 10)
      cod_matriz = `${data.codigo.toUpperCase()}-0${numero_matriz}`;
    else cod_matriz = `${data.codigo.toUpperCase()}-${numero_matriz}`;

    try {
      const [rows] = await con.query(
        "INSERT INTO matriz (`cod_matriz`, `descripcion`, `idmaterial`, `idcliente`, `cantPiezaGolpe`, `ubicacion`, `numero_matriz`) VALUES (?,?,?,?,?,?,?);",
        [
          cod_matriz,
          descripcion,
          idmaterial,
          idcliente,
          cantPiezaGolpe,
          ubicacion,
          numero_matriz,
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

        this.listMatriz.push(result[0]);

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
    const { descripcion, idmaterial, cantPiezaGolpe, ubicacion } = object;

    let enviar = {
      descripcion: null, //
      idmaterial: null, //
      cantPiezaGolpe: null, //
      ubicacion: null, //
    };

    if (descripcion != null && descripcion != "")
      enviar.descripcion = descripcion;
    if (idmaterial != null && idmaterial != "") enviar.idmaterial = idmaterial;
    if (ubicacion != null && ubicacion != "") enviar.ubicacion = ubicacion;
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
          SET descripcion = IFNULL(?,descripcion),
              idmaterial = IFNULL(?,idmaterial),
              cantPiezaGolpe = IFNULL(?,cantPiezaGolpe),
              ubicacion = IFNULL(?,ubicacion)
          WHERE id = ?;`,
        [
          enviar.descripcion,
          enviar.idmaterial,
          enviar.cantPiezaGolpe,
          enviar.ubicacion,
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
          WHERE matriz.id = ?;`,
        [idMatriz]
      );

      const updateList = this.listMatriz.map((elem) => {
        if (elem.id == idMatriz) return rows[0];
        else return elem;
      });

      this.listMatriz = updateList;

      return {
        data: {
          data: rows[0],
          message: "Operacion Exitosa",
          status: "success",
        },
      };
    } catch (e) {
      console.log(e);
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
      //Eliminar todo lo relacionado con el historial de matriz de errores
      try {
        await historialErrorMatrizManager.deleteByIdMatriz(idMatriz);
      } catch (error) {}

      const [result] = await con.query("DELETE FROM matriz WHERE (`id` = ?);", [
        idMatriz,
      ]);

      const filterList = this.listMatriz.filter((elem) => elem.id != idMatriz);
      this.listMatriz = filterList;

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
