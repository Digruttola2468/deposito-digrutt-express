export default class HistorialFechasPedidosRepository {
  constructor(hfpDao) {
    //hfpDao => HistorialFechasPedidosDao
    this.dao = hfpDao;
  }

  getHistorialFechaPedido = async () => await this.dao.get();

  getOneHistorial = async (idHistorial) => await this.dao.getOne(idHistorial);

  newHistorialFechaPedido = async (historialFechaPedido) =>
    await this.dao.insert(historialFechaPedido);

  updateHistorialFechaPedido = async (idHistorial, historialFechaPedido) =>
    await this.dao.update(idHistorial, historialFechaPedido);

  deleteHistorialFechaPedido = async (idHistorial) =>
    await this.dao.delete(idHistorial);
}
