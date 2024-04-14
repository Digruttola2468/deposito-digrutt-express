export default class ControlCalidadRepository {
  constructor(controlCalidadDao) {
    this.dao = controlCalidadDao;
  }

  getAll = async () => await this.dao.get();
  getOneAtencionReclamos = async (id) => await this.dao.getOne(id);

  getAtencionReclamosByClientes = async (idCliente) => await this.dao.getByIdCliente(idCliente);
  getAtencionReclamosByIdInventario = async (idCliente) => await this.dao.getByIdInventario(idCliente);

  newAtencionReclamos = async (controlCalidad) => await this.dao.insert(controlCalidad);
  updateAtencionReclamos = async (id, controlCalidad) => await this.dao.update(id, controlCalidad);
  deleteAtencionReclamos = async (id) => await this.dao.delete(id);
}
