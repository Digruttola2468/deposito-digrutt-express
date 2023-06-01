import express from "express";
import cors from 'cors';

import { PORT,ORIGIN_WEB } from "./config.js";
import indexRoute from "./routes/index.routes.js";
import mercaderiaRoute from "./routes/mercaderia.routes.js";

const app = express();

//Habilitamos que la URL pueda acceder a este proyecto
app.use(cors({
  origin: ORIGIN_WEB
}));

//Habilitamos la lectura en JSON
app.use(express.json());

//
app.use(indexRoute);
app.use(mercaderiaRoute);

app.get("/", (req, res) => {
  res.send("Page Principal");
});

app.use((req, res) => {
  res.send("No se encuntra la pagina");
});

app.listen(PORT);
console.log(`Server localhost:${PORT}`);
