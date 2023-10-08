import { Router } from "express";
import {
  createTypeProduct,
  deleteTypeProducto,
  getOneTypeProducto,
  getTypeProductos,
  updateTypeProduct,
} from "../controller/tipoProducto.controler.js";

import userExtractor from '../middleware/userExtractor.js'

const router = Router();

router.get("/tiposproductos", getTypeProductos);
router.get("/tiposproductos/:id", getOneTypeProducto);

router.post("/tiposproductos",userExtractor, createTypeProduct);

router.put("/tiposproductos/:id",userExtractor, updateTypeProduct);

router.delete("/tiposproductos/:id",userExtractor, deleteTypeProducto);

export default router;
