// SERVER
import express from "express";
import cors from "cors";
import { PORT } from "./config/dotenv.js";

// AUTH
import session from "express-session";
import MySQLStore from "express-mysql-session";
import passport from "passport";

// --- ROUTES ---
import indexRoute from "./routes/index.routes.js";
import inventarioRoute from "./routes/inventario.routes.js";
import mercaderiaRoute from "./routes/mercaderia.routes.js";
import userRoute from "./routes/auth.routes.js";
import remitoRoute from "./routes/remitos.routes.js";
import notaEnvioRoute from "./routes/facturaNegro.routes.js";
import excelRoute from "./routes/excel.routes.js";
import clientesRoute from "./routes/clientes.routes.js";
import EnviosRoute from "./routes/envios.routes.js";
import maquinaParadaRoute from "./routes/MaquinaParada.routes.js";
import relacionMaquinaMatrizRoute from "./routes/relacionMatrizMaquina.routes.js";
import historialFechaPedidosRoute from "./routes/historialFechasPedidos.routes.js";
import matricesRoute from "./routes/matrices.routes.js";
import historialMatricesErrorRoute from "./routes/historialErrorMatriz.routes.js";
import controlCalidadRoute from "./routes/controlCalidad.routes.js";
/*
import localidad from "./routes/localidad.routes.js";
import coloresRoute from "./routes/colores.routes.js";
import tipoProductoRoute from "./routes/tipoProducto.routes.js";
import producionRoute from "./routes/producion.routes.js";
import materiaPrimaRoute from "./routes/material.routes.js";
import motivoMaquinaParadaRoute from "./routes/motivoMaquinaParada.routes.js";
import placeSavedEnviosRoute from "./routes/placeSavedEnvios.routes.js";
import grafica from "./routes/grafica.routes.js";
import PedidosRoute from "./routes/pedidos.routes.js";
import vehiculoRoute from "./routes/vehiculos.routes.js";
*/

import con from "./config/db.js";

// --- Middlewares ---
import errorHandle from "./middleware/errors.js";
import initPassport from "./config/sessions.passport.js";

// Init Express
const app = express();

//Habilitamos que cualquier URL pueda acceder a este proyecto
app.use(cors());

// Habilitamos la lectura y escritura en JSON
app.use(express.json());

// SESSION MYSQL
const MysqlStorage = MySQLStore(session);
const sessionStore = new MysqlStorage({}, con);
app.use(
  session({
    store: sessionStore,
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);

// INICIALIZATE PASSPORT
app.use(passport.initialize());
app.use(passport.session());
initPassport();

// --- Routers ---
app.use("/api/server", indexRoute);
app.use("/api/inventario", inventarioRoute);
app.use("/api/mercaderia", mercaderiaRoute);
app.use("/api/notaEnvio", notaEnvioRoute);
app.use("/api/remito", remitoRoute);
app.use("/api/session", userRoute);
app.use("/api/excel", excelRoute);
app.use("/api/clientes", clientesRoute);
app.use("/api/envios", EnviosRoute);
app.use("/api/maquinaParada", maquinaParadaRoute);
app.use("/api/maquina_matriz", relacionMaquinaMatrizRoute);
app.use("/api/historialFechaPedidos", historialFechaPedidosRoute);
app.use("/api/matrices", matricesRoute);
app.use("/api/historialMatriz", historialMatricesErrorRoute);
app.use("/api/controlCalidad", controlCalidadRoute);
/*
app.use("/api/colores", coloresRoute);
app.use("/api/tiposproductos", tipoProductoRoute);
app.use("/api/materiaPrima", materiaPrimaRoute);
app.use("/api/producion", producionRoute);
app.use("/api/motivoMaquinaParada", motivoMaquinaParadaRoute);
app.use("/api/grafica", grafica);
app.use("/api/localidad", localidad);
app.use("/api/vehiculos", vehiculoRoute);
app.use("/api/savedPlacesEnviados", placeSavedEnviosRoute);
app.use("/api/pedidos", PedidosRoute);
*/

//app.use(errorHandle);

// WHEN NOT FOUND PAGE
app.use((req, res) => {
  return res.send("No se encuntra la pagina");
});

app.listen(3000);
