import { Router } from "express";
import {newRemito, getRemitos} from '../controller/remitos.controler.js'
import userExtractor from '../middleware/userExtractor.js'

const router = Router();

router.get('/remito',userExtractor, getRemitos);
router.post('/remito',userExtractor, newRemito);

export default router;