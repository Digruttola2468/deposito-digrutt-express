import { Router } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config.js";
import { db_supabase } from "../config/supabase.js";

const router = Router();

router.get("/login", async (req, res) => {
  const gmail = req.query.email;

  if (gmail != null) {
    try {
      const { data, error } = await db_supabase
        .from("users")
        .select()
        .eq("gmail", gmail);

      if (error) throw new Error("Error al momento de leer tabla");

      if (data.length === 0)
        return res.status(404).send({ message: "No se encontro el usuario" });

      const userForToken = {
        created_at: data[0].created_at,
        nombre: data[0].nombre,
        apellido: data[0].apellido,
        gmail: data[0].gmail,
        role: data[0].role,
      };

      const token = jwt.sign(userForToken, JWT_SECRET);

      return res.json({
        ...userForToken,
        token,
      });
    } catch (error) {
      return res.status(500).send({ message: "Something wrong" });
    }
  } else res.status(404).send({ message: "Gmail Vacio" });
});

export default router;
