import express from "express";
import cors from "cors";
import cloudinary from "cloudinary";
import { CLOUDINARY_APIKEY, CLOUDINARY_APISECRET } from "./config.js";

import { PORT } from "./config.js";

//ROUTES PRINCIPAL
import localidad from "./routes/localidad.routes.js";
import indexRoute from "./routes/index.routes.js";
import mercaderiaRoute from "./routes/mercaderia.routes.js";
import coloresRoute from "./routes/colores.routes.js";
import tipoProductoRoute from "./routes/tipoProducto.routes.js";
import inventario from "./routes/inventario.routes.js";
import excel from "./routes/excel.routes.js";
import facturaNegro from "./routes/facturaNegro.routes.js";
import cloudinaryRoute from './routes/cloudinary.routes.js';

//ROUTES PRODUCCION
import clientes from "./routes/clientes.routes.js";

//ROUTES GRAFICA
import grafica from "./routes/grafica.routes.js";

//ROUTES USERS
import user from "./routes/auth.routes.js";

//ROUTES REMITOS
import remito from "./routes/remitos.routes.js";

//CLASSES
import InventarioManager from "./class/InventarioManager.js";
import MercaderiaManager from "./class/MercaderiaManager.js";
import ClientesManager from "./class/ClientesManager.js";
import FacturaNegroManager from "./class/FacturaNegroManager.js";
import RemitosManager from "./class/RemitosManager.js";
import AuthManager from "./class/AuthManager.js";

const app = express();

//Habilitamos que la URL pueda acceder a este proyecto
app.use(cors());
app.use(express.urlencoded({ extended: true }));

//Habilitamos la lectura en JSON
app.use(express.json());

//INIT
export const inventarioManager = new InventarioManager();
export const mercaderiaManager = new MercaderiaManager();
export const clientesManager = new ClientesManager();
export const facturaNegroManager = new FacturaNegroManager();
export const remitosManager = new RemitosManager();
export const authManager = new AuthManager();

//
app.use('/api',indexRoute);
app.use('/api',mercaderiaRoute);
app.use('/api',coloresRoute);
app.use('/api',tipoProductoRoute);
app.use('/api',inventario);
app.use('/api',excel);
app.use('/api',cloudinaryRoute);

app.use('/api',clientes);

app.use('/api',grafica);

app.use('/api',user);

app.use('/api',remito);

app.use('/api',localidad);

app.use('/api',facturaNegro);

app.get("/", (req, res) => {
  res.send("Page Principal");
});

app.use((req, res) => {
  res.send("No se encuntra la pagina");
});

app.listen(PORT);
console.log(`Server localhost:${PORT}`);
