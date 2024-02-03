import { con } from "../config/db.js";
import CustomError from "../errors/Custom_errors.js";
import { ENUM_ERRORS } from "../errors/enums.js";
import { mercaderiaManager } from "../index.js";

export default class InventarioManager {
  constructor() {
    this.listInventario = [];
  }

  async getInventario() {
    try {
      const [rows] = await con.query(
        "SELECT inventario.*, clientes.cliente, idCliente AS idcliente FROM inventario LEFT JOIN clientes ON inventario.idcliente = clientes.id;"
      );
      this.listInventario = rows;
      return { data: rows };
    } catch (e) {
      console.error(e);
      return { error: { message: "Something wrong" } };
    }
  }

  getListInventario() {
    return this.listInventario;
  }

  getListInventarioNombre() {
    if (this.listInventario.length != 0) {
      let listEnviar = [];
      for (let i = 0; i < this.listInventario.length; i++) {
        let element = this.listInventario[i];
        listEnviar.push({
          id: element.id,
          nombre: element.nombre,
          descripcion: element.descripcion,
          idcliente: element.idCliente,
          urlImage: element.url_image,
          entrada: element.entrada,
          salida: element.salida,
          articulo: element.articulo,
          cliente: element.cliente,
        });
      }
      return { data: listEnviar };
    }
    return { error: { message: "Lista Inventario Vacio" } };
  }

  getOneInventario(idInventario) {
    if (this.listInventario.length != 0) {
      const findInventarioById = this.listInventario.find(
        (e) => e.id == idInventario
      );
      return { data: findInventarioById };
    } else return { error: { message: "Lista Inventario Vacio" } };
  }

  existsIdInventario(idInventario) {
    if (this.listInventario.length != 0) {
      const findIdInventario = this.listInventario.find(
        (elem) => elem.id == idInventario
      );
      if (findIdInventario) return true;
      else return false;
    } else return null;
  }

  getLengthList() {
    if (this.listInventario.length != 0) return this.listInventario.length;
    else return -1;
  }

  handleErrors(e) {
    switch (e.code) {
      case "WARN_DATA_TRUNCATED":
        CustomError.createError({
          cause: "Error en el formato enviado",
          message: "Error formato",
          code: ENUM_ERRORS.INVALID_TYPES_ERROR,
        });
        break;
      case "ER_TRUNCATED_WRONG_VALUE_FOR_FIELD":
        if (e.sqlMessage.includes("idcolor"))
          CustomError.createError({
            cause: "Error en el tipo de dato",
            message: "Error tipo de dato",
            code: ENUM_ERRORS.INVALID_TYPES_ERROR,
            name: "idColor",
          });
        if (e.sqlMessage.includes("precio"))
          CustomError.createError({
            cause: "Error en el tipo de dato",
            message: "Error tipo de dato",
            code: ENUM_ERRORS.INVALID_TYPES_ERROR,
            name: "precio",
          });
        if (e.sqlMessage.includes("idtipoproducto"))
          CustomError.createError({
            cause: "Error en el tipo de dato",
            message: "Error tipo de dato",
            code: ENUM_ERRORS.INVALID_TYPES_ERROR,
            name: "idtipoproducto",
          });
        if (e.sqlMessage.includes("pesoUnidad"))
          CustomError.createError({
            cause: "Error en el tipo de dato",
            message: "Error tipo de dato",
            code: ENUM_ERRORS.INVALID_TYPES_ERROR,
            name: "pesoUnidad",
          });
        if (e.sqlMessage.includes("stockCaja"))
          CustomError.createError({
            cause: "Error en el tipo de dato",
            message: "Error tipo de dato",
            code: ENUM_ERRORS.INVALID_TYPES_ERROR,
            name: "stockCaja",
          });
        if (e.sqlMessage.includes("idCliente"))
          CustomError.createError({
            cause: "Error en el tipo de dato",
            message: "Error tipo de dato",
            code: ENUM_ERRORS.INVALID_TYPES_ERROR,
            name: "idCliente",
          });
        if (e.sqlMessage.includes("idCodMatriz"))
          CustomError.createError({
            cause: "Error en el tipo de dato",
            message: "Error tipo de dato",
            code: ENUM_ERRORS.INVALID_TYPES_ERROR,
            name: "idCodMatriz",
          });
        break;
      case "ER_DUP_ENTRY":
        if (e.sqlMessage.includes("UC_inventario"))
          CustomError.createError({
            cause: "Ya existe ese Cod.Producto",
            message: "Error al intentar crear producto",
            code: ENUM_ERRORS.THIS_OBJECT_ALREDY_EXISTS,
            name: "codProducto",
          });
        if (e.sqlMessage.includes("UC_articulo"))
          CustomError.createError({
            cause: "Ya existe ese Articulo",
            message: "Error al intentar crear producto",
            code: ENUM_ERRORS.THIS_OBJECT_ALREDY_EXISTS,
            name: "articulo",
          });
        break;
      case "ER_NO_REFERENCED_ROW_2":
        if (e.sqlMessage.includes("idcolor"))
          CustomError.createError({
            cause: "No existe ese color en BBDD",
            message: "Error al intentar crear producto",
            code: ENUM_ERRORS.FOREING_KEY_OBJECT_NOT_EXISTS,
            name: "idColor",
          });

        if (e.sqlMessage.includes("idtipoproducto"))
          CustomError.createError({
            cause: "No existe ese tipo producto",
            message: "Error al intentar crear producto",
            code: ENUM_ERRORS.FOREING_KEY_OBJECT_NOT_EXISTS,
            name: "idtipoproducto",
          });

        if (e.sqlMessage.includes("idCliente"))
          CustomError.createError({
            cause: "No existe ese cliente",
            message: "Error al intentar crear producto",
            code: ENUM_ERRORS.FOREING_KEY_OBJECT_NOT_EXISTS,
            name: "idCliente",
          });

        if (e.sqlMessage.includes("idCodMatriz"))
          CustomError.createError({
            cause: "No existe esa Matriz",
            message: "Error al intentar crear producto",
            code: ENUM_ERRORS.FOREING_KEY_OBJECT_NOT_EXISTS,
            name: "idMatriz",
          });
        break;
    }
  }

  async createInventario(object) {
    try {
      let {
        nombre, //Obligatorio
        precio,
        descripcion, //Obligatorio
        idcolor,
        idtipoproducto,
        pesoUnidad,
        stockCaja,
        idCliente,
        idCodMatriz,
      } = object;

      //Validar Campos
      if (nombre == null || nombre == "")
        CustomError.createError({
          cause: "Campo Cod.Producto Vacio",
          message: "No se creo correctamente",
          code: ENUM_ERRORS.INVALID_TYPE_EMPTY,
          name: "codProducto",
        });

      if (descripcion == null || descripcion == "")
        CustomError.createError({
          cause: "Campo Descripcion Vacio",
          message: "No se creo correctamente",
          code: ENUM_ERRORS.INVALID_TYPE_EMPTY,
          name: "descripcion",
        });

      if (precio == "") precio = null;
      if (idcolor == "") idcolor = null;
      if (idtipoproducto == "") idtipoproducto = null;
      if (pesoUnidad == "") pesoUnidad = null;
      if (stockCaja == "") stockCaja = null;
      if (idCliente == "") idCliente = null;
      if (idCodMatriz == "") idCodMatriz = null;

      const [rows] = await con.query(
        "INSERT INTO inventario (nombre,precio,descripcion,idcolor,idtipoproducto,pesoUnidad,stockCaja,idCliente,idCodMatriz,entrada,salida) VALUES (?,?,?,?,?,?,?,?,?,?,?) ;",
        [
          nombre.toLowerCase(),
          precio,
          descripcion,
          idcolor,
          idtipoproducto,
          pesoUnidad,
          stockCaja,
          idCliente,
          idCodMatriz,
          0,
          0,
        ]
      );

      const enviar = {
        id: rows.insertId,
        nombre: nombre.toLowerCase(),
        precio,
        descripcion,
        idcolor,
        idtipoproducto,
        pesoUnidad,
        stockCaja,
        idCliente,
        idCodMatriz,
        entrada: 0,
        salida: 0,
        url_image: null,
      };

      //Agregar a la lista
      this.listInventario.push(enviar);

      return {
        status: "success",
        data: enviar,
      };
    } catch (e) {
      this.handleErrors(e);
    }
  }

  async updateInventario(idInventario, object) {
    try {
      let {
        nombre,
        precio,
        descripcion,
        idcolor,
        idtipoproducto,
        pesoUnidad,
        stockCaja,
        idCliente,
        idCodMatriz,
        articulo,
        ubicacion,
      } = object;

      if (precio == "") precio = null;
      if (idcolor == "") idcolor = null;
      if (idtipoproducto == "") idtipoproducto = null;
      if (pesoUnidad == "") pesoUnidad = null;
      if (stockCaja == "") stockCaja = null;
      if (idCliente == "") idCliente = null;
      if (idCodMatriz == "") idCodMatriz = null;

      const [result] = await con.query(
        `UPDATE inventario 
                SET nombre = IF(STRCMP(nombre, ?) = 0, nombre, ?),
                    precio = IFNULL(?,precio),
                    descripcion = IFNULL(?,descripcion),
                    idcolor = IFNULL(?,idcolor),
                    idtipoproducto = IFNULL(?,idtipoproducto),
                    pesoUnidad = IFNULL(?,pesoUnidad),
                    stockCaja = IFNULL(?,stockCaja), 
                    idCliente = IFNULL(?,idCliente),
                    idCodMatriz = IFNULL(?,idCodMatriz),
                    articulo = IF(STRCMP(articulo, ?) = 0, articulo, ?),
                    ubicacion = IFNULL(?,ubicacion)
                WHERE id = ?`,
        [
          nombre,
          nombre,
          precio,
          descripcion,
          idcolor,
          idtipoproducto,
          pesoUnidad,
          stockCaja,
          idCliente,
          idCodMatriz,
          articulo,
          articulo,
          ubicacion,
          idInventario,
        ]
      );

      if (result.affectedRows === 0)
        return { error: { message: "No se encontro el Inventario" } };

      const [rows] = await con.query(
        `SELECT * FROM inventario WHERE id=?`,
        idInventario
      );

      //update ListInventario
      const mapListInventarioUpdate = this.listInventario.map((elem) => {
        if (elem.id == idInventario) return rows[0];
        else return elem;
      });

      this.listInventario = mapListInventarioUpdate;

      return { status: "success", data: rows[0] };
    } catch (e) {
      this.handleErrors(e);
    }
  }

  async deleteInventario(idInventario) {
    if (idInventario == null || idInventario == "")
      CustomError.createError({
        cause: "No existe ese inventario",
        message: "El idInventario esta vacio",
        code: ENUM_ERRORS.INVALID_TYPE_EMPTY,
        name: "idInventario",
      });

    try {
      const result = await mercaderiaManager.deleteMercaderiaWhereIdinventario(
        idInventario
      );
      if (result.data.done) {
        try {
          const [result] = await con.query(
            "DELETE FROM inventario WHERE (`id` = ?);",
            [idInventario]
          );

          if (result.affectedRows <= 0)
            CustomError.createError({
              name: "idInventario",
              message: "No existe ese cod.producto",
              cause: "No existe ese cod.producto",
              code: ENUM_ERRORS.INVALID_TYPES_ERROR,
            });

          //Delete from listInventario
          const filterListInventario = this.listInventario.filter(
            (elem) => elem.id != idInventario
          );
          this.listInventario = filterListInventario;

          return { data: { message: "Eliminado Correctamente" } };
        } catch (error) {}
      }
    } catch (e) {
      CustomError.createError({
        name: e.name,
        message: e.message,
        cause: e.cause,
        code: e.code,
      });
    }
  }

  async suminventario(idInventario) {
    const inventarioInteger = parseInt(idInventario);

    if (!Number.isInteger(inventarioInteger)) return [];

    try {
      let stockMercaderia = {
        entrada: 0,
        salida: 0,
      };

      const listMercaderia =
        mercaderiaManager.getMercaderiaIdInventario(idInventario);

      const listMercaderiaEntrada = listMercaderia.filter(
        (elem) => elem.categoria == "Entrada"
      );

      const listMercaderiaSalida = listMercaderia.filter(
        (elem) => elem.categoria == "Salida"
      );

      //Contamos stock mercaderia Entrada
      if (listMercaderiaEntrada.length != 0) {
        for (let i = 0; i < listMercaderiaEntrada.length; i++) {
          const element = listMercaderiaEntrada[i];
          stockMercaderia.entrada += element.stock;
        }
      }

      //Contamos stock mercaderia Salida
      if (listMercaderiaSalida.length != 0) {
        for (let i = 0; i < listMercaderiaSalida.length; i++) {
          const element = listMercaderiaSalida[i];
          stockMercaderia.salida += element.stock;
        }
      }

      //Update BBDD
      const [result] = await con.query(
        ` UPDATE inventario 
                SET salida  = IFNULL(?,salida),
                    entrada = IFNULL(?,entrada)
                WHERE id = ?
              `,
        [stockMercaderia.salida, stockMercaderia.entrada, inventarioInteger]
      );

      if (result.affectedRows === 0)
        return {
          error: {
            message: "NO se agrego el stock de la pieza en el inventario",
          },
        };

      //update ListInventario
      const mapListInventarioUpdate = this.listInventario.map((elem) => {
        if (elem.id == idInventario)
          return {
            ...elem,
            entrada: stockMercaderia.entrada,
            salida: stockMercaderia.salida,
          };
        else return elem;
      });

      this.listInventario = mapListInventarioUpdate;

      return {
        data: {
          isDone: true,
          entrada: stockMercaderia.entrada,
          salida: stockMercaderia.salida,
        },
      };
    } catch (e) {
      console.error(e);
      return {
        error: {
          message: "Something Wrong",
        },
      };
    }
  }

  // No se porque pero no funciona :(
  /*async suminventario(idInventario) {
    const inventarioInteger = parseInt(idInventario);

    if (!Number.isInteger(inventarioInteger)) return [];

    try {
      const listaEnviar = [];

      const [rows] = await con.query(
        `SELECT  *,
                      SUM(CASE WHEN idcategoria = 1 THEN stock ELSE 0 END ) as salida,
                      SUM(CASE WHEN idcategoria = 2 THEN stock ELSE 0 END ) as entrada
                      FROM mercaderia 
                      INNER JOIN inventario ON inventario.id = mercaderia.idinventario 
                      WHERE idinventario = ?;`,
        [inventarioInteger]
      );
      if (rows[0].entrada == null) rows[0].entrada = 0;

      if (rows[0].salida == null) rows[0].salida = 0;

      //update ListInventario
      const mapListInventarioUpdate = this.listInventario.map((elem) => {
        if (elem.id == idInventario)
          return {
            ...elem,
            entrada: parseInt(rows[0].entrada),
            salida: parseInt(rows[0].salida),
          };
        else return elem;
      });

      this.listInventario = mapListInventarioUpdate;

      listaEnviar.push({ ...rows[0] });

      return listaEnviar;
    } catch (error) {
      console.error(error);
      return [];
    }
  }*/
}
