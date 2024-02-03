import { Router } from "express";
import { clientesManager } from "../index.js";
import userExtractor from "../middleware/userExtractor.js";
import allPermissions from "../config/permissos.js";

const router = Router();

router.get("/clientes", async (req, res) => {
  const { data, error } = await clientesManager.getClientes();

  if (error != null) return res.status(500).json(error);

  return res.json(data);
});

router.get("/cliente/:id", async (req, res) => {
  const idCliente = req.params.id;

  const { data, error } = clientesManager.getOneCliente(idCliente);

  if (error != null) return res.status(500).json(error);

  return res.json(data);
});

router.post(
  "/cliente",
  userExtractor([allPermissions.oficina, allPermissions.mercaderia]),
  async (req, res, next) => {
    const object = req.body;
    try {
      const result = await clientesManager.createCliente(object);
      return res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

router.put(
  "/cliente/:id",
  userExtractor([allPermissions.oficina, allPermissions.mercaderia]),
  async (req, res, next) => {
    const idCliente = req.params.id;
    const object = req.body;
    try {
      const result = await clientesManager.updateCliente(idCliente, object);

      return res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  "/cliente/:id",
  userExtractor([allPermissions.oficina, allPermissions.mercaderia]),
  async (req, res, next) => {
    const idCliente = req.params.id;
    try {
      const result = await clientesManager.deleteCliente(idCliente);
      return res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
