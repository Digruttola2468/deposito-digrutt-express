import express from "express";
import { PORT } from "./config.js";
import indexRoute from "./routes/index.routes.js";
import mercaderiaRoute from "./routes/mercaderia.routes.js";

const app = express();

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
