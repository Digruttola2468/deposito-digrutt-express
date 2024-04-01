export default class RelacionMatrizMaquinaRepository {
  constructor(rmmDao) {
    this.dao = rmmDao;
  }

  getAll = async () => await this.dao.get();

  getListMatrizByMaquina = async (idMaquina) =>
    await this.dao.getMatrizByIdMaquina(idMaquina);

  getListMaquinaByMatriz = async (idMatriz) =>
    await this.dao.getMaquinaByIdMatriz(idMatriz);
}
