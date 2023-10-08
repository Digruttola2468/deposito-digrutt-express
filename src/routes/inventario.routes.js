import { Router } from "express";
import {
  createInventario,
  deleteInventario,
  getAllInventarioSelect,
  getOneInventario,
  updateInventario,
  getInventariosSelectNombres,
} from "../controller/inventario.controler.js";

import userExtractor from '../middleware/userExtractor.js'

const router = Router();

router.get("/inventario", getAllInventarioSelect);
router.get('/inventario/nombres', getInventariosSelectNombres);

router.get("/inventario/:id", getOneInventario);

router.post("/inventario",userExtractor, createInventario);

router.put("/inventario/:id",userExtractor, updateInventario);

router.delete("/inventario/:id",userExtractor, deleteInventario);

export default router;
