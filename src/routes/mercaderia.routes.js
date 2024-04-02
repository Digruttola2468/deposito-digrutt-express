import { Router } from "express";

import userExtractor from "../middleware/userExtractor.js";
import allPermissions from "../config/permissos.js";
import { mercaderiaServer } from "../services/index.repository.js";
import schemaValidation from "../middleware/schemaValidation.js";
import {
  schemaPostListMercaderia,
  schemaPostMercaderiaEntrada,
  schemaPostMercaderiaSalida,
  schemaPutMercaderia,
} from "../schemas/mercaderia.schema.js";

const router = Router();

router.get(
  "/",
  userExtractor([allPermissions.mercaderia]),
  async (req, res) => {
    try {
      const rows = await mercaderiaServer.getMercaderia();
      return res.json({ status: "success", data: rows });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ status: "error", message: "Something Wrong" });
    }
  }
);

router.get(
  "/:mid",
  userExtractor([allPermissions.mercaderia]),
  async (req, res) => {
    const mid = parseInt(req.params.mid);
    try {
      const [rows] = await mercaderiaServer.getOneMercaderia(mid);
      return res.json({ status: "success", data: rows[0] });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ status: "error", message: "Something Wrong" });
    }
  }
);

router.post(
  "/",
  userExtractor([allPermissions.mercaderia]),
  schemaValidation(schemaPostMercaderiaEntrada),
  async (req, res, next) => {
    const object = req.body;
    try {
      const data = await mercaderiaServer.createMercaderia(object);

      return res.json({ status: "success", data });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ status: "error", message: "Something Wrong" });
    }
  }
);

router.post(
  "/salida",
  userExtractor([allPermissions.mercaderia]),
  schemaValidation(schemaPostMercaderiaSalida),
  async (req, res, next) => {
    const { fecha, stock, idinventario, observacion } = req.body;
    if (observacion == null || observacion == "")
      return res.status(400).json({
        status: "error",
        message: "Campo observacion vacio",
        campus: "observacion",
      });

    try {
      const data = await mercaderiaServer.createMercaderia({
        fecha,
        stock,
        idinventario,
        idcategoria: "1",
        observacion,
      });

      return res.json({ status: "success", data });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ status: "error", message: "Something Wrong" });
    }
  }
);

router.post(
  "/list",
  userExtractor([allPermissions.mercaderia]),
  schemaValidation(schemaPostListMercaderia),
  async (req, res) => {
    const list = req.body;
    const listDoneNew = await mercaderiaServer.createListMercaderia(
      list.fecha,
      list.data
    );

    if (listDoneNew.length >= 1) {
      return res.json({ status: "success", data: listDoneNew });
    } else
      return res.status(400).json({ status: "error", message: "No se agrego" });
  }
);

router.put(
  "/:mid",
  userExtractor([allPermissions.mercaderia]),
  schemaValidation(schemaPutMercaderia),
  async (req, res, next) => {
    const object = req.body;
    const idMercaderia = req.params.mid;
    try {
      const objectUpdated = await mercaderiaServer.updateMercaderia(
        idMercaderia,
        object
      );

      if (objectUpdated)
        return res.json({ status: "success", data: objectUpdated[0] });
      else
        return res
          .status(400)
          .json({ status: "error", message: "No se actualizo con exito" });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ status: "error", message: "Something Wrong" });
    }
  }
);

router.delete(
  "/:mid",
  userExtractor([allPermissions.mercaderia]),
  async (req, res, next) => {
    const mid = parseInt(req.params.mid);
    try {
      const isDeleted = await mercaderiaServer.deleteMercaderia(mid);

      if (isDeleted)
        return res.json({
          status: "success",
          message: "Eliminado Correctamente",
        });
      else
        return res
          .status(400)
          .json({ status: "error", message: "No existe esa mercaderia" });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ status: "error", message: "Something Wrong" });
    }
  }
);

export default router;
