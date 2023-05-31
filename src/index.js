import express from "express";

import {PORT} from './config.js'

const app = express();

app.get('/', (req,res) => {
    res.send('Page Principal')
});

app.get('/server', (req,res) => {
    res.send('Servidor Express Funcionando')
});

app.use((req,res) => {
    res.send('No se encuntra la pagina')
})

app.listen(PORT);
console.log(`Server localhost:${PORT}`);