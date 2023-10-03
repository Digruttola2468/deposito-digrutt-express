import { Router } from "express";
import { graficaMercaderia } from '../controller/grafica.controler.js';

const router = Router();

router.get('/grafica/mercaderia/:idInventario', graficaMercaderia);

export default router;