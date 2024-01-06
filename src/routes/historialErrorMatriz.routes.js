import { Router } from "express";
import { historialErrorMatrizManager } from "../index.js";
import userExtractor from "../middleware/userExtractor.js";

const ruta = Router();

ruta.get("/historialMatriz",userExtractor, async (req, res) => {
  const solved = req.query?.solved;

  if (solved >= 1)
    return res.json(historialErrorMatrizManager.getIsSolvedTrue());
  else if (solved <= 0)
    return res.json(historialErrorMatrizManager.getIsSolvedFalse());
  else {
    const { data, error } = await historialErrorMatrizManager.getHistorial();

    if (error) return res.status(404).json(error);

    return res.json(data);
  }
});

ruta.get("/historialMatriz/:idHistorial",userExtractor, (req, res) => {
  const idHistorial = req.params.idHistorial;
  const result = historialErrorMatrizManager.getOne(idHistorial);

  return res.json(result);
});

ruta.get("/historialMatriz/:idMatriz/listIdMatriz",userExtractor, (req, res) => {
  const idMatriz = req.params.idMatriz;
  const result = historialErrorMatrizManager.getListByIdMatriz(idMatriz);

  return res.json(result);
});

ruta.post("/historialMatriz",userExtractor, async (req, res) => {
  const object = req.body;
  const { data, error } = await historialErrorMatrizManager.postHistorialMatriz(
    object
  );
  if (error) return res.status(404).json(error);

  return res.json(data);
});

ruta.put("/historialMatriz/:idHistorial",userExtractor, async (req, res) => {
  const idHistorial = req.params.idHistorial;
  const body = req.body;
  const { data, error } =
    await historialErrorMatrizManager.updateHistorialMatriz(idHistorial, body);
  if (error) return res.status(404).json(error);

  return res.json(data);
});

ruta.put("/historialMatriz/:idHistorial/:solved",userExtractor, async (req, res) => {
  const idHistorial = req.params.idHistorial;
  const isSolved = req.params.solved;
  const { data, error } = await historialErrorMatrizManager.updateIsSolved(
    idHistorial,
    isSolved
  );
  if (error) return res.status(404).json(error);

  return res.json(data);
});

ruta.delete('/historialMatriz/:idHistorial', userExtractor, async (req,res) => {
  const idHistorial = req.params.idHistorial;
  const { data, error } = await historialErrorMatrizManager.deleteHistorialMatriz(
    idHistorial
  );

  if (error) return res.status(500).json(error);

  return res.json(data);
})

export default ruta;
