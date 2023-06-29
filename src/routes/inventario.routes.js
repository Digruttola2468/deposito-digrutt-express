import { Router } from "express";
import {
  createInventario,
  deleteInventario,
  getAllInventario,
  getOneInventario,
  updateInventario,
  getInventariosSelectNombres,
} from "../controller/inventario.controler.js";

const router = Router();

router.get("/inventario", getAllInventario);
router.get('/inventario/nombres', getInventariosSelectNombres);

router.get("/inventario/:id", getOneInventario);

router.post("/inventario", createInventario);

router.put("/inventario/:id", updateInventario);

router.delete("/inventario/:id", deleteInventario);

export default router;
