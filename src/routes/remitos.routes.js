import { Router } from "express";
import {newRemito, getRemitos} from '../controller/remitos.controler.js'
import userExtractor from '../middleware/userExtractor.js'

const router = Router();

router.get('/remito', getRemitos);
router.post('/remito', newRemito);

export default router;