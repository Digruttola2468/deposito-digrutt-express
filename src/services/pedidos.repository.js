import { format, formatStr, isAfter, isBefore } from "@formkit/tempo";

export default class PedidosRepository {
  constructor(pedidosDao, historialFechaDao, matricesDao) {
    this.dao = pedidosDao;
    this.historialFechaPedidosDao = historialFechaDao;
    this.matricesDao = matricesDao;
  }

  getPedidos = async () => await this.dao.get();
  getOnePedido = async (idPedido) => await this.dao.getOne(idPedido);
  newPedido = async (pedido) => await this.dao.insert(pedido);

  newListPedidos = async (listPedidos) => {
    const listPedidosAdd = [];
    for (let i = 0; i < listPedidos.length; i++) {
      const element = listPedidos[i];

      const [result] = await this.dao.insert(element);
      listPedidosAdd.push({ id: result.insertId, ...element });
    }
    return listPedidosAdd;
  };

  excelInforme = async (dateInit, dateEnd) => {
    const rows = await this.dao.get();
    const matrices = await this.matricesDao.get();

    //OBTENEMOS EN BASE A UN RANGO DE FECHA Y MIENTRAS OBTENEMOS LOS CLIENTES
    const clientesSet = new Set();
    const getByRangeDate = rows.filter((elem) => {
      const estaAntes = isBefore(dateInit, elem.fecha_entrega);
      const estaDesps = isAfter(dateEnd, elem.fecha_entrega);

      if (estaAntes && estaDesps) {
        clientesSet.add(elem.idcliente);
        return elem;
      }
    });

    // AGREGAMOS EN BASE A LA FECHA ACTUAL, CUANTOS DIAS FALTAN PARA COMPLETAR EL PEDIDO
    const milisegundosDia = 24 * 60 * 60 * 1000;
    const addDaysFaltan = getByRangeDate.map((elem) => {
      // GET DAY FALTAN
      const fecha = new Date(elem.fecha_entrega);
      const milisegundosTranscurridos = Math.abs(
        fecha.getTime() - dateInit.getTime()
      );

      let diasTranscurridos = Math.round(
        milisegundosTranscurridos / milisegundosDia
      );

      // GET ONE MATRIZ
      const matriz = matrices.find(
        (matrizElem) => matrizElem.id == elem.idCodMatriz
      );

      let cantFaltaEnviar = elem.cantidadEnviar - elem.cantidad_enviada;
      return {
        ...elem,
        faltanDays: diasTranscurridos,
        piezaXGolpe: matriz?.cantPiezaGolpe ?? 0,
        cantFaltaEnviar,
      };
    });

    // PASAMOS SET TO ARRAY
    const array = Array.from(clientesSet);

    // CADA ARRAY PERTENECE A UN CLIENTE DIFERENTE
    const listClientes = [];
    for (let i = 0; i < array.length; i++) {
      const idCliente = array[i];

      const cliente1 = addDaysFaltan.filter(
        (elem) => elem.idcliente == idCliente
      );
      listClientes.push(cliente1);
    }

    return listClientes;
  };

  updatePedido = async (idPedido, pedido) => {
    if (pedido.cantidadEnviada != null && pedido.cantidadEnviada >= 1) {

      const date = new Date();
      const formatoooDate = format({ date, format: "YYYY-MM-DD" })
      console.log(formatoooDate);
      const formatoooHora = format({ date, format: "HH:mm" })

      await this.historialFechaPedidosDao.insert({
        idPedido: idPedido,
        stringDate: formatoooDate,
        horaString: formatoooHora,
        cantidad_enviada: pedido.cantidadEnviada,
      });
    }

    return await this.dao.update(idPedido, pedido);
  };

  updateDonePedido = async (idPedido, isDone) =>
    await this.dao.updatePedidosIsDone(idPedido, isDone);

  deletePedido = async (idPedido) => await this.dao.delete(idPedido);
}
