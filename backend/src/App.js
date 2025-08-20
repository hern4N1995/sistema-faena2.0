/* const express = require('express');
const cors = require('cors');
require('dotenv').config();
import cors from 'cors';
const app = express();
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  }),
);
app.use(express.json());

// Ruta base de prueba
app.get('/', (req, res) => {
  res.json({
    message: 'Sistema de Faenas API, ESTA FUNCIONANDO CORRECTAMENTE ',
  });
});

// TODO: importar rutas desde src/routes
const faenaRoutes = require('./routes/faena.routes');
app.use('/api/faenas', faenaRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
 */

// src/app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const usuarioRoutes = require('./routes/usuario.routes');
const tropaRoutes = require('./routes/tropa.routes');
const faenaRoutes = require('./routes/faena.routes');

const plantaRoutes = require('./routes/planta.routes');

const app = express();

// Configurar CORS
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  }),
);

// Parsear JSON
app.use(express.json());

// Ruta base de prueba
app.get('/', (req, res) => {
  res.json({
    message: 'Sistema de Faenas API, ESTA FUNCIONANDO CORRECTAMENTE',
  });
});

// Rutas de faenas

app.use('/api/auth', authRoutes);

app.use('/api/usuarios', usuarioRoutes);
app.use('/api/tropas', tropaRoutes);
app.use('/api/faena', faenaRoutes);
app.use('/api/plantas', plantaRoutes);

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
