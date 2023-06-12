import { con } from "../db.js";
import ExcelJs from "exceljs";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const dir = dirname(__filename);

export const getExcelMercaderiaEntrada = async (req, res) => {
  try {
    const [rows] = await con.query(
      `SELECT mercaderia.id,fecha,stock,proveedor,nombre,descripcion,idinventario
                FROM mercaderia 
                INNER JOIN inventario on mercaderia.idinventario = inventario.id 
                WHERE idcategoria = 2;`
    );

    const workbook = new ExcelJs.Workbook();
    const worksheet = workbook.addWorksheet("entrada");

    worksheet.columns = [
      { header: "FECHA", key: "fecha", width: 10 },
      { header: "CODIGO PRODUCTO", key: "nombre", width: 10 },
      { header: "DESCRIPCION", key: "descripcion", width: 10 },
      { header: "CANTIDAD", key: "stock", width: 10 },
    ];

    worksheet.addRows(rows);

    await workbook.xlsx.writeFile("./src/controller/mercaderiaEntrada.xlsx");

    res.sendFile(dir + "/mercaderiaEntrada.xlsx");
  } catch (error) {
    return res.status(500).json({ message: "something goes wrong" });
  }
};

export const getExcelMercaderiaSalida = async (req, res) => {
  try {
    const [rows] = await con.query(
      `SELECT mercaderia.id,fecha,stock,proveedor,nombre,descripcion,idinventario
                FROM mercaderia 
                INNER JOIN inventario on mercaderia.idinventario = inventario.id 
                WHERE idcategoria = 1;`
    );

    const workbook = new ExcelJs.Workbook();
    const worksheet = workbook.addWorksheet("salida");

    worksheet.columns = [
      { header: "FECHA", key: "fecha", width: 10 },
      { header: "CODIGO PRODUCTO", key: "nombre", width: 10 },
      { header: "DESCRIPCION", key: "descripcion", width: 10 },
      { header: "CANTIDAD", key: "stock", width: 10 },
    ];

    worksheet.addRows(rows);

    await workbook.xlsx.writeFile("./src/controller/mercaderiaSalida.xlsx");

    res.sendFile(dir + "/mercaderiaSalida.xlsx");
  } catch (error) {
    return res.status(500).json({ message: "something goes wrong" });
  }
};

export const getExcelInventario = async (req, res) => {
  try {
    const [rows] = await con.query(`SELECT nombre,descripcion FROM inventario`);

    const workbook = new ExcelJs.Workbook();
    const worksheet = workbook.addWorksheet("principal");

    worksheet.columns = [
      { header: "CODIGO PRODUCTO", key: "nombre", width: 10 },
      { header: "DESCRIPCION", key: "descripcion", width: 10 },
    ];

    worksheet.addRows(rows);

    await workbook.xlsx.writeFile("./src/controller/inventario.xlsx");

    res.sendFile(dir + "/inventario.xlsx");
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "something goes wrong" });
  }
};
