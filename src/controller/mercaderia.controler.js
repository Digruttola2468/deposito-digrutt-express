import {mercaderiaManager} from '../index.js'

export const getRefreshMercaderia = async (req, res) => {
  const { data, error } = await mercaderiaManager.refreshGetMercaderia();

  if (error != null) return res.status(404).json(error);

  return res.json(data);
};

export const getMercaderias = async (req, res) => {
  const { data, error } = await mercaderiaManager.getMercaderia();

  if (error != null) return res.status(404).json(error);

  return res.json(data);
};

export const createMercaderia = async (req, res) => {
  const object = req.body;
  const { data, error } = await mercaderiaManager.createMercaderia(object);

  if (error != null) return res.status(404).json(error);

  return res.json(data);
};

export const updateMercaderia = async (req, res) => {
  const object = req.body;
  const idMercaderia = req.params.id;
  const { data, error } = await mercaderiaManager.updateMercaderia(
    idMercaderia,
    object
  );

  if (error != null) return res.status(404).json(error);

  return res.json(data);
};

export const deleteMercaderia = async (req, res) => {
  const idMercaderia = req.params.id;
  const { data, error } = await mercaderiaManager.deleteMercaderia(idMercaderia);

  if (error != null) return res.status(500).json(error);

  return res.json(data);
};
