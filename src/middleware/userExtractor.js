import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/dotenv.js";
import allPermissions from "../config/permissos.js";

export default (roles) => async (req, res, next) => {
  const token = req.cookies.access_token;
  if (!token)
    return res
      .status(403)
      .json({ status: "error", message: "Access not authorized" });

  try {
    const decoredToken = jwt.verify(token, JWT_SECRET);

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
  } catch {
    return res.status(401).json({ message: "token vacio o invalido" });
  }
};
