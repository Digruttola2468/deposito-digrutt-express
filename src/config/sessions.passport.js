import passport from "passport";
import GoogleStrategy from "passport-google-oauth2";
import passportJwt from "passport-jwt";
import local from "passport-local";
import { z } from "zod";

import {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  JWT_SECRET,
} from "./dotenv.js";
import { userServer } from "../services/index.repository.js";
import { createHash, isValidPassword } from "../utils.js";

const LocalStrategy = local.Strategy;
const PassportJWT = passportJwt.Strategy;
const ExtractJWT = passportJwt.ExtractJwt;

const passportInit = () => {
  passport.use(
    "google",
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: "http:localhost:3000/api/session/google/callback",
        passReqToCallback: true,
      },
      async function (request, accessToken, refreshToken, profile, done) {
        const [rows] = await userServer.getUserByGmail(profile.email);
        if (rows.length == 0) {
          const newUser = {
            nombre: profile.given_name,
            apellido: profile.family_name,
            gmail: profile.email,
          };

          const user = await userServer.createNewUser_google(newUser);

          return done(null, {
            id: user.insertId,
            ...newUser,
            role: "user",
            isGmailValidate: 0,
            isGoogleAuth: 1,
          });
        } else return done(null, rows[0]);
      }
    )
  );

  passport.use(
    "register",
    new LocalStrategy(
      {
        passReqToCallback: true, //Acceso a req como middleware
        usernameField: "email",
      },
      async (req, username, password, done) => {
        const { first_name, last_name, email } = req.body;
        const schema = z.object({
          first_name: z.string().nonempty(),
          last_name: z.string().nonempty(),
          email: z.string().email(),
        });

        const schemaResult = schema.safeParse(req.body);

        if (schemaResult.success) {
          const [rows] = await userServer.getUserByGmail(username);
          if (rows.length >= 1) return done({statusCode: 400, message: 'Ya existe ese usuario'}, null);

          try {
            const newUser = {
              nombre: first_name,
              apellido: last_name,
              gmail: email,
              password: createHash(password),
            };

            const user = await userServer.createNewUser_gmail(newUser);

            return done(null, {
              id: user.insertId,
              ...newUser,
              role: "user",
              isGmailValidate: 0,
              isGoogleAuth: 0,
            });
          } catch (e) {
            done(e);
          }
        }
        return done(
          {
            statusCode: 400,
            message: "Campos Incompletos o Vacios",
          },
          null
        );
      }
    )
  );

  passport.use(
    "login",
    new LocalStrategy(
      { usernameField: "email" },
      async (username, password, done) => {
        try {
          const [rows] = await userServer.getUserByGmail(username);
          if (rows.length === 0)
            return done(
              {
                message: "No se encontro el usuario",
                statusCode: 404,
              },
              null
            );

          if (rows[0].isGmailValidate != 1)
            return done(
              { message: "Falta Validar el correo", statusCode: 400 },
              null
            );

          if (!isValidPassword(rows[0].password, password))
            return done(
              {
                message: "El gmail o password no son correctos",
                statusCode: 400,
              },
              null
            );

          return done(false, rows[0], { message: "Inicio de session exitosa" });
        } catch (error) {
          return done(true, null, {
            message: "Something Wrong",
            statusCode: 500,
          });
        }
      }
    )
  );

  passport.use(
    "jwt",
    new PassportJWT(
      {
        secretOrKey: JWT_SECRET,
        jwtFromRequest: ExtractJWT.fromUrlQueryParameter("secret_token"),
      },
      async (token, done) => {
        try {
          return done(null, token.user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.serializeUser(function (user, done) {
    done(null, user);
  });

  passport.deserializeUser(async function (id, done) {
    done(null, id);
  });
};

export default passportInit;
