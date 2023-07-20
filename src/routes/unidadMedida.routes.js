import { Router } from "express";
import {
  createUnidadMedida,
  deleteUnidadMedida,
  getOneUnidadMedida,
  getUnidadMedida,
  updateUnidadMedida,
} from "../controller/unidadMedida.controler.js";

const router = Router();

router.get("/unidadMedida", getUnidadMedida);
router.get("/unidadMedida/:id", getOneUnidadMedida);

router.post("/unidadMedida", createUnidadMedida);

router.put("/unidadMedida/:id", updateUnidadMedida);

router.delete("/unidadMedida/:id", deleteUnidadMedida);

export default router;
