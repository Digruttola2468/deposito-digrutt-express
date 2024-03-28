export default class NotaEnvioRepository {
  constructor(notaEnvioDao, mercaderiaDao) {
    this.dao = notaEnvioDao;
    this.mercaderiaDao = mercaderiaDao;
  }

  async get() {
    return await this.dao.get();
  }

  async getOne(nid) {
    return await this.dao.getOne(nid);
  }

  async getOneWithAllMercaderiaOutput(nid) {
    const listMercaderiaByIdFacturaNegro =
      this.mercaderiaDao.getByIdRemito(nid);

    const [rows] = await this.getOne(nid);

    if (rows[0]) {
      if (listMercaderiaByIdFacturaNegro.length != 0) {
        return {
          notaEnvio: rows[0],
          mercaderia: listMercaderiaByIdFacturaNegro,
        };
      } else return { error: { message: "No se encontro en la mercaderia" } };
    } else return { error: { message: "No se encontro la nota envio" } };
  }

  async createNotaEnvio(object) {
    const { products, fecha } = object;
    const [rows] = await this.dao.insert(object);

    for (let i = 0; i < products.length; i++) {
      const element = products[i];

      const enviar = {
        fecha: fecha,
        stock: element.stock,
        idinventario: element.idProduct,
        idcategoria: 1,
        idFacturaNegro: rows.insertId,
      };

      await this.mercaderiaDao.insert(enviar);
    }

    return await this.getOne(rows.insertId);
  }

  async updateNotaEnvio(nid, object) {
    const [result] = await this.dao.update(nid, object);
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
        } else return { error: true };
      }

      return await this.dao.getOne(nid);
    } else throw new Error("No se actualizo");
  }

  async updateNotaEnvioAddNewMercaderia(nid, products) {
    const listMercaderiaByIdNotaEnvio =
      this.mercaderiaDao.getByIdNotaEnvio(nid);

    let listErros = [];
    if (products != null) {
      let valorDeclarado = 0;
      for (let i = 0; i < products.length; i++) {
        const element = products[i];

        for (let i = 0; i < listMercaderiaByIdNotaEnvio.length; i++) {
          const elmMercaderia = listMercaderiaByIdNotaEnvio[i];

          if (element.idInventario == elmMercaderia.idinventario) {
            listErros.push({
              idcodproduct: element.idInventario,
              campus: "idInventario",
            });
          }
        }

        if (listErros.length != 0) return { error: true, listErros };

        const enviar = {
          fecha: listMercaderiaByIdNotaEnvio[0].fecha,
          stock: element.stock,
          idinventario: element.idInventario,
          idcategoria: 1,
          idFacturaNegro: nid,
        };
        await this.mercaderiaDao.insert(enviar);

        valorDeclarado += parseFloat(element.price);
      }

      valorDeclarado += parseFloat(listMercaderiaByIdNotaEnvio[0].total);

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

  async deleteNotaEnvio() {
    const listMercaderiaByIdNotaEnvio = this.mercaderiaDao.getByIdRemito(rid);

    if (listMercaderiaByIdNotaEnvio.length != 0) {
      for (let i = 0; i < listMercaderiaByIdNotaEnvio.length; i++)
        await this.mercaderiaDao.delete(listMercaderiaByIdNotaEnvio[i].id);
    }

    const [result] = await this.dao.delete(rid);

    if (result.affectedRows >= 1) {
      return { error: false, success: true };
    } else return { error: true, success: false };
  }
}
