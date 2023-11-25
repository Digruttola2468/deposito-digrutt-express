import { inventarioManager } from "../index.js";

export const getRefreshInventario = async (req, res) => {
  const { data, error } = await inventarioManager.refreshListInventario();

  if (error != null) return res.status(404).json(error);

  return res.json(data);
};

export const getAllInventario = async (req, res) => {
  const { data, error } = await inventarioManager.getInventario();

  if (error != null) return res.status(404).json(error);

  return res.json(data);
};

export const getInventariosSelectNombres = async (req, res) => {
  const { data, error } = inventarioManager.getListInventarioNombre();

  if (error != null) return res.status(404).json(error);

  return res.json(data);
};

export const getOneInventario = (req, res) => {
  const idInventario = req.params.id;
  const { data, error } = inventarioManager.getOneInventario(
    idInventario
  );

  if (error != null) return res.status(404).json(error);

  console.log(data);
  return res.json(data);
};

export const getSumInventario = async (req, res) => {
  const { id } = req.params;

  const result = await inventarioManager.suminventario(id);

  if (result.error != null)
    return res.status(404).json({ message: "Ocurrio un error" });

  return res.json(result.data);
};

export const createInventario = async (req, res) => {
  const object = req.body;
  const { data, error } = await inventarioManager.createInventario(object);

  if (error != null) return res.status(404).json(error);

  return res.json(data);
};

export const updateInventario = async (req, res) => {
  const idInventario = req.params.id;
  const object = req.body;
  const { data, error } = await inventarioManager.updateInventario(
    idInventario,
    object
  );

  if (error != null) return res.status(500).json(error);

  return res.json(data);
};

export const deleteInventario = async (req, res) => {
  const idInventario = req.params.id;
  const { data, error } = await inventarioManager.deleteInventario(
    idInventario
  );

  if (error != null) return res.status(500).json(error);

  return res.json(data);
};
