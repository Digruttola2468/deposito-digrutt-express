import { Router } from "express";
import userExtractor from "../middleware/userExtractor.js";
import allPermissions from "../config/permissos.js";
import { matriceServer } from "../services/index.repository.js";
import schemaValidation from "../middleware/schemaValidation.js";
import {
  schemaPostMatriz,
  schemaPutMatriz,
} from "../schemas/matrices.schema.js";

const ruta = Router();

const handleReturnErrors = (res, campus, message) => {
  return res.status(400).json({ status: "error", errors: [{ campus, message }] });
};

const handleErrors = (e, res) => {
  switch (e.code) {
    case "ER_TRUNCATED_WRONG_VALUE_FOR_FIELD":
    case "ER_NO_REFERENCED_ROW_2":
      if (e.sqlMessage.includes("idmaterial"))
        handleReturnErrors(res, "idmaterial", "No existe ese material");
      if (e.sqlMessage.includes("idcliente"))
        handleReturnErrors(res, "idcliente", "No existe ese cliente");
      break;
    case "ER_DUP_ENTRY":
      if (e.sqlMessage.includes("cod_matriz"))
        handleReturnErrors(res, "cod_matriz", "Ya existe esa matriz");
      break;
  }
};

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
  schemaValidation(schemaPostMatriz),
  async (req, res, next) => {
    const object = req.body;
    try {
      const resultData = await matriceServer.newMatriz(object);
      return res.json({
        status: "success",
        data: resultData,
      });
    } catch (error) {
      return handleErrors(error,res);
    }
  }
);

ruta.put(
  "/:idMatriz",
  userExtractor([allPermissions.produccion, allPermissions.matriceria]),
  schemaValidation(schemaPutMatriz),
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
      return handleErrors(error);
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
