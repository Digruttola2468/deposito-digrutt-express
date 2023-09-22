import { Router } from "express";
import {
  createProducto,
  deleteProducto,
  getOneProducto,
  getProductos,
  updateProducto,
} from "../controller/productos.controler.js";

const router = Router();

router.get("/productos", getProductos);
router.get("/productos/:id", getOneProducto);

router.post("/productos", createProducto);

router.put("/productos/:id", updateProducto);

router.delete("/productos/:id", deleteProducto);

export default router;
