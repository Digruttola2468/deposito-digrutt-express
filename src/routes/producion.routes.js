import { Router } from "express";
import userExtractor from "../middleware/userExtractor.js";
import allPermissions from "../config/permissos.js";
import { produccionServer } from "../services/index.repository.js";

const ruta = Router();

ruta.get("/", userExtractor([allPermissions.produccion]), async (req, res) => {
  try {
    const [rows] = await produccionServer.getProduccion();
    return res.json({ status: "success", data: rows });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: "error", message: "Something Wrong" });
  }
});

ruta.get(
  "/:idProduccion",
  userExtractor([allPermissions.produccion]),
  async (req, res) => {
    try {
      const [rows] = await produccionServer.getOneProduccion(
        req.params.idProduccion
      );
      return res.json({ status: "success", data: rows[0] });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ status: "error", message: "Something Wrong" });
    }
  }
);

ruta.get(
  "/:numMaquina",
  userExtractor([allPermissions.produccion]),
  async (req, res) => {
    const numMaquina = req.params.numMaquina;
    const init = req.query.init;
    const end = req.query.end;

    try {
      const result = await produccionServer.getRangeDateByMaquina(
        numMaquina,
        init,
        end
      );
      return res.json({ status: "success", data: result });
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
  userExtractor([allPermissions.produccion]),
  async (req, res, next) => {
    const object = req.body;
    try {
      const [result] = await produccionServer.newOneProduccion(object);
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

ruta.post(
  "/list",
  userExtractor([allPermissions.produccion]),
  async (req, res, next) => {
    const list = req.body;
    try {
      const result = await produccionServer.newListProduccion(list);

      return res.json({ status: "success", data: result });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ status: "error", message: "Something Wrong" });
    }
  }
);

ruta.put(
  "/:idProduccion",
  userExtractor([allPermissions.produccion]),
  async (req, res) => {
    const idProduccion = req.params.idProduccion;
    const body = req.body;

    try {
      const [result] = await produccionServer.updateProduccion(
        idProduccion,
        body
      );

      if (result.affectedRows >= 1) {
        const [rows] = await produccionServer.getOneProduccion(idProduccion);

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

ruta.delete(
  "/:idProduccion",
  userExtractor([allPermissions.produccion]),
  async (req, res, next) => {
    try {
      const [result] = await produccionServer.deleteProduccion(
        req.params.idProduccion
      );
      if (result.affectedRows >= 1)
        return res.json({
          status: "success",
          message: "Se elimino correctamente",
        });
      else
        return res
          .status(404)
          .json({ status: "error", message: "No existe esa Produccion" });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ status: "error", message: "Something Wrong" });
    }
  }
);

export default ruta;
