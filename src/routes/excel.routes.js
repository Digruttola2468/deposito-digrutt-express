import { Router } from "express";
import { getExcelInventario, getExcelMercaderia } from '../controller/excel.controler.js';

import userExtractor from '../middleware/userExtractor.js'

const router = Router();

router.get('/excel/mercaderia',userExtractor, getExcelMercaderia);
router.get('/excel/inventario' ,userExtractor, getExcelInventario);

export default router;