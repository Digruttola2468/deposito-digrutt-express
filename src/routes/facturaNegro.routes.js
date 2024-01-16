import { Router } from "express";
import { facturaNegroManager } from '../index.js'

import userExtractor from "../middleware/userExtractor.js";
import allPermissions from "../config/permissos.js";

const router = Router();

router.get("/facturaNegro/newNroEnvio", (req, res) => {
  const sendNewNroEnvio = facturaNegroManager.getNroEnvio();

  //Ocurrio un error
  if (sendNewNroEnvio === -1)
    return res.status(404).json({ message: "Something wrong" });

  return res.json({ nroEnvio: sendNewNroEnvio });
});

router.get("/facturaNegro", userExtractor(allPermissions.oficina), async (req, res) => {
  const { data, error } = await facturaNegroManager.getFacturaNegro();

  if (error != null) return res.status(500).json(error);

  return res.json(data);
});

router.get("/facturaNegro/:id", userExtractor(allPermissions.oficina), (req, res) => {
  const { id } = req.params;
  const resultJson = facturaNegroManager.getOneNotaEnvio(id);

  return res.json(resultJson);
});

router.post("/facturaNegro", userExtractor(allPermissions.oficina), async (req, res) => {
  const object = req.body;
  const result = await facturaNegroManager.createFacturaNegro(object);

  if (result.error != null) return res.status(404).json(result.error);

  return res.json(result.data);
});

export default router;
