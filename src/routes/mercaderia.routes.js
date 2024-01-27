import { Router } from "express";
import { mercaderiaManager } from "../index.js";

import userExtractor, { auth } from "../middleware/userExtractor.js";
import allPermissions from "../config/permissos.js";

const router = Router();

router.get("/mercaderia", userExtractor([allPermissions.mercaderia]), async (req, res) => {
  const { data, error } = await mercaderiaManager.getMercaderia();

  if (error != null) return res.status(404).json(error);

  return res.json(data);
});

router.get("/mercaderia/:mid", userExtractor([allPermissions.mercaderia]), (req, res) => {
  const mid = parseInt(req.params.mid);
  const { data, error } = mercaderiaManager.getOneMercaderia(mid);

  if (error != null) return res.status(404).json(error);

  return res.json(data);
});

router.post("/mercaderia", userExtractor([allPermissions.mercaderia]), async (req, res) => {
  const object = req.body;
  const { data, error } = await mercaderiaManager.createMercaderia(object);

  if (error != null) return res.status(404).json(error);

  return res.json(data);
});

router.post("/mercaderia/list", userExtractor([allPermissions.mercaderia]), async (req, res) => {
  const object = req.body;
  const { data, error } = await mercaderiaManager.postMercaderiaList(object);

  if (error != null) return res.status(404).json(error);

  return res.json(data);
});

router.put("/mercaderia/:id", userExtractor([allPermissions.mercaderia]), async (req, res) => {
  const object = req.body;
  const idMercaderia = req.params.id;
  const { data, error } = await mercaderiaManager.updateMercaderia(
    idMercaderia,
    object
  );

  if (error != null) return res.status(404).json(error);

  return res.json(data);
});

router.delete("/mercaderia/:id", userExtractor([allPermissions.mercaderia]), async (req, res) => {
  const idMercaderia = req.params.id;
  const { data, error } = await mercaderiaManager.deleteMercaderia(
    idMercaderia
  );

  if (error != null) return res.status(500).json(error);

  return res.json(data);
});

export default router;
