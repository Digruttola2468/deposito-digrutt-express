import { con } from "../db.js";
import { inventarioManager } from "../index.js";

export default class MercaderiaManager {
  constructor() {
    this.listMercaderia = [];
  }
  listInventario
  async refreshGetMercaderia() {
    try {
      const [rows] = await con.query(
        `SELECT mercaderia.id,fecha,stock,nombre,descripcion,categoria,idinventario,articulo
              FROM mercaderia 
                  INNER JOIN inventario on mercaderia.idinventario = inventario.id
                  INNER JOIN categoria on mercaderia.idcategoria = categoria.id 
              ORDER BY mercaderia.fecha DESC;`
      );
      const listaEnviar = [];

      //format date
      for (let i = 0; i < rows.length; i++) {
        const element = new Date(rows[i].fecha);

        const year = element.getFullYear();
        const mounth = element.getMonth() + 1;
        const day = element.getDate();

        const format = `${day}-${mounth}-${year}`;
        listaEnviar.push({ ...rows[i], fecha: format });
      }

      this.listMercaderia = listaEnviar;

      return { data: listaEnviar };
    } catch (error) {
      return { error: { message: "Something wrong" } };
    }
  }

  async getMercaderia() {
    if (this.listMercaderia.length != 0) {
      return { data: this.listMercaderia };
    }

    return await this.refreshGetMercaderia();
  }

  async getOneMercaderia(idMercaderia) {
    if (this.listMercaderia.length != 0) {
      const findInventarioById = this.listMercaderia.find(
        (e) => e.id == idMercaderia
      );
      return { data: findInventarioById };
    } else {
      try {
        const [rows] =
          await con.query(`SELECT mercaderia.id,fecha,stock,nombre,descripcion,categoria,idinventario,articulo
        FROM mercaderia 
            INNER JOIN inventario on mercaderia.idinventario = inventario.id
            INNER JOIN categoria on mercaderia.idcategoria = categoria.id 
        ORDER BY mercaderia.fecha DESC;`);
        this.listMercaderia = rows;
        const findInventarioById = rows.find((e) => e.id == idMercaderia);
        return { data: findInventarioById };
      } catch (e) {
        console.error(e);
        return { error: { message: "Something wrong" } };
      }
    }
  }

  async createMercaderia(object) {
    await this.getMercaderia();
    try {
      const { fecha, stock, idinventario, idcategoria } = object;

      //Validar Campos
      if (fecha == null || fecha == "")
        return { error: { message: "Campo Fecha Vacio" } };

      if (stock == null || stock == "")
        return { error: { message: "Campo Stock Vacio" } };

      if (idinventario == null || idinventario == "")
        return { error: { message: "Campo Pieza Vacia" } };

      if (idcategoria == null || idcategoria == "")
        return { error: { message: "Campo Categoria Vacia" } };

      const stockInteger = parseInt(stock);

      const inventarioInteger = parseInt(idinventario);

      const categoriaInteger = parseInt(idcategoria);

      if (!Number.isInteger(stockInteger))
        return { error: { message: "Campo Stock No es un numero" } };

      if (!Number.isInteger(inventarioInteger))
        return { error: { message: "Algo paso con inventario" } };

      if (!Number.isInteger(categoriaInteger))
        return { error: { message: "Algo paso con la categoria" } };

      if (categoriaInteger !== 1 && categoriaInteger !== 2)
        return { error: { message: "Algo paso con la categoria" } };

      const fechaDate = new Date(fecha);

      const year = fechaDate.getFullYear();
      const mounth = fechaDate.getMonth() + 1;
      const day = fechaDate.getDate();

      const format = `${year}-${mounth}-${day}`;

      if (Number.isNaN(fechaDate.getDate()))
        return { error: { message: "Error en el formato de la Fecha" } };

      const [rows] = await con.query(
        "INSERT INTO mercaderia (`fecha`, `stock`, `idcategoria`, `idinventario`) VALUES (?,?,?,?);",
        [format, stockInteger, categoriaInteger, inventarioInteger]
      );

      try {
        const resultado = await inventarioManager.suminventario(
          inventarioInteger
        );
        const [result] = await con.query(
          ` UPDATE inventario 
                  SET salida  = IFNULL(?,salida),
                      entrada = IFNULL(?,entrada)
                  WHERE id = ?
                `,
          [
            parseInt(resultado[0].salida),
            parseInt(resultado[0].entrada),
            idinventario,
          ]
        );
        if (result.affectedRows === 0)
          return {
            error: {
              message: "NO se agrego el stock de la pieza en el inventario",
            },
          };
      } catch (e) {
        console.log(e);
        return {
          error: {
            message: "something wrong",
          },
        };
      }

      //get one listInventario
      const getOneInventario = await inventarioManager.getOneInventario(
        inventarioInteger
      );

      const { nombre, descripcion, articulo } = getOneInventario.data;

      let categoria = "";
      if (idcategoria == 1) categoria = "Salida";

      if (idcategoria == 2) categoria = "Entrada";

      const enviar = {
        id: rows.insertId,
        nombre: nombre,
        descripcion: descripcion,
        articulo: articulo,
        fecha: format,
        stock: stockInteger,
        idinventario: idinventario,
        categoria: categoria,
      };

      //add this.listMercaderia
      this.listMercaderia.push(enviar);

      return {
        data: enviar,
      };
    } catch (e) {
      console.error(e);
      return {
        error: {
          message: "something wrong",
        },
      };
    }
  }

  async updateMercaderia(idMercaderia, object) {
    await this.getMercaderia();
    try {
      let enviar = {};
      const { fecha, stock, idinventario, idcategoria } = object;
      const id = idMercaderia;

      if (
        fecha == null &&
        stock == null &&
        idinventario == null &&
        idcategoria == null
      ) {
        return { error: { message: "Campos vacios" } };
      }

      //Si se agrega los siguientes campos , validar q sean correctos
      if (fecha) {
        const validarDate = new Date(fecha);
        enviar.fecha = fecha;
        if (Number.isNaN(validarDate.getDate()))
          return { error: { message: "Error en el formato de la Fecha" } };
      }
      if (stock) {
        const stockInteger = parseInt(stock);
        enviar.stock = stockInteger;
        if (!Number.isInteger(stockInteger))
          return { error: { message: "Campo Stock No es un numero" } };
      }
      if (idinventario) {
        const inventarioInteger = parseInt(idinventario);
        enviar.idinventario = inventarioInteger;
        if (!Number.isInteger(inventarioInteger))
          return { error: { message: "Algo paso con inventario" } };
      }
      if (idcategoria) {
        const categoriaInteger = parseInt(idcategoria);
        enviar.idcategoria = categoriaInteger;
        if (!Number.isInteger(categoriaInteger))
          return { error: { message: "Algo paso con la categoria" } };
      }

      const fechaDate = new Date(fecha);

      const year = fechaDate.getFullYear();
      const mounth = fechaDate.getMonth() + 1;
      const day = fechaDate.getDate();

      const format = `${year}-${mounth}-${day}`;
      
      const [result] = await con.query(
        `UPDATE mercaderia
            SET fecha = IFNULL(?,fecha),
                stock = IFNULL(?,stock),
                idcategoria = IFNULL(?,idcategoria),
                idinventario = IFNULL(?,idinventario)
            WHERE id = ?;`,
        [format, stock, idcategoria, idinventario, id]
      );

      if (result.affectedRows === 0)
        return { error: { message: "No se encontro la mercaderia" } };

      const { data } = await this.getOneMercaderia(id);

      if (stock) {
        try {
          const resultado = await inventarioManager.suminventario(
            data.idinventario
          );

          const [result] = await con.query(
            `UPDATE inventario 
                  SET salida  = IFNULL(?,salida),
                      entrada = IFNULL(?,entrada)
                 WHERE id = ?`,
            [
              parseInt(resultado[0].salida),
              parseInt(resultado[0].entrada),
              data.idinventario,
            ]
          );
          if (result.affectedRows === 0)
            return { error: { message: "No se encontro el inventario" } };
        } catch (e) {
          console.error(e);
        }
      }

      //Update this.listMercaderia
      const mapListMercaderia = this.listMercaderia.map((elem) => {
        if (elem.id == id) return { ...data, ...enviar };
        else return elem;
      });

      this.listMercaderia = mapListMercaderia;

      return { data: { ...data, ...enviar } };
    } catch (e) {
      console.error(e);
      return {
        error: {
          message: "something wrong",
        },
      };
    }
  }

  async deleteMercaderia(idMercaderia) {
    await this.getMercaderia();
    try {
      const { data } = await this.getOneMercaderia(idMercaderia);

      const [result] = await con.query(
        "DELETE FROM mercaderia WHERE (`id` = ?);",
        [idMercaderia]
      );

      if (result.affectedRows <= 0)
        return {
          error: {
            message: "No se encontro la mercaderia",
          },
        };

      try {
        const resultado = await inventarioManager.suminventario(
          data.idinventario
        );

        const [result] = await con.query(
          `UPDATE inventario 
              SET salida  = IFNULL(?,salida),
                  entrada = IFNULL(?,entrada)
              WHERE id = ?`,
          [
            parseInt(resultado[0].salida),
            parseInt(resultado[0].entrada),
            data.idinventario,
          ]
        );
        if (result.affectedRows === 0)
          return { error: { message: "No se encontro el inventario" } };
      } catch (e) {
        console.error(e);
        return {
          error: {
            message: "something wrong",
          },
        };
      }

      //Delete from listInventario
      const filterListMercaderia = this.listMercaderia.filter(
        (elem) => elem.id != idMercaderia
      );
      this.listMercaderia = filterListMercaderia;

      return { data: { message: "Eliminado Correctamente" } };
    } catch (error) {
      return {
        error: {
          message: "something wrong",
        },
      };
    }
  }
}
