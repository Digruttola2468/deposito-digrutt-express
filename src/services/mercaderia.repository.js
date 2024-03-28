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
    return { id: rows.insertId, ...rows };
  };

  createListMercaderia = async (list) => {
    const listMercaderiaDone = [];
    for (let i = 0; i < list.length; i++) {
      const element = list[i];

      try {
        // New Mercaderia
        const [rows] = await this.dao.insert(element);

        // Update Stock Inventario
        await this.inventarioDao.suminventario(element.idinventario);

        // Return New Mercaderia JSON
        listMercaderiaDone.push({ id: rows.insertId, ...element });
      } catch (error) {
        console.log("INDEX: ", i, "Object: ", element);
        console.error(error);
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
      await this.inventarioDao.suminventario(rows.idinventario);
      return true;
    } else return false;
  };
}
