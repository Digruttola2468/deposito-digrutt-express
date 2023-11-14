import { Router } from "express";
import {
  getFacturaNegro,
  getNewNroEnvio,
  getRefreshFacturaNegro,
  newFacturaNegro,
} from "../controller/facturaNegro.controler.js";

import userExtractor from "../middleware/userExtractor.js";

const router = Router();

router.get("/facturaNegro/newNroEnvio",userExtractor, getNewNroEnvio);
router.get("/facturaNegro",userExtractor, getFacturaNegro);
router.get("/refresh/facturaNegro",userExtractor, getRefreshFacturaNegro);

router.post("/facturaNegro",userExtractor, newFacturaNegro);

export default router;
