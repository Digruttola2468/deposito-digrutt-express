import { Router } from "express";
import {
  createCodMaquinaParada,
  deleteCodMaquinaParada,
  getCodMaquinaParada,
  getOneCodMaquinaParada,
  updateCodMaquinaParada,
} from "../controller/motivoMaquinaParada.controler.js";

import userExtractor from '../middleware/userExtractor.js'

const router = Router();

router.get("/maquinaParada", getCodMaquinaParada);
router.get("/maquinaParada/:id", getOneCodMaquinaParada);

router.post("/maquinaParada",userExtractor, createCodMaquinaParada);

router.put("/maquinaParada/:id",userExtractor, updateCodMaquinaParada);

router.delete("/maquinaParada/:id",userExtractor, deleteCodMaquinaParada);

export default router;
