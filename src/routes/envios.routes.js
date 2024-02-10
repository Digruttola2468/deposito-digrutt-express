import { Router } from "express";
import { enviosManager } from "../index.js";
import userExtractor from "../middleware/userExtractor.js";
import allPermissions from "../config/permissos.js";

const router = Router();

router.get("/", async (req, res) => {
  const { data, error } = await enviosManager.getEnvios();

  if (error != null) return res.status(500).json(error);

  return res.json(data);
});

router.get("/:id", async (req, res) => {
  const idEnvio = req.params.id;

  const { data, error } = await enviosManager.getOneEnvio(idEnvio);

  if (error != null) return res.status(500).json(error);

  return res.json(data);
});

router.post(
  "/",
  userExtractor([allPermissions.envios]),
  async (req, res, next) => {
    const object = req.body;
    try {
      const { data, error } = await enviosManager.createEnvio(object);

      if (error) return res.status(404).json(error);

      return res.json(data);
    } catch (error) {
      next(error);
    }
  }
);

router.put("/:id", userExtractor([allPermissions.envios]), async (req, res, next) => {
  const idEnvio = req.params.id;
  const object = req.body;

  try {
    const { data, error } = await enviosManager.updateEnvio(idEnvio, object);

    if (error != null) return res.status(500).json(error);

    return res.json(data);
  } catch (error) {
    next(error)
  }
});

router.delete(
  "/:id",
  userExtractor([allPermissions.envios]),
  async (req, res) => {
    const idEnvio = req.params.id;
    const { data, error } = await enviosManager.deleteEnvio(idEnvio);

    if (error != null) return res.status(500).json(error);

    return res.json(data);
  }
);

export default router;
