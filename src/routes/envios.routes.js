import { Router } from "express";
import userExtractor from "../middleware/userExtractor.js";
import allPermissions from "../config/permissos.js";
import { envioServer } from "../services/index.repository.js";
import schemaValidation from "../middleware/schemaValidation.js";
import { schemaPostEnvios, schemaPutEnvios } from "../schemas/envios.schema.js";
/**
 *
 */

const handleReturnErrors = (res, campus, message) => {
  return res
    .status(400)
    .json({ status: "error", errors: [{ campus, message }] });
};

const handleErrors = (e, res) => {
  switch (e.code) {
    case "ER_TRUNCATED_WRONG_VALUE_FOR_FIELD":
    case "ER_NO_REFERENCED_ROW_2":
      if (e.sqlMessage.includes("idVehiculo"))
        return handleReturnErrors(res, "idVehiculo", "No existe ese auto");
      if (e.sqlMessage.includes("idLocalidad"))
        return handleReturnErrors(
          res,
          "idLocalidad",
          "No existe esa localidad"
        );
      break;
    case "WARN_DATA_TRUNCATED":
      if (e.sqlMessage.includes("lat"))
        return handleReturnErrors(
          res,
          "lat",
          "Campo lat tiene que ser numerico"
        );
      if (e.sqlMessage.includes("lon"))
        return handleReturnErrors(
          res,
          "lon",
          "Campo lon tiene que ser numerico"
        );

      break;
  }
};

const router = Router();

router.get("/", async (req, res) => {
  try {
    const rows = await envioServer.getEnvios();
    return res.json({ status: "success", data: rows });
  } catch (error) {
    return res
      .status(500)
      .json({ status: "error", message: "Something Wrong" });
  }
});

router.get("/:eid", async (req, res) => {
  try {
    const [rows] = await envioServer.getOneEnvios(req.params.eid);
    return res.json({ status: "success", data: rows[0] });
  } catch (error) {
    return res
      .status(500)
      .json({ status: "error", message: "Something Wrong" });
  }
});

router.post(
  "/",
  userExtractor([allPermissions.envios]),
  schemaValidation(schemaPostEnvios),
  async (req, res) => {
    const body = req.body;
    try {
      const [result] = await envioServer.newEnvio(body);
      if (result.affectedRows >= 1) {
        const [rows] = await envioServer.getOneEnvios(result.insertId);

        return res.json({ status: "success", data: rows[0] });
      } else
        return res
          .status(404)
          .json({ status: "error", message: "No existe ese Envio" });
    } catch (error) {
      return handleErrors(error, res);
    }
  }
);

router.put(
  "/:eid",
  userExtractor([allPermissions.envios]),
  schemaValidation(schemaPutEnvios),
  async (req, res, next) => {
    const idEnvio = req.params.eid;
    try {
      const [result] = await envioServer.updateEnvios(idEnvio, req.body);
      if (result.affectedRows >= 1) {
        const [rows] = await envioServer.getOneEnvios(idEnvio);

        return res.json({ status: "success", data: rows[0] });
      } else
        return res
          .status(404)
          .json({ status: "error", message: "No existe ese Envio" });
    } catch (error) {
      return handleErrors(error, res);
    }
  }
);

router.delete(
  "/:eid",
  userExtractor([allPermissions.envios]),
  async (req, res) => {
    try {
      const [result] = await envioServer.deleteEnvios(req.params.eid);
      if (result.affectedRows >= 1)
        return res.json({
          status: "success",
          message: "Se elimino correctamente",
        });
      else
        return res
          .status(404)
          .json({ status: "error", message: "No existe ese envio" });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ status: "error", message: "Something Wrong" });
    }
  }
);

export default router;
