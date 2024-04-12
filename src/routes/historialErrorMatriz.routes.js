import { Router } from "express";
import userExtractor from "../middleware/userExtractor.js";
import allPermissions from "../config/permissos.js";
import { historialErroresMatrices } from "../services/index.repository.js";

const ruta = Router();

ruta.get(
  "/",
  userExtractor([allPermissions.matriceria, allPermissions.produccion]),
  async (req, res) => {
    try {
      const rows = await historialErroresMatrices.getHistorial();
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
  "/:idHistorial",
  userExtractor([allPermissions.matriceria, allPermissions.produccion]),
  async (req, res) => {
    try {
      const [rows] = await historialErroresMatrices.getOneHistorial(
        req.params.idHistorial
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
  "/:idMatriz/listIdMatriz",
  userExtractor([allPermissions.matriceria, allPermissions.produccion]),
  async (req, res) => {
    const idMatriz = req.params.idMatriz;
    try {
      const [rows] = await historialErroresMatrices.getByIdMatriz(idMatriz);
      return res.json({ status: "success", data: rows });
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
  userExtractor([allPermissions.matriceria, allPermissions.produccion]),
  async (req, res, next) => {
    const object = req.body;
    try {
      const [result] = await historialErroresMatrices.newHistorial(object);
      if (result.affectedRows >= 1) {
        const [rows] = await historialErroresMatrices.getOneHistorial(
          result.insertId
        );

        return res.json({ status: "success", data: rows[0] });
      } else
        return res
          .status(404)
          .json({
            status: "error",
            message: "No existe ese Historial De los errores matrices",
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
  "/:idHistorial",
  userExtractor([allPermissions.matriceria]),
  async (req, res, next) => {
    const idHistorial = req.params.idHistorial;
    const body = req.body;
    try {
      const [result] = await historialErroresMatrices.updateHistorial(
        idHistorial,
        body
      );

      if (result.affectedRows >= 1) {
        const [rows] = await historialErroresMatrices.getOneHistorial(
          idHistorial
        );

        return res.json({ status: "success", data: rows[0] });
      } else
        return res
          .status(404)
          .json({
            status: "error",
            message: "No existe ese Historial De los errores matrices",
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
  "/:idHistorial/:solved",
  userExtractor([allPermissions.matriceria]),
  async (req, res, next) => {
    const idHistorial = req.params.idHistorial;
    const isSolved = req.params.solved;
    try {
      const [result] = await historialErroresMatrices.updateMatrizTerminado(
        idHistorial,
        isSolved
      );

      if (result.affectedRows >= 1) {
        const [rows] = await historialErroresMatrices.getOneHistorial(
          idHistorial
        );

        return res.json({ status: "success", data: rows[0] });
      } else
        return res
          .status(404)
          .json({ status: "error", message: "No existe ese Historial De los errores matrices" });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ status: "error", message: "Something Wrong" });
    }
  }
);

ruta.delete(
  "/:idHistorial",
  userExtractor([allPermissions.matriceria]),
  async (req, res, next) => {
    try {
      const [result] = await historialErroresMatrices.deleteHistorial(
        req.params.idHistorial
      );
      if (result.affectedRows >= 1)
        return res.json({
          status: "success",
          message: "Se elimino correctamente",
        });
      else
        return res
          .status(404)
          .json({ status: "error", message: "No existe ese Historial De los errores matrices" });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ status: "error", message: "Something Wrong" });
    }
  }
);

export default ruta;
