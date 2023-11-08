import { Router } from "express";
import {
  getMercaderias,
  createMercaderia,
  updateMercaderia,
  deleteMercaderia,
} from "../controller/mercaderia.controler.js";

import userExtractor from '../middleware/userExtractor.js'

const router = Router();

router.get("/mercaderia", getMercaderias);

router.post('/mercaderia', createMercaderia)

router.put('/mercaderia/:id', updateMercaderia)

router.delete("/mercaderia/:id", deleteMercaderia);

export default router;
