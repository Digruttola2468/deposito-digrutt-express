import { Router } from "express";
import { producionManager } from "../index.js";
import userExtractor from "../middleware/userExtractor.js";

const ruta = Router();

ruta.get("/producion", userExtractor, async (req, res) => {
  const { data, error } = await producionManager.getProduccion();

  if (error != null) return res.status(404).json(error);

  return res.json(data);
});

ruta.post("/producion", userExtractor, async (req, res) => {
  const object = req.body;
  const { data, error } = await producionManager.postProducion(object);

  if (error != null) return res.status(404).json(error);

  return res.json(data);
});

export default ruta;
