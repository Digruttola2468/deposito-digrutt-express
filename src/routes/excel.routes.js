import { Router } from "express";
import { getExcelInventario, getExcelMercaderia } from '../controller/excel.controler.js';

const router = Router();

router.get('/excel/mercaderia', getExcelMercaderia);
router.get('/excel/inventario' , getExcelInventario);

export default router;