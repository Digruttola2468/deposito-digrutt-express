import { Router } from "express";
import { pedidosManager } from "../index.js";
import userExtractor, { auth } from "../middleware/userExtractor.js";
import allPermissions from "../config/permissos.js";

const ruta = Router();

ruta.get(
  "/",
  userExtractor([allPermissions.mercaderia, allPermissions.oficina]),
  async (req, res) => {
    const { data, error } = await pedidosManager.getPedidos();

    if (error) return res.status(404).json(error);

    return res.json(data);
  }
);

ruta.get(
  "/list/:value",
  userExtractor([allPermissions.mercaderia, allPermissions.oficina]),
  async (req, res) => {
    const order = req.query.order;
    const id = req.params.value;

    if (order == "inventario") {
      const result = pedidosManager.getproductsByidInventario(id);
      return res.json(result);
    }
    if (order == "clientes") {
      const result = pedidosManager.getproductsByIdCliente(id);
      return res.json(result);
    }
    if (order == "done") {
      const result = pedidosManager.getproductsByIsDone(id);
      return res.json(result);
    }
    const result = pedidosManager.getproductsByIsDone(id);
    return res.json(result);
  }
);

ruta.get(
  "/:idPedido",
  userExtractor([allPermissions.mercaderia, allPermissions.oficina]),
  async (req, res) => {
    const idPedido = req.params.idPedido;

    const result = pedidosManager.getOne(idPedido);

    return res.json(result);
  }
);

ruta.post(
  "/",
  userExtractor([allPermissions.mercaderia, allPermissions.oficina]),
  async (req, res, next) => {
    const object = req.body;
    try {
      const { data, error } = await pedidosManager.postPedidos(object);

      if (error) return res.status(404).json(error);

      return res.json(data);
    } catch (error) {
      next(error);
    }
  }
);

//Falta validar si esta bien realizada la lista
ruta.post(
  "/list",
  userExtractor([allPermissions.mercaderia, allPermissions.oficina]),
  async (req, res) => {
    const object = req.body;
    const { data, error } = await pedidosManager.postListPedidos(object);

    if (error) return res.status(404).json(error);

    return res.json(data);
  }
);

ruta.put(
  "/:idPedido",
  userExtractor([allPermissions.mercaderia, allPermissions.oficina]),
  async (req, res, next) => {
    const idPedido = req.params.idPedido;
    const object = req.body;
    try {
      const { data, error } = await pedidosManager.updatePedidos(
        idPedido,
        object
      );

      if (error) return res.status(404).json(error);

      return res.json(data);
    } catch (error) {
      next(error);
    }
  }
);

ruta.put(
  "/:idPedido/doneStock",
  userExtractor([allPermissions.mercaderia, allPermissions.oficina]),
  async (req, res) => {
    const idPedido = req.params.idPedido;
    const { isDone } = req.body;

    if (isDone != null) {
      const { data, error } = await pedidosManager.updatePedidosIsDone(
        idPedido,
        isDone
      );

      if (error) return res.status(404).json(error);

      return res.json(data);
    }
  }
);

ruta.delete(
  "/:idPedido",
  userExtractor([allPermissions.mercaderia, allPermissions.oficina]),
  async (req, res, next) => {
    const idPedido = req.params.idPedido;
    try {
      const { data, error } = await pedidosManager.deletePedido(idPedido);

      if (error) return res.status(404).json(error);

      return res.json(data);
    } catch (error) {
      next(error);
    }
  }
);

export default ruta;
