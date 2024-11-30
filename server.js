const express = require('express');
const cors = require('cors');

const app = express();
const port = 3000; // Cambia el puerto si es necesario

// Habilita CORS
app.use(cors());

// Servir archivos estáticos (HTML, CSS, JS) desde la carpeta "public"
app.use(express.static('public'));


// Inicia el servidor
app.listen(port, "localhost",() => {
    console.log(`Servidor funcionando en http://${"localhost"}:${port}`);
});