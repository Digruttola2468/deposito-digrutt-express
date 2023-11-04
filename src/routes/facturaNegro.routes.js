import { Router } from "express";
import { getFacturaNegro,newFacturaNegro } from '../controller/facturaNegro.controler.js'

import userExtractor from '../middleware/userExtractor.js'

const router = Router();

router.get('/facturaNegro', userExtractor, getFacturaNegro);
router.post('/facturaNegro', userExtractor, newFacturaNegro);

export default router;