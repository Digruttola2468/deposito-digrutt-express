import { Router } from "express";
import userExtractor from "../middleware/userExtractor.js";
import allPermissions from "../config/permissos.js";

const router = Router();

router.get("/", userExtractor(allPermissions.oficina), async (req, res) => {
  const { data, error } = await remitosManager.getRemitos();

  if (error != null) return res.status(404).json(error);

  return res.json(data);
});

router.get("/:id", userExtractor(allPermissions.oficina), async (req, res) => {
  const { id } = req.params;

  const resultJson = remitosManager.getOneRemito(id);

  res.json(resultJson);
});

router.post(
  "/",
  userExtractor(allPermissions.oficina),
  async (req, res, next) => {
    const object = req.body;
    try {
      const { data, error } = await remitosManager.newRemito(object);

      if (error != null) return res.status(404).json(error);

      return res.json(data);
    } catch (error) {
      next(error);
    }
  }
);

router.put("/:idRemito", userExtractor(allPermissions.oficina), async (req, res, next) => {
  try {
    const { data, error } = await remitosManager.updateRemito(
      req.params.idRemito,
      req.body
    );

    if (error != null) return res.status(404).json(error);

    return res.json(data);
  } catch (error) {
    next(error);
  }
});

router.put(
  "/newProduct/:idRemito",
  userExtractor(allPermissions.oficina),
  async (req, res) => {
    const { data, error } = await remitosManager.updateRemitoAddNewMercaderia(
      req.params.idRemito,
      req.body
    );

    if (error != null) return res.status(404).json(error);

    return res.json(data);
  }
);

router.delete(
  "/:id",
  userExtractor(allPermissions.oficina),
  async (req, res, next) => {
    const idRemito = req.params.id;

    try {
      const { data, error } = await remitosManager.deleteRemito(idRemito);

      if (error != null) return res.status(404).json(error);

      return res.json(data);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
