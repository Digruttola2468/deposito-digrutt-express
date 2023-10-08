import { Router } from "express";
import {
  createCliente,
  deleteCliente,
  getClientes,
  getOneCliente,
  updateCliente,
} from "../controller/clientes.controler.js";

import userExtractor from '../middleware/userExtractor.js'

const router = Router();

router.get("/clientes", getClientes);
router.get("/cliente/:id", getOneCliente);

router.post("/cliente",userExtractor, createCliente);

router.put("/cliente/:id",userExtractor, updateCliente);

router.delete("/cliente/:id",userExtractor, deleteCliente);

export default router;
