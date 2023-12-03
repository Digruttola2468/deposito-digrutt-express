import { Router } from "express";
import { mercaderiaManager } from "../index.js";

import userExtractor from "../middleware/userExtractor.js";

const router = Router();

router.get("/mercaderia", userExtractor, async (req, res) => {
  const page = parseInt(req.query?.page ?? 0) * 10;
  const { data, error } = await mercaderiaManager.getMercaderia(page);

  if (error != null) return res.status(404).json(error);

  return res.json(data);
});

router.get("/mercaderia/:mid", userExtractor, (req, res) => {
  const mid = parseInt(req.params.mid);
  const { data, error } = mercaderiaManager.getOneMercaderia(mid);

  if (error != null) return res.status(404).json(error);

  return res.json(data);
});

router.post("/mercaderia", userExtractor, async (req, res) => {
  const object = req.body;
  const { data, error } = await mercaderiaManager.createMercaderia(object);

  if (error != null) return res.status(404).json(error);

  return res.json(data);
});

router.post("/mercaderia/list", userExtractor, async (req, res) => {
  const object = req.body;
  const { data, error } = await mercaderiaManager.postMercaderiaList(object);

  if (error != null) return res.status(404).json(error);

  return res.json(data);
});

router.put("/mercaderia/:id", userExtractor, async (req, res) => {
  const object = req.body;
  const idMercaderia = req.params.id;
  const { data, error } = await mercaderiaManager.updateMercaderia(
    idMercaderia,
    object
  );

  if (error != null) return res.status(404).json(error);

  return res.json(data);
});

router.delete("/mercaderia/:id", userExtractor, async (req, res) => {
  const idMercaderia = req.params.id;
  const { data, error } = await mercaderiaManager.deleteMercaderia(
    idMercaderia
  );

  if (error != null) return res.status(500).json(error);

  return res.json(data);
});

export default router;
