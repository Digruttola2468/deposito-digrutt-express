import { Router } from "express";
import { producionManager } from "../index.js";
import userExtractor from "../middleware/userExtractor.js";

const ruta = Router();

ruta.get("/producion", userExtractor, async (req, res) => {
  const { data, error } = await producionManager.getProduccion();

  if (error != null) return res.status(404).json(error);

  return res.json(data);
});

ruta.get('/producion/:numMaquina', async (req,res) => {
  const numMaquina = req.params.numMaquina;
  const init = req.query.init;
  const end = req.query.end;

  const result = producionManager.getRangeDateByNumMaquina(numMaquina,init,end)

  return res.json(result)
})

ruta.post("/producion", userExtractor, async (req, res) => {
  const object = req.body;
  const { data, error } = await producionManager.postProducion(object);

  if (error != null) return res.status(404).json(error);

  return res.json(data);
});

ruta.post("/producion/list", userExtractor, async (req, res) => {
  const object = req.body;
  const { data, error } = await producionManager.postListProduccion(object);

  if (error != null) return res.status(404).json(error);

  return res.json(data);
});

export default ruta;
