export default class RemitosRepository {
  constructor(remitoDao, mercaderiaDao) {
    this.dao = remitoDao;
    this.mercaderiaDao = mercaderiaDao;
  }

  async get() {
    return await this.dao.get();
  }

  getOne(rid) {
    return this.dao.getOne(rid);
  }

  getOneRemitoWithMercaderas(rid) {
    return {
      remito: this.dao.getOne(rid),
      mercaderia: this.mercaderiaDao.getByIdRemito(rid),
    };
  }

  async newRemito(object) {
    const { products } = object;
    const [rows] = await this.dao.insert(object);

    for (let i = 0; i < products.length; i++) {
      const element = products[i];

      const enviar = {
        fecha: fecha,
        stock: element.stock,
        idinventario: element.idProduct,
        idcategoria: 1,
        idremito: rows.insertId,
      };
      await this.mercaderiaDao.insert(enviar);
    }

    return {
      id: rows.insertId,
      fecha: object.fecha,
      idCliente: object.idCliente,
      num_remito: object.numRemito,
      num_orden: object.nroOrden,
      total: object.valorDeclarado,
    };
  }

  async updateRemito(rid, obj) {
    const { products, valorDeclarado, fecha, nroOrden, numRemito } = obj;

    if (products != null && products != "") {
      const [result] = await con.query(
        `
        UPDATE remitos SET
          total = IFNULL(?,total),
          fecha = IFNULL(?,fecha),
          num_orden = IFNULL(?,num_orden),
          num_remito = IFNULL(IF(STRCMP(num_remito, ?) = 0, num_remito, ?), num_remito)
          WHERE id = ?
        `,
        [valorDeclarado, fecha, nroOrden, numRemito, numRemito, rid]
      );

      if (result.affectedRows >= 1) {
        const listMercaderiaByIdRemito = this.mercaderiaDao.getByIdRemito(rid);

        for (let i = 0; i < products.length; i++) {
          const element = products[i];

          let enviar = {
            fecha: null,
            stock: null,
          };

          if (fecha != null && fecha != "") enviar.fecha = fecha;

          enviar.stock = element.stock;

          //Validar si pertenece o no al mismo idRemito ya que podemos colocar cualquier idMercaderia
          const exits = listMercaderiaByIdRemito.find(
            (elem) => elem.id == element.idMercaderia
          );
          if (exits) {
            await this.mercaderiaDao.update(element.idMercaderia, enviar);
          } else return { error: "" };
        }

        
        return this.dao.getOne(rid);
      } else return { error: "" };
    } else return { error: "" };
  }

  async updateRemitoAddNewMercaderia(rid, products) {
    const listMercaderiaByIdRemito = this.mercaderiaDao.getByIdRemito(rid);

    let listErros = [];
    if (products != null) {
      let valorDeclarado = 0;
      for (let i = 0; i < products.length; i++) {
        const element = products[i];

        for (let i = 0; i < listMercaderiaByIdRemito.length; i++) {
          const elmMercaderia = listMercaderiaByIdRemito[i];

          if (element.idInventario == elmMercaderia.idinventario) {
            listErros.push({
              idcodproduct: element.idInventario,
              campus: "idInventario",
            });
          }
        }
        if (listErros.length != 0) return { error: true, listErros };

        const enviar = {
          fecha: listMercaderiaByIdRemito[0].fecha,
          stock: element.stock,
          idinventario: element.idInventario,
          idcategoria: 1,
          idremito: rid,
        };
        await this.mercaderiaDao.insert(enviar);

        valorDeclarado += parseFloat(element.price);
      }

      valorDeclarado += parseFloat(listMercaderiaByIdRemito[0].total);

      //Update el valor declarado
      await con.query(
        `
          UPDATE remitos 
            SET total = IFNULL(?,total)
            WHERE id = ?
        `,
        [valorDeclarado, rid]
      );

      const [rows] = await this.getOne(rid);

      return rows;
    }
  }

  async deleteRemito(rid) {
    const listMercaderiaByIdRemito = this.mercaderiaDao.getByIdRemito(rid);

    if (listMercaderiaByIdRemito.length != 0) {
      for (let i = 0; i < listMercaderiaByIdRemito.length; i++)
        await this.mercaderiaDao.delete(
          listMercaderiaByIdRemito[i].id
        );
    }

    const [result] = await this.dao.delete(rid);

    if (result.affectedRows >= 1) {
      return { error: false, success: true };
    } else return { error: true, success: false };
  }
}
