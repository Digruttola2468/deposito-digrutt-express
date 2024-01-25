import { Router } from "express";
import { producionManager } from "../index.js";
import userExtractor, { auth } from "../middleware/userExtractor.js";
import allPermissions from "../config/permissos.js";

const ruta = Router();

ruta.get(
  "/producion",
  userExtractor([allPermissions.produccion]),
  async (req, res) => {
    const { data, error } = await producionManager.getProduccion();

    if (error != null) return res.status(404).json(error);

    return res.json(data);
  }
);

ruta.get(
  "/producion/:numMaquina",
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
  "/producion",
  userExtractor([allPermissions.produccion]),
  async (req, res) => {
    const object = req.body;
    const { data, error } = await producionManager.postProducion(object);

    if (error != null) return res.status(404).json(error);

    return res.json(data);
  }
);

ruta.post(
  "/producion/list",
  userExtractor([allPermissions.produccion]),
  async (req, res) => {
    const object = req.body;
    const { data, error } = await producionManager.postListProduccion(object);

    if (error != null) return res.status(404).json(error);

    return res.json(data);
  }
);

ruta.put(
  "/producion/:idProduccion",
  userExtractor([allPermissions.produccion]),
  async (req, res) => {
    const idProduccion = req.params.idProduccion;
    const body = req.body;

    const { data, error } = await producionManager.updateProduccion(
      idProduccion,
      body
    );

    if (error != null) return res.status(404).json(error);

    return res.json(data);
  }
);

ruta.delete(
  "/producion/:idProduccion",
  userExtractor([allPermissions.produccion]),
  async (req, res) => {
    const idProduccion = req.params.idProduccion;

    const { data, error } = await producionManager.deleteProduccion(
      idProduccion
    );

    if (error != null) return res.status(404).json(error);

    return res.json(data);
  }
);

export default ruta;
