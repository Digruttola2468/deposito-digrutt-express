import { Router } from "express";
import { historialErrorMatrizManager } from "../index.js";
import userExtractor from "../middleware/userExtractor.js";
import allPermissions from "../config/permissos.js";

const ruta = Router();

ruta.get(
  "/",
  userExtractor([allPermissions.matriceria, allPermissions.produccion]),
  async (req, res) => {
    const solved = req.query?.solved;

    if (solved >= 1)
      return res.json(historialErrorMatrizManager.getIsSolvedTrue());
    else if (solved <= 0)
      return res.json(historialErrorMatrizManager.getIsSolvedFalse());
    else {
      const { data, error } = await historialErrorMatrizManager.getHistorial();

      if (error) return res.status(404).json(error);

      return res.json(data);
    }
  }
);

ruta.get(
  "/:idHistorial",
  userExtractor([allPermissions.matriceria, allPermissions.produccion]),
  (req, res) => {
    const idHistorial = req.params.idHistorial;
    const result = historialErrorMatrizManager.getOne(idHistorial);

    return res.json(result);
  }
);

ruta.get(
  "/:idMatriz/listIdMatriz",
  userExtractor([allPermissions.matriceria, allPermissions.produccion]),
  (req, res) => {
    const idMatriz = req.params.idMatriz;
    const result = historialErrorMatrizManager.getListByIdMatriz(idMatriz);

    return res.json(result);
  }
);

ruta.post(
  "/",
  userExtractor([allPermissions.matriceria, allPermissions.produccion]),
  async (req, res, next) => {
    const object = req.body;
    try {
      const { data, error } =
        await historialErrorMatrizManager.postHistorialMatriz(object);
      if (error) return res.status(404).json(error);

      return res.json(data);
    } catch (error) {
      next(error);
    }
  }
);

ruta.put(
  "/:idHistorial",
  userExtractor([allPermissions.matriceria]),
  async (req, res, next) => {
    const idHistorial = req.params.idHistorial;
    const body = req.body;
    try {
      const { data, error } =
        await historialErrorMatrizManager.updateHistorialMatriz(
          idHistorial,
          body
        );
      if (error) return res.status(404).json(error);

      return res.json(data);
    } catch (error) {
      next(error);
    }
  }
);

ruta.put(
  "/:idHistorial/:solved",
  userExtractor([allPermissions.matriceria]),
  async (req, res, next) => {
    const idHistorial = req.params.idHistorial;
    const isSolved = req.params.solved;
    try {
      const { data, error } = await historialErrorMatrizManager.updateIsSolved(
        idHistorial,
        isSolved
      );
      if (error) return res.status(404).json(error);

      return res.json(data);
    } catch (error) {
      next(error);
    }
  }
);

ruta.delete(
  "/:idHistorial",
  userExtractor([allPermissions.matriceria]),
  async (req, res, next) => {
    const idHistorial = req.params.idHistorial;
    try {
      const { data, error } =
        await historialErrorMatrizManager.deleteHistorialMatriz(idHistorial);

      if (error) return res.status(500).json(error);

      return res.json(data);
    } catch (error) {
      next(error);
    }
  }
);

export default ruta;
