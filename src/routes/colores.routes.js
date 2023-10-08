import { Router } from "express";
import {
  createColor,
  deleteColor,
  getColores,
  getOneColor,
  updateColor,
} from "../controller/colores.controler.js";

import userExtractor from '../middleware/userExtractor.js'

const router = Router();

router.get("/colores", getColores);
router.get('/colores/:id', getOneColor);

router.post("/colores",userExtractor, createColor);

router.put("/colores/:id",userExtractor, updateColor);

router.delete("/colores/:id",userExtractor, deleteColor);

export default router;
