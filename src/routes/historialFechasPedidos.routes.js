import { Router } from "express";
import { historialPedidosManager } from "../index.js";
import userExtractor from "../middleware/userExtractor.js";
import allPermissions from "../config/permissos.js";

const ruta = Router();

ruta.get(
  "/",
  userExtractor([allPermissions.mercaderia, allPermissions.oficina]),
  async (req, res, next) => {
    const { data, error } =
      await historialPedidosManager.getHistorialFechasPedidos();

    if (error) return res.status(404).json(error);

    return res.json(data);
  }
);

ruta.post(
  "/",
  userExtractor([allPermissions.mercaderia, allPermissions.oficina]),
  async (req, res, next) => {
    const object = req.body;
    try {
      const { data, error } =
        await historialPedidosManager.postHistorialFechasPedidos(object);

      if (error) return res.status(404).json(error);

      return res.json(data);
    } catch (error) {
      next(error);
    }
  }
);

ruta.put(
  "/:idHistorial",
  userExtractor([allPermissions.mercaderia, allPermissions.oficina]),
  async (req, res, next) => {
    const idHistorial = req.params.idHistorial;
    const object = req.body;

    try {
      const { data, error } =
        await historialPedidosManager.updateHistorialFechasPedidos(
          idHistorial,
          object
        );

      if (error) return res.status(404).json(error);

      return res.json(data);
    } catch (error) {
      next(error);
    }
  }
);

ruta.delete(
  "/:idHistorial",
  userExtractor([allPermissions.mercaderia, allPermissions.oficina]),
  async (req, res, next) => {
    const idHistorial = req.params.idHistorial;

    try {
      const { data } = await historialPedidosManager.deleteHistorialFechasPedidos(idHistorial);
      return res.json(data);
    } catch (error) {
      next(error);
    }
  }
);

export default ruta;
