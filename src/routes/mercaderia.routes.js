import { Router } from "express";
import { mercaderiaManager } from "../index.js";

import userExtractor, { auth } from "../middleware/userExtractor.js";
import allPermissions from "../config/permissos.js";

const router = Router();

router.get(
  "/",
  userExtractor([allPermissions.mercaderia]),
  async (req, res) => {
    const { data, error } = await mercaderiaManager.getMercaderia();

    if (error != null) return res.status(404).json(error);

    return res.json(data);
  }
);

router.get("/:mid", userExtractor([allPermissions.mercaderia]), (req, res) => {
  const mid = parseInt(req.params.mid);
  const { data, error } = mercaderiaManager.getOneMercaderia(mid);

  if (error != null) return res.status(404).json(error);

  return res.json(data);
});

router.post(
  "/",
  userExtractor([allPermissions.mercaderia]),
  async (req, res, next) => {
    const object = req.body;
    try {
      const { data, error } = await mercaderiaManager.createMercaderia(object);

      if (error != null) return res.status(404).json(error);

      return res.json(data);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/salida",
  userExtractor([allPermissions.mercaderia]),
  async (req, res, next) => {
    const { fecha, stock, idinventario, observacion } = req.body;

    if (observacion == null || observacion == "")
      return res.status(400).json({
        status: "error",
        message: "Campo observacion vacio",
        campus: "observacion",
      });

    try {
      const { data, error } = await mercaderiaManager.createMercaderia({
        fecha,
        stock,
        idinventario,
        idcategoria: "1",
        observacion,
      });

      if (error != null) return res.status(404).json(error);

      return res.json(data);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/list",
  userExtractor([allPermissions.mercaderia]),
  async (req, res) => {
    const object = req.body;
    const { data, error } = await mercaderiaManager.postMercaderiaList(object);

    if (error != null) return res.status(404).json(error);

    return res.json(data);
  }
);

router.put(
  "/:id",
  userExtractor([allPermissions.mercaderia]),
  async (req, res, next) => {
    const object = req.body;
    const idMercaderia = req.params.id;
    try {
      const { data, error } = await mercaderiaManager.updateMercaderia(
        idMercaderia,
        object
      );

      if (error != null) return res.status(404).json(error);

      return res.json(data);
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  "/:id",
  userExtractor([allPermissions.mercaderia]),
  async (req, res, next) => {
    const idMercaderia = req.params.id;
    try {
      const result = await mercaderiaManager.deleteMercaderia(idMercaderia);

      return res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
