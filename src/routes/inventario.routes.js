import { Router } from "express";
import { inventarioManager } from "../index.js";

import userExtractor from "../middleware/userExtractor.js";
import allPermissions, { inventarioPermissions } from "../config/permissos.js";

const router = Router();

router.get(
  "/",

  userExtractor(inventarioPermissions),
  async (req, res) => {
    const { data, error } = await inventarioManager.getInventario();

    if (error != null) return res.status(404).json(error);

    return res.json(data);
  }
);

router.get(
  "/nombres",

  userExtractor(inventarioPermissions),
  (req, res) => {
    const { data, error } = inventarioManager.getListInventarioNombre();

    if (error != null) return res.status(404).json(error);

    return res.json(data);
  }
);

router.get(
  "/sumInventario/:id",

  userExtractor(inventarioPermissions),
  async (req, res) => {
    const { id } = req.params;

    const result = await inventarioManager.suminventario(id);

    if (result.error != null)
      return res.status(404).json({ message: "Ocurrio un error" });

    return res.json(result.data);
  }
);

router.get(
  "/:id",

  userExtractor(inventarioPermissions),
  (req, res) => {
    const idInventario = req.params.id;
    const { data, error } = inventarioManager.getOneInventario(idInventario);

    if (error != null) return res.status(404).json(error);

    return res.json(data);
  }
);

router.post(
  "/",

  userExtractor([allPermissions.oficina, allPermissions.mercaderia]),
  async (req, res, next) => {
    const object = req.body;
    try {
      const result = await inventarioManager.createInventario(object);

      return res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

router.put(
  "/:id",

  userExtractor([allPermissions.oficina, allPermissions.mercaderia]),
  async (req, res, next) => {
    const idInventario = req.params.id;
    const object = req.body;

    try {
      const result = await inventarioManager.updateInventario(
        idInventario,
        object
      );

      return res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  "/:id",

  userExtractor([allPermissions.oficina, allPermissions.mercaderia]),
  async (req, res,next) => {
    const idInventario = req.params.id;
    try {
      const { data, error } = await inventarioManager.deleteInventario(
        idInventario
      );
  
      if (error != null) return res.status(500).json(error);
  
      return res.json(data);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
