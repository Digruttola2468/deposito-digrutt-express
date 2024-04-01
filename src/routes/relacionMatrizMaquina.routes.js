import { Router } from "express";
import userExtractor from "../middleware/userExtractor.js";
import allPermissions from "../config/permissos.js";
import { relacionMaqMatzServer } from "../services/index.repository.js";

const ruta = Router();

ruta.get(
  "/",
  userExtractor([allPermissions.matriceria, allPermissions.produccion]),
  async (req, res) => {
    try {
      const [rows] = await relacionMaqMatzServer.getAll();
      return res.json({ status: "success", data: rows });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ status: "error", message: "Something Wrong" });
    }
  }
);

ruta.get(
  "/matriz/:idMaquina",
  userExtractor([allPermissions.matriceria, allPermissions.produccion]),
  async (req, res) => {
    try {
      const [rows] = await relacionMaqMatzServer.getListMatrizByMaquina(
        req.params.idMaquina
      );
      return res.json({ status: "success", data: rows[0] });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ status: "error", message: "Something Wrong" });
    }
  }
);

ruta.get(
  "/maquina/:idMatriz",
  userExtractor([allPermissions.matriceria, allPermissions.produccion]),
  async (req, res) => {
    try {
      const [rows] = await relacionMaqMatzServer.getListMaquinaByMatriz(
        req.params.idMatriz
      );
      return res.json({ status: "success", data: rows[0] });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ status: "error", message: "Something Wrong" });
    }
  }
);

export default ruta;
