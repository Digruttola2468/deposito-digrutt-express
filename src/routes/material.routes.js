import { Router } from "express";
import { con } from "../config/db.js";

const ruta = Router();

ruta.get("/materiaPrima", async (req, res) => {
  try {
    const [rows] = await con.query("SELECT * FROM materiaPrima");
    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ message: "Something Wrong" });
  }
});

export default ruta;