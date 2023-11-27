import { Router } from "express";
import {
  getMercaderias,
  createMercaderia,
  updateMercaderia,
  deleteMercaderia,
  createListMercaderia,
} from "../controller/mercaderia.controler.js";

import userExtractor from '../middleware/userExtractor.js'

const router = Router();

router.get("/mercaderia",userExtractor, getMercaderias);

router.post('/mercaderia',userExtractor, createMercaderia)
router.post('/mercaderia/list',userExtractor,createListMercaderia);

router.put('/mercaderia/:id',userExtractor, updateMercaderia)

router.delete("/mercaderia/:id",userExtractor, deleteMercaderia);

export default router;
