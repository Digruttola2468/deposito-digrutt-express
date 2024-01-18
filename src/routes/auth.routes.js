import { Router } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config.js";
import { authManager } from "../index.js";
import { db_supabase } from "../config/supabase.js";
import passport from "passport";

const router = Router();

router.get("/login", async (req, res) => {
  const gmail = req.query.email;
  const password = req.query.password;

  if (gmail != null) {
    if (password != null) {
      try {
        const signIn = await db_supabase.auth.signInWithPassword({
          email: gmail,
          password: password,
        });

        if (signIn.error != null) {
          if (signIn.error.message == "Email not confirmed")
            return res.status(404).json({
              message: "El gmail no esta verificado",
              status: "not validated gmail",
            });
          if (signIn.error.message == "Invalid login credentials") {
            return res.status(404).json({
              message: "El correo o la contraseña son incorrectos",
              status: "incorrect gmail password",
            });
          } else return res.status(404).json({ message: "Upss..." });
        }

        if (!(await authManager.existUser(gmail))) {
          //Agregar a la base de datos
          const result = await authManager.postUser({
            nombre: signIn.data.user.user_metadata.first_name,
            apellido: signIn.data.user.user_metadata.last_name,
            gmail: signIn.data.user.email,
          });

          if (result.error) return res.status(404).json({ message: "Upss..." });
        }

        const user = await authManager.getUserByGmail(gmail);

        if (user.length == 0)
          return res.status(404).json({
            message: "No se encuntra el usuario",
            status: "not found user",
          });

        const userForToken = {
          created_at: signIn.data.user.created_at,
          nombre: user.nombre,
          apellido: user.apellido,
          gmail: user.gmail,
          role: user.role,
        };

        const token = jwt.sign(userForToken, JWT_SECRET);

        return res.json({
          ...userForToken,
          token,
        });
      } catch (error) {
        console.log(error);
        return res.status(500).send({ message: "Something wrong" });
      }
    } else res.status(404).send({ message: "Password Vacio" });
  } else res.status(404).send({ message: "Gmail Vacio" });
});

router.post("/register", async (req, res) => {
  const { gmail, password, nombre, apellido } = req.body;

  // Validar que los campos no esten vacios
  if (gmail == null || gmail == "")
    return res
      .status(400)
      .json({ message: "Campo Gmail vacio", campus: "gmail" });

  if (password == null || password == "")
    return res
      .status(400)
      .json({ message: "Campo Contraseña vacio", campus: "contraseña" });

  if (nombre == null || nombre == "")
    return res
      .status(400)
      .json({ message: "Campo Nombre vacio", campus: "nombre" });

  if (apellido == null || apellido == "")
    return res
      .status(400)
      .json({ message: "Campo Apellido vacio", campus: "apellido" });

  // Validar que el formato del gmail sea correcto
  const pattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;

  if (gmail.match(pattern)) {
    // Registra el usuario pero no se puede loggea porque tiene que confirmar su gmail
    try {
      const { data, error } = await db_supabase.auth.signUp({
        email: gmail,
        password: password,
        options: {
          emailRedirectTo: "localhost:3000/api/callback",
          data: {
            first_name: nombre,
            last_name: apellido,
          },
        },
      });

      if (error) {
        if (error.status == 422)
          return res
            .status(500)
            .json({
              message: "La contraseña tiene que ser +6 caracteres",
              status: "long character password",
              campus: "password",
            });
        else return res.status(500).json({ message: "something wrong" });
      }

      return res.json({ message: "Usuario Registrado" });
    } catch (error) {
      return res.status(500).json({ message: "something wrong" });
    }
  } else
    return res
      .status(400)
      .json({
        message: "Error en el formato del correo electronico",
        campus: "gmail",
      });
});

router.get(
  "/google",
  passport.authenticate("google", { scope: ["user:email"] })
);

router.get("/google/callback", (req, res) => {
  passport.authenticate("google", {
    successRedirect: "https://deposito-digrutt-produccion.onrender.com/",
    failureRedirect: "/google/failure",
  });
});

router.get("/google/failure", (req, res) => {
  res.send("Ocurrio un error");
});

export default router;
