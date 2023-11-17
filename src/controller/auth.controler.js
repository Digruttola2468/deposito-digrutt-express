import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config.js";

import { db_supabase } from "../supabase/supabase.js";

export const iniciarSesion = async (req, res) => {
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
        is_admin: data[0].is_admin,
        is_mercaderia: data[0].is_mercaderia,
        is_oficina: data[0].is_oficina,
        is_produccion: data[0].is_produccion,
        is_matriceria: data[0].is_matriceria,
        gmail: data[0].gmail,
      };

      if (
        userForToken.is_admin != false ||
        userForToken.is_mercaderia != false ||
        userForToken.is_oficina != false ||
        userForToken.is_produccion != false ||
        userForToken.is_matriceria != false
      ) {
        const token = jwt.sign(userForToken, JWT_SECRET);

        return res.json({
          ...userForToken,
          token,
        });
      } else
        return res.status(404).send({
          message:
            "Todavia No estas habilitado, avisale al dueño de la pagina para que te habilite",
        });
    } catch (error) {
      return res.status(500).send({ message: "Something wrong" });
    }
  } else res.status(404).send({ message: "Gmail Vacio" });
};
