import { Router } from "express";
import userExtractor from "../middleware/userExtractor.js";
import { con } from "../config/db.js";

const router = Router();

router.get("/localidad", async (req, res) => {
  try {
    const [rows] = await con.query("SELECT * FROM localidad;");

    res.json(rows);
  } catch (error) {
    return res.status(500).send({ message: "Something wrong" });
  }
});

router.get("/localidad/:id", async (req, res) => {
  try {
    const [rows] = await con.query("SELECT * FROM localidad WHERE id = ?;", [
      req.params.id,
    ]);

    if (rows.length <= 0) return res.status(404).json({ message: "No existe" });

    res.json(rows);
  } catch (error) {
    return res.status(500).send({ message: "Something wrong" });
  }
});

router.post("/localidad", userExtractor, async (req, res) => {
  try {
    const { ciudad } = req.body;
    const [rows] = await con.query(
      "INSERT INTO localidad (ciudad) VALUES (?) ;",
      [ciudad]
    );

    res.json({
      id: rows.insertId,
      ciudad,
    });
  } catch (error) {
    return res.status(500).send({ message: "Something wrong" });
  }
});

router.put("/localidad/:id", userExtractor, async (req, res) => {
  try {
    const { ciudad } = req.body;
    const id = req.params.id;

    const [result] = await con.query(
      "UPDATE localidad SET ciudad = IFNULL(?,ciudad) WHERE id = ?",
      [ciudad, id]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Ciudad not found" });

    const [rows] = await con.query("SELECT * FROM localidad WHERE id = ?", [
      id,
    ]);
    res.json(rows[0]);
  } catch (error) {
    return res.status(500).send({ message: "Something wrong" });
  }
});

router.delete("/localidad/:id", userExtractor, async (req, res) => {
  try {
    const [result] = await con.query(
      "DELETE FROM localidad WHERE (`id` = ?);",
      [req.params.id]
    );

    if (result.affectedRows <= 0)
      return res.status(404).json({ message: "No se encontro" });

    res.status(200).send({ message: "Eliminado Correctamente" });
  } catch (error) {
    return res.status(500).send({ message: "Something wrong" });
  }
});

export default router;
