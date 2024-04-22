import { Router } from "express";
import userExtractor from "../middleware/userExtractor.js";
import allPermissions from "../config/permissos.js";
import { pedidoServer } from "../services/index.repository.js";
import schemaValidation, {
  schemaListValidation,
} from "../middleware/schemaValidation.js";
import {
  schemaPostListPedidos,
  schemaPostPedidos,
  schemaPutPedidos,
  schemaPutPedidosDone,
} from "../schemas/pedidos.schema.js";

const ruta = Router();

const handleReturnErrors = (res, campus, message) => {
  return res
    .status(400)
    .json({ status: "error", errors: [{ campus, message }] });
};

const handleErrors = (e, res) => {
  switch (e.code) {
    case "ER_NO_REFERENCED_ROW_2":
    case "ER_TRUNCATED_WRONG_VALUE_FOR_FIELD":
      if (e.sqlMessage.includes("idinventario"))
        handleReturnErrors(res, "idinventario", "No existe ese cod.producto");

      if (e.sqlMessage.includes("idcliente"))
        handleReturnErrors(res, "idcliente", "No existe ese cliente");

      if (e.sqlMessage.includes("cantidadEnviar"))
        handleReturnErrors(
          res,
          "cantidadEnviar",
          "Cantidad Enviar no es numerico"
        );

      break;
    default:
      throw e;
  }
};

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

/*ruta.get(
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
  schemaValidation(schemaPostPedidos),
  async (req, res, next) => {
    const object = req.body;

    const validarDate = new Date(object.fecha_entrega);

    if (Number.isNaN(validarDate.getDate()))
      return res.status(400).json({
        status: "error",
        errors: [{ campus: "fecha", message: "La fecha es invalido" }],
      });

    try {
      const [result] = await pedidoServer.newPedido(object);
      if (result.affectedRows >= 1) {
        const [rows] = await pedidoServer.getOnePedido(result.insertId);

        return res.json({ status: "success", data: rows[0] });
      } else
        return res
          .status(404)
          .json({ status: "error", message: "No existe ese pedido" });
    } catch (error) {
      handleErrors(error, res);
    }
  }
);

ruta.post(
  "/list",
  userExtractor([allPermissions.mercaderia, allPermissions.oficina]),
  schemaListValidation(schemaPostListPedidos),
  async (req, res) => {
    const list = req.body;

    const listErrors = [];
    for (let i = 0; i < list.length; i++) {
      const element = list[i];
      const validarDate = new Date(element.fecha_entrega);

      if (Number.isNaN(validarDate.getDate()))
        listErrors.push({
          index: i,
          campus: "fecha",
          message: `La fecha es invalido`,
        });
    }

    if (listErrors.length != 0)
      return res.status(400).json({ status: "error", errors: listErrors });

    try {
      const result = await pedidoServer.newListPedidos(list);

      return res.json({ status: "success", data: result });
    } catch (error) {
      handleErrors(error, res);
    }
  }
);

ruta.put(
  "/:idPedido",
  userExtractor([allPermissions.mercaderia, allPermissions.oficina]),
  schemaValidation(schemaPutPedidos),
  async (req, res, next) => {
    const idPedido = req.params.idPedido;
    const object = req.body;
    
    if (object.fecha_entrega != null && object.fecha_entrega != "") {
      const validarDate = new Date(object.fecha_entrega);

      if (Number.isNaN(validarDate.getDate()))
        return res.status(400).json({
          status: "error",
          errors: [{ campus: "fecha", message: "La fecha es invalido" }],
        });
    }

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
      handleErrors(error, res);
    }
  }
);

ruta.put(
  "/:idPedido/doneStock",
  userExtractor([allPermissions.mercaderia, allPermissions.oficina]),
  schemaValidation(schemaPutPedidosDone),
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
