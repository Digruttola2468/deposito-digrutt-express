import { Router } from "express";
import {
  createInventario,
  deleteInventario,
  getAllInventario,
  getOneInventario,
  updateInventario,
  getInventarioTipos,
  getInventarioColores,
  getInventarioColoresWhereId,
  getInventarioTiposWhereId
} from "../controller/inventario.controler.js";

const router = Router();

router.get("/inventario", getAllInventario);
router.get('/inventario/tipos', getInventarioTipos);
router.get('/inventario/tipos/:id', getInventarioTiposWhereId);
router.get('/inventario/colors', getInventarioColores);
router.get('/inventario/colors/:id', getInventarioColoresWhereId);

router.get("/inventario/:id", getOneInventario);

router.post("/inventario", createInventario);

router.put("/inventario/:id", updateInventario);

router.delete("/inventario/:id", deleteInventario);

export default router;
