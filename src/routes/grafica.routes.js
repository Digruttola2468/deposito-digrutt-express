import { Router } from "express";
import {
  graficaMercaderia,
  graficaCliente,
  getGraficaRelacionOtrosClientes,
  graficaProduccion,
} from "../controller/grafica.controler.js";

import userExtractor from "../middleware/userExtractor.js";
import allPermissions from "../config/permissos.js";

const router = Router();

router.get(
  "/mercaderia/:idInventario",
  userExtractor([allPermissions.mercaderia, allPermissions.oficina]),
  graficaMercaderia
);

//router.get('/grafica/cliente/:idCliente', graficaCliente);

router.get(
  "/cliente",
  userExtractor([allPermissions.mercaderia, allPermissions.oficina]),
  graficaCliente
);

router.get(
  "/clientes/todos",
  userExtractor([allPermissions.mercaderia, allPermissions.oficina]),
  getGraficaRelacionOtrosClientes
);

router.get(
  "/produccion",
  userExtractor([allPermissions.produccion, allPermissions.oficina]),
  graficaProduccion
);

export default router;
