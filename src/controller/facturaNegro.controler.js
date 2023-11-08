import {facturaNegroManager} from '../index.js'

export const getNewNroEnvio = (req, res) => {
  const sendNewNroEnvio = facturaNegroManager.getNroEnvio();

  //Ocurrio un error
  if (sendNewNroEnvio === -1) 
    return res.status(404).json({ message: "Something wrong" });
  
  return res.json({nroEnvio: sendNewNroEnvio})
};

export const getRefreshFacturaNegro = async (req, res) => {
  const { data, error } =
    await facturaNegroManager.getAllListFacturaNegroBBDD();

  if (error != null) return res.status(500).json(error);

  return res.json(data);
};

export const getFacturaNegro = async (req, res) => {
  const { data, error } = await facturaNegroManager.getAllListFacturaNegro();

  if (error != null) return res.status(500).json(error);

  return res.json(data);
};

export const newFacturaNegro = async (req, res) => {
  const object = req.body;
  const result = await facturaNegroManager.createFacturaNegro(object);

  if (result.error != null) return res.status(404).json(result.error);

  return res.json(result.data);
};