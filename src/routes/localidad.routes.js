import { Router } from "express";
import { createLocalidad, deleteLocalidad, getLocalidad, getOneLocalidad, updateLocalidad } from '../controller/localidad.controler.js'

import userExtractor from '../middleware/userExtractor.js'

const router = Router();

router.get("/localidad", getLocalidad);
router.get("/localidad/:id", getOneLocalidad);

router.post("/localidad",userExtractor, createLocalidad);

router.put("/localidad/:id",userExtractor, updateLocalidad);

router.delete("/localidad/:id",userExtractor, deleteLocalidad);

export default router;
