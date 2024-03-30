import con from "../../config/db.js";

export default class MercaderiaMySql {
  constructor() {
    this.listMercaderia = [];
  }

  getListMercaderia = () => this.listMercaderia;

  async get() {
    const [rows] = await con.query(
      `SELECT mercaderia.id,mercaderia.observacion,fecha,stock,nombre,descripcion,categoria,idinventario,articulo,idremito,idFacturaNegro,idCliente AS idcliente
            FROM mercaderia 
                LEFT JOIN inventario on mercaderia.idinventario = inventario.id
                LEFT JOIN categoria on mercaderia.idcategoria = categoria.id
            ORDER BY mercaderia.fecha DESC;`
    );
    this.listMercaderia = rows;

    return rows;
  }

  async getOne(mid) {
    return await con.query(
      `
        SELECT mercaderia.id,mercaderia.observacion,fecha,stock,nombre,descripcion,categoria,idinventario,articulo,idremito,idFacturaNegro,idCliente AS idcliente
            FROM mercaderia 
                LEFT JOIN inventario on mercaderia.idinventario = inventario.id
                LEFT JOIN categoria on mercaderia.idcategoria = categoria.id
            WHERE mercaderia.id = ?;
    `,
      [mid]
    );
  }

  async getByIdRemito(idRemito) {
    return await con.query(
      `
        SELECT mercaderia.id,nombre,descripcion,idFacturaNegro,idCliente,idremito,fecha,stock
            FROM mercaderia 
                LEFT JOIN inventario on mercaderia.idinventario = inventario.id
            WHERE mercaderia.idFacturaNegro = ?;
    `,
      [idRemito]
    );
  }

  async getByIdNotaEnvio(idNotaEnvio) {
    return await con.query(
      `
        SELECT mercaderia.id,nombre,descripcion,idFacturaNegro,idCliente,idremito,fecha,stock
            FROM mercaderia 
                LEFT JOIN inventario on mercaderia.idinventario = inventario.id
            WHERE mercaderia.idFacturaNegro = ?;
    `,
      [idNotaEnvio]
    );
  }

  getByIdInventario(idinventario) {
    if (this.listMercaderia.length != 0) {
      const filterByIdInventario = this.listMercaderia.filter(
        (elem) => elem.idinventario == idinventario
      );
      if (filterByIdInventario) return filterByIdInventario;
      else return [];
    } else return [];
  }

  insert = async (data) => {
    const {
      fecha,
      stock,
      idcategoria,
      idinventario,
      idremito,
      idFacturaNegro,
      observacion,
    } = data;
    return await con.query(
      "INSERT INTO mercaderia (`fecha`, `stock`, `idcategoria`, `idinventario`, `idremito`, `idFacturaNegro`, `observacion`) VALUES (?,?,?,?,?,?,?);",
      [
        fecha,
        stock,
        idcategoria,
        idinventario,
        idremito,
        idFacturaNegro,
        observacion,
      ]
    );
  };

  update = async (id, data) => {
    return await con.query(
      `UPDATE mercaderia
            SET fecha = IFNULL(?,fecha),
                stock = IFNULL(?,stock)
            WHERE id = ?;`,
      [data.fecha, data.stock, id]
    );
  };

  delete = async (id) => {
    return await con.query("DELETE FROM mercaderia WHERE (`id` = ?);", [id]);
  };

  async deleteWhereIdinventario(idinventario) {
    try {
      const [rows] = await con.query(
        `SELECT mercaderia.id,fecha,stock,nombre,descripcion,categoria,idinventario,articulo,idremito,idFacturaNegro,idCliente AS idcliente
                  FROM mercaderia 
                    LEFT JOIN inventario on mercaderia.idinventario = inventario.id
                    LEFT JOIN categoria on mercaderia.idcategoria = categoria.id
                  WHERE mercaderia.idinventario = ?`,
        [idinventario]
      );

      if (rows.length != 0) {
        for (let i = 0; i < rows.length; i++) {
          const { id } = rows[i];

          const [result] = await con.query(
            "DELETE FROM mercaderia WHERE (`id` = ?);",
            [id]
          );
        }
      }

      return { status: "success", error: null };
    } catch (error) {
      throw error;
    }
  }
}
