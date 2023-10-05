import { Router } from "express";
import { graficaMercaderia,graficaCliente } from '../controller/grafica.controler.js';

const router = Router();

router.get('/grafica/mercaderia/:idInventario', graficaMercaderia);

//router.get('/grafica/cliente/:idCliente', graficaCliente);

router.get('/grafica/cliente', graficaCliente);

export default router;