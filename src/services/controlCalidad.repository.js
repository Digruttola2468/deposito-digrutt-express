export default class ControlCalidadRepository {
  constructor(controlCalidadDao) {
    this.dao = controlCalidadDao;
  }

  getControlCalidad = async () => await this.dao.get();
  getControlCalidadByClientes = async (idCliente) => await this.dao.getByCliente(idCliente);
  getOneControlCalidad = async (id) => await this.dao.getOne(id);
  newControlCalidad = async (controlCalidad) => await this.dao.insert(controlCalidad);
  updateControlCalidad = async (id, controlCalidad) => await this.dao.update(id, controlCalidad);
  deleteControlCalidad = async (id) => await this.dao.delete(id);
}
