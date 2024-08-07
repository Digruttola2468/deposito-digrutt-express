import { Router } from "express";

import userExtractor from "../middleware/userExtractor.js";
import con from "../config/db.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const [rows] = await con.query("SELECT * FROM tipoproducto;");

    res.json(rows);
  } catch (error) {
    return res.status(500).send({ message: "Something wrong" });
  }
});
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await con.query("SELECT * FROM tipoproducto WHERE id = ?;", [
      req.params.id,
    ]);

    if (rows.length <= 0) return res.status(404).json({ message: "No existe" });

    res.json(rows);
  } catch (error) {
    return res.status(500).send({ message: "Something wrong" });
  }
});

router.post("/", userExtractor([]), async (req, res) => {
  try {
    const { nombre } = req.body;
    const [rows] = await con.query(
      "INSERT INTO tipoproducto (tipo) VALUES (?) ;",
      [nombre]
    );

    res.json({
      id: rows.insertId,
      nombre,
    });
  } catch (error) {
    return res.status(500).send({ message: "Something wrong" });
  }
});

router.put("/:id", userExtractor([]), async (req, res) => {
  try {
    const { nombre } = req.body;
    const id = req.params.id;
    const [result] = await con.query(
      "UPDATE tipoproducto SET tipo = IFNULL(?,tipo) WHERE id = ?",
      [nombre, id]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "tipo producto not found" });

    const [rows] = await con.query("SELECT * FROM tipoproducto WHERE id = ?", [
      id,
    ]);
    res.json(rows[0]);
  } catch (error) {
    return res.status(500).send({ message: "Something wrong" });
  }
});

router.delete("/:id",userExtractor([]), async (req, res) => {
  try {
    const [result] = await con.query(
      "DELETE FROM tipoproducto WHERE (`id` = ?);",
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
