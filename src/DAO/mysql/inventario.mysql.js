import con from "../../config/db.js";

export default class InventarioMysql {
  constructor() {
    this.listInventario = [];
  }

  getListInventario = () => this.listInventario;

  async get() {
    const [rows] = await con.query(
      ` 
        SELECT inventario.*, clientes.cliente, idCliente AS idcliente 
            FROM inventario 
            LEFT JOIN clientes ON inventario.idcliente = clientes.id;
      `
    );
    this.listInventario = rows;
    return rows;
  }

  async getOne(iid) {
    return await con.query(
      ` 
          SELECT inventario.*, clientes.cliente, idCliente AS idcliente 
              FROM inventario 
              LEFT JOIN clientes ON inventario.idcliente = clientes.id
          WHERE inventario.id = ?;
        `,
      [iid]
    );
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
      return listEnviar;
    }
    return [];
  }

  insert = async (data) => {
    return await con.query(
      "INSERT INTO inventario (nombre,precio,descripcion,idcolor,idtipoproducto,pesoUnidad,stockCaja,idCliente,idCodMatriz,entrada,salida) VALUES (?,?,?,?,?,?,?,?,?,?,?) ;",
      [
        data.nombre.toLowerCase(),
        data.precio,
        data.descripcion,
        data.idcolor,
        data.idtipoproducto,
        data.pesoUnidad,
        data.stockCaja,
        data.idCliente,
        data.idCodMatriz,
        0,
        0,
      ]
    );
  };

  update = async (iid, data) => {
    return await con.query(
      `UPDATE inventario 
                SET nombre = IFNULL(IF(STRCMP(nombre, ?) = 0, nombre, ?), nombre),
                    precio = IFNULL(?,precio),
                    descripcion = IFNULL(?,descripcion),
                    idcolor = IFNULL(?,idcolor),
                    idtipoproducto = IFNULL(?,idtipoproducto),
                    pesoUnidad = IFNULL(?,pesoUnidad),
                    stockCaja = IFNULL(?,stockCaja), 
                    idCliente = IFNULL(?,idCliente),
                    idCodMatriz = IFNULL(?,idCodMatriz),
                    articulo = IFNULL(IF(STRCMP(articulo, ?) = 0, articulo, ?), articulo),
                    ubicacion = IFNULL(?,ubicacion)
                WHERE id = ?`,
      [
        data.nombre,
        data.nombre,
        data.precio,
        data.descripcion,
        data.idcolor,
        data.idtipoproducto,
        data.pesoUnidad,
        data.stockCaja,
        data.idCliente,
        data.idCodMatriz,
        data.articulo,
        data.articulo,
        data.ubicacion,
        iid,
      ]
    );
  };

  delete = async (iid) => {
    return await con.query("DELETE FROM inventario WHERE (`id` = ?);", [iid]);
  };

  async suminventario(idInventario) {
    const inventarioInteger = parseInt(idInventario);

    if (!Number.isInteger(inventarioInteger)) return [];

    let stockMercaderia = {
      entrada: 0,
      salida: 0,
    };

    const [rows] = await con.query(
      `SELECT stock, categoria
            FROM mercaderia
        WHERE mercaderia.idinventario = ?
        `,
      [idInventario]
    );

    const listMercaderiaEntrada = rows.filter(
      (elem) => elem.categoria == "Entrada"
    );

    const listMercaderiaSalida = rows.filter(
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

    try {
      //Update BBDD
      const [result] = await con.query(
        ` UPDATE inventario 
                SET salida  = IFNULL(?,salida),
                    entrada = IFNULL(?,entrada)
                WHERE id = ?
              `,
        [stockMercaderia.salida, stockMercaderia.entrada, inventarioInteger]
      );

      if (result.affectedRows >= 1) {
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
          status: "success",
          entrada: stockMercaderia.entrada,
          salida: stockMercaderia.salida,
          error: null,
        };
      } else
        return {
          error: {
            message: "NO se agrego el stock de la pieza en el inventario",
          },
        };
    } catch (e) {
      return {
        error: {
          message: "Something Wrong",
        },
      };
    }
  }
}
