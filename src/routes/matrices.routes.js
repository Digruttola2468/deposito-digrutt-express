import { Router } from "express";
import { matricesManager } from "../index.js";
import userExtractor, { auth } from "../middleware/userExtractor.js";
import allPermissions from "../config/permissos.js";

const ruta = Router();

ruta.get(
  "/",
  userExtractor([allPermissions.produccion, allPermissions.matriceria]),
  async (req, res) => {
    const { data, error } = await matricesManager.getMatrices();

    if (error != null) return res.status(404).json(error);

    return res.json(data);
  }
);

ruta.post(
  "/",
  userExtractor([allPermissions.produccion, allPermissions.matriceria]),
  async (req, res, next) => {
    const object = req.body;
    try {
      const { data, error } = await matricesManager.postMatriz(object);
      if (error != null) return res.status(404).json(error);

      return res.json(data);
    } catch (error) {
      next(error);
    }
  }
);

ruta.put(
  "/:idMatriz",
  userExtractor([allPermissions.produccion, allPermissions.matriceria]),
  async (req, res, next) => {
    const idMatriz = req.params.idMatriz;
    const body = req.body;
    try {
      const { data, error } = await matricesManager.updateMatriz(
        idMatriz,
        body
      );

      if (error != null) return res.status(404).json(error);

      return res.json(data);
    } catch (error) {
      next(error);
    }
  }
);

ruta.delete(
  "/:idMatriz",
  userExtractor([allPermissions.produccion, allPermissions.matriceria]),
  async (req, res, next) => {
    const idMatriz = req.params.idMatriz;
    try {
      const { data, error } = await matricesManager.deleteMatriz(idMatriz);

      if (error != null) return res.status(404).json(error);

      return res.json(data);
    } catch (error) {
      next(error);
    }
  }
);

export default ruta;
