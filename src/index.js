import express from "express";
import cors from "cors";
import handlebars from "express-handlebars";

import { PORT } from "./config.js";
import __dirname from './utils.js';

//ROUTES PRINCIPAL
import localidad from "./routes/localidad.routes.js";
import indexRoute from "./routes/index.routes.js";
import mercaderiaRoute from "./routes/mercaderia.routes.js";
import coloresRoute from "./routes/colores.routes.js";
import tipoProductoRoute from "./routes/tipoProducto.routes.js";
import inventario from "./routes/inventario.routes.js";
import excel from "./routes/excel.routes.js";
import facturaNegro from "./routes/facturaNegro.routes.js";
import cloudinaryRoute from "./routes/cloudinary.routes.js";
import views from './routes/views.routes.js';
import producionRoute from './routes/producion.routes.js'
import maquinaParadaRoute from './routes/MaquinaParada.routes.js';
import matricesRoute from './routes/matrices.routes.js'
import historialMatricesErrorRoute from './routes/historialErrorMatriz.routes.js'

import motivoMaquinaParadaRoute from './routes/motivoMaquinaParada.routes.js'

//ROUTES PRODUCCION
import clientes from "./routes/clientes.routes.js";

//ROUTES GRAFICA
import grafica from "./routes/grafica.routes.js";

//ROUTES USERS
import user from "./routes/auth.routes.js";

//ROUTES REMITOS
import remito from "./routes/remitos.routes.js";

//ROUTES PEDIDOS
import PedidosRoute from "./routes/pedidos.routes.js";

//CLASSES
import InventarioManager from "./class/InventarioManager.js";
import MercaderiaManager from "./class/MercaderiaManager.js";
import ClientesManager from "./class/ClientesManager.js";
import FacturaNegroManager from "./class/FacturaNegroManager.js";
import RemitosManager from "./class/RemitosManager.js";
import AuthManager from "./class/AuthManager.js";
import ProducionManager from "./class/ProduccionManager.js";
import HistorialMatriz from "./class/HistorialErrorMatriz.js";

import MaquinaParada from "./class/MaquinaParada.js";
import Matrices from "./class/MatricesMaster.js";
import PedidosManager from "./class/PedidosManager.js";

import googleInicializate from "./passport/googleAuth.js";

const app = express();

//Habilitamos que la URL pueda acceder a este proyecto
app.use(cors());
//app.use(express.urlencoded({ extended: true }));

// Configurar el motor de plantillas
app.engine("handlebars", handlebars.engine());
app.set("views", __dirname + "/views");
app.set("view engine", "handlebars");

//Habilitamos la lectura en JSON
app.use(express.json());

googleInicializate();

//INIT
export const inventarioManager = new InventarioManager();
export const mercaderiaManager = new MercaderiaManager();
export const clientesManager = new ClientesManager();
export const facturaNegroManager = new FacturaNegroManager();
export const remitosManager = new RemitosManager();
export const authManager = new AuthManager();
export const producionManager = new ProducionManager();
export const maquinaParadaManager = new MaquinaParada();
export const matricesManager = new Matrices();
export const historialErrorMatrizManager = new HistorialMatriz();
export const pedidosManager = new PedidosManager();

//
app.use("/api", indexRoute);
app.use("/api", mercaderiaRoute);
app.use("/api", coloresRoute);
app.use("/api", tipoProductoRoute);
app.use("/api", inventario);
app.use("/api", excel);
app.use("/api", cloudinaryRoute);
app.use('/api', maquinaParadaRoute);
app.use('/api', matricesRoute);
app.use('/api', PedidosRoute)

app.use('/api', producionRoute);
app.use("/api", clientes);
app.use('/api', motivoMaquinaParadaRoute);
app.use('/api', historialMatricesErrorRoute)

app.use("/api", grafica);

app.use("/api", user);

app.use("/api", remito);

app.use("/api", localidad);

app.use("/api", facturaNegro);

app.use(views);

app.get("/", (req, res) => {
  res.send("Page Principal");
});

app.use((req, res) => {
  res.send("No se encuntra la pagina");
});

app.listen(PORT);
console.log(`Server localhost:${PORT}`);
