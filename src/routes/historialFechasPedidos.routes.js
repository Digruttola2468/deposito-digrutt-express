import { Router } from "express";
import userExtractor from "../middleware/userExtractor.js";
import allPermissions from "../config/permissos.js";
import { historialFechasPedidosServer } from "../services/index.repository.js";

const ruta = Router();

ruta.get(
  "/",
  userExtractor([allPermissions.mercaderia, allPermissions.oficina]),
  async (req, res, next) => {
    try {
      const rows =
        await historialFechasPedidosServer.getHistorialFechaPedido();
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
  "/:idHistorial",
  userExtractor([allPermissions.mercaderia, allPermissions.oficina]),
  async (req, res, next) => {
    try {
      const [rows] = await historialFechasPedidosServer.getOneHistorial(
        req.params.idHistorial
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
  userExtractor([allPermissions.mercaderia, allPermissions.oficina]),
  async (req, res, next) => {
    const object = req.body;
    try {
      const [result] =
        await historialFechasPedidosServer.newHistorialFechaPedido(object);
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

ruta.put(
  "/:idHistorial",
  userExtractor([allPermissions.mercaderia, allPermissions.oficina]),
  async (req, res, next) => {
    const idHistorial = req.params.idHistorial;
    const object = req.body;

    const [result] =
      await historialFechasPedidosServer.updateHistorialFechaPedido(
        idHistorial,
        object
      );

    if (result.affectedRows >= 1) {
      const [rows] = await historialFechasPedidosServer.getOneHistorial(
        idHistorial
      );

      return res.json({ status: "success", data: rows[0] });
    } else
      return res
        .status(404)
        .json({ status: "error", message: "No existe ese historial fechas" });
  }
);

ruta.delete(
  "/:idHistorial",
  userExtractor([allPermissions.mercaderia, allPermissions.oficina]),
  async (req, res, next) => {
    try {
      const [result] =
        await historialFechasPedidosServer.deleteHistorialFechaPedido(
          req.params.idHistorial
        );
      if (result.affectedRows >= 1)
        return res.json({
          status: "success",
          message: "Se elimino correctamente",
        });
      else
        return res
          .status(404)
          .json({ status: "error", message: "No existe ese historial fechas" });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ status: "error", message: "Something Wrong" });
    }
  }
);

export default ruta;
