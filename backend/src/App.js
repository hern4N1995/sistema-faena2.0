// src/app.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const usuarioRoutes = require('./routes/usuario.routes');
const tropaRoutes = require('./routes/tropa.routes');
const faenaRoutes = require('./routes/faena.routes');
const plantaRoutes = require('./routes/planta.routes');
const especieRoutes = require('./routes/especie.routes');
const categoriaEspecieRoutes = require('./routes/categoriaEspecie.routes');
const app = express();

app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  }),
);

app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'Sistema de Faenas API, ESTA FUNCIONANDO CORRECTAMENTE',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/tropas', tropaRoutes);
app.use('/api/faena', faenaRoutes);
app.use('/api/plantas', plantaRoutes);
app.use('/api', especieRoutes);
app.use('/', categoriaEspecieRoutes); // o '/api' si usás prefijo
app.use('/api', require('./routes/tropa.routes'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
