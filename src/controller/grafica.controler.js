import { con } from "../db.js";

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
    console.log(error);
    return res.status(500).send({ message: "Something wrong" });
  }
};
