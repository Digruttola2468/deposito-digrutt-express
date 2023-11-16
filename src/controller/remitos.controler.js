import { remitosManager } from "../index.js";

export const getRemitos = async (req, res) => {
  const { data, error } = await remitosManager.getRemitos();

  if (error != null) return res.status(404).json(error);

  return res.json(data);
};

export const getOneRemitoFromMercaderiaByIdRemito = (req, res) => {
  const { id } = req.params;
  
  const resultJson = remitosManager.getOneRemito(id);

  res.json(resultJson);
};

export const newRemito = async (req, res) => {
  const object = req.body;
  const { data, error } = await remitosManager.newRemito(object);

  if (error != null) return res.status(404).json(error);

  return res.json(data);
};
