import { con } from "../config/db.js";
import { produccionServer } from "../services/index.repository.js";

//
const getArrayYear = (mercaderiaApi, idinventario) => {
  const enviar = new Set();
  if (idinventario != null) {
    const filtrado = mercaderiaApi.filter(
      (elem) => elem.idinventario == idinventario
    );

    for (let i = 0; i < filtrado.length; i++) {
      const dateFecha = new Date(filtrado[i].fecha);
      enviar.add(dateFecha.getFullYear());
    }
  }

  const iterator1 = enviar.values();

  const list = [];
  for (const entry of iterator1) {
    list.push(entry);
  }

  return list;
};

const getArrayMercaderia = (mercaderiaApi, idinventario, idcategoria, year) => {
  const filtradoDato = mercaderiaApi.filter(
    (elem) => elem.idinventario == idinventario
  );
  const filtrado = filtradoDato.filter(
    (elem) => elem.idcategoria == idcategoria
  );

  let enero = 0;
  let febrero = 0;
  let marzo = 0;
  let abril = 0;
  let mayo = 0;
  let junio = 0;
  let julio = 0;
  let agosto = 0;
  let septiembre = 0;
  let octubre = 0;
  let noviembre = 0;
  let diciembre = 0;

  for (let i = 0; i < filtrado.length; i++) {
    const element = filtrado[i];
    const dateFecha = new Date(element.fecha);

    if (dateFecha.getFullYear() == year) {
      if (dateFecha.getMonth() == 0) enero += element.stock;

      if (dateFecha.getMonth() == 1) febrero += element.stock;

      if (dateFecha.getMonth() == 2) marzo += element.stock;

      if (dateFecha.getMonth() == 3) abril += element.stock;

      if (dateFecha.getMonth() == 4) mayo += element.stock;

      if (dateFecha.getMonth() == 5) junio += element.stock;

      if (dateFecha.getMonth() == 6) julio += element.stock;

      if (dateFecha.getMonth() == 7) agosto += element.stock;

      if (dateFecha.getMonth() == 8) septiembre += element.stock;

      if (dateFecha.getMonth() == 9) octubre += element.stock;

      if (dateFecha.getMonth() == 10) noviembre += element.stock;

      if (dateFecha.getMonth() == 11) diciembre += element.stock;
    }
  }

  return {
    enero,
    febrero,
    marzo,
    abril,
    mayo,
    junio,
    julio,
    agosto,
    septiembre,
    octubre,
    noviembre,
    diciembre,
  };
};

export const graficaMercaderia = async (req, res) => {
  try {
    const enviarJSON = [];

    const idInventario = req.params.idInventario;

    const [rows] = await con.query(
      `SELECT id,fecha,stock,idinventario,idcategoria FROM mercaderia;`
    );

    const array = getArrayYear(rows, idInventario);

    for (let i = 0; i < array.length; i++) {
      const year = array[i];
      const listEntrada = getArrayMercaderia(rows, idInventario, 2, year);
      const listSalida = getArrayMercaderia(rows, idInventario, 1, year);
      enviarJSON.push({
        fecha: year,
        entrada: listEntrada,
        salida: listSalida,
      });
    }

    res.json(enviarJSON);
  } catch (error) {
    return res.status(500).send({ message: "Something wrong" });
  }
};

const getAllMercaderia = async () => {
  try {
    const [rows] = await con.query(`SELECT * FROM mercaderia`);
    return rows;
  } catch (error) {
    return [];
  }
};

//ACA OBTENEMOS TODO LOS DATOS ; HASTA TODOS LOS AÑOS DE CADA INVENTARIO
/*export const graficaCliente = async (req, res) => {
  try {
    const enviarJSON = [];
    const idCliente = req.params.idCliente;

    //Obtener todos los que tengan ese idCliente en Inventario
    const [rows] = await con.query(
      `SELECT id,nombre,descripcion FROM inventario WHERE idCliente = ?;`
    ,[idCliente]);

    const apiMercaderia = await getAllMercaderia();

    for (let i = 0; i < rows.length; i++) {
      const idInventario = rows[i].id;
      const nameInventario = rows[i].nombre;
      const descripcionInventario = rows[i].descripcion;

      const filterWhereIdInventario = apiMercaderia.filter(elem => elem.idinventario === idInventario)

      const arrayYear = getArrayYear(filterWhereIdInventario, idInventario);

      for (let j = 0; j < arrayYear.length; j++) {
        const year = arrayYear[j];
        
        const listSalida = getArrayMercaderia(filterWhereIdInventario, idInventario, 1, year);
        
        enviarJSON.push({
          fecha: year,
          idInventario,
          nombre: nameInventario,
          descripcion: descripcionInventario,
          salida: listSalida,
        });
      }
    }

    res.json(enviarJSON);
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Something wrong" });
  }
}*/

//ACA SE OBTIENE EN RELACION AL AÑO ENVIADO
export const graficaCliente = async (req, res) => {
  try {
    const enviarJSON = [];
    const idCliente = req.query.idCliente;
    const yearQuery = req.query.year;

    //Obtener todos los que tengan ese idCliente en Inventario
    const [rows] = await con.query(
      `SELECT id,nombre,descripcion FROM inventario WHERE idCliente = ?;`,
      [idCliente]
    );

    const apiMercaderia = await getAllMercaderia();

    for (let i = 0; i < rows.length; i++) {
      const idInventario = rows[i].id;
      const nameInventario = rows[i].nombre;
      const descripcionInventario = rows[i].descripcion;

      const filterWhereIdInventario = apiMercaderia.filter(
        (elem) => elem.idinventario === idInventario
      );

      const listSalida = getArrayMercaderia(
        filterWhereIdInventario,
        idInventario,
        1,
        yearQuery
      );

      enviarJSON.push({
        fecha: yearQuery,
        idInventario,
        nombre: nameInventario,
        descripcion: descripcionInventario,
        salida: listSalida,
      });
    }

    res.json(enviarJSON);
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Something wrong" });
  }
};

const getClientesAPI = async () => {
  try {
    const [rows] = await con.query("SELECT * FROM clientes;");

    return rows;
  } catch (error) {
    return res.status(500).send({ message: "Something wrong" });
  }
};

export const getGraficaRelacionOtrosClientes = async (req, res) => {
  try {
    const enviarJSON = [];

    const arrayClientes = await getClientesAPI();

    const [rows] = await con.query(
      `SELECT id,entrada,salida,idCliente FROM inventario;`
    );

    for (let i = 0; i < arrayClientes.length; i++) {
      const element = arrayClientes[i];

      const filterByIdCliente = rows.filter(
        (elem) => elem.idCliente === element.id
      );

      let entrada = 0;
      let salida = 0;

      for (let j = 0; j < filterByIdCliente.length; j++) {
        const element = filterByIdCliente[j];

        entrada += element.entrada;
        salida += element.salida;
      }

      const stockActual = entrada - salida;

      enviarJSON.push({
        cliente: element.cliente,
        stockEntrada: entrada,
        stockSalida: salida,
        stockActual,
      });
    }

    res.json(enviarJSON);
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Something wrong" });
  }
};

export const graficaProduccion = (req, res) => {
  const init = req.query.init;
  const end = req.query.end;

  const result = produccionServer.getRangeDateListProduccion(init, end);

  const numMaquinaSet = new Set();
  result.forEach((elem) => {
    numMaquinaSet.add(elem.num_maquina);
  });

  const numMaquinaList = [];
  numMaquinaSet.forEach((value1, value2, set) => {
    numMaquinaList.push(value2);
  });

  const enviar = [];

  for (let i = 0; i < numMaquinaList.length; i++) {
    const numMaquina = numMaquinaList[i];

    let listEnviar = [];
    const filterByNumMaquina = result.filter(
      (elem) => elem.num_maquina == numMaquina
    );

    let golpesSemanales = [0,0,0,0,0,0];
    let piezasSemanales = [0,0,0,0,0,0];
    let promedioGolpesHoraSemanal = [0,0,0,0,0,0];

    filterByNumMaquina.forEach((elem) => {
      const fechaDate = new Date(elem.fecha);
      const dayOfWeek = fechaDate.getDay(); //Lunes

      const golpe = golpesSemanales.map((e,index,array) => {
        if (dayOfWeek == index) return elem.golpesReales
        else return e
      })

      const pieza = piezasSemanales.map((e,index,array) => {
        if (dayOfWeek == index) return elem.piezasProducidas
        else return e
      })

      const prom = promedioGolpesHoraSemanal.map((e,index,array) => {
        if (dayOfWeek == index) return elem.prom_golpeshora
        else return e
      });
      
      golpesSemanales = golpe;
      piezasSemanales = pieza;
      promedioGolpesHoraSemanal = prom;
    });

    listEnviar.push(
      { label: "Promedio Golpes/H", data: promedioGolpesHoraSemanal },
      { label: "Piezas Producidas", data: piezasSemanales },
      { label: "Golpes Reales", data: golpesSemanales }
    );

    enviar.push({
      maquina: numMaquina,
      grafica: listEnviar,
    });
  }
  return res.json(enviar);
};
