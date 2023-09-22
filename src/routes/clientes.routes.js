import { Router } from "express";
import {
  createCliente,
  deleteCliente,
  getClientes,
  getOneCliente,
  updateCliente,
} from "../controller/clientes.controler.js";

const router = Router();

router.get("/clientes", getClientes);
router.get("/cliente/:id", getOneCliente);

router.post("/cliente", createCliente);

router.put("/cliente/:id", updateCliente);

router.delete("/cliente/:id", deleteCliente);

export default router;
