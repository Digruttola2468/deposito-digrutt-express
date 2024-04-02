import { Router } from "express";
import userExtractor from "../middleware/userExtractor.js";
import allPermissions from "../config/permissos.js";
import { pedidoServer } from "../services/index.repository.js";

const ruta = Router();

ruta.get(
  "/",
  userExtractor([allPermissions.mercaderia, allPermissions.oficina]),
  async (req, res) => {
    try {
      const rows = await pedidoServer.getPedidos();
      return res.json({ status: "success", data: rows });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ status: "error", message: "Something Wrong" });
    }
  }
);
/*
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
);*/

ruta.get(
  "/:idPedido",
  userExtractor([allPermissions.mercaderia, allPermissions.oficina]),
  async (req, res) => {
    try {
      const [rows] = await pedidoServer.getOnePedido(req.params.idPedido);
      return res.json({ status: "success", data: rows[0] });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ status: "error", message: "Something Wrong" });
    }
  }
);

ruta.post(
  "/",
  userExtractor([allPermissions.mercaderia, allPermissions.oficina]),
  async (req, res, next) => {
    const object = req.body;
    try {
      const [result] = await pedidoServer.newPedido(object);
      return res.json({
        status: "success",
        data: { id: result.insertId, ...object },
      });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ status: "error", message: "Something Wrong" });
    }
  }
);

//Falta validar si esta bien realizada la lista
/*ruta.post(
  "/list",
  userExtractor([allPermissions.mercaderia, allPermissions.oficina]),
  async (req, res) => {
    const object = req.body;
    const { data, error } = await pedidosManager.postListPedidos(object);

    if (error) return res.status(404).json(error);

    return res.json(data);
  }
);*/

ruta.put(
  "/:idPedido",
  userExtractor([allPermissions.mercaderia, allPermissions.oficina]),
  async (req, res, next) => {
    const idPedido = req.params.idPedido;
    const object = req.body;
    try {
      const [result] = await pedidoServer.updatePedido(idPedido, object);

      if (result.affectedRows >= 1) {
        const [rows] = await pedidoServer.getOnePedido(idPedido);

        return res.json({ status: "success", data: rows[0] });
      } else
        return res
          .status(404)
          .json({ status: "error", message: "No existe ese pedido" });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ status: "error", message: "Something Wrong" });
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
      try {
        const [result] = await pedidoServer.updateDonePedido(idPedido, isDone);

        if (result.affectedRows >= 1) {
          const [rows] = await pedidoServer.getOnePedido(idPedido);

          return res.json({ status: "success", data: rows[0] });
        } else
          return res
            .status(404)
            .json({ status: "error", message: "No existe ese pedido" });
      } catch (error) {
        console.log(error);
        return res
          .status(500)
          .json({ status: "error", message: "Something Wrong" });
      }
    }
  }
);

ruta.delete(
  "/:idPedido",
  userExtractor([allPermissions.mercaderia, allPermissions.oficina]),
  async (req, res, next) => {
    try {
      const [result] = await pedidoServer.deletePedido(req.params.idPedido);
      if (result.affectedRows >= 1)
        return res.json({
          status: "success",
          message: "Se elimino correctamente",
        });
      else
        return res
          .status(404)
          .json({ status: "error", message: "No existe ese pedido" });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ status: "error", message: "Something Wrong" });
    }
  }
);

export default ruta;
