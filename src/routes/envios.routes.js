import { Router } from "express";
import userExtractor from "../middleware/userExtractor.js";
import allPermissions from "../config/permissos.js";
import { envioServer } from "../services/index.repository.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const rows = await envioServer.getEnvios();
    return res.json({ status: "success", data: rows });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: "error", message: "Something Wrong" });
  }
});

router.get("/:eid", async (req, res) => {
  try {
    const [rows] = await envioServer.getOneEnvios(req.params.eid);
    return res.json({ status: "success", data: rows });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: "error", message: "Something Wrong" });
  }
});

router.post("/", userExtractor([allPermissions.envios]), async (req, res) => {
  const body = req.body;
  try {
    const [result] = await envioServer.newEnvio(body);
    return res.json({
      status: "success",
      data: { id: result.insertId, ...body },
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: "error", message: "Something Wrong" });
  }
});

router.put(
  "/:eid",
  userExtractor([allPermissions.envios]),
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
          .json({ status: "error", message: "No existe ese cliente" });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ status: "error", message: "Something Wrong" });
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
          .json({ status: "error", message: "No existe ese cliente" });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ status: "error", message: "Something Wrong" });
    }
  }
);

export default router;
