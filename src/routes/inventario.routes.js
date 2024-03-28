import { Router } from "express";

import userExtractor from "../middleware/userExtractor.js";
import allPermissions, { inventarioPermissions } from "../config/permissos.js";
import { inventarioServer } from "../services/index.repository.js";

const router = Router();

router.get("/", userExtractor(inventarioPermissions), async (req, res) => {
  try {
    const result = await inventarioServer.getInventario();
    return res.json({ status: "success", data: result });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: "error", message: "Something Wrong" });
  }
});

router.get("/nombres", userExtractor(inventarioPermissions), (req, res) => {
  try {
    const result = inventarioServer.getListInventarioNombre();
    return res.json({ status: "success", data: result });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: "error", message: "Something Wrong" });
  }
});

router.get(
  "/sumInventario/:id",
  userExtractor(inventarioPermissions),
  async (req, res) => {
    const { id } = req.params;

    try {
      const result = await inventarioServer.sumMercaderiaByIdInventario(id);
      return res.json(result);
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ status: "error", message: "Something Wrong" });
    }
  }
);

router.get("/:id", userExtractor(inventarioPermissions), async (req, res) => {
  const idInventario = req.params.id;
  try {
    const [rows] = await inventarioServer.getOne(idInventario);
    return res.json({ status: "success", data: rows[0] });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: "error", message: "Something Wrong" });
  }
});

router.post(
  "/",
  userExtractor([allPermissions.oficina, allPermissions.mercaderia]),
  async (req, res, next) => {
    const object = req.body;
    try {
      const result = await inventarioServer.createInventario(object);
      return res.json({ status: "success", data: result });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ status: "error", message: "Something Wrong" });
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
      const [rows] = await inventarioServer.updateInventario(idInventario, object);
      return res.json({ status: "success", data: rows[0] });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ status: "error", message: "Something Wrong" });
    }
  }
);

router.delete(
  "/:id",
  userExtractor([allPermissions.oficina, allPermissions.mercaderia]),
  async (req, res, next) => {
    const idInventario = req.params.id;
    try {
      const [result] = await inventarioServer.deleteInventario(idInventario);

      if (result.affectedRows >= 1)
        return res.json({
          status: "success",
          message: "Eliminado Correctamente",
        });
      else
        return res.status(404).json({
          status: "error",
          message: "No existe ese inventario",
        });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ status: "error", message: "Something Wrong" });
    }
  }
);

export default router;
