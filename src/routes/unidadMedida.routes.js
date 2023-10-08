import { Router } from "express";
import {
  createUnidadMedida,
  deleteUnidadMedida,
  getOneUnidadMedida,
  getUnidadMedida,
  updateUnidadMedida,
} from "../controller/unidadMedida.controler.js";

import userExtractor from '../middleware/userExtractor.js'

const router = Router();

router.get("/unidadMedida", getUnidadMedida);
router.get("/unidadMedida/:id", getOneUnidadMedida);

router.post("/unidadMedida",userExtractor, createUnidadMedida);

router.put("/unidadMedida/:id",userExtractor, updateUnidadMedida);

router.delete("/unidadMedida/:id",userExtractor, deleteUnidadMedida);

export default router;
