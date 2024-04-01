export default class MercaderiaRepository {
  constructor(MercaderiaDao, InventarioDao) {
    this.dao = MercaderiaDao;
    this.inventarioDao = InventarioDao;
  }

  getMercaderia = async () => {
    return await this.dao.get();
  };

  getOneMercaderia = async (mid) => {
    return await this.dao.getOne(mid);
  };

  createMercaderia = async (obj) => {
    const { idinventario } = obj;

    // New Mercaderia
    const [rows] = await this.dao.insert(obj);

    // Update Stock Inventario
    await this.inventarioDao.suminventario(idinventario);

    // Return New Mercaderia JSON
    return { id: rows.insertId, ...obj };
  };

  createListMercaderia = async (fecha, list) => {
    const listMercaderiaDone = [];
    for (let i = 0; i < list.length; i++) {
      const element = list[i];

      try {
        const enviar = {
          fecha: fecha,
          stock: element.stock,
          idcategoria: 2,
          idinventario: element.idinventario,
        };

        // New Mercaderia
        const [result] = await this.dao.insert(enviar);

        // Update Stock Inventario
        await this.inventarioDao.suminventario(element.idinventario);

        // Return New Mercaderia JSON
        listMercaderiaDone.push({ id: result.insertId, ...element });
      } catch (error) {
        throw new Error(error);
      }
    }
    return listMercaderiaDone;
  };

  updateMercaderia = async (mid, obj) => {
    const [result] = await this.dao.update(mid, obj);

    if (result.affectedRows >= 1) {
      const [rows] = await this.getOneMercaderia(mid);

      // Update Stock Inventario
      await this.inventarioDao.suminventario(rows.idinventario);

      return rows;
    } else return null;
  };

  deleteMercaderia = async (mid) => {
    // Get One Mercaderia
    const [rows] = await this.getOneMercaderia(mid);

    const [result] = await this.dao.delete(mid);
    if (result.affectedRows >= 1) {
      // Update Stock Inventario
      await this.inventarioDao.suminventario(rows[0].idinventario);
      return true;
    } else return false;
  };
}
