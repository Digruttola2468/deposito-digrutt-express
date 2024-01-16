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

router.post("/cliente", userExtractor([allPermissions.oficina, allPermissions.mercaderia]), async (req, res) => {
  const object = req.body;
  const { data, error } = await clientesManager.createCliente(object);

  if (error) return res.status(404).json(error);

  return res.json(data);
});

router.put("/cliente/:id", userExtractor([allPermissions.oficina, allPermissions.mercaderia]), async (req, res) => {
  const idCliente = req.params.id;
  const object = req.body;
  const { data, error } = await clientesManager.updateCliente(
    idCliente,
    object
  );

  if (error != null) return res.status(500).json(error);

  return res.json(data);
});

router.delete("/cliente/:id", userExtractor([allPermissions.oficina, allPermissions.mercaderia]), async (req, res) => {
  const idCliente = req.params.id;
  const { data, error } = await clientesManager.deleteCliente(idCliente);

  if (error != null) return res.status(500).json(error);

  return res.json(data);
});

export default router;
