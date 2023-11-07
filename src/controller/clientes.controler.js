import ClientesManager from "../class/ClientesManager.js";

const clientManager = new ClientesManager();

export const getRefreshClientes = async (req, res) => {
  const { data, error } = await clientManager.refreshListClientes();

  if (error != null) return res.status(500).json(error);

  return res.json(data);
};

export const getClientes = async (req, res) => {
  const { data, error } = await clientManager.getAllClientes();

  if (error != null) return res.status(500).json(error);

  return res.json(data);
};

export const getOneCliente = async (req, res) => {
  const idCliente = req.params.id;

  const { data, error } = clientManager.getOneCliente(idCliente);

  if (error != null) return res.status(500).json(error);

  return res.json(data);
};

export const createCliente = async (req, res) => {
  const object = req.body;
  const result = await clientManager.createCliente(object);

  if (result.error != null) return res.status(404).json(result.error);

  return res.json(result.data);
};

export const updateCliente = async (req, res) => {
  const idCliente = req.params.id;
  const object = req.body;
  const { data, error } = await clientManager.updateCliente(idCliente, object);

  if (error != null) return res.status(500).json(error);

  return res.json(data);
};

export const deleteCliente = async (req, res) => {
  const idCliente = req.params.id;
  const { data, error } = await clientManager.deleteCliente(idCliente);

  if (error != null) return res.status(500).json(error);

  return res.json(data);
};
