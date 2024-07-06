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


/**
 * @swagger
 * components:
 *  schemas:
 *    Produccion:
 *      type: object
 *      properties:
 *        fecha:
 *          type: date
 *          description: fecha operacion control produccion
 *        numMaquina:
 *          type: integer
 *          description: numero de maquina del control establecido
 *        golpesReales:
 *          type: integer
 *          description: cuantos golpes conto la maquina
 *        piezasProducidas:
 *          type: integer
 *          description: cuantas piezas producidas hubo en base a los golpesReales * piezaxgolpe
 *        promGolpesHora:
 *          type: integer
 *          description: promedio de golpesReales/24
 *        idMatriz:
 *          type: integer
 *          description: que matriz estuvo inyectando
 *        idTurno:
 *          type: integer
 *          description: en que turno se obtuvo dicha operacion
 *      required:
 *        - fecha
 *        - idMatriz
 *        - numMaquina
 *        - golpesReales
 *        - piezasProducidas
 *        - promGolpesHora
 *        - idTurno
 *      example:
 *        fecha: 2024-04-14
 *        numMaquina: 2
 *        golpesReales: 350
 *        piezasProducidas: 350
 *        promGolpesHora: 20
 *        idMatriz: 1
 *        idTurno: 1
 */

/**
 * @swagger
 * /api/producion:
 *  get:
 *    summary: devolver todos los de produccion
 *    tags: [Produccion]
 *    security:
 *      - cookieAuth: []
 *    responses:
 *      200:
 *        description: todos los datos de produccion
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Produccion'
 *
 */
ruta.get(
  "/",
  userExtractor([allPermissions.produccion]),
  async (req, res) => {
    try {
      const rows = await produccionServer.getProduccion();
      return res.json({ status: "success", data: rows });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ status: "error", message: "Something Wrong" });
    }
  }
);

/**
 * @swagger
 * /api/producion/{idProduccion}:
 *  get:
 *    summary: devolver una produccion
 *    tags: [Produccion]
 *    parameters:
 *      - in: path
 *        name: idProduccion
 *        schema:
 *          type: integer
 *        required: true
 *        description: Valor unico de la lista de todos los datos de produccion
 *    security:
 *      - bearerAuth: []
 *    responses:
 *      200:
 *        description: todos los datos de produccion
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Produccion'
 *      404:
 *        description: No existe esa produccion
 */
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

/**
 * @swagger
 * /api/producion/maquina/{numMaquina}:
 *  get:
 *    summary: devolver lista produccion de una maquina
 *    tags: [Produccion]
 *    parameters:
 *      - in: path
 *        name: numMaquina
 *        schema:
 *          type: integer
 *        required: true
 *        description: Numero de la maquina a consultar
 *    security:
 *      - bearerAuth: []
 *    responses:
 *      200:
 *        description: todos los datos de produccion
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Produccion'
 *      404:
 *        description: No existe esa produccion
 */
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

/**
 * @swagger
 * /api/producion:
 *  post:
 *    summary: creamos una nueva produccion
 *    tags: [Produccion]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            $ref: '#/components/schemas/Produccion'
 *    security:
 *      - bearerAuth: []
 *    responses:
 *      200:
 *        description: Se creo correctamente!
 */
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

/**
 * @swagger
 * /api/producion/list:
 *  post:
 *    summary: creamos una lista de nuevos datos de produccion
 *    tags: [Produccion]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            $ref: '#/components/schemas/Produccion'
 *    security:
 *      - bearerAuth: []
 *    responses:
 *      200:
 *        description: Se creo correctamente!
 */
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

/**
 * @swagger
 * /api/producion/{idProduccion}:
 *  put:
 *    type: http,
 *    scheme: bearer,
 *    bearerFormat: JWT,
 *    summary: actualizar datos de una produccion
 *    tags: [Produccion]
 *    parameters:
 *      - in: path
 *        name: idProduccion
 *        schema:
 *          type: integer
 *        required: true
 *        description: Valor unico de la lista de produccion
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            $ref: '#/components/schemas/Produccion'
 *    security:
 *      - bearerAuth: []
 *    responses:
 *      200:
 *        description: el dato actualizado
 *      404:
 *        description: No existe esa produccion
 */
ruta.put(
  "/:idProduccion",
  userExtractor([allPermissions.produccion]),
  schemaValidation(schemaPutProduccion),
  async (req, res) => {
    const idProduccion = req.params.idProduccion;
    const body = req.body;

    if (body.fecha != null && body.fecha != "") {
      const validarDate = new Date(body.fecha);

      if (Number.isNaN(validarDate.getDate()))
        return res.status(400).json({
          status: "error",
          errors: [{ campus: "fecha", message: "La fecha es invalido" }],
        });
    }

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

/**
 * @swagger
 * /api/producion/{idProduccion}:
 *  delete:
 *    summary: eliminar una produccion
 *    tags: [Produccion]
 *    parameters:
 *      - in: path
 *        name: idProduccion
 *        schema:
 *          type: integer
 *        required: true
 *        description: Valor unico de la lista de produccion
 *    security:
 *      - bearerAuth: []
 *    responses:
 *      200:
 *        description: Eliminado correctamente
 *      404:
 *        description: No existe esa produccion
 */
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
