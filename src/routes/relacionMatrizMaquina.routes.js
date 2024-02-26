import { Router } from "express";
import { relacionMaquinaMatriz } from "../index.js";
import userExtractor from "../middleware/userExtractor.js";
import allPermissions from "../config/permissos.js";

const ruta = Router();

ruta.get(
  "/",
  userExtractor([allPermissions.matriceria, allPermissions.produccion]),
  async (req, res) => {
    const { data, error } = await relacionMaquinaMatriz.getAll();

    if (error != null) return res.status(404).json(error);

    return res.json(data);
  }
);

ruta.get(
  "/matriz/:idMaquina",
  userExtractor([allPermissions.matriceria, allPermissions.produccion]),
  async (req, res) => {
    const idMaquina = req.params.idMaquina;
    const { data, error } = await relacionMaquinaMatriz.getMatrizByIdMaquina(
      idMaquina
    );

    if (error != null) return res.status(404).json(error);

    return res.json(data);
  }
);

ruta.get(
  "/maquina/:idMatriz",
  userExtractor([allPermissions.matriceria, allPermissions.produccion]),
  async (req, res) => {
    const idMatriz = req.params.idMaquina;
    const { data, error } =
      await relacionMaquinaMatriz.getListMaquinaByIdMatriz(idMatriz);

    if (error != null) return res.status(404).json(error);

    return res.json(data);
  }
);

export default ruta;
