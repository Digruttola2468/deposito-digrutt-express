import { Router } from "express";
import con from "../config/db.js";

const ruta = Router();

ruta.get("/", async (req, res) => {
  try {
    const [rows] = await con.query("SELECT * FROM motivoMaquinaParada");
    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ message: "Something Wrong" });
  }
});

export default ruta;
