import passport from "passport";
import GoogleStrategy from "passport-google-oauth2";

import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from "../config.js";
import { authManager } from "../index.js";
import { con } from "../config/db.js";

const googleInicializate = () => {
  passport.use(
    "google",
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL:
          "https://deposito-digrutt-express-production.up.railway.app/api/google/callback",
        passReqToCallback: true,
      },
      async function (request, accessToken, refreshToken, profile, done) {
        const user = await authManager.getUserByGmail(profile.email);
        if (user.length == 0) {
          const { data } = await authManager.postUser({
            nombre: profile.given_name,
            apellido: profile.family_name,
            gmail: profile.email,
          });

          return done(null, data.user);
        } else return done(null, user);
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

export default googleInicializate;
