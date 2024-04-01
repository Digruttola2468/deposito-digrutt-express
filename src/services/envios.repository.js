import moment from "moment";

export default class EnviosRepository {
  constructor(EnviosDao) {
    this.dao = EnviosDao;
  }

  generateStringDateAndHours(date) {
    const hours = date.getHours();
    const minutes = date.getMinutes();

    const year = date.getFullYear();
    const mes = date.getMonth() + 1;
    const dia = date.getDate();

    const hora = `${hours < 10 ? `0${hours}` : hours}:${
      minutes < 10 ? `0${minutes}` : minutes
    }`;
    const fecha = `${year}/${mes < 10 ? `0${mes}` : mes}/${
      dia < 10 ? `0${dia}` : dia
    }`;

    return [fecha, hora];
  }

  async getEnvios() {
    return await this.dao.get();
  }
  async getOneEnvios(eid) {
    return await this.dao.getOne(eid);
  }
  async newEnvio(envio) {
    const date = new Date();
    const [fecha, hora] = this.generateStringDateAndHours(date);

    const enviar = {
      ...envio,
      fecha_date: date,
      fecha,
      hora,
    };

    return await this.dao.insert(enviar);
  }
  async updateEnvios(eid, envio) {
    const date = new Date();
    const [fecha, hora] = this.generateStringDateAndHours(date);

    const enviar = {
      ...envio,
      fecha_date: date,
      fechaObj: fecha,
      horaObj: hora,
    };

    return await this.dao.update(eid, enviar);
  }
  async deleteEnvios(eid) {
    return await this.dao.delete(eid);
  }
}
