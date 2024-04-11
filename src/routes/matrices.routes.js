import { Router } from "express";
import userExtractor from "../middleware/userExtractor.js";
import allPermissions from "../config/permissos.js";
import { matriceServer } from "../services/index.repository.js";

const ruta = Router();

ruta.get(
  "/",
  userExtractor([allPermissions.produccion, allPermissions.matriceria]),
  async (req, res) => {
    try {
      const rows = await matriceServer.getMatrices();
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
  "/:mid",
  userExtractor([allPermissions.produccion, allPermissions.matriceria]),
  async (req, res) => {
    try {
      const [rows] = await matriceServer.getOneMatriz(req.params.mid);
      return res.json({ status: "success", data: rows[0] });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ status: "error", message: "Something Wrong" });
    }
  }
);

ruta.post(
  "/",
  userExtractor([allPermissions.produccion, allPermissions.matriceria]),
  async (req, res, next) => {
    const object = req.body;
    try {
      const resultData = await matriceServer.newMatriz(object);
      return res.json({
        status: "success",
        data: resultData,
      });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ status: "error", message: "Something Wrong" });
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
      const [result] = await matriceServer.updateMatriz(idMatriz, body);

      if (result.affectedRows >= 1) {
        const [rows] = await matriceServer.getOneMatriz(idMatriz);

        return res.json({ status: "success", data: rows[0] });
      } else
        return res
          .status(404)
          .json({ status: "error", message: "No existe esa Matriz" });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ status: "error", message: "Something Wrong" });
    }
  }
);

ruta.delete(
  "/:idMatriz",
  userExtractor([allPermissions.produccion, allPermissions.matriceria]),
  async (req, res, next) => {
    const idMatriz = req.params.idMatriz;
    try {
      const [result] = await matriceServer.delete(idMatriz);
      if (result.affectedRows >= 1)
        return res.json({
          status: "success",
          message: "Se elimino correctamente",
        });
      else
        return res
          .status(404)
          .json({ status: "error", message: "No existe esa Matriz" });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ status: "error", message: "Something Wrong" });
    }
  }
);

export default ruta;
