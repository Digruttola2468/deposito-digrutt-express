export default class PedidosRepository {
  constructor(pedidosDao, historialFechaDao) {
    this.dao = pedidosDao;
    this.historialFechaPedidosDao = historialFechaDao;
  }

  //await historialPedidosManager.postHistorialFechasPedidos({ idPedido: idPedido, cantidad_enviada: enviar.cantidadEnviada })

  getPedidos = async () => await this.dao.get();
  getOnePedido = async (idPedido) => await this.dao.getOne(idPedido);
  newPedido = async (pedido) => await this.dao.insert(pedido);

  newListPedidos = async (listPedidos) => {
    
  };

  updatePedido = async (idPedido, pedido) =>
    await this.dao.update(idPedido, pedido);

  updateDonePedido = async (idPedido, isDone) =>
    await this.dao.updatePedidosIsDone(idPedido, isDone);

  deletePedido = async (idPedido) => await this.dao.delete(idPedido);
}
