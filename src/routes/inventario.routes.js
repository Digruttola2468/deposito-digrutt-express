import { Router } from "express";
import { inventarioManager } from "../index.js";

import userExtractor from '../middleware/userExtractor.js'

const router = Router();

router.get("/inventario",userExtractor, async (req, res) => {
  const { data, error } = await inventarioManager.getInventario();

  if (error != null) return res.status(404).json(error);

  return res.json(data);
});

router.get('/inventario/nombres',userExtractor, async (req, res) => {
  const { data, error } = inventarioManager.getListInventarioNombre();

  if (error != null) return res.status(404).json(error);

  return res.json(data);
});

router.get('/inventario/sumInventario/:id', userExtractor, async (req, res) => {
  const { id } = req.params;

  const result = await inventarioManager.suminventario(id);

  if (result.error != null)
    return res.status(404).json({ message: "Ocurrio un error" });

  return res.json(result.data);
});

router.get("/inventario/:id",userExtractor, (req, res) => {
  const idInventario = req.params.id;
  const { data, error } = inventarioManager.getOneInventario(
    idInventario
  );

  if (error != null) return res.status(404).json(error);

  return res.json(data);
});

router.post("/inventario",userExtractor, async (req, res) => {
  const object = req.body;
  const { data, error } = await inventarioManager.createInventario(object);

  if (error != null) return res.status(404).json(error);

  return res.json(data);
});

router.put("/inventario/:id",userExtractor,  async (req, res) => {
  const idInventario = req.params.id;
  const object = req.body;
  const { data, error } = await inventarioManager.updateInventario(
    idInventario,
    object
  );

  if (error != null) return res.status(500).json(error);

  return res.json(data);
});

router.delete("/inventario/:id",userExtractor, async (req, res) => {
  const idInventario = req.params.id;
  const { data, error } = await inventarioManager.deleteInventario(
    idInventario
  );

  if (error != null) return res.status(500).json(error);

  return res.json(data);
});

export default router;
