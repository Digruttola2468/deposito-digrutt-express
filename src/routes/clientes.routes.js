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

const handleReturnErrors = (res, campus, message) => {
  return res.status(400).json({ status: "error", errors: [{campus, message}] });
};

const handleErrors = (e, res, campus = ["idLocalidad", "cliente", "codigo"]) => {
  switch (e.code) {
    case "ER_TRUNCATED_WRONG_VALUE_FOR_FIELD":
      if (e.sqlMessage.includes("idLocalidad"))
        handleReturnErrors(res, "idLocalidad", "Error tipo de dato");

      break;
    case "WARN_DATA_TRUNCATED":
      if (e.sqlMessage.includes("idLocalidad"))
        handleReturnErrors(res, "idLocalidad", "Error tipo de dato");

      break;
    case "ER_NO_REFERENCED_ROW_2":
      if (e.sqlMessage.includes("idLocalidad"))
        handleReturnErrors(res, "idLocalidad", "No existe esa localidad");

      break;
    case "ER_DUP_ENTRY":
      if (e.sqlMessage.includes("cliente"))
        handleReturnErrors(res, "cliente", "Ya existe ese cliente");
      if (e.sqlMessage.includes("codigo"))
        handleReturnErrors(res, "codigo", "Error al intentar crear cliente");
      break;
    default:
      throw e;
  }
};

router.get("/", async (req, res) => {
  try {
    const rows = await clienteServer.getClientes();
    return res.json({ status: "success", data: rows });
  } catch (error) {
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
    return res
      .status(500)
      .json({ status: "error", message: "Something Wrong" });
  }
});

router.post(
  "/",
  userExtractor([allPermissions.oficina, allPermissions.mercaderia]),
  schemaValidation(schemaPostCliente),
  async (req, res) => {
    const object = req.body;
    try {
      const [result] = await clienteServer.newCliente(object);
      return res.json({
        status: "success",
        data: { id: result.insertId, ...object },
      });
    } catch (e) {
      handleErrors(e, res)
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
    } catch (e) {
      handleErrors(e, res)
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
      return res
        .status(500)
        .json({ status: "error", message: "Something Wrong" });
    }
  }
);

export default router;
