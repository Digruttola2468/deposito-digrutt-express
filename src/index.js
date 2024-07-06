// --- SERVER ---
import express from "express";
import cors from "cors";
import { PORT } from "./config/dotenv.js";
import __dirname from "./utils.js";
import cookieParser from "cookie-parser";

// --- AUTH ---
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
import maquinaParadaRoute from "./routes/maquinaParada.routes.js";
import relacionMaquinaMatrizRoute from "./routes/relacionMatrizMaquina.routes.js";
import historialFechaPedidosRoute from "./routes/historialFechasPedidos.routes.js";
import matricesRoute from "./routes/matrices.routes.js";
import historialMatricesErrorRoute from "./routes/historialErrorMatriz.routes.js";
import atencionReclamosRoute from "./routes/atencionReclamos.routes.js";
import coloresRoute from "./routes/colores.routes.js";
import localidadRoute from "./routes/localidad.routes.js";
import vehiculoRoute from "./routes/vehiculos.routes.js";
import motivoMaquinaParadaRoute from "./routes/motivoMaquinaParada.routes.js";
import placeSavedEnviosRoute from "./routes/placeSavedEnvios.routes.js";
import tipoProductoRoute from "./routes/tipoProducto.routes.js";
import materiaPrimaRoute from "./routes/material.routes.js";
import producionRoute from "./routes/producion.routes.js";
import pedidosRoute from "./routes/pedidos.routes.js";
import turnosRoute from './routes/turnos.routes.js'

// --- SWAGGER DOC ---
import swaggerUI from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";

import con from "./config/db.js";

// --- Middlewares ---
import initPassport from "./config/sessions.passport.js";

// Init Express
const app = express();

//Habilitamos que cualquier URL pueda acceder a este proyecto
app.use(cors());

// Habilitamos la lectura y escritura en JSON
app.use(express.json());
app.use(cookieParser());

// --- SESSION MYSQL ---
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

// --- INICIALIZATE PASSPORT ---
app.use(passport.initialize());
app.use(passport.session());
initPassport();

// --- SWAGGER DOC VARIANT ---
const swaggerSpec = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "DIGRUTT API DOC",
      version: "1.0.0"
    },
    servers: [
      {
        url: "http://localhost:3000"
      }
    ]
  },
  apis: [`${__dirname}/routes/producion.routes.js`, `${__dirname}/routes/auth.routes.js`]
}

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
app.use("/api/atencionReclamos", atencionReclamosRoute);
app.use("/api/colores", coloresRoute);
app.use("/api/localidad", localidadRoute);
app.use("/api/vehiculos", vehiculoRoute);
app.use("/api/motivoMaquinaParada", motivoMaquinaParadaRoute);
app.use("/api/savedPlacesEnviados", placeSavedEnviosRoute);
app.use("/api/tiposproductos", tipoProductoRoute);
app.use("/api/materiaPrima", materiaPrimaRoute);
app.use("/api/producion", producionRoute);
app.use("/api/pedidos", pedidosRoute);
app.use("/api/turnosProducion", turnosRoute);

app.use("/api-doc", swaggerUI.serve, swaggerUI.setup(swaggerJSDoc(swaggerSpec)))

// WHEN NOT FOUND PAGE
app.use((req, res) => {
  return res.send("No se encuntra la pagina");
});

app.listen(PORT);