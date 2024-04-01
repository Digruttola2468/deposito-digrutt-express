export default class HistorialErrorMatrices {
  constructor(historialDao) {
    this.dao = historialDao;
  }

  getHistorial = async () => {
    return await this.dao.get();
  };

  getOneHistorial = async (idHistorial) => {
    return await this.dao.getOne(idHistorial);
  };

  getByIdMatriz = async (idMatriz) => {
    return await this.dao.getByMatriz(idMatriz);
  };

  newHistorial = async (historial) => {
    //Obtenemos la fecha actual
    const fechaDate = new Date();
    const stringDate = `${fechaDate.getFullYear()}-${
      fechaDate.getMonth() + 1
    }-${fechaDate.getDate()}`;

    return await this.dao.insert({ ...historial, stringDate });
  };

  updateHistorial = async (idHistorial, historial) => {
    return await this.dao.update(idHistorial, historial);
  };

  updateMatrizTerminado = async (idHistorial, isSolved) => {
    let enviar = { fechaTerminado: null };

    const date = new Date();
    const formatDate = `${date.getFullYear()}-${
      date.getMonth() + 1
    }-${date.getDate()}`;

    //Falso => no esta terminado
    if (isSolved <= 0) {
      enviar.fechaTerminado = null;
    }
    //True => esta terminado
    if (isSolved >= 1) {
      enviar.fechaTerminado = formatDate;
    }

    return await this.dao.updateIsSolved(
      idHistorial,
      enviar.fechaTerminado,
      isSolved
    );
  };

  deleteHistorial = async (idHistorial) => {
    return await this.dao.delete(idHistorial);
  };
}
