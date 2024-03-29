import { Router } from "express";
import { con } from "../config/db.js";
import ExcelJs from "exceljs";
import userExtractor, { auth } from "../middleware/userExtractor.js";
import {
  inventarioManager,
  producionManager,
  facturaNegroManager,
  matricesManager,
} from "../index.js";

import { fileURLToPath } from "url";
import { dirname } from "path";
import allPermissions, { inventarioPermissions } from "../config/permissos.js";
import moment from "moment";
import permissos from "../config/permissos.js";

const __filename = fileURLToPath(import.meta.url);
const dir = dirname(__filename);

const router = Router();

const getMercaderia = async (idcategoria) => {
  const [rows] = await con.query(
    `SELECT mercaderia.*, inventario.id AS idinventario, inventario.nombre, inventario.descripcion, inventario.articulo
                FROM mercaderia 
                RIGHT JOIN inventario on mercaderia.idinventario = inventario.id 
                WHERE idcategoria = ${idcategoria};`
  );
  return rows;
};

router.get(
  "/mercaderia",
  userExtractor(allPermissions.mercaderia),
  async (req, res) => {
    try {
      const resultEntrada = await getMercaderia(2);
      const resultSalida = await getMercaderia(1);

      const workbook = new ExcelJs.Workbook();

      const worksheetEntrada = workbook.addWorksheet("entrada");
      const worksheetSalida = workbook.addWorksheet("salida");

      worksheetEntrada.columns = [
        { header: "FECHA", key: "fecha", width: 20 },
        { header: "ARTICULO", key: "articulo", width: 20 },
        { header: "CODIGO PRODUCTO", key: "nombre", width: 15 },
        { header: "DESCRIPCION", key: "descripcion", width: 60 },
        { header: "CANTIDAD", key: "stock", width: 20 },
      ];

      worksheetSalida.columns = [
        { header: "FECHA", key: "fecha", width: 20 },
        { header: "ARTICULO", key: "articulo", width: 20 },
        { header: "CODIGO PRODUCTO", key: "nombre", width: 15 },
        { header: "DESCRIPCION", key: "descripcion", width: 60 },
        { header: "CANTIDAD", key: "stock", width: 20 },
      ];

      worksheetEntrada.addRows(resultEntrada);
      worksheetSalida.addRows(resultSalida);

      await workbook.xlsx.writeFile(dir + "/mercaderia.xlsx");

      return res.sendFile(dir + "/mercaderia.xlsx");
    } catch (error) {
      console.error(error);
    }
  }
);

router.get(
  "/inventario",
  userExtractor(inventarioPermissions),
  async (req, res) => {
    try {
      const listaEnviar = [];

      const listMatrices = inventarioManager.getlistMatrices();

      if (listMatrices.length == 0)
        return res.status(400).json({ message: "Lista Vacia" });

      listMatrices.forEach((elem) => {
        const stockActual = elem.entrada - elem.salida;
        listaEnviar.push({ ...elem, stockActual });
      });

      const workbook = new ExcelJs.Workbook();

      const worksheet = workbook.addWorksheet("Invent de producto");

      worksheet.columns = [
        { header: "ARTICULO", key: "articulo", width: 20 },
        { header: "CODIGO PRODUCTO", key: "nombre", width: 30 },
        { header: "DESCRIPCION", key: "descripcion", width: 60 },
        { header: "ENTRADA", key: "entrada", width: 10 },
        { header: "SALIDA", key: "salida", width: 10 },
        { header: "STOCK ACTUAL", key: "stockActual", width: 15 },
        { header: "Cliente", key: "cliente", width: 30 },
        { header: "Peso x Unidad (gramos)", key: "pesoUnidad", width: 50 },
      ];

      worksheet.addRows(listaEnviar);

      await workbook.xlsx.writeFile(dir + "/inventario.xlsx");

      return res.sendFile(dir + "/inventario.xlsx");
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "something goes wrong" });
    }
  }
);

router.get(
  "/produccion-semanal",
  userExtractor([allPermissions.produccion]),
  async (req, res) => {
    const fechaInit = req.query?.start;
    const fechaEnd = req.query?.end;

    const result = producionManager.getRangeDateListProduccion(
      fechaInit,
      fechaEnd
    );

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
      result.forEach((elem) => {
        if (elem.num_maquina == numMaquina) {
          listEnviar.push([
            new Date(elem.fecha),
            elem.golpesReales,
            elem.piezasProducidas,
            elem.prom_golpeshora,
          ]);
        }
      });

      enviar.push({
        maquina: numMaquina,
        data: listEnviar,
      });
    }

    const workbook = new ExcelJs.Workbook();

    const worksheet = workbook.addWorksheet("Produccion Semanal");

    const positionTable = [
      "A2",
      "F2",
      "A11",
      "F11",
      "A20",
      "F20",
      "A29",
      "F29",
      "A38",
      "F38",
    ];
    const positionTitle = [
      "A1",
      "F1",
      "A10",
      "F10",
      "A19",
      "F19",
      "A28",
      "F28",
      "A37",
      "F37",
    ];

    for (let i = 0; i < numMaquinaList.length; i++) {
      worksheet.getCell(positionTitle[i]).value =
        "Maquina " + enviar[i].maquina;
      worksheet.addTable({
        name: `Maquina ${enviar[i].maquina}`,
        ref: positionTable[i],
        headerRow: true,
        totalsRow: true,
        style: {
          theme: "TableStyleDark3",
          showRowStripes: true,
        },
        columns: [
          { name: "Fecha", totalsRowLabel: "Total: ", filterButton: true },
          {
            name: "Golpes",
            totalsRowFunction: "sum",
            filterButton: false,
          },
          {
            name: "Piezas",
            totalsRowFunction: "sum",
            filterButton: false,
          },
          {
            name: "Golpes/h",
            totalsRowFunction: "sum",
            filterButton: false,
          },
        ],
        rows: enviar[i].data,
      });
    }

    await workbook.xlsx.writeFile(dir + "/produccion_semanal.xlsx");

    return res.sendFile(dir + "/produccion_semanal.xlsx");
  }
);

router.get(
  "/notaEnvio/:idNotaEnvio",
  userExtractor([allPermissions.oficina]),
  async (req, res, next) => {
    const idNotaEnvio = req.params.idNotaEnvio;

    const result = facturaNegroManager.getOneNotaEnvio(idNotaEnvio);

    console.log("Result: ", result);

    const notaEnvio = result.notaEnvio.nro_envio;
    const listMercaderia = result.mercaderia;
    const cliente = result.notaEnvio.cliente.toUpperCase();

    let formatDate = result.notaEnvio.fecha;
    /*if (result.notaEnvio?.fecha) {
    const fecha = result.notaEnvio.fecha;
    const newdate = fecha.split("-").reverse().join("-");
    const date = moment(newdate);

    formatDate = date.format("DD/MM/YYYY");
  }*/

    const workbook = new ExcelJs.Workbook();

    try {
      const work = await workbook.xlsx.readFile(dir + "/notaEnvio.xlsx");

      const worksheet = work.getWorksheet(`Hoja1`);

      worksheet.getCell("H1").value = formatDate;
      worksheet.getCell("G4").value = notaEnvio;
      worksheet.getCell("A6").value = cliente;

      const celdasA = [
        "A10",
        "A11",
        "A12",
        "A13",
        "A14",
        "A15",
        "A16",
        "A17",
        "A18",
        "A19",
        "A20",
        "A21",
        "A22",
        "A23",
        "A24",
        "A25",
        "A26",
        "A27",
        "A28",
        "A29",
      ];
      const celdasB = [
        "B10",
        "B11",
        "B12",
        "B13",
        "B14",
        "B15",
        "B16",
        "B17",
        "B18",
        "B19",
        "B20",
        "B21",
        "B22",
        "B23",
        "B24",
        "B25",
        "B26",
        "B27",
        "B28",
        "B29",
      ];

      let total = 0;
      for (let i = 0; i < listMercaderia.length; i++) {
        const element = listMercaderia[i];

        worksheet.getCell(celdasA[i]).value = element.stock;
        worksheet.getCell(celdasB[i]).value = element.descripcion;

        total += element.stock;
      }

      worksheet.getCell("A30").value = total;

      try {
        await work.xlsx.writeFile(dir + "/notaEnvio.xlsx");
      } catch (error) {}

      return res.sendFile(dir + "/notaEnvio.xlsx");
    } catch (error) {
      return res
        .status(500)
        .json({ status: "error", message: "Ocurrio un error" });
    }
  }
);

router.get(
  "/matrices",
  userExtractor([permissos.produccion, permissos.matriceria]),
  async (req, res) => {
    try {

      const listMatrices = await matricesManager.getMatrices();

      if (listMatrices.length == 0)
        return res.status(400).json({ message: "Lista Vacia" });

      const workbook = new ExcelJs.Workbook();

      const worksheet = workbook.addWorksheet("Matrices");

      worksheet.columns = [
        { header: "COD MATRIZ", key: "cod_matriz", width: 17 },
        { header: "DESCRIPCION", key: "descripcion", width: 60 },
        { header: "P x G", key: "cantPiezaGolpe", width: 10 },
        { header: "MATERIA PRIMA", key: "material", width: 20 },
        { header: "CLIENTE", key: "cliente", width: 20 },
      ];

      worksheet.addRows(listMatrices.data);

      await workbook.xlsx.writeFile(dir + "/matrices.xlsx");

      return res.sendFile(dir + "/matrices.xlsx");
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "something goes wrong" });
    }
  }
);

export default router;
