import { Router } from "express";
import { graficaMercaderia,graficaCliente,getGraficaRelacionOtrosClientes,graficaProduccion } from '../controller/grafica.controler.js';

import userExtractor from "../middleware/userExtractor.js";

const router = Router();

router.get('/grafica/mercaderia/:idInventario',userExtractor, graficaMercaderia);

//router.get('/grafica/cliente/:idCliente', graficaCliente);

router.get('/grafica/cliente',userExtractor, graficaCliente);

router.get('/grafica/clientes/todos',userExtractor, getGraficaRelacionOtrosClientes);

router.get('/grafica/produccion',userExtractor, graficaProduccion);

export default router;