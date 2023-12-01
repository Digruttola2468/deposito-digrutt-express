import { Router } from "express";
import { facturaNegroManager } from '../index.js'

import userExtractor from "../middleware/userExtractor.js";

const router = Router();

router.get("/facturaNegro/newNroEnvio", (req, res) => {
  const sendNewNroEnvio = facturaNegroManager.getNroEnvio();

  //Ocurrio un error
  if (sendNewNroEnvio === -1)
    return res.status(404).json({ message: "Something wrong" });

  return res.json({ nroEnvio: sendNewNroEnvio });
});

router.get("/facturaNegro", userExtractor, async (req, res) => {
  const page = parseInt(req.query?.page ?? 0) * 10;

  const { data, error } = await facturaNegroManager.getFacturaNegro(page);

  if (error != null) return res.status(500).json(error);

  return res.json(data);
});

router.get("/facturaNegro/:id", userExtractor, (req, res) => {
  const { id } = req.params;
  const resultJson = facturaNegroManager.getOneNotaEnvio(id);

  return res.json(resultJson);
});

router.post("/facturaNegro", userExtractor, async (req, res) => {
  const object = req.body;
  const result = await facturaNegroManager.createFacturaNegro(object);

  if (result.error != null) return res.status(404).json(result.error);

  return res.json(result.data);
});

export default router;
