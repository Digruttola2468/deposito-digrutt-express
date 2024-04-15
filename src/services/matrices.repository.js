export default class MatricesRepository {
  constructor(matrizDao, clienteDao) {
    this.dao = matrizDao;
    this.clienteDao = clienteDao;
  }

  getMatrices = async () => {
    return await this.dao.get();
  };

  getOneMatriz = async (idMatriz) => {
    return await this.dao.getOne(idMatriz);
  };

  newMatriz = async (matriz) => {
    const { numero_matriz, idcliente } = matriz;
    const [rows] = await this.clienteDao.getOne(idcliente);

    let cod_matriz = null;
    if (numero_matriz < 10 && numero_matriz >= 1)
      cod_matriz = `${rows[0].codigo.toUpperCase()}-00${numero_matriz}`;
    else if (numero_matriz < 100 && numero_matriz >= 10)
      cod_matriz = `${rows[0].codigo.toUpperCase()}-0${numero_matriz}`;
    else cod_matriz = `${rows[0].codigo.toUpperCase()}-${numero_matriz}`;

    const [result] = await this.dao.insert({ cod_matriz, ...matriz });

    if (result.affectedRows >= 1) {
      const [rows] = await this.getOneMatriz(result.insertId);

      return rows;
    } else return null;
  };

  updateMatriz = async (mid, matriz) => {
    return await this.dao.update(mid, matriz);
  };

  delete = async (mid) => {
    return await this.dao.delete(mid);
  };
}
