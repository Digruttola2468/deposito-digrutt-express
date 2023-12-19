import { Router } from "express";
import userExtractor from "../middleware/userExtractor.js";
import { remitosManager } from "../index.js";

const router = Router();

router.get("/remito", userExtractor, async (req, res) => {
  const { data, error } = await remitosManager.getRemitos();

  if (error != null) return res.status(404).json(error);

  return res.json(data);
});

router.get("/remito/:id", userExtractor, async (req, res) => {
  const { id } = req.params;

  const resultJson = remitosManager.getOneRemito(id);

  res.json(resultJson);
});

router.post("/remito", userExtractor, async (req, res) => {
  const object = req.body;
  const { data, error } = await remitosManager.newRemito(object);

  if (error != null) return res.status(404).json(error);

  return res.json(data);
});

/*router.put("/remito/:idRemito", userExtractor, async (req, res) => {
  const { data, error } = await remitosManager.updateRemito(
    req.params.idRemito,
    req.body
  );

  if (error != null) return res.status(404).json(error);

  return res.json(data);
});*/

router.put("/remito/newProduct/:idRemito", userExtractor, async (req, res) => {
  const { data, error } = await remitosManager.updateRemitoAddNewMercaderia(
    req.params.idRemito,
    req.body
  );

  if (error != null) return res.status(404).json(error);

  return res.json(data);
});

router.delete("/remito/:id", userExtractor, async (req, res) => {
  const idRemito = req.params.id;
  const { data, error } = await remitosManager.deleteRemito(idRemito);

  if (error != null) return res.status(404).json(error);

  return res.json(data);
});

export default router;
