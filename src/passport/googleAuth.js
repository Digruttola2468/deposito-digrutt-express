import passport from "passport";
import GoogleStrategy from "passport-google-oauth2";

import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from "../config.js";

const googleInicializate = () => {
  passport.use(
    "google",
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:3000/api/google/callback",
        passReqToCallback: true,
      },
      function (request, accessToken, refreshToken, profile, done) {
        console.log("GOOGLE STRATEGY: ", profile);
        return done(err, profile);
      }
    )
  );

  passport.serializeUser(function (user, done) {
    console.log("SERIALIZE USER: ", user);
    done(null, user);
  });

  passport.deserializeUser(function (user, done) {
    console.log("DESERIALIZE USER: ", user);
    done(null, user);
  });
};

export default googleInicializate;
