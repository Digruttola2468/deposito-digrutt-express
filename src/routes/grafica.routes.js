import { Router } from "express";
import { graficaMercaderia,graficaCliente,getGraficaRelacionOtrosClientes } from '../controller/grafica.controler.js';

const router = Router();

router.get('/grafica/mercaderia/:idInventario', graficaMercaderia);

//router.get('/grafica/cliente/:idCliente', graficaCliente);

router.get('/grafica/cliente', graficaCliente);

router.get('/grafica/clientes/todos', getGraficaRelacionOtrosClientes);

export default router;