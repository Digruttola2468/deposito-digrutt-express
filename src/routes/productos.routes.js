import { Router } from "express";
import {
  createProducto,
  deleteProducto,
  getOneProducto,
  getProductos,
  updateProducto,
} from "../controller/productos.controler.js";

import userExtractor from '../middleware/userExtractor.js'

const router = Router();

router.get("/productos", getProductos);
router.get("/productos/:id", getOneProducto);

router.post("/productos",userExtractor, createProducto);

router.put("/productos/:id",userExtractor, updateProducto);

router.delete("/productos/:id",userExtractor, deleteProducto);

export default router;
