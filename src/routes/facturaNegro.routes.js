import { Router } from "express";
import {
  getFacturaNegro,
  getNewNroEnvio,
  getRefreshFacturaNegro,
  newFacturaNegro,
  getMercaderiaWhereIdFacturaNegro
} from "../controller/facturaNegro.controler.js";

import userExtractor from "../middleware/userExtractor.js";

const router = Router();

router.get("/facturaNegro/newNroEnvio", getNewNroEnvio);
router.get("/facturaNegro",userExtractor, getFacturaNegro);
router.get("/refresh/facturaNegro",userExtractor, getRefreshFacturaNegro);

router.get('/facturaNegro/:id',userExtractor, getMercaderiaWhereIdFacturaNegro);

router.post("/facturaNegro",userExtractor, newFacturaNegro);

export default router;
