import jwt from 'jsonwebtoken'
import {JWT_SECRET} from '../config.js'

export default (req,res,next) => {
    const authorization = req.get("authorization");

    let token = "";
    if (authorization && authorization.toLowerCase().startsWith("bearer"))
      token = authorization.substring(7);

    let decoredToken = {};

    try {
      decoredToken = jwt.verify(token, JWT_SECRET);
    } catch {}

    const {gmail, is_admin, is_mercaderia, is_oficina, is_produccion, is_matriceria} = decoredToken;

    if (!token)
      return res.status(401).json({ message: "token missing or invalid" });

    if (!gmail)
      return res.status(401).json({ message: "token missing or invalid" });

    if (!is_admin)
      return res.status(401).json({ message: "You dont have permission" });

    next();
}