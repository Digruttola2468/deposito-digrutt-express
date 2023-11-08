import { con } from "../db.js";

export default class InventarioManager {
  constructor() {
    this.listInventario = [];
  }

  ////////////////////////////////////////////////////////////////////////////
  //Esto deberia pertenecer a Mercaderia
  async deleteMercaderiaWhereIdinventario(idinventario) {
    const list = await this.getMercaderiaWhereIdInventario(idinventario);

    if (list != []) {
      for (let i = 0; i < list.length; i++) {
        const id = list[i];

        const [result] = await con.query(
          "DELETE FROM mercaderia WHERE (`id` = ?);",
          [id]
        );
      }
    }
  }
  async getMercaderiaWhereIdInventario(idinventario) {
    try {
      const [rows] = await con.query(
        `SELECT * FROM mercaderia WHERE idinventario = ?`,
        [idinventario]
      );

      const listIdMercaderia = [];
      for (let i = 0; i < rows.length; i++) {
        const element = rows[i];
        listIdMercaderia.push(element.id);
      }

      return listIdMercaderia;
    } catch (error) {
      return [];
    }
  }
  ////////////////////////////////////////////////////////////////////////////

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

  async getListInventarioNombre() {
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

    try {
      const [rows] = await con.query(
        "SELECT id,nombre,descripcion,idCliente FROM inventario;"
      );
      return { data: rows };
    } catch (error) {
      return { error: { message: "Something wrong" } };
    }
  }

  async getInventario() {
    if (this.listInventario.length != 0) return { data: this.listInventario };

    try {
      const [rows] = await con.query("SELECT * FROM inventario;");
      this.listInventario = rows;
      return { data: rows };
    } catch (e) {
      console.error(e);
      return { error: { message: "Something wrong" } };
    }
  }

  getOneInventario(idInventario) {
    if (this.listInventario.length != 0) {
      const findInventarioById = this.listInventario.find(
        (e) => e.id == idInventario
      );
      return { data: findInventarioById };
    } else return { error: { message: "Lista Inventario Vacia" } };
  }

  getLengthList() {
    if (this.listInventario.length != 0) return this.listInventario.length;
    else return -1;
  }

  async createInventario(object) {
    await this.refreshListInventario();
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
        "INSERT INTO inventario (nombre,precio,descripcion,idcolor,idtipoproducto,pesoUnidad,stockCaja,idCliente,idCodMatriz,articulo) VALUES (?,?,?,?,?,?,?,?,?,?) ;",
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
        ]
      );

      //Agregar a la lista
      this.listInventario.push({
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
      });

      return {
        data: {
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
        },
      };
    } catch (e) {
      console.error(e);
      return { error: { message: "Something wrong" } };
    }
  }

  async updateInventario(idInventario, object) {
    await this.refreshListInventario();

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
      } = object;

      if(nombre == "") {
        nombre = null;
      }
      if(articulo == "") {
        articulo = null;
      }

      if (nombre != null) {
        //Validar q no se repita el cod.Producto
        const findSameCodProducto = this.listInventario.find(
          (elem) => elem.nombre.toLowerCase() == nombre.toLowerCase()
        );

        if (findSameCodProducto != null)
          return { error: { message: "Ya existe ese Cod.Producto" } };
      }
      if (articulo != null) {
        //Validar que no se repita el Articulo ya que es unico
        const findSameArticulo = this.listInventario.find((elem) => {
          if (typeof elem.articulo === "string")
            return elem.articulo.toLowerCase() == articulo.toLowerCase();
        });
        if (findSameArticulo != null)
          return { error: { message: "Ya existe ese Articulo" } };
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

      const [rows] = await con.query("SELECT * FROM inventario WHERE id = ?", [
        idInventario,
      ]);

      //update ListInventario
      const mapListInventarioUpdate = this.listInventario.map((elem) => {
        if (elem.id == idInventario) return { ...rows[0] };
        else return elem;
      });

      this.listInventario = mapListInventarioUpdate;

      return { data: rows[0] };
    } catch (e) {
      console.error(e);
      return { error: { message: "Something wrong" } };
    }
  }

  async deleteInventario(idInventario) {
    await this.refreshListInventario();

    try {
      const [result] = await con.query(
        "DELETE FROM inventario WHERE (`id` = ?);",
        [idInventario]
      );

      if (result.affectedRows <= 0)
        return { error: { message: "No se encontro el inventario" } };

      await this.deleteMercaderiaWhereIdinventario(idInventario);

      //Delete from listInventario
      const filterListInventario = this.listInventario.filter(
        (elem) => elem.id != idInventario
      );
      this.listInventario = filterListInventario;

      return { data: { message: "Eliminado Correctamente" } };
    } catch (e) {
      console.error(e);
      return { error: { message: "Something wrong" } };
    }
  }

  async suminventario(idInventario) {
    try {
      const listaEnviar = [];

      const [rows] = await con.query(
        `SELECT *, 
                      SUM(CASE WHEN idcategoria = 1 THEN stock ELSE 0 END ) as salida,
                      SUM(CASE WHEN idcategoria = 2 THEN stock ELSE 0 END ) as entrada
                      FROM mercaderia 
                      INNER JOIN inventario ON inventario.id = mercaderia.idinventario 
                      WHERE idinventario = ?;`,
        [idInventario]
      );
      if (rows[0].entrada == null) rows[0].entrada = 0;

      if (rows[0].salida == null) rows[0].salida = 0;

      listaEnviar.push({ ...rows[0] });

      return listaEnviar;
    } catch (error) {
      console.error(error);
      return [];
    }
  }
}
