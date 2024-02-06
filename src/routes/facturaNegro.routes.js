import { Router } from "express";
import { facturaNegroManager } from "../index.js";

import userExtractor, { auth } from "../middleware/userExtractor.js";
import allPermissions from "../config/permissos.js";

const router = Router();

router.get("/newNroEnvio", (req, res) => {
  const sendNewNroEnvio = facturaNegroManager.getNroEnvio();

  //Ocurrio un error
  if (sendNewNroEnvio === -1)
    return res.status(404).json({ message: "Something wrong" });

  return res.json({ nroEnvio: sendNewNroEnvio });
});

router.get(
  "/",
  userExtractor([allPermissions.oficina]),
  async (req, res) => {
    const { data, error } = await facturaNegroManager.getFacturaNegro();

    if (error != null) return res.status(500).json(error);

    return res.json(data);
  }
);

router.get(
  "/:id",
  userExtractor([allPermissions.oficina]),
  (req, res) => {
    const { id } = req.params;
    const resultJson = facturaNegroManager.getOneNotaEnvio(id);

    return res.json(resultJson);
  }
);

router.post(
  "/",
  userExtractor([allPermissions.oficina]),
  async (req, res, next) => {
    const object = req.body;
    try {
      const result = await facturaNegroManager.createFacturaNegro(object);

      if (result.error != null) return res.status(404).json(result.error);

      return res.json(result.data);
    } catch (error) {
      next(error);
    }
  }
);

router.put(
  "/:idNotaEnvio",
  userExtractor([allPermissions.oficina]),
  async (req, res, next) => {
    const idNotaEnvio = req.params.idNotaEnvio;
    const object = req.body;
    try {
      const result = await facturaNegroManager.updateRemito(
        idNotaEnvio,
        object
      );

      if (result.error != null) return res.status(404).json(result.error);

      return res.json(result.data);
    } catch (error) {
      next(error);
    }
  }
);

router.put(
  "/:idNotaEnvio/newProduct",
  userExtractor([allPermissions.oficina]),
  async (req, res, next) => {
    const idNotaEnvio = req.params.idNotaEnvio;
    const object = req.body;
    try {
      const result = await facturaNegroManager.updateNotaEnvioAddNewMercaderia(
        idNotaEnvio,
        object
      );

      if (result.error != null) return res.status(404).json(result.error);

      return res.json(result.data);
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  "/:idNotaEnvio",
  userExtractor([allPermissions.oficina]),
  async (req, res, next) => {
    const idNotaEnvio = req.params.idNotaEnvio;
    try {
      const result = await facturaNegroManager.deleteNotaEnvio(idNotaEnvio);

      if (result.error != null) return res.status(404).json(result.error);

      return res.json(result.data);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
