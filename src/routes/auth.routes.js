import { Router } from "express";
import jwt from "jsonwebtoken";
import passport from "passport";
import { JWT_SECRET } from "../config/dotenv.js";
import { userServer } from "../services/index.repository.js";
import schemaValidation from "../middleware/schemaValidation.js";
import { schemaPostUser } from "../schemas/user.schema.js";

const router = Router();

const NAME_COOKIE = "access_token"
const COOKIE_OPTIONS = {
  httpOnly: true, // La cookie solo se puede acceder en el servidor
  secure: false, //La cookie solo se puede acceder en https
  sameSite: "none", // La cookie solo se puede acceder en el mismo dominio
  maxAge: 12000 * 60 * 60, //La cookie tiene un tiempo de validez de 12h
  domain: "http://localhost:5173"
}

/**
 * @swagger
 * components:
 *  schemas:
 *    User:
 *      type: object
 *      properties:
 *        first_name:
 *          type: string
 *          description: nombre
 *        last_name:
 *          type: string
 *          description: apellido
 *        email:
 *          type: string
 *          description: correo electronico
 *        password:
 *          type: password
 *          description: contraseña
 *      required:
 *        - first_name
 *        - last_name
 *        - email
 *        - password
 *      example:
 *        first_name: juaco
 *        last_name: cesar
 *        email: yourcorreoelectronico@gmail.com
 *        password: juacocesar2010
 */


/**
 * @swagger
 * /api/session/protected:
 *  get:
 *    summary: Obtener datos del usuario
 *    tags: [User]
 *    responses:
 *      200:
 *        description: Se obtuvo correctamente
 */
router.get(
  "/protected",
  async (req, res, next) => {
    const token = req.cookies.access_token
    if (!token) 
      return res.status(403).json({status: "error", message: "Access not authorized"})
    
    try {
      const data = jwt.verify(token, JWT_SECRET)
      return res.json(data);
    } catch (error) {
      return res.status(401).json({status: "error", message: "Access not authorized"})
    }
  }
);

/**
 * @swagger
 * /api/session/logout:
 *  post:
 *    summary: Cerrar Session
 *    tags: [User]
 *    responses:
 *      200:
 *        description: Cerrado Con exito
 */
router.post(
  "/logout",
  (req, res, next) => {
    req.session.destroy();
    return res.clearCookie(NAME_COOKIE).json({status: "success", message: "Cerrado con exito"})
  }
);

/**
 * @swagger
 * /api/session/login:
 *  post:
 *    summary: Login User
 *    tags: [User]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              email:
 *                type: string
 *                description: correo electronico
 *              password:
 *                type: string
 *                description: contraseña
 *            required:
 *              - email
 *              - password
 *            example:
 *              email: yourcorreoelectronico@gmail.com
 *              password: juacocesar2010
 *    responses:
 *      200:
 *        description: Se logio correctamente!
 *        headers: 
 *          Set-Cookie:
 *            schema: 
 *              type: string
 *              example: access_token=abcde12345; Path=/; HttpOnly
 */
router.post("/login", async (req, res, next) => {
  passport.authenticate("login", async (err, user, info) => {
    try {
      if (err || user == null)
        return res
          .status(err.statusCode)
          .json({ status: "error", message: err.message });

      req.login(user, { session: false }, async (err) => {
        if (err) return next(err);
        const token = jwt.sign({ user }, JWT_SECRET, {
          expiresIn: "12h",
        });
        return res
          .cookie(NAME_COOKIE, token, COOKIE_OPTIONS)
          .json({
            user: {
              role: user.role,
              nombre: user.nombre,
              apellido: user.apellido,
              gmail: user.gmail,
              isGmailValidate: user.isGmailValidate,
              isGoogleAuth: user.isGoogleAuth
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

/**
 * @swagger
 * /api/session/register:
 *  post:
 *    summary: nuevo usuario
 *    tags: [User]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            $ref: '#/components/schemas/User'
 *    responses:
 *      200:
 *        description: Se creo correctamente!
 */
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

    const token = jwt.sign({ user: req.user }, JWT_SECRET, {
      expiresIn: "12h",
    });
    return res
      .cookie(NAME_COOKIE, token, COOKIE_OPTIONS)
      .json({ user: req.user })
  }
);

router.get("/google/failure", (req, res) => {
  return res.send("Error al Autenticar con Google");
});

export default router;
