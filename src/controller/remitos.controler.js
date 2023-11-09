import {remitosManager} from '../index.js'

export const getRemitos = (req, res) => {
  try {
  } catch (error) {
    return res.status(500).send({ message: "Something wrong" });
  }
};

export const getRemiteFromMercaderiaByIdRemito = (req, res) => {
  try {
  } catch (error) {
    return res.status(500).send({ message: "Something wrong" });
  }
};

export const newRemito = async (req, res) => {
  const object = req.body;
  const { data, error } = await remitosManager.newRemito(object);

  if (error != null) return res.status(404).json(error);

  return res.json(data);
};
