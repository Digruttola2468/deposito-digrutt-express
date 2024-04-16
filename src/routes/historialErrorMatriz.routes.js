import { Router } from "express";
import userExtractor from "../middleware/userExtractor.js";
import allPermissions from "../config/permissos.js";
import { historialErroresMatrices } from "../services/index.repository.js";
import schemaValidation from "../middleware/schemaValidation.js";
import { schemaPostHistorialErrorMatriz, schemaPutHistorialErrorMatriz } from "../schemas/historialErrorMatriz.schema.js";

const ruta = Router();

const handleReturnErrors = (res, campus, message) => {
  return res
    .status(400)
    .json({ status: "error", errors: [{ campus, message }] });
};

const handleErrors = (e, res) => {
  console.log(e);
  switch (e.code) {
    case "ER_TRUNCATED_WRONG_VALUE_FOR_FIELD":
      if (e.sqlMessage.includes("idMatriz"))
        return handleReturnErrors(res, "idMatriz", "Error tipo de dato");
      if (e.sqlMessage.includes("idCategoria"))
        return handleReturnErrors(res, "idCategoria", "Error tipo de dato");

      break;
    case "ER_NO_REFERENCED_ROW_2":
      if (e.sqlMessage.includes("idMatriz"))
        return handleReturnErrors(res, "idMatriz", "No existe esa matriz");
      if (e.sqlMessage.includes("idCategoria"))
        return handleReturnErrors(
          res,
          "idCategoria",
          "No existe esa categoria"
        );

      break;
    case "ER_DUP_ENTRY":
      if (e.sqlMessage.includes("cliente"))
        return handleReturnErrors(res, "cliente", "Ya existe ese cliente");
      if (e.sqlMessage.includes("codigo"))
        return handleReturnErrors(
          res,
          "codigo",
          "Error al intentar crear cliente"
        );
      break;
    default:
      throw e;
  }
};

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
  schemaValidation(schemaPostHistorialErrorMatriz),
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
        return res.status(404).json({
          status: "error",
          message: "No existe ese Historial De los errores matrices",
        });
    } catch (error) {
      return handleErrors(error, res);
    }
  }
);

ruta.put(
  "/:idHistorial",
  userExtractor([allPermissions.matriceria]),
  schemaValidation(schemaPutHistorialErrorMatriz), 
  async (req, res, next) => {
    const idHistorial = req.params.idHistorial;
    const body = req.body;

    if (body.stringDate != null && body.stringDate != "") {
      const validarDate = new Date(body.stringDate);

      if (Number.isNaN(validarDate.getDate()))
        return res.status(400).json({
          status: "error",
          errors: [{ campus: "fecha", message: "La fecha es invalido" }],
        });
    }

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
        return res.status(404).json({
          status: "error",
          message: "No existe ese Historial De los errores matrices",
        });
    } catch (error) {
      return handleErrors(error, res);
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
        return res.status(404).json({
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
        return res.status(404).json({
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

export default ruta;
