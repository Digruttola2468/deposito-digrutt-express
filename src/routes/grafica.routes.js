import { Router } from "express";
import {
  graficaMercaderia,
  graficaCliente,
  getGraficaRelacionOtrosClientes,
  graficaProduccion,
} from "../controller/grafica.controler.js";

import userExtractor, { auth } from "../middleware/userExtractor.js";
import allPermissions from "../config/permissos.js";

const router = Router();

router.get(
  "/grafica/mercaderia/:idInventario",
  auth,
  userExtractor(allPermissions.mercaderia, allPermissions.oficina),
  graficaMercaderia
);

//router.get('/grafica/cliente/:idCliente', graficaCliente);

router.get(
  "/grafica/cliente",
  auth,
  userExtractor(allPermissions.mercaderia, allPermissions.oficina),
  graficaCliente
);

router.get(
  "/grafica/clientes/todos",
  auth,
  userExtractor(allPermissions.mercaderia, allPermissions.oficina),
  getGraficaRelacionOtrosClientes
);

router.get(
  "/grafica/produccion",
  auth,
  userExtractor(allPermissions.produccion, allPermissions.oficina),
  graficaProduccion
);

export default router;
