import { Router } from "express";
import {
  createColor,
  deleteColor,
  getColores,
  getOneColor,
  updateColor,
} from "../controller/colores.controler.js";

const router = Router();

router.get("/colores", getColores);
router.get('/colores/:id', getOneColor);

router.post("/colores", createColor);

router.put("/colores/:id", updateColor);

router.delete("/colores/:id", deleteColor);

export default router;
