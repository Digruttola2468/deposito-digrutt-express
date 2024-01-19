import { Router } from "express";
import { con } from "../config/db.js";
import ExcelJs from "exceljs";
import userExtractor, { auth } from "../middleware/userExtractor.js";
import { inventarioManager, producionManager } from "../index.js";

import { fileURLToPath } from "url";
import { dirname } from "path";
import allPermissions, { inventarioPermissions } from "../config/permissos.js";

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



router.get("/excel/mercaderia", userExtractor(allPermissions.mercaderia), async (req, res) => {
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
});

router.get("/excel/inventario", userExtractor(inventarioPermissions), async (req, res) => {
  try {
    const listaEnviar = [];

    const listInventario = inventarioManager.getListInventario();

    if (listInventario.length == 0) return res.status(400).json({message: 'Lista Vacia'})
    
    listInventario.forEach(elem => {
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
      { header: 'Cliente', key: 'cliente', width: 30},
      { header: "Peso x Unidad (gramos)", key: "pesoUnidad", width: 50 },
    ];

    worksheet.addRows(listaEnviar);

    await workbook.xlsx.writeFile(dir + "/inventario.xlsx");

    return res.sendFile(dir + "/inventario.xlsx");
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "something goes wrong" });
  }
});

router.get("/excel/produccion-semanal", userExtractor(allPermissions.produccion), async (req, res) => {
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
    "F38"
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
    "F37"
  ];

  for (let i = 0; i < numMaquinaList.length; i++) {
    worksheet.getCell(positionTitle[i]).value = "Maquina " + enviar[i].maquina;
    worksheet
      .addTable({
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
});

export default router;
