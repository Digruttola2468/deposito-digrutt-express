import { Router } from "express";
import userExtractor from "../middleware/userExtractor.js";
import allPermissions from "../config/permissos.js";
import { remitoServer } from "../services/index.repository.js";

const router = Router();

router.get("/", userExtractor(allPermissions.oficina), async (req, res) => {
  try {
    const result = await remitoServer.get();
    return res.json({ status: "success", data: result });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: "error", message: "Something Wrong" });
  }
});

router.get("/:id", userExtractor(allPermissions.oficina), async (req, res) => {
  const { id } = req.params;

  try {
    const result = await remitoServer.getOneRemitoWithMercaderas(id);
    return res.json({ status: "success", data: result });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: "error", message: "Something Wrong" });
  }
});

router.post(
  "/",
  userExtractor(allPermissions.oficina),
  async (req, res, next) => {
    const object = req.body;
    try {
      const result = await remitoServer.newRemito(object);
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
  "/:idRemito",
  userExtractor(allPermissions.oficina),
  async (req, res, next) => {
    const { idRemito } = req.params;
    const body = req.body;
    try {
      const result = await remitoServer.updateRemito(idRemito, body);
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
  "/newProduct/:idRemito",
  userExtractor(allPermissions.oficina),
  async (req, res) => {
    const { idRemito } = req.params;
    const body = req.body;
    try {
      const result = await remitoServer.updateRemitoAddNewMercaderia(
        idRemito,
        body
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

router.delete(
  "/:id",
  userExtractor(allPermissions.oficina),
  async (req, res, next) => {
    const idRemito = req.params.id;

    try {
      const { success } = await remitoServer.deleteRemito(idRemito);
      if (success)
        return res.json({
          status: "success",
          message: "Eliminado Correctamente",
        });
      else
        return res
          .status(404)
          .json({ status: "error", message: "No existe ese remito" });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ status: "error", message: "Something Wrong" });
    }
  }
);

export default router;
