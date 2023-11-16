import { Router } from "express";
import {newRemito, getRemitos, getOneRemitoFromMercaderiaByIdRemito} from '../controller/remitos.controler.js'
import userExtractor from '../middleware/userExtractor.js'

const router = Router();

router.get('/remito',userExtractor, getRemitos);
router.get('/remito/:id',userExtractor, getOneRemitoFromMercaderiaByIdRemito)

router.post('/remito',userExtractor, newRemito);

export default router;