import { Router } from "express";
import userExtractor from "../middleware/userExtractor.js";
import allPermissions from "../config/permissos.js";
import { clienteServer } from "../services/index.repository.js";
import schemaValidation from "../middleware/schemaValidation.js";
import {
  schemaPostCliente,
  schemaPutCliente,
} from "../schemas/clientes.schema.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const [rows] = await clienteServer.getClientes();
    return res.json({ status: "success", data: rows });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: "error", message: "Something Wrong" });
  }
});

router.get("/:cid", async (req, res) => {
  try {
    const [rows] = await clienteServer.getOneCliente(req.params.cid);
    return res.json({ status: "success", data: rows[0] });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: "error", message: "Something Wrong" });
  }
});

router.post(
  "/",
  userExtractor([allPermissions.oficina, allPermissions.mercaderia]),
  schemaValidation(schemaPostCliente),
  async (req, res, next) => {
    const object = req.body;
    try {
      const [result] = await clienteServer.newCliente(object);
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

router.put(
  "/:id",
  userExtractor([allPermissions.oficina, allPermissions.mercaderia]),
  schemaValidation(schemaPutCliente),
  async (req, res, next) => {
    const idCliente = req.params.id;
    const object = req.body;
    try {
      const [result] = await clienteServer.updateCliente(idCliente, object);

      if (result.affectedRows >= 1) {
        const [rows] = await clienteServer.getOneCliente(idCliente);
        
        return res.json({ status: "success", data: rows[0] });
      } else
        return res
          .status(404)
          .json({ status: "error", message: "No existe ese cliente" });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ status: "error", message: "Something Wrong" });
    }
  }
);

router.delete(
  "/:id",
  userExtractor([allPermissions.oficina, allPermissions.mercaderia]),
  async (req, res, next) => {
    const idCliente = req.params.id;
    try {
      const [result] = await clienteServer.deleteCliente(idCliente);
      if (result.affectedRows >= 1)
        return res.json({
          status: "success",
          message: "Se elimino correctamente",
        });
      else
        return res
          .status(404)
          .json({ status: "error", message: "No existe ese cliente" });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ status: "error", message: "Something Wrong" });
    }
  }
);

export default router;
