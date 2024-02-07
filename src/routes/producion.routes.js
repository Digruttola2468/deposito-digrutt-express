import { Router } from "express";
import { producionManager } from "../index.js";
import userExtractor from "../middleware/userExtractor.js";
import allPermissions from "../config/permissos.js";

const ruta = Router();

ruta.get("/", userExtractor([allPermissions.produccion]), async (req, res) => {
  const { data, error } = await producionManager.getProduccion();

  if (error != null) return res.status(404).json(error);

  return res.json(data);
});

ruta.get(
  "/:numMaquina",
  userExtractor([allPermissions.produccion]),
  async (req, res) => {
    const numMaquina = req.params.numMaquina;
    const init = req.query.init;
    const end = req.query.end;

    const result = producionManager.getRangeDateByNumMaquina(
      numMaquina,
      init,
      end
    );

    return res.json(result);
  }
);

ruta.post(
  "/",
  userExtractor([allPermissions.produccion]),
  async (req, res, next) => {
    const object = req.body;
    try {
      const { data, error } = await producionManager.postProducion(object, true);

      if (error != null) return res.status(404).json(error);

      return res.json(data);
    } catch (error) {
      next(error);
    }
  }
);

ruta.post(
  "/list",
  userExtractor([allPermissions.produccion]),
  async (req, res, next) => {
    const object = req.body;
    try {
      const { data, error } = await producionManager.postListProduccion(object);

      if (error != null) return res.status(404).json(error);

      return res.json(data);
    } catch (error) {
      next(error);
    }
  }
);

ruta.put(
  "/:idProduccion",
  userExtractor([allPermissions.produccion]),
  async (req, res, next) => {
    const idProduccion = req.params.idProduccion;
    const body = req.body;

    try {
      const { data, error } = await producionManager.updateProduccion(
        idProduccion,
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
  "/:idProduccion",
  userExtractor([allPermissions.produccion]),
  async (req, res, next) => {
    const idProduccion = req.params.idProduccion;

    try {
      const { data, error } = await producionManager.deleteProduccion(
        idProduccion
      );

      if (error != null) return res.status(404).json(error);

      return res.json(data);
    } catch (error) {
      next(error);
    }
  }
);

export default ruta;
