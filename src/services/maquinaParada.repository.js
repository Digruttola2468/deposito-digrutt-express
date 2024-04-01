export default class MaquinaParadaRepository {
  constructor(maquinaParadaDao) {
    this.dao = maquinaParadaDao;
  }

  async getMaquinasParadas() {
    return await this.dao.get();
  }
  async getOneMaquinaParada(mpid) {
    return await this.dao.getOne(mpid);
  }
  async newMaquinaParada(maquinaParada) {
    return await this.dao.insert(maquinaParada);
  }
  async updateMaquinaParada(mpid, maquinaParada) {
    return await this.dao.update(mpid, maquinaParada);
  }
  async deleteMaquinaParada(mpid) {
    return await this.dao.delete(mpid);
  }
}
