import { Router } from "express";

import userExtractor from "../middleware/userExtractor.js";
import allPermissions from "../config/permissos.js";
import { notaEnvioServer } from "../services/index.repository.js";

const router = Router();

/*router.get("/newNroEnvio", (req, res) => {

});*/

router.get("/", userExtractor([allPermissions.oficina]), async (req, res) => {
  try {
    const result = await notaEnvioServer.get();
    return res.json({ status: "success", data: result });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: "error", message: "Something Wrong" });
  }
});

router.get(
  "/:nid",
  userExtractor([allPermissions.oficina]),
  async (req, res) => {
    const { nid } = req.params;
    try {
      const result = await notaEnvioServer.getOneWithAllMercaderiaOutput(nid);
      return res.json({ status: "success", data: result });
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
  userExtractor([allPermissions.oficina]),
  async (req, res, next) => {
    const object = req.body;
    try {
      const [rows] = await notaEnvioServer.createNotaEnvio(object);
      return res.json({ status: "success", data: rows[0] });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ status: "error", message: "Something Wrong" });
    }
  }
);

router.put(
  "/:idNotaEnvio",
  userExtractor([allPermissions.oficina]),
  async (req, res, next) => {
    const idNotaEnvio = req.params.idNotaEnvio;
    const object = req.body;
    try {
      const [rows] = await notaEnvioServer.updateNotaEnvio(idNotaEnvio, object);
      return res.json({ status: "success", data: rows[0] });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ status: "error", message: "Something Wrong" });
    }
  }
);

router.put(
  "/:idNotaEnvio/newProduct",
  userExtractor([allPermissions.oficina]),
  async (req, res, next) => {
    const idNotaEnvio = req.params.idNotaEnvio;
    const object = req.body;
    try {
      const result = await notaEnvioServer.updateNotaEnvioAddNewMercaderia(
        idNotaEnvio,
        object
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
  "/:idNotaEnvio",
  userExtractor([allPermissions.oficina]),
  async (req, res, next) => {
    const idNotaEnvio = req.params.idNotaEnvio;
    try {
      const { error, success } = await notaEnvioServer.deleteNotaEnvio(
        idNotaEnvio
      );
      if (success)
        return res.json({
          status: "success",
          message: "Eliminado Correctamente",
        });
      else
        return res
          .status(404)
          .json({ status: "error", message: "No existe esa nota envio" });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ status: "error", message: "Something Wrong" });
    }
  }
);

export default router;
