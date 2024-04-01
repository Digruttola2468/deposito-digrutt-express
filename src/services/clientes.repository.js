export default class ClientesRepository {
  constructor(clienteDao) {
    this.dao = clienteDao;
  }

  async getClientes() {
    return await this.dao.get();
  }
  async getOneCliente(cid) {
    return await this.dao.getOne(cid);
  }
  async newCliente(cliente) {
    return await this.dao.insert(cliente);
  }
  async updateCliente(cid, cliente) {
    return await this.dao.update(cid, cliente);
  }
  async deleteCliente(cid) {
    return await this.dao.delete(cid);
  }
}
