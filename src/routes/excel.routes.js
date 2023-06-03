import { Router } from "express";
import { getExcelMercaderiaEntrada,getExcelInventario } from '../controller/excel.controler.js';

const router = Router();

//router.get('/excel/mercaderia/entrada' , getExcelMercaderiaEntrada);

router.get('/excel/inventario' , getExcelInventario);

export default router;