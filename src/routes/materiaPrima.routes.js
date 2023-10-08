import { Router } from "express";
import {
  createMateriaPrima,
  deleteMateriaPrima,
  getAllMateriaPrima,
  getOneMateriaPrima,
  updateMateriaPrima,
} from "../controller/materiaPrima.controler.js";

import userExtractor from '../middleware/userExtractor.js'

const router = Router();

router.get("/materiaPrima", getAllMateriaPrima);
router.get("/materiaPrima/:id", getOneMateriaPrima);

router.post("/materiaPrima",userExtractor, createMateriaPrima);

router.put("/materiaPrima/:id",userExtractor, updateMateriaPrima);

router.delete("/materiaPrima/:id",userExtractor, deleteMateriaPrima);

export default router;
