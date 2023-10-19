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

router.get("/inventario",userExtractor, getAllInventarioSelect);
router.get('/inventario/nombres',userExtractor, getInventariosSelectNombres);

router.get("/inventario/:id",userExtractor, getOneInventario);

router.post("/inventario",userExtractor, createInventario);

router.put("/inventario/:id",userExtractor, updateInventario);

router.delete("/inventario/:id",userExtractor, deleteInventario);

export default router;
