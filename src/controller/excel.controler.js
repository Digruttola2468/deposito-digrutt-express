import { con } from "../db.js";
import ExcelJs from "exceljs";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { getAllInventarioSelect } from "./inventario.controler.js";

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


export const getExcelInventario = async (req, res) => {
  try {

    const listaEnviar = [];

    const listInventario = await getAllInventarioSelect();

    for (let i = 0; i < listInventario.length; i++) {
      const element = listInventario[i];
      const stockActual = element.entrada - element.salida;

      listaEnviar.push({...element, stockActual});
    }
    
    const workbook = new ExcelJs.Workbook();
    const worksheet = workbook.addWorksheet("Invent de producto");

    worksheet.columns = [
      { header: "CODIGO PRODUCTO", key: "nombre", width: 20 },
      { header: "DESCRIPCION", key: "descripcion", width: 60 },
      { header: "ENTRADA", key: "entrada", width: 10 },
      { header: "SALIDA", key: "salida", width: 10 },
      { header: "STOCK ACTUAL", key: "stockActual", width: 15  },
      { header: "Peso x Unidad (gramos)", key: "pesoUnidad", width: 50  },
    ];

    worksheet.addRows(listaEnviar);

    await workbook.xlsx.writeFile("./src/controller/inventario.xlsx");

    res.sendFile(dir + "/inventario.xlsx");
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "something goes wrong" });
  }
};
