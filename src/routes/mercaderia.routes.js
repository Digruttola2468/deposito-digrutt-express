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

router.get("/mercaderia", getMercaderias);

router.get("/mercaderia/entrada", getEntradaMercaderias);
router.get("/mercaderia/entrada/:nombre", getEntradaMercaderiasWhereNombre);

router.get("/mercaderia/salida", getSalidaMercaderias);
router.get("/mercaderia/salida/:nombre", getSalidaMercaderiasWhereNombre);

router.post('/mercaderia',userExtractor, createMercaderia)

router.put('/mercaderia/:id',userExtractor, updateMercaderia)

router.delete("/mercaderia/:id",userExtractor, deleteMercaderia);

export default router;
