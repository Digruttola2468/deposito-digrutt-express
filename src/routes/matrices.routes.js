import { Router } from "express";
import { matricesManager } from "../index.js";
import userExtractor, { auth } from "../middleware/userExtractor.js";
import allPermissions from "../config/permissos.js";

const ruta = Router();

ruta.get("/matrices",auth, userExtractor(allPermissions.produccion, allPermissions.matriceria), async (req, res) => {
  const { data, error } = await matricesManager.getMatrices();

  if (error != null) return res.status(404).json(error);

  return res.json(data);
});

ruta.post("/matrices",auth, userExtractor(allPermissions.produccion, allPermissions.matriceria), async (req, res) => {
  const object = req.body;
  const { data, error } = await matricesManager.postMatriz(object);
  if (error != null) return res.status(404).json(error);

  return res.json(data);
});
  
ruta.put("/matriz/:idMatriz",auth, userExtractor(allPermissions.produccion, allPermissions.matriceria), async (req, res) => {
  const idMatriz = req.params.idMatriz;
  const body = req.body;
  const { data, error } = await matricesManager.updateMatriz(idMatriz, body);

  if (error != null) return res.status(404).json(error);

  return res.json(data);
});

ruta.delete('/matriz/:idMatriz',auth, userExtractor(allPermissions.produccion, allPermissions.matriceria), async (req,res) => {
  const idMatriz = req.params.idMatriz;
  const { data, error } = await matricesManager.deleteMatriz(idMatriz);

  if (error != null) return res.status(404).json(error);

  return res.json(data);
})

export default ruta;
