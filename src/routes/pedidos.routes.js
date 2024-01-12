import { Router } from "express";
import { pedidosManager } from "../index.js";
import userExtractor from "../middleware/userExtractor.js";

const ruta = Router();

ruta.get("/pedidos", userExtractor, async (req, res) => {
  const { data, error } = await pedidosManager.getPedidos();

  if (error) return res.status(404).json(error);

  return res.json(data);
});

ruta.get("/pedidos/list/:value", userExtractor, async (req, res) => {
  const order = req.query.order;
  const id = req.params.value;

  if (order == "inventario") {
    const result = pedidosManager.getListByIdInventario(id);
    return res.json(result);
  }
  if (order == "clientes") {
    const result = pedidosManager.getListByIdCliente(id);
    return res.json(result);
  }
  if (order == "done") {
    const result = pedidosManager.getListByIsDone(id);
    return res.json(result);
  }
  const result = pedidosManager.getListByIsDone(id);
  return res.json(result);
});

ruta.get("/pedidos/:idPedido", userExtractor, async (req, res) => {
  const idPedido = req.params.idPedido;

  const result = pedidosManager.getOne(idPedido);

  return res.json(result);
});

ruta.post("/pedidos", userExtractor, async (req, res) => {
  const object = req.body;
  const { data, error } = await pedidosManager.postPedidos(object);

  if (error) return res.status(404).json(error);

  return res.json(data);
});

//Falta validar si esta bien realizada la lista
ruta.post("/pedidos/list", userExtractor, async (req, res) => {
  const object = req.body;
  const { data, error } = await pedidosManager.postListPedidos(object);

  if (error) return res.status(404).json(error);

  return res.json(data);
});

ruta.put("/pedidos/:idPedido", userExtractor, async (req, res) => {
  const idPedido = req.params.idPedido;
  const object = req.body;
  const { data, error } = await pedidosManager.updatePedidos(idPedido, object);

  if (error) return res.status(404).json(error);

  return res.json(data);
});

ruta.put("/pedidos/:idPedido/doneStock", userExtractor, async (req, res) => {
  const idPedido = req.params.idPedido;
  const { stockDisposicion, isDone } = req.body;

  if (stockDisposicion != null) {
    const { data, error } = await pedidosManager.updatePedidosStockDisposicion(
      idPedido,
      stockDisposicion
    );

    if (error) return res.status(404).json(error);

    return res.json(data);
  }
  if (isDone != null) {
    const { data, error } = await pedidosManager.updatePedidosIsDone(
      idPedido,
      isDone
    );

    if (error) return res.status(404).json(error);

    return res.json(data);
  }
});

ruta.delete("/pedidos/:idPedido", userExtractor, async (req, res) => {
  const idPedido = req.params.idPedido;
  const { data, error } = await pedidosManager.deletePedido(idPedido);

  if (error) return res.status(404).json(error);

  return res.json(data);
});

export default ruta;