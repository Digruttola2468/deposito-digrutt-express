import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config.js";
import allPermissions from "../config/permissos.js";

import { authManager } from "../index.js";

export function auth(req, res, next) {
  if (req.session?.user) return next();

  return res.json({ message: "No estas Registrado, por favor inicia sesion" });
}

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

  const user = await authManager.getUserByGmail(gmail);
  
  if (user) {
    if (user.role === allPermissions.admin) return next();
    else {
      if ([].concat(roles).includes(user.role)) return next();
      else return res.status(409).json({ message: "No tienes Permisos" });
    }
  } else return res.status(401).json({ message: "No existe el usuario" });
};
