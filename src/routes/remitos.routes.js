import { Router } from "express";
import userExtractor from "../middleware/userExtractor.js";
import { remitosManager } from '../index.js'

const router = Router();

router.get("/remito", userExtractor, async (req, res) => {
  const page = parseInt(req.query?.page ?? 0) * 10;

  const { data, error } = await remitosManager.getRemitos(page);

  if (error != null) return res.status(404).json(error);

  return res.json(data);
});

router.get("/remito/:id", userExtractor, async (req, res) => {
  const { id } = req.params;
    
  const resultJson = remitosManager.getOneRemito(id);

  res.json(resultJson);
});

router.post("/remito", userExtractor, async (req, res) => {
  const object = req.body;
  const { data, error } = await remitosManager.newRemito(object);

  if (error != null) return res.status(404).json(error);

  return res.json(data);
});

export default router;
