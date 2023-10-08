import { Router } from "express";
import {
  createDeposito,
  deleteDeposito,
  getDepositos,
  getOneDeposito,
  updateDeposito,
} from "../controller/deposito.controler.js";

import userExtractor from '../middleware/userExtractor.js'

const router = Router();

router.get("/deposito", getDepositos);
router.get("/deposito/:id", getOneDeposito);

router.post("/deposito",userExtractor, createDeposito);

router.put("/deposito/:id",userExtractor, updateDeposito);

router.delete("/deposito/:id",userExtractor, deleteDeposito);

export default router;
