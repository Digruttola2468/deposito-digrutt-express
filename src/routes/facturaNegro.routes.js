import { Router } from "express";
import {
  getFacturaNegro,
  getNewNroEnvio,
  getRefreshFacturaNegro,
  newFacturaNegro,
} from "../controller/facturaNegro.controler.js";

import userExtractor from "../middleware/userExtractor.js";

const router = Router();

router.get("/facturaNegro/newNroEnvio", getNewNroEnvio);
router.get("/facturaNegro", getFacturaNegro);
router.get("/refresh/facturaNegro", getRefreshFacturaNegro);

router.post("/facturaNegro", newFacturaNegro);

export default router;
