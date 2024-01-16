import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config.js";
import { db_supabase } from "../config/supabase.js";
import allPermissions from "../config/permissos.js";

export default (roles) => async (req, res, next) => {
  const authorization = req.get("authorization");

  let token = "";
  if (authorization && authorization.toLowerCase().startsWith("bearer"))
    token = authorization.substring(7);

  if (!token)
    return res.status(401).json({ message: "token vacio o invalido" });

  let decoredToken = {};

  try {
    decoredToken = jwt.verify(token, JWT_SECRET);
  } catch {
    return res.status(401).json({ message: "token vacio o invalido" });
  }

  const { gmail } = decoredToken;

  if (!gmail)
    return res
      .status(404)
      .json({ message: "No existe el usuario. Registrate" });

  const { data: users, error } = await db_supabase
    .from("users")
    .select("*")
    .eq("gmail", gmail);

  console.log(users);

  if (users.length != 0) {
    if (users[0].role === allPermissions.admin) {
      return next();
    } else {
      if ([].concat(roles).includes(users[0].role)) return next();
      else return res.status(409).json({ error: "No tienes Permisos" });
    }
    
  } else return res.status(401).json({ message: "No existe el usuario" });
};
