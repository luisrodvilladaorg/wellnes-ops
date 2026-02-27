const express = require('express');
const { Client } = require('pg');

const app = express();

let client;

// Función PRO: reconexión automática con retry infinito
async function connectWithRetry() {
    while (true) {
        try {
            client = new Client({
                connectionString: process.env.DATABASE_URL,
            });

            await client.connect();
            console.log("Connected to PostgreSQL");
            break; // Salimos del bucle cuando conecta
        } catch (err) {
            console.error("DB not ready, retrying in 2s...");
            await new Promise(res => setTimeout(res, 2000));
        }
    }

    // Si la conexión se cae después de estar conectada
    client.on("error", async (err) => {
        console.error("Lost DB connection. Reconnecting...");
        await connectWithRetry();
    });
}

// Llamamos a la función de reconexión
connectWithRetry();

// Healthcheck simple: solo indica que el backend está vivo
app.get('/api/health', (req, res) => {
    res.status(200).send('OK');
});

// Healthcheck de DB opcional
app.get('/api/health/db', async (req, res) => {
    try {
        await client.query('SELECT NOW()');
        res.status(200).send('DB OK');
    } catch (e) {
        res.status(503).send('DB Error');
    }
});

// Escuchar en 0.0.0.0 para Docker
app.listen(3000, "0.0.0.0", () => console.log('Backend listening'));

//Ruta  API para que nginx pueda dirigir el trafico a este backend, el resto de trafico será para frontend

//app.get('/api', (req, res) => {
//    res.send('Backend funcionando, respondiendo desde el Backend Luis');
//});

app.get('/api', (req, res) => {
    res.send(`Backend funcionando desde ${require("os").hostname()}`);
});

//Permite que React lea las variables

const apiUrl = process.env.REACT_APP_API_URL;

// Ejemplo de uso:
// fetch(`${apiUrl}/algo`).then(...)