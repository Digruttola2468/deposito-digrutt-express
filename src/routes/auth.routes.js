import { Router } from "express";
import jwt from "jsonwebtoken";
import passport from "passport";
import { JWT_SECRET } from "../config/dotenv.js";
import { userServer } from "../services/index.repository.js";
import schemaValidation from "../middleware/schemaValidation.js";
import { schemaPostUser } from "../schemas/user.schema.js";

const router = Router();

router.get(
  "/profile",
  passport.authenticate("jwt", { session: false }),
  async (req, res, next) => {
    return res.json({
      user: req.user,
      token: req.query.secret_token,
    });
  }
);

router.post("/login", async (req, res, next) => {
  passport.authenticate("login", async (err, user, info) => {
    try {
      if (err || user == null)
        return res
          .status(err.statusCode)
          .json({ status: "error", message: err.message });

      req.login(user, { session: false }, async (err) => {
        if (err) return next(err);
        const token = jwt.sign({ user }, JWT_SECRET, { expiresIn: "5m" }); // expiresIn: "120h"
        return res.json({
          token,
          user: {
            role: user.role,
            nombre: user.nombre,
            apellido: user.apellido,
            gmail: user.gmail,
          },
          message: info.message,
        });
      });
    } catch (e) {
      return res
        .status(500)
        .json({ status: "error", message: "Something Wrong" });
    }
  })(req, res, next);
});

router.get("/validateGmail/:gmail", async (req, res) => {
  const gmail = req.params.gmail;

  try {
    await userServer.updateOkValidateGmail(gmail);

    return res.json({
      status: "success",
      message: "Ya el correo esta validado",
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: "error", message: "No se logro validar" });
  }
});

router.post(
  "/register",
  schemaValidation(schemaPostUser),
  async (req, res, next) => {
    passport.authenticate(
      "register",
      { session: false },
      async (err, user, info) => {
        if (err || user == null) {
          return res
            .status(err.statusCode)
            .json({ status: "error", message: err.message });
        }

        return res.json({
          message: "Registrado Exitoso",
          status: "success",
        });
      }
    )(req, res, next);
  }
);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/google/failure",
  }),
  (req, res) => {
    req.session.user = req.user;

    const token = jwt.sign({ user: req.user }, JWT_SECRET);
    return res.json({ token });
  }
);

router.get("/google/failure", (req, res) => {
  return res.send("Error al Autenticar con Google");
});

export default router;
