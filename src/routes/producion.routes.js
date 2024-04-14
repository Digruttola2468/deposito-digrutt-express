import { Router } from "express";
import userExtractor from "../middleware/userExtractor.js";
import allPermissions from "../config/permissos.js";
import { produccionServer } from "../services/index.repository.js";
import schemaValidation, {
  schemaListValidation,
} from "../middleware/schemaValidation.js";
import {
  schemaListPostProduccion,
  schemaPostProduccion,
  schemaPutProduccion,
} from "../schemas/produccion.schema.js";

const ruta = Router();

const handleReturnErrors = (res, campus, message) => {
  return res
    .status(400)
    .json({ status: "error", errors: [{ campus, message }] });
};

const handleErrors = (e, res) => {
  switch (e.code) {
    case "ER_TRUNCATED_WRONG_VALUE_FOR_FIELD":
    case "ER_NO_REFERENCED_ROW_2":
      if (e.sqlMessage.includes("fk_idNumMaquina_producion"))
        handleReturnErrors(res, "numMaquina", "No existe esa maquina");

      if (e.sqlMessage.includes("idMatriz"))
        handleReturnErrors(res, "idMatriz", "No existe esa matriz");
      break;

    case "WARN_DATA_TRUNCATED":
      if (e.sqlMessage.includes("prom_golpeshora"))
        handleReturnErrors(
          res,
          "promGolpeshora",
          "Promedio Golpes hora no es numerico"
        );
      break;
  }
};

ruta.get("/", userExtractor([allPermissions.produccion]), async (req, res) => {
  try {
    const rows = await produccionServer.getProduccion();
    return res.json({ status: "success", data: rows });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: "error", message: "Something Wrong" });
  }
});

ruta.get(
  "/:idProduccion",
  userExtractor([allPermissions.produccion]),
  async (req, res) => {
    try {
      const [rows] = await produccionServer.getOneProduccion(
        req.params.idProduccion
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
  "/maquina/:numMaquina",
  userExtractor([allPermissions.produccion]),
  async (req, res) => {
    const numMaquina = req.params.numMaquina;
    const init = req.query.init;
    const end = req.query.end;

    try {
      const result = await produccionServer.getRangeDateByMaquina(
        numMaquina,
        init,
        end
      );
      return res.json({ status: "success", data: result });
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
  userExtractor([allPermissions.produccion]),
  schemaValidation(schemaPostProduccion),
  async (req, res, next) => {
    const object = req.body;

    const validarDate = new Date(object.fecha);

    if (Number.isNaN(validarDate.getDate()))
      return res.status(400).json({
        status: "error",
        errors: [{ campus: "fecha", message: "La fecha es invalido" }],
      });

    try {
      const [result] = await produccionServer.newOneProduccion(object);
      return res.json({
        status: "success",
        data: { id: result.insertId, ...object },
      });
    } catch (error) {
      console.log(error);
      handleErrors(error, res);
    }
  }
);

ruta.post(
  "/list",
  userExtractor([allPermissions.produccion]),
  schemaListValidation(schemaListPostProduccion),
  async (req, res, next) => {
    const list = req.body;

    const listErrors = [];
    for (let i = 0; i < list.length; i++) {
      const element = list[i];
      const validarDate = new Date(element.fecha);

      if (Number.isNaN(validarDate.getDate()))
        listErrors.push({
          index: i,
          campus: "fecha",
          message: `La fecha es invalido`,
        });
    }

    if (listErrors.length != 0)
      return res.status(400).json({ status: "error", errors: listErrors });

    try {
      const result = await produccionServer.newListProduccion(list);

      return res.json({ status: "success", data: result });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ status: "error", message: "Something Wrong" });
    }
  }
);

ruta.put(
  "/:idProduccion",
  userExtractor([allPermissions.produccion]),
  schemaValidation(schemaPutProduccion),
  async (req, res) => {
    const idProduccion = req.params.idProduccion;
    const body = req.body;

    const validarDate = new Date(body.fecha);

    if (Number.isNaN(validarDate.getDate()))
      return res.status(400).json({
        status: "error",
        errors: [{ campus: "fecha", message: "La fecha es invalido" }],
      });

    try {
      const [result] = await produccionServer.updateProduccion(
        idProduccion,
        body
      );

      if (result.affectedRows >= 1) {
        const [rows] = await produccionServer.getOneProduccion(idProduccion);

        return res.json({ status: "success", data: rows[0] });
      } else
        return res
          .status(404)
          .json({ status: "error", message: "No existe esa produccion" });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ status: "error", message: "Something Wrong" });
    }
  }
);

ruta.delete(
  "/:idProduccion",
  userExtractor([allPermissions.produccion]),
  async (req, res, next) => {
    try {
      const [result] = await produccionServer.deleteProduccion(
        req.params.idProduccion
      );
      if (result.affectedRows >= 1)
        return res.json({
          status: "success",
          message: "Se elimino correctamente",
        });
      else
        return res
          .status(404)
          .json({ status: "error", message: "No existe esa Produccion" });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ status: "error", message: "Something Wrong" });
    }
  }
);

export default ruta;
