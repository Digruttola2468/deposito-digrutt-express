import { Router } from "express";
import { clientesManager } from "../index.js";
import userExtractor from "../middleware/userExtractor.js";

import { con } from "../config/db.js";

const router = Router();

router.get("/clientes", async (req, res) => {

  const page = parseInt(req.query?.page ?? -1) * 10;

  if (page != -10) {
    try {
      const [rows] = await con.query("SELECT * FROM clientes LIMIT 10 OFFSET ?;", [page]);
      
      return res.json(rows);
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: "Something wrong" });
    }
  }
  
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

router.post("/cliente", userExtractor, async (req, res) => {
  const object = req.body;
  const result = await clientesManager.createCliente(object);

  if (result.error != null) return res.status(404).json(result.error);

  return res.json(result.data);
});

router.put("/cliente/:id", userExtractor, async (req, res) => {
  const idCliente = req.params.id;
  const object = req.body;
  const { data, error } = await clientesManager.updateCliente(
    idCliente,
    object
  );

  if (error != null) return res.status(500).json(error);

  return res.json(data);
});

router.delete("/cliente/:id", userExtractor, async (req, res) => {
  const idCliente = req.params.id;
  const { data, error } = await clientesManager.deleteCliente(idCliente);

  if (error != null) return res.status(500).json(error);

  return res.json(data);
});

export default router;
