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

    if (!token || !decoredToken.gmail)
      return res.status(401).json({ message: "token missing or invalid" });

    next();
}