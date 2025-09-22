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
const provinciaRoutes = require('./routes/provincia.routes');
const departamentoRoutes = require('./routes/departamento.routes');
const titularFaenaRoutes = require('./routes/titularFaena.routes');
const productorRoutes = require('./routes/productor.routes');
const decomisoRoutes = require('./routes/decomisos.routes');
const afeccionRoutes = require('./routes/afeccion.routes');

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
app.use('/api', require('./routes/faena.routes'));
app.use('/api', provinciaRoutes);
app.use('/api/departamentos', departamentoRoutes);
app.use('/api', plantaRoutes);
app.use('/api', titularFaenaRoutes);
app.use('/api', especieRoutes);
app.use('/', categoriaEspecieRoutes); // o '/api' si usás prefijo
app.use('/api', productorRoutes);
/* app.use('/api', require('./routes/tropa.routes'));  COMENTADO 04-09*/
app.use('/api/faena', require('./routes/faena.routes'));
app.use('/api', decomisoRoutes);
app.use('/api', afeccionRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
