import { Router } from "express";
import {
  createCodMaquinaParada,
  deleteCodMaquinaParada,
  getCodMaquinaParada,
  getOneCodMaquinaParada,
  updateCodMaquinaParada,
} from "../controller/motivoMaquinaParada.controler.js";

const router = Router();

router.get("/maquinaParada", getCodMaquinaParada);
router.get("/maquinaParada/:id", getOneCodMaquinaParada);

router.post("/maquinaParada", createCodMaquinaParada);

router.put("/maquinaParada/:id", updateCodMaquinaParada);

router.delete("/maquinaParada/:id", deleteCodMaquinaParada);

export default router;
