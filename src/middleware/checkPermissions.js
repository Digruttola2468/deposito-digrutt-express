import jwt from 'jsonwebtoken'
import {JWT_SECRET} from '../config.js'

const getToken = (authorization) => {
    let token = "";
    if (authorization && authorization.toLowerCase().startsWith("bearer"))
      token = authorization.substring(7);

    let decoredToken = {};

    try {
      decoredToken = jwt.verify(token, JWT_SECRET);
    } catch {}

    return decoredToken;
}

export const checkMercaderia = (req,res,next) => {
    const authorization = req.get("authorization");

    const {is_admin, is_mercaderia} = getToken(authorization);

    if (is_admin) next();

    if (is_mercaderia) next();

    return res.status(401).json({ message: "No tenes permisos" });
}

export const checkInventario = (req,res,next) => {
    const authorization = req.get("authorization");

    const {is_admin, is_mercaderia, is_oficina} = getToken(authorization);

    if (is_admin) next();

    if (is_mercaderia) next();

    if (is_oficina) next();

    return res.status(401).json({ message: "No tenes permisos" });
}

export const checkGraficas = (req,res,next) => {

}

export const checkOficina = (req,res,next) => {
    const authorization = req.get("authorization");

    const {is_admin, is_oficina} = getToken(authorization);

    if (is_admin) next();

    if (is_oficina) next();

    return res.status(401).json({ message: "No tenes permisos" });
}

export const checkProduccion = (req,res,next) => {

}

export const checkMatriceria = (req,res,next) => {
    const authorization = req.get("authorization");

    const {is_admin, is_matriceria} = getToken(authorization);

    if (is_admin) next();

    if (is_matriceria) next();

    return res.status(401).json({ message: "No tenes permisos" });
}