import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/dotenv.js";
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

  const { gmail, role } = decoredToken.user;

  if (!gmail)
    return res
      .status(404)
      .json({ message: "No existe el usuario. Registrate" });

  if (role === allPermissions.admin) return next();
  else {
    if ([].concat(roles).includes(role)) return next();
    else
      return res
        .status(409)
        .json({ status: "error", message: "No tienes Permisos" });
  }
};
