import { Router } from "express";
import {
  createInventario,
  deleteInventario,
  getAllInventario,
  getOneInventario,
  updateInventario,
  getInventariosSelectNombres,
  getRefreshInventario,
  getSumInventario,
} from "../controller/inventario.controler.js";

import userExtractor from '../middleware/userExtractor.js'

const router = Router();

router.get("/inventario",userExtractor, getAllInventario);
router.get('/inventario/nombres',userExtractor, getInventariosSelectNombres);
router.get('/refresh/inventario',userExtractor, getRefreshInventario);

router.get('/inventario/sumInventario/:id', userExtractor, getSumInventario)

router.get("/inventario/:id",userExtractor, getOneInventario);

router.post("/inventario",userExtractor, createInventario);

router.put("/inventario/:id",userExtractor, updateInventario);

router.delete("/inventario/:id",userExtractor, deleteInventario);

export default router;
