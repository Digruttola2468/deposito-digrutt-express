import express from "express";
import cors from 'cors';

import { PORT } from "./config.js";

//ROUTES
import indexRoute from "./routes/index.routes.js";
import mercaderiaRoute from "./routes/mercaderia.routes.js";
import coloresRoute from './routes/colores.routes.js';
import depositoRoute from './routes/deposito.routes.js';
import tipoProductoRoute from './routes/tipoProducto.routes.js';
import inventario from './routes/inventario.routes.js';
import excel from './routes/excel.routes.js';

const app = express();

//Habilitamos que la URL pueda acceder a este proyecto
app.use(cors());

//Habilitamos la lectura en JSON
app.use(express.json());

//
app.use(indexRoute);
app.use(mercaderiaRoute);
app.use(coloresRoute);
app.use(depositoRoute);
app.use(tipoProductoRoute);
app.use(inventario);
app.use(excel);

app.get("/", (req, res) => {
  res.send("Page Principal");
});

app.use((req, res) => {
  res.send("No se encuntra la pagina");
});

app.listen(PORT);
console.log(`Server localhost:${PORT}`);
