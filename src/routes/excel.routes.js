import { Router } from "express";
import con from "../config/db.js";
import ExcelJs from "exceljs";
import userExtractor from "../middleware/userExtractor.js";
import { addDay, format } from "@formkit/tempo";

import { fileURLToPath } from "url";
import { dirname } from "path";
import allPermissions, { inventarioPermissions } from "../config/permissos.js";
import permissos from "../config/permissos.js";
import { inventarioServer, matriceServer, pedidoServer, produccionServer } from "../services/index.repository.js";
import moment from "moment";

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
  async (req, res) => {
    try {
      const listaEnviar = [];

      const listMatrices = await matriceServer.getMatrices();

      if (listMatrices.length == 0)
        return res.status(400).json({ message: "Lista Vacia" });


      /*listMatrices.forEach((elem) => {
        const stockActual = elem.entrada - elem.salida;
        listaEnviar.push({ ...elem, stockActual });
      });*/

      const workbook = new ExcelJs.Workbook();

      const worksheet = workbook.addWorksheet("Invent de producto");

      worksheet.columns = [
        { header: "Cod Matriz", key: "cod_matriz", width: 20 },
        { header: "Descripcion", key: "descripcion", width: 60 },
        { header: "Cant Pieza x Golpe", key: "cantPiezaGolpe", width: 10 },
        { header: "Cliente", key: "cliente", width: 10 },
      ];

      worksheet.addRows(listMatrices);

      await workbook.xlsx.writeFile(dir + "/inventario.xlsx");

      return res.sendFile(dir + "/inventario.xlsx");
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "something goes wrong" });
    }
  }
);
// 
router.get(
  "/produccion-semanal",
  userExtractor([allPermissions.produccion]),
  async (req, res) => {
    const fechaInit = req.query?.start;
    const fechaEnd = req.query?.end;

    const result = produccionServer.getRangeDateListProduccion(
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
            elem.descripcion,
            elem.golpesReales,
            elem.piezasProducidas,
            elem.prom_golpeshora,
            elem.turno
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

    worksheet.getCell(`A1`).value = `Semana 1 (${moment.utc(fechaInit).format("L")} - ${moment.utc(fechaEnd).format("L")})`;
    worksheet.getCell(`A1`).font = {
      italic: false,
      size: 14,
      bold: true,
    };
    worksheet.getCell(`A1`).alignment = {
      vertical: "middle",
      horizontal: "center",
    };
    worksheet.mergeCells(`A1:F1`);

    let position = 2;
    for (let i = 0; i < numMaquinaList.length; i++) {
      worksheet.getCell(`A${position}`).value = "Maquina " + enviar[i].maquina;
      worksheet.getCell(`A${position}`).font = {
        italic: true,
        size: 12,
      };
      worksheet.getCell(`A${position}`).alignment = {
        vertical: "middle",
        horizontal: "center",
      };
      worksheet.mergeCells(`A${position}:F${position}`);

      position += 1;

      worksheet.addTable({
        name: `Maquina ${enviar[i].maquina}`,
        ref: `A${position}`,
        headerRow: true,
        totalsRow: true,
        style: {
          theme: "TableStyleDark3",
          showRowStripes: false,
        },
        columns: [
          { name: "Fecha" },
          { name: "Descripcion" },
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
            totalsRowFunction: "average",
            filterButton: false,
          },
          {
            name: "Turno"
          },
        ],
        rows: enviar[i].data,
      });

      position += enviar[i].data.length;
      position += 3;
    }
    const dateNow = new Date();
    await workbook.xlsx.writeFile(dir + `/produccion_semanal_${dateNow.valueOf()}.xlsx`);

    return res.sendFile(dir + `/produccion_semanal_${dateNow.valueOf()}.xlsx`);
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
      const listMatrices = await matriceServer.getMatrices();

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

router.get(
  "/relacionMaquina/:idMaquina",
  userExtractor([permissos.produccion, permissos.matriceria]),
  async (req, res) => {
    const idMaquina = req.params.idMaquina;
    const workbook = new ExcelJs.Workbook();

    const worksheet = workbook.addWorksheet("Matriz Maquina");

    const [rows] = await con.query(
      "SELECT * FROM matrices_maquinas INNER JOIN matriz ON matrices_maquinas.idMatriz = matriz.id WHERE idMaquina = ?",
      [idMaquina]
    );

    const enviar = [];
    for (let i = 0; i < rows.length; i++) {
      const element = rows[i];

      enviar.push([element.descripcion, element.cod_matriz]);
    }

    worksheet.getCell("A1").value = `Maquina N° ${idMaquina}`;

    worksheet.addTable({
      name: `Maquina N° ${idMaquina}`,
      ref: "A2",
      headerRow: true,
      totalsRow: true,
      style: {
        theme: "TableStyleDark3",
        showRowStripes: true,
      },
      columns: [
        {
          name: `Descripcion`,
        },
        {
          name: `Codigo`,
        },
      ],
      rows: enviar,
    });

    await workbook.xlsx.writeFile(dir + `/matricesMaquina.xlsx`);

    return res.sendFile(dir + `/matricesMaquina.xlsx`);
  }
);

router.get("/pedidos/:dias", async (req, res) => {
  const dias = req.params.dias;
  const actual = new Date();

  const dateEnd = addDay(actual, parseInt(dias));

  const data = await pedidoServer.excelInforme(actual, dateEnd);

  const workbook = new ExcelJs.Workbook();

  const worksheet = workbook.addWorksheet("Estrategia Pedidos");

  const alignmentCenter = {
    vertical: "middle", horizontal: "center"
  };

  worksheet.getCell("A1").value = `FECHA INICIAL: ${format(
    actual,
    "short"
  )}`;
  worksheet.getCell("A1").alignment = alignmentCenter
  worksheet.mergeCells(`A1:B1`);

  worksheet.getCell("C1").value = `FECHA FINAL: ${format(dateEnd, "short")}`
  worksheet.getCell("C1").alignment = alignmentCenter
  worksheet.mergeCells(`C1:E1`);

  worksheet.getCell("F1").value = `ENTRE ${dias} Dias`
  worksheet.getCell("F1").alignment = alignmentCenter
  worksheet.mergeCells(`F1:G1`);


  let A_valueInit = 4;
  for (let i = 0; i < data.length; i++) {
    const element = data[i]; //ELEMT []

    const enviar = [];
    let nombreCliente = "";
    for (let j = 0; j < element.length; j++) {
      const obj = element[j];

      let piezaXGolpe = obj.piezaXGolpe;
      let cantidadEnviar = obj.cantFaltaEnviar;

      let golpesRealesNecesito = cantidadEnviar * piezaXGolpe;
      let golpesRealesDiaNecesito = golpesRealesNecesito / obj.faltanDays;

      let piezasDia = golpesRealesDiaNecesito / piezaXGolpe;

      let promGolpesHora = golpesRealesDiaNecesito / 24;

      nombreCliente = obj.cliente.toUpperCase();

      enviar.push([
        obj.descripcion,
        obj.cantFaltaEnviar,
        obj.fecha_entrega,
        obj.faltanDays,
        Math.round(golpesRealesDiaNecesito),
        Math.round(piezasDia),
        Math.round(promGolpesHora),
      ]);
    }

    worksheet.getCell(
      `A${A_valueInit - 1}`
    ).value = `${nombreCliente.toUpperCase()}`;
    worksheet.getCell(`A${A_valueInit - 1}`).font = {
      size: 14,
      italic: true
    };
    worksheet.mergeCells(`A${A_valueInit - 1}:G${A_valueInit - 1}`);
    worksheet.getCell(`A${A_valueInit - 1}`).alignment = alignmentCenter
    

    worksheet.addTable({
      name: `Pedido`,
      ref: `A${A_valueInit}`,
      headerRow: true,
      totalsRow: false,
      style: {
        theme: "TableStyleDark3",
        showRowStripes: true,
      },
      columns: [
        {
          name: `Descripcion`,
        },
        {
          name: `Enviar`,
        },
        {
          name: `Entrega`,
        },
        {
          name: `Faltan (dias)`,
        },
        {
          name: `G/Dia`,
        },
        {
          name: `P/Dia`,
        },
        {
          name: `G/h`,
        },
      ],
      rows: enviar,
    });

    // SUMARLE 1 de espacio
    A_valueInit += 3;
    // SUMARLE LONGITUD TABLA
    A_valueInit += element.length;
  }
console.log
  await workbook.xlsx.writeFile(dir + `/estrategiaPedido.xlsx`);

  return res.sendFile(dir + `/estrategiaPedido.xlsx`);
});

export default router;
