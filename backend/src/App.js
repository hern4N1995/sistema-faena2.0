/* // src/app.js
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
const veterinarioRoutes = require('./routes/veterinario.routes');
const tipoParteDecoRoutes = require('./routes/tipoParteDeco.routes');
const partesDecomisadasRoutes = require('./routes/partesDecomisadas.routes');
const decomisoDetalleRoutes = require('./routes/decomisoDetalle.routes');
const tropaDetalleRoutes = require('./routes/tropaDetalle.routes'); // <-- nueva línea de import

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
app.use('/api', categoriaEspecieRoutes);
app.use('/api', productorRoutes);
/* app.use('/api', require('./routes/tropa.routes'));  COMENTADO 04-09*/
/*app.use('/api/faena', require('./routes/faena.routes'));
app.use('/api', afeccionRoutes);
app.use('/api/veterinarios', veterinarioRoutes);
app.use('/api/tipos-parte-deco', tipoParteDecoRoutes);
app.use('/api/partes-decomisadas', partesDecomisadasRoutes);
app.use('/api/decomiso-detalle', decomisoDetalleRoutes);
app.use('/api/decomisos', decomisoRoutes);
// montar rutas de detalle de tropa (soportan /api/tropas/:tropaId/detalle/:detalleId y /api/tropa-detalle/:detalleId)
app.use('/api', tropaDetalleRoutes);

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
const especieRoutes = require('./routes/especie.routes');
const categoriaEspecieRoutes = require('./routes/categoriaEspecie.routes');
const provinciaRoutes = require('./routes/provincia.routes');
const departamentoRoutes = require('./routes/departamento.routes');
const titularFaenaRoutes = require('./routes/titularFaena.routes');
const productorRoutes = require('./routes/productor.routes');
const decomisoRoutes = require('./routes/decomisos.routes');
const afeccionRoutes = require('./routes/afeccion.routes');
const veterinarioRoutes = require('./routes/veterinario.routes');
const tipoParteDecoRoutes = require('./routes/tipoParteDeco.routes');
const partesDecomisadasRoutes = require('./routes/partesDecomisadas.routes');
const decomisoDetalleRoutes = require('./routes/decomisoDetalle.routes');
const tropaDetalleRoutes = require('./routes/tropaDetalle.routes');

const app = express();

/**
 * CORS configuration
 * - VITE/Vercel frontend origin should be set in FRONTEND_ORIGINS (comma-separated) or FRONTEND_ORIGIN env var
 * - Fallback includes localhost dev origin
 */
const allowedOriginsEnv =
  process.env.FRONTEND_ORIGINS || process.env.FRONTEND_ORIGIN || '';
const allowedOrigins = [
  'http://localhost:5173',
  ...allowedOriginsEnv
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
];

const corsOptions = {
  origin: function (origin, callback) {
    // allow non-browser requests like curl/postman (no origin)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) return callback(null, true);
    return callback(new Error('CORS policy: Origin not allowed'), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  preflightContinue: false,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'Sistema de Faenas API, ESTA FUNCIONANDO CORRECTAMENTE',
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/tropas', tropaRoutes);
app.use('/api/faena', faenaRoutes);
app.use('/api/provincias', provinceOrRouteWrapper(provinciaRoutes));
app.use('/api/departamentos', departamentoRoutes);
app.use('/api/plantas', plantaRoutes);
app.use('/api/titulares-faena', titularFaenaRoutes);
app.use('/api/especies', especieRoutes);
app.use('/api/categorias-especie', categoriaEspecieRoutes);
app.use('/api/productores', productorRoutes);
app.use('/api/veterinarios', veterinarioRoutes);
app.use('/api/tipos-parte-deco', tipoParteDecoRoutes);
app.use('/api/partes-decomisadas', partesDecomisadasRoutes);
app.use('/api/decomiso-detalle', decomisoDetalleRoutes);
app.use('/api/decomisos', decomisoRoutes);
app.use('/api', tropaDetalleRoutes);

// Helper to ensure route export shape (keeps existing behaviour if route is already an express Router)
function provinceOrRouteWrapper(routeModule) {
  // If the route module exports a Router directly, return it.
  // If it exports a function that accepts the app (legacy), call it and return an empty router.
  try {
    if (
      routeModule &&
      typeof routeModule === 'object' &&
      typeof routeModule.use === 'function'
    ) {
      return routeModule;
    }
    // If it's a function that attaches to app, return a noop router (routes already mounted inside function)
    if (typeof routeModule === 'function') {
      // attempt to call with a temporary express Router to mount its routes
      const tmpRouter = express.Router();
      routeModule(tmpRouter);
      return tmpRouter;
    }
  } catch (e) {
    // fallback
  }
  // default: return an empty router to avoid crashing
  return express.Router();
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
