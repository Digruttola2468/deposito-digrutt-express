import { Router } from "express";
import {
  getMercaderias,
  getEntradaMercaderias,
  getSalidaMercaderias,
  getEntradaMercaderiasWhereNombre,
  getSalidaMercaderiasWhereNombre,
  createMercaderia,
  updateMercaderia,
  deleteMercaderia,
} from "../controller/mercaderia.controler.js";

import userExtractor from '../middleware/userExtractor.js'

const router = Router();

router.get("/mercaderia",userExtractor, getMercaderias);

router.get("/mercaderia/entrada",userExtractor, getEntradaMercaderias);
router.get("/mercaderia/entrada/:nombre",userExtractor, getEntradaMercaderiasWhereNombre);

router.get("/mercaderia/salida",userExtractor, getSalidaMercaderias);
router.get("/mercaderia/salida/:nombre",userExtractor, getSalidaMercaderiasWhereNombre);

router.post('/mercaderia',userExtractor, createMercaderia)

router.put('/mercaderia/:id',userExtractor, updateMercaderia)

router.delete("/mercaderia/:id",userExtractor, deleteMercaderia);

export default router;
