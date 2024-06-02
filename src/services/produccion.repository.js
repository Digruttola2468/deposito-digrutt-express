export default class ProduccionRepository {
  constructor(produccionDao) {
    this.dao = produccionDao;
  }

  getProduccion = async () => await this.dao.get();

  getOneProduccion = async (pid) => await this.dao.getOne(pid);

  newOneProduccion = async (produccion) => await this.dao.insert(produccion);

  getRangeDateByMaquina = (numMaquina, dateInit, dateEnd) =>
    this.dao.getRangeDateByNumMaquina(numMaquina, dateInit, dateEnd);
  
  getRangeDateListProduccion = (init,end) => this.dao.getRangeDateListProduccion(init,end)

  newListProduccion = async (listProduccion) => {
    const listProduccionAdd = [];
    for (let i = 0; i < listProduccion.length; i++) {
      const element = listProduccion[i];

      const [result] = await this.dao.insert(element);
      listProduccionAdd.push({ id: result.insertId, ...element });
    }
    return listProduccionAdd;
  };
  updateProduccion = async (pid, produccion) =>
    await this.dao.update(pid, produccion);

  deleteProduccion = async (pid) => await this.dao.delete(pid);
}
