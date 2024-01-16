import { Router } from "express";
import { graficaMercaderia,graficaCliente,getGraficaRelacionOtrosClientes,graficaProduccion } from '../controller/grafica.controler.js';

import userExtractor from "../middleware/userExtractor.js";
import allPermissions from "../config/permissos.js";

const router = Router();

router.get('/grafica/mercaderia/:idInventario',userExtractor(allPermissions.mercaderia,allPermissions.oficina), graficaMercaderia);

//router.get('/grafica/cliente/:idCliente', graficaCliente);

router.get('/grafica/cliente',userExtractor(allPermissions.mercaderia,allPermissions.oficina), graficaCliente);

router.get('/grafica/clientes/todos',userExtractor(allPermissions.mercaderia,allPermissions.oficina), getGraficaRelacionOtrosClientes);

router.get('/grafica/produccion', userExtractor(allPermissions.produccion,allPermissions.oficina), graficaProduccion);

export default router;