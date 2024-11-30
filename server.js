const express = require('express');
const cors = require('cors');

const app = express();
const port = 3000; // Cambia el puerto si es necesario

// Habilita CORS
app.use(cors());

// Servir archivos estáticos (HTML, CSS, JS) desde la carpeta "public"
app.use(express.static('public'));


// Inicia el servidor
app.listen(port, "192.168.100.11",() => {
    console.log(`Servidor funcionando en http://${"192.168.100.11"}:${port}`);
});