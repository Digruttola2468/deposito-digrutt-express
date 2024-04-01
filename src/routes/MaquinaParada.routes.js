import { Router } from "express";
import userExtractor from "../middleware/userExtractor.js";
import allPermissions from "../config/permissos.js";
import { maquinaParadaServer } from "../services/index.repository.js";

const ruta = Router();

ruta.get(
  "/",
  userExtractor([allPermissions.produccion, allPermissions.inyectora]),
  async (req, res) => {
    try {
      const [rows] = await maquinaParadaServer.getMaquinasParadas();
      return res.json({ status: "success", data: rows });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ status: "error", message: "Something Wrong" });
    }
  }
);

ruta.get(
  "/:mpid",
  userExtractor([allPermissions.produccion, allPermissions.inyectora]),
  async (req, res) => {
    try {
      const [rows] = await maquinaParadaServer.getOneMaquinaParada(
        req.params.mpid
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

ruta.post(
  "/",
  userExtractor([allPermissions.produccion, allPermissions.inyectora]),
  async (req, res) => {
    const body = req.body;
    try {
      const [result] = await maquinaParadaServer.newMaquinaParada(body);
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
  }
);

ruta.put(
  "/:idMaquinaParada",
  userExtractor([allPermissions.produccion, allPermissions.inyectora]),
  async (req, res) => {
    const idMaquinaParada = req.params.idMaquinaParada;
    const body = req.body;

    try {
      const [result] = await maquinaParadaServer.updateMaquinaParada(
        idMaquinaParada,
        body
      );

      if (result.affectedRows >= 1) {
        const [rows] = await maquinaParadaServer.getOneMaquinaParada(
          idMaquinaParada
        );

        return res.json({ status: "success", data: rows[0] });
      } else
        return res
          .status(404)
          .json({ status: "error", message: "No existe esa Maquina Parada" });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ status: "error", message: "Something Wrong" });
    }
  }
);

ruta.delete(
  "/:idMaquina",
  userExtractor([allPermissions.produccion, allPermissions.inyectora]),
  async (req, res) => {
    const idMaquina = req.params.idMaquina;
    try {
      const [result] = await maquinaParadaServer.deleteMaquinaParada(idMaquina);
      if (result.affectedRows >= 1)
        return res.json({
          status: "success",
          message: "Se elimino correctamente",
        });
      else
        return res
          .status(404)
          .json({ status: "error", message: "No existe esa Maquina Parada" });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ status: "error", message: "Something Wrong" });
    }
  }
);

export default ruta;
