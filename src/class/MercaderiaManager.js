import { con } from "../db.js";
import { inventarioManager } from "../index.js";

export default class MercaderiaManager {
  constructor() {
    this.listMercaderia = [];
  }

  async refreshGetMercaderia() {
    try {
      const [rows] = await con.query(
        `SELECT mercaderia.id,fecha,stock,nombre,descripcion,categoria,idinventario,articulo,idremito,idFacturaNegro
              FROM mercaderia 
                  INNER JOIN inventario on mercaderia.idinventario = inventario.id
                  INNER JOIN categoria on mercaderia.idcategoria = categoria.id
              ORDER BY mercaderia.fecha DESC;`
      );

      this.listMercaderia = rows;

      return { data: rows };
    } catch (error) {
      return { error: { message: "Something wrong" } };
    }
  }

  async getMercaderia() {
    if (this.listMercaderia.length != 0) {
      this.listMercaderia.sort((a, b) => {
        const ADate = new Date(a.fecha);
        const BDate = new Date(b.fecha);

        if (ADate < BDate) return 1;
        if (ADate > BDate) return -1;
        return 0;
      });

      return { data: this.listMercaderia };
    }

    return await this.refreshGetMercaderia();
  }

  getOneMercaderia(idMercaderia) {
    if (this.listMercaderia.length != 0) {
      const findInventarioById = this.listMercaderia.find(
        (e) => e.id == idMercaderia
      );
      return { data: findInventarioById };
    } else return { error: { message: "Mercaderia Vacia" } };
  }

  async createMercaderia(object) {
    try {
      const {
        fecha,
        stock,
        idinventario,
        idcategoria,
        idFacturaNegro,
        idremito,
      } = object;

      //Validar Campos
      if (fecha == null || fecha == "")
        return { error: { message: "Campo Fecha Vacio" } };

      if (stock == null || stock == "")
        return { error: { message: "Campo Stock Vacio" } };

      if (idinventario == null || idinventario == "")
        return { error: { message: "Campo Cod.Producto Vacio" } };

      if (idcategoria == null || idcategoria == "")
        return { error: { message: "Campo Categoria Vacia" } };

      //Si se coloca idFacturaNegro verificar que sea de tipo integer
      if (idFacturaNegro != null) {
        const facturaNegroInteger = parseInt(idFacturaNegro);

        if (!Number.isInteger(facturaNegroInteger))
          return { error: { message: "Algo paso con la facturaNegro" } };
      }

      //Si se coloca idRemito verificar que sea de tipo integer
      if (idremito != null) {
        const remitoInteger = parseInt(idremito);

        if (!Number.isInteger(remitoInteger))
          return { error: { message: "Algo paso con el Remito" } };
      }

      const stockInteger = parseInt(stock);
      const inventarioInteger = parseInt(idinventario);
      const categoriaInteger = parseInt(idcategoria);

      //Verificamos que sean de tipo Integer
      if (!Number.isInteger(stockInteger))
        return { error: { message: "Campo Stock No es un numero" } };

      if (!Number.isInteger(inventarioInteger))
        return { error: { message: "Algo paso con inventario" } };

      if (!Number.isInteger(categoriaInteger))
        return { error: { message: "Algo paso con la categoria" } };

      //Verificamos que sea de tipo Entrada - Salida , si no es ninguna de las dos saltar un error
      if (categoriaInteger !== 1 && categoriaInteger !== 2)
        return { error: { message: "Algo paso con la categoria" } };

      //Validar que el idinventario exista
      const existsIdInventario =
        inventarioManager.existsIdInventario(inventarioInteger);
      if (existsIdInventario != null) {
        if (!existsIdInventario)
          return { error: { message: "No existe ese cod.producto" } };
      } else return { error: { message: "Algo paso con la idInventario" } };

      //Convertimos la fecha ingresada a tipo Date
      const fechaDate = new Date(fecha);

      if (Number.isNaN(fechaDate.getDate()))
        return { error: { message: "Error en el formato de la Fecha" } };

      const [rows] = await con.query(
        "INSERT INTO mercaderia (`fecha`, `stock`, `idcategoria`, `idinventario`, `idremito`, `idFacturaNegro`) VALUES (?,?,?,?,?,?);",
        [
          fecha,
          stockInteger,
          categoriaInteger,
          inventarioInteger,
          idremito,
          idFacturaNegro,
        ]
      );

      //get one listInventario
      const getOneInventario =
        inventarioManager.getOneInventario(inventarioInteger);

      const { nombre, descripcion, articulo } = getOneInventario.data;

      let categoria = "";
      if (categoriaInteger === 1) categoria = "Salida";

      if (categoriaInteger === 2) categoria = "Entrada";

      const enviar = {
        id: rows.insertId,
        nombre: nombre,
        descripcion: descripcion,
        articulo: articulo,
        fecha: fecha,
        stock: stockInteger,
        idinventario: inventarioInteger,
        categoria: categoria,
        idFacturaNegro: idFacturaNegro,
        idremito: idremito,
      };

      //add this.listMercaderia
      this.listMercaderia.push(enviar);

      try {
        await inventarioManager.suminventario(inventarioInteger);
      } catch (e) {
        console.log(e);
        return {
          error: {
            message: "something wrong",
          },
        };
      }

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
    try {
      let enviar = {
        fecha: null,
        stock: null,
        idcategoria: null,
        categoria: null,
      };
      const { fecha, stock, idcategoria } = object;
      const id = idMercaderia;

      //Si se agrega los siguientes campos , validar q sean correctos
      if (fecha) {
        const validarDate = new Date(fecha);

        if (Number.isNaN(validarDate.getDate()))
          return { error: { message: "Error en el formato de la Fecha" } };

        enviar.fecha = fecha;
      }
      if (stock) {
        const stockInteger = parseInt(stock);

        if (!Number.isInteger(stockInteger))
          return { error: { message: "Campo Stock No es un numero" } };

        enviar.stock = stockInteger;
      }
      if (idcategoria) {
        const categoriaInteger = parseInt(idcategoria);

        if (!Number.isInteger(categoriaInteger))
          return { error: { message: "Algo paso con la categoria" } };

        if (categoriaInteger == 2) enviar.categoria = "Entrada";
        else if (categoriaInteger == 1) enviar.categoria = "Salida";
        else return { error: { message: "Algo paso con la categoria" } };
        
        enviar.idcategoria = categoriaInteger;
      }

      const [result] = await con.query(
        `UPDATE mercaderia
            SET fecha = IFNULL(?,fecha),
                stock = IFNULL(?,stock),
                idcategoria = IFNULL(?,idcategoria)
            WHERE id = ?;`,
        [enviar.fecha, enviar.stock, enviar.idcategoria, id]
      );

      if (result.affectedRows === 0)
        return { error: { message: "No se encontro la mercaderia" } };

      const { data } = this.getOneMercaderia(id);

      if (enviar.fecha == null) enviar.fecha = data.fecha;

      if (enviar.categoria == null) enviar.categoria = data.categoria;

      if (enviar.stock == null) enviar.stock = data.stock;

      const enviarUpdateList = {
        fecha: enviar.fecha,
        categoria: enviar.categoria,
        stock: enviar.stock,
      };

      //Update this.listMercaderia
      const mapListMercaderia = this.listMercaderia.map((elem) => {
        if (elem.id == id) return { ...data, ...enviarUpdateList };
        else return elem;
      });

      this.listMercaderia = mapListMercaderia;

      if (stock || idcategoria) {
        try {
          await inventarioManager.suminventario(data.idinventario);
        } catch (e) {
          console.error(e);
          return { error: { message: "Something Wrong" } };
        }
      }

      return { data: { ...data, ...enviarUpdateList } };
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
    try {
      const { data } = this.getOneMercaderia(idMercaderia);

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

      //Delete from listInventario
      const filterListMercaderia = this.listMercaderia.filter(
        (elem) => elem.id != idMercaderia
      );
      this.listMercaderia = filterListMercaderia;

      try {
        await inventarioManager.suminventario(data.idinventario);
      } catch (e) {
        console.error(e);
        return { error: { message: "Something Wrong" } };
      }

      return { data: { message: "Eliminado Correctamente" } };
    } catch (error) {
      return {
        error: {
          message: "something wrong",
        },
      };
    }
  }

  async deleteMercaderiaWhereIdinventario(idinventario) {
    const list = this.getMercaderiaWhereIdInventario(idinventario);

    if (list.length != 0) {
      if (list.length > 0) {
        for (let i = 0; i < list.length; i++) {
          const id = list[i];

          const [result] = await con.query(
            "DELETE FROM mercaderia WHERE (`id` = ?);",
            [id]
          );
        }
      }
      return { data: { message: "Eliminado Correctamente", done: true } };
    } return { data: { done: true } };
  }

  getMercaderiaWhereIdInventario(idinventario) {
    if (this.listMercaderia.length != 0) {
      try {
        const filterListMercaderiaByIdInventario = this.listMercaderia.filter(
          (elem) => elem.idinventario == idinventario
        );

        const listIdMercaderia = [];
        for (let i = 0; i < filterListMercaderiaByIdInventario.length; i++) {
          const element = filterListMercaderiaByIdInventario[i];
          listIdMercaderia.push(element.id);
        }

        return listIdMercaderia;
      } catch (error) {
        return [];
      }
    } else return [];
  }

  getMercaderiaIdInventario(idinventario) {
    if (this.listMercaderia.length != 0) {
      try {
        const filterListMercaderiaByIdInventario = this.listMercaderia.filter(
          (elem) => elem.idinventario == idinventario
        );

        return filterListMercaderiaByIdInventario;
      } catch (error) {
        return [];
      }
    } else return [];
  }

  getMercaderiaByIdRemito(idRemito) {
    if (this.listMercaderia.length != 0) {
      const filterByIdRemito = this.listMercaderia.filter(
        (elem) => elem.idremito == idRemito
      );
      if (filterByIdRemito) return filterByIdRemito;
      else return [];
    } else return [];
  }

  getMercaderiaByIdFacturaNegro(idFactura) {
    if (this.listMercaderia.length != 0) {
      const filterByIdFacturaNegro = this.listMercaderia.filter(
        (elem) => elem.idFacturaNegro == idFactura
      );
      if (filterByIdFacturaNegro) return filterByIdFacturaNegro;
      else return [];
    } else return [];
  }
}
