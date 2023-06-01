import { Router } from "express";
import {
  createDeposito,
  deleteDeposito,
  getDepositos,
  getOneDeposito,
  updateDeposito,
} from "../controller/deposito.controler.js";

const router = Router();

router.get("/deposito", getDepositos);
router.get("/deposito/:id", getOneDeposito);

router.post("/deposito", createDeposito);

router.put("/deposito/:id", updateDeposito);

router.delete("/deposito/:id", deleteDeposito);

export default router;
