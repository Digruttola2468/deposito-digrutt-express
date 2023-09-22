import express from "express";
import cors from 'cors';

import { PORT } from "./config.js";

import { fileURLToPath } from "url";
import { dirname } from "path";

//ROUTES MERCADERIA
import indexRoute from "./routes/index.routes.js";
import mercaderiaRoute from "./routes/mercaderia.routes.js";
import coloresRoute from './routes/colores.routes.js';
import depositoRoute from './routes/deposito.routes.js';
import tipoProductoRoute from './routes/tipoProducto.routes.js';
import inventario from './routes/inventario.routes.js';
import excel from './routes/excel.routes.js';
import unidadMedidaRoute from './routes/unidadMedida.routes.js';

//ROUTES PRODUCCION
import clientes from './routes/clientes.routes.js';
import materiaPrima from './routes/materiaPrima.routes.js';
import codMaquinaParada from './routes/motivoMaquinaParada.routes.js';

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
app.use(unidadMedidaRoute);

app.use(clientes);
app.use(materiaPrima);
app.use(codMaquinaParada);

app.get("/", (req, res) => {
  res.send("Page Principal");
});

const __filename = fileURLToPath(import.meta.url);
const dir = dirname(__filename);
app.get('/photos/:name', (req,res) => {
  res.sendFile(dir + `/assets/${req.params.name}.png`);
})

app.use((req, res) => {
  res.send("No se encuntra la pagina");
});

app.listen(PORT);
console.log(`Server localhost:${PORT}`);
