import { con } from "../db.js";
import ExcelJs from "exceljs";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const dir = dirname(__filename);

const getMercaderia = async (idcategoria) => {
  const [rows] = await con.query(
    `SELECT mercaderia.id,fecha,stock,proveedor,nombre,descripcion,idinventario
              FROM mercaderia 
              INNER JOIN inventario on mercaderia.idinventario = inventario.id 
              WHERE idcategoria = ${idcategoria};`
  );
  return rows;
};

export const getExcelMercaderia = async (req, res) => {
  try {
    const resultEntrada = await getMercaderia(2);
    const resultSalida = await getMercaderia(1);

    const workbook = new ExcelJs.Workbook();

    const worksheetEntrada = workbook.addWorksheet("entrada");
    const worksheetSalida = workbook.addWorksheet("salida");

    worksheetEntrada.columns = [
      { header: "FECHA", key: "fecha", width: 20 },
      { header: "CODIGO PRODUCTO", key: "nombre", width: 15 },
      { header: "DESCRIPCION", key: "descripcion", width: 60 },
      { header: "CANTIDAD", key: "stock", width: 20 },
    ];

    worksheetSalida.columns = [
      { header: "FECHA", key: "fecha", width: 20 },
      { header: "CODIGO PRODUCTO", key: "nombre", width: 15 },
      { header: "DESCRIPCION", key: "descripcion", width: 60 },
      { header: "CANTIDAD", key: "stock", width: 20 },
    ];

    worksheetEntrada.addRows(resultEntrada);
    worksheetSalida.addRows(resultSalida);

    await workbook.xlsx.writeFile("./src/controller/mercaderia.xlsx");

    res.sendFile(dir + "/mercaderia.xlsx");
  } catch (error) {
    console.error(error);
  }
};


const getIdInvenario = async () => {
  const [rows] = await con.query("SELECT id FROM inventario");
  return rows;
};
export const getExcelInventario = async (req, res) => {
  try {
    const listaEnviar = [];

    const resultado = await getIdInvenario();

    for (let index = 0; index < resultado.length; index++) {
      const element = resultado[index];
      const [rows] = await con.query(
        `SELECT nombre, descripcion, 
                SUM(CASE WHEN idcategoria = 1 THEN stock ELSE 0 END ) as Salida,
                SUM(CASE WHEN idcategoria = 2 THEN stock ELSE 0 END ) as Entrada
                FROM mercaderia 
                INNER JOIN inventario ON inventario.id = mercaderia.idinventario 
                WHERE idinventario = ${element.id};`
      );
      if (rows[0].Entrada == null) rows[0].Entrada = 0;

      if (rows[0].Salida == null) rows[0].Salida = 0;

      const stockActual = parseInt(rows[0].Entrada) - parseInt(rows[0].Salida);
      listaEnviar.push({ 
        nombre: rows[0].nombre,
        descripcion: rows[0].descripcion,
        entrada: parseInt(rows[0].Entrada),
        salida: parseInt(rows[0].Salida),
        stockActual });
    }

    const workbook = new ExcelJs.Workbook();
    const worksheet = workbook.addWorksheet("Invent de producto");

    worksheet.columns = [
      { header: "CODIGO PRODUCTO", key: "nombre", width: 20 },
      { header: "DESCRIPCION", key: "descripcion", width: 60 },
      { header: "ENTRADA", key: "entrada", width: 10 },
      { header: "SALIDA", key: "salida", width: 10 },
      { header: "STOCK ACTUAL", key: "stockActual", width: 15  },
    ];

    worksheet.addRows(listaEnviar);

    await workbook.xlsx.writeFile("./src/controller/inventario.xlsx");

    res.sendFile(dir + "/inventario.xlsx");
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "something goes wrong" });
  }
};
