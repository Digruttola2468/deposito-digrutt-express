import { Router } from "express";
import { isConectionBBDD } from '../controller/index.controler.js'

const router = Router();

router.get('/ping' , isConectionBBDD);

export default router;