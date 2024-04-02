import { Router } from "express";
import userExtractor from "../middleware/userExtractor.js";
import allPermissions from "../config/permissos.js";
import { controlCalidadServer } from "../services/index.repository.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const rows = await controlCalidadServer.getControlCalidad();
    return res.json({ status: "success", data: rows });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: "error", message: "Something Wrong" });
  }
});

router.get("/cliente/:idCliente", async (req, res) => {
  try {
    const [rows] = await controlCalidadServer.getControlCalidadByClientes(
      req.params.idCliente
    );
    return res.json({ status: "success", data: rows });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: "error", message: "Something Wrong" });
  }
});

router.get("/:cid", async (req, res) => {
  try {
    const [rows] = await controlCalidadServer.getOneControlCalidad(
      req.params.cid
    );
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
      const [result] = await controlCalidadServer.newControlCalidad(object);
      return res.json({
        status: "success",
        data: { id: result.insertId, ...object },
      });
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
    const idControlCalidad = req.params.id;
    const object = req.body;
    try {
      const [result] = await controlCalidadServer.updateControlCalidad(
        idControlCalidad,
        object
      );

      if (result.affectedRows >= 1) {
        const [rows] = await controlCalidadServer.getOneControlCalidad(
          idControlCalidad
        );

        return res.json({ status: "success", data: rows[0] });
      } else
        return res
          .status(404)
          .json({ status: "error", message: "No existe ese control" });
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
    const idControlCalidad = req.params.id;
    try {
      const [result] = await controlCalidadServer.deleteControlCalidad(
        idControlCalidad
      );
      if (result.affectedRows >= 1)
        return res.json({
          status: "success",
          message: "Se elimino correctamente",
        });
      else
        return res
          .status(404)
          .json({ status: "error", message: "No existe ese control" });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ status: "error", message: "Something Wrong" });
    }
  }
);

export default router;
