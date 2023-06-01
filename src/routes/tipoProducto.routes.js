import { Router } from "express";
import {
  createTypeProduct,
  deleteTypeProducto,
  getOneTypeProducto,
  getTypeProductos,
  updateTypeProduct,
} from "../controller/tipoProducto.controler.js";

const router = Router();

router.get("/tiposproductos", getTypeProductos);
router.get("/tiposproductos/:id", getOneTypeProducto);

router.post("/tiposproductos", createTypeProduct);

router.put("/tiposproductos/:id", updateTypeProduct);

router.delete("/tiposproductos/:id", deleteTypeProducto);

export default router;
