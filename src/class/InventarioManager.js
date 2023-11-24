import { con } from "../db.js";

import { mercaderiaManager } from "../index.js";

export default class InventarioManager {
  constructor() {
    this.listInventario = [];
  }

  async refreshListInventario() {
    try {
      const [rows] = await con.query("SELECT * FROM inventario;");
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
          idCliente: element.idCliente,
        });
      }
      return { data: listEnviar };
    }
    return { error: { message: "Lista Inventario Vacio" } };
  }

  async getInventario() {
    if (this.listInventario.length != 0) return { data: this.listInventario };

    await this.refreshListInventario();
  }

  getOneInventario(idInventario) {
    if (this.listInventario.length != 0) {
      const findInventarioById = this.listInventario.find(
        (e) => e.id == idInventario
      );
      return { data: findInventarioById };
    } else return { error: { message: "Lista Inventario Vacio" } };
  }

  getLengthList() {
    if (this.listInventario.length != 0) return this.listInventario.length;
    else return -1;
  }

  async createInventario(object) {
    try {
      const {
        nombre, //Obligatorio
        precio,
        descripcion, //Obligatorio
        idcolor,
        idtipoproducto,
        pesoUnidad,
        stockCaja,
        idCliente,
        idCodMatriz,
        articulo,
      } = object;
      //Entrada - salida

      //Validar Campos
      if (nombre == null || nombre == "")
        return { error: { message: "Campo Cod.Producto Vacio" } };

      if (descripcion == null || descripcion == "")
        return { error: { message: "Campo Descripcion Vacio" } };

      if (articulo != null && articulo != "") {
        //Validar que no se repita el Articulo ya que es unico
        const findSameArticulo = this.listInventario.find(
          (elem) => elem.articulo.toLowerCase() == articulo.toLowerCase()
        );
        if (findSameArticulo != null)
          return { error: { message: "Ya existe ese Articulo" } };
      }

      //Validar q no se repita el cod.Producto
      const findSameCodProducto = this.listInventario.find(
        (elem) => elem.nombre.toLowerCase() == nombre.toLowerCase()
      );
      if (findSameCodProducto != null)
        return { error: { message: "Ya existe ese Cod.Producto" } };

      const [rows] = await con.query(
        "INSERT INTO inventario (nombre,precio,descripcion,idcolor,idtipoproducto,pesoUnidad,stockCaja,idCliente,idCodMatriz,articulo,entrada,salida) VALUES (?,?,?,?,?,?,?,?,?,?,?,?) ;",
        [
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
          0,
          0,
        ]
      );

      const enviar = {
        id: rows.insertId,
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
        entrada: 0,
        salida: 0,
      };

      //Agregar a la lista
      this.listInventario.push(enviar);

      return {
        data: enviar,
      };
    } catch (e) {
      console.error(e);
      return { error: { message: "Something wrong" } };
    }
  }

  async updateInventario(idInventario, object) {
    try {
      const {
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
      } = object;

      if (nombre != null) {
        if (typeof nombre === "string") {
          if (nombre != "") {
            //Validar q no se repita el cod.Producto
            const findSameCodProducto = this.listInventario.find(
              (elem) => elem.nombre.toLowerCase() == nombre.toLowerCase()
            );

            //Validamos si existe ese nombre
            if (findSameCodProducto != null) {
              //Si existe, validar si es igual que el anterior
              if (findSameCodProducto.nombre != nombre)
                return { error: { message: "Ya existe ese Cod.Producto" } };
            }
          } else return { error: { message: "Campo nombre Vacio" } };
        } else return { error: { message: "Error en el tipo de dato nombre" } };
      }
      if (articulo != null) {
        if (typeof articulo === "string") {
          if (articulo != "") {
            //Validar q no se repita el cod.Producto
            const findSameCodProducto = this.listInventario.find(
              (elem) => elem.articulo.toLowerCase() == articulo.toLowerCase()
            );

            //Validamos si existe ese nombre
            if (findSameCodProducto != null) {
              //Si existe, validar si es igual que el anterior
              if (findSameCodProducto.articulo != articulo)
                return { error: { message: "Ya existe ese Articulo" } };
            }
          } else return { error: { message: "Campo articulo Vacio" } };
        } else
          return { error: { message: "Error en el tipo de dato articulo" } };
      }

      const [result] = await con.query(
        `UPDATE inventario 
                SET nombre = IFNULL(?,nombre),
                    precio = IFNULL(?,precio),
                    descripcion = IFNULL(?,descripcion),
                    idcolor = IFNULL(?,idcolor),
                    idtipoproducto = IFNULL(?,idtipoproducto),
                    pesoUnidad = IFNULL(?,pesoUnidad),
                    stockCaja = IFNULL(?,stockCaja), 
                    idCliente = IFNULL(?,idCliente),
                    idCodMatriz = IFNULL(?,idCodMatriz),
                    articulo = IFNULL(?,articulo)
                WHERE id = ?`,
        [
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
          idInventario,
        ]
      );

      if (result.affectedRows === 0)
        return { error: { message: "No se encontro el Inventario" } };

      const { data } = this.getOneInventario(idInventario);

      //update ListInventario
      const mapListInventarioUpdate = this.listInventario.map((elem) => {
        if (elem.id == idInventario) return { ...data };
        else return elem;
      });

      this.listInventario = mapListInventarioUpdate;

      return { data: data };
    } catch (e) {
      console.error(e);
      return { error: { message: "Something wrong" } };
    }
  }

  async deleteInventario(idInventario) {
    if (idInventario == null) return { error: { message: "Campo Vacio" } };

    //Validamos que sea de tipo integer
    const inventarioInteger = parseInt(idInventario);
    if (!Number.isInteger(inventarioInteger))
      return { error: { message: "Algo paso al obtener el cod.producto" } };

    try {
      const { data } = await mercaderiaManager.deleteMercaderiaWhereIdinventario(
        inventarioInteger
      );
      
      if (data.done) {
        const [result] = await con.query(
          "DELETE FROM inventario WHERE (`id` = ?);",
          [inventarioInteger]
        );
  
        if (result.affectedRows <= 0)
          return { error: { message: "No se encontro el inventario" } };
  
        //Delete from listInventario
        const filterListInventario = this.listInventario.filter(
          (elem) => elem.id != inventarioInteger
        );
        this.listInventario = filterListInventario;
  
        return { data: { message: "Eliminado Correctamente" } };
      } else return { error: { message: "Error al eliminar en mercaderia" } };

    } catch (e) {
      console.error(e);
      return { error: { message: "Something wrong" } };
    }
  }

  async suminventario(idInventario) {
    const inventarioInteger = parseInt(idInventario);

    if (!Number.isInteger(inventarioInteger)) return [];

    try {
      const listaEnviar = [];

      const [rows] = await con.query(
        `SELECT *, 
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
  }
}
