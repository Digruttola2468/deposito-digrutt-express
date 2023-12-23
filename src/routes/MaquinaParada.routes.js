import { Router } from "express";
import userExtractor from "../middleware/userExtractor.js";
import { maquinaParadaManager } from "../index.js";

const ruta = Router();

ruta.get("/maquinaParada", userExtractor, async (req, res) => {
  const { data, error } = await maquinaParadaManager.getMaquinaParada();

  if (error != null) return res.status(404).json(error);

  return res.json(data);
});

ruta.post("/maquinaParada", userExtractor, async (req, res) => {
  const body = req.body;
  const { data, error } = await maquinaParadaManager.postProducion(body);
  if (error != null) return res.status(404).json(error);

  return res.json(data);
});

ruta.delete("/maquinaParada/:idMaquina", userExtractor, async (req, res) => {
  const idMaquina = req.params.idMaquina;
  const { data, error } = await maquinaParadaManager.deleteMaquinaParada(
    idMaquina
  );

  if (error != null) return res.status(404).json(error);

  return res.json(data);
});

export default ruta;