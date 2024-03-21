export default class InventarioRepository {
  constructor(inventarioDao, mercaderiaDao) {
    this.dao = inventarioDao;
    this.mercaderiaDao = mercaderiaDao;
  }

  async getInventario() {
    return await this.dao.get();
  }

  getListInventarioNombre() {
    return this.dao.getListInventarioNombre();
  }

  async getOne(iid) {
    return await this.dao.getOne(iid);
  }

  async createInventario(object) {
    const [rows] = await this.dao.insert(object);

    return await this.getOne(rows.insertId);
  }

  async updateInventario(iid, object) {
    const [result] = await this.dao.update(iid, object);

    if (result.affectedRows >= 1) return await this.getOne(iid);
    else return null;
  }

  async deleteInventario(iid) {
    // Eliminar de produccion - controlCalidad - pedidos
    await this.mercaderiaDao.deleteWhereIdinventario(iid);

    return await this.dao.delete(iid);
  }

  async sumMercaderiaByIdInventario(iid) {
    return await this.dao.suminventario(iid);
  }
}
