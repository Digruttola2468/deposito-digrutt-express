import { Router } from "express";
import {
  createMateriaPrima,
  deleteMateriaPrima,
  getAllMateriaPrima,
  getOneMateriaPrima,
  updateMateriaPrima,
} from "../controller/materiaPrima.controler.js";

const router = Router();

router.get("/materiaPrima", getAllMateriaPrima);
router.get("/materiaPrima/:id", getOneMateriaPrima);

router.post("/materiaPrima", createMateriaPrima);

router.put("/materiaPrima/:id", updateMateriaPrima);

router.delete("/materiaPrima/:id", deleteMateriaPrima);

export default router;
