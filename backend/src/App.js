// src/App.js
require('dotenv').config();
const express = require('express');
const path = require('path');

/* ---------------------------
   Helpers seguros
   --------------------------- */

function safeRequire(p) {
  try {
    const mod = require(p);
    console.log('safeRequire OK:', p);
    return mod;
  } catch (err) {
    console.error(
      'safeRequire ERROR al require:',
      p,
      '\n',
      err && err.stack ? err.stack : err,
    );
    return null;
  }
}

function toRouter(moduleExport) {
  if (!moduleExport) return null;
  // Si ya es un router de express
  if (
    (typeof moduleExport === 'object' || typeof moduleExport === 'function') &&
    typeof moduleExport.use === 'function'
  ) {
    return moduleExport;
  }
  // Si exporta una función que recibe router (pattern)
  if (typeof moduleExport === 'function') {
    try {
      const tmp = require('express').Router();
      moduleExport(tmp);
      if (typeof tmp.use === 'function') return tmp;
    } catch (e) {
      // no convertible
    }
  }
  return null;
}

function safeMount(appInstance, mountPath, moduleExport, originalPath) {
  // Soporte defensivo si se pasaron argumentos en orden distinto
  if (typeof mountPath !== 'string' && typeof moduleExport === 'string') {
    const tmp = mountPath;
    mountPath = moduleExport;
    moduleExport = tmp;
  }

  // Normalizar mountPath: si es una URL completa, extraer pathname; si no es string, lo dejamos como-is
  let normalizedMountPath = mountPath;
  if (typeof normalizedMountPath === 'string') {
    normalizedMountPath = normalizedMountPath.trim();
    if (normalizedMountPath === '') normalizedMountPath = '/';
    if (/^https?:\/\//i.test(normalizedMountPath)) {
      try {
        const u = new URL(normalizedMountPath);
        normalizedMountPath = u.pathname || '/';
      } catch (e) {
        console.warn(
          'safeMount: mountPath parece una URL inválida, se ignorará:',
          mountPath,
        );
        return false;
      }
    }
    if (!normalizedMountPath.startsWith('/'))
      normalizedMountPath = '/' + normalizedMountPath;
  }

  const r = toRouter(
    typeof normalizedMountPath === 'string' ? moduleExport : mountPath,
  );
  if (!r) {
    console.warn('SAFE_MOUNT: No se pudo convertir la exportación a Router', {
      mountPath: normalizedMountPath,
      originalPath,
    });
    return false;
  }

  // inspeccionar stack del router antes de montarlo (detección de rutas mal formadas)
  try {
    const stack = r.stack || (r._router && r._router.stack) || [];
    for (let i = 0; i < stack.length; i++) {
      const layer = stack[i];
      if (!layer) continue;
      if (layer.route && layer.route.path) {
        const p = String(layer.route.path);
        if (/^:/.test(p)) {
          console.error(
            'SAFE_MOUNT: Ruta interna empieza con ":" (falta "/" antes del parámetro)',
            {
              mountPath: normalizedMountPath,
              originalPath,
              layerIndex: i,
              path: p,
            },
          );
          return false;
        }
        if (/\/:\s/.test(p) || /\/:[^a-zA-Z0-9_\/]/.test(p)) {
          console.error('SAFE_MOUNT: Ruta interna con formato inválido', {
            mountPath: normalizedMountPath,
            originalPath,
            layerIndex: i,
            path: p,
          });
          return false;
        }
      }
      if (layer && layer.regexp) {
        const re = String(layer.regexp);
        if (re.includes('https://') || re.includes('http://')) {
          console.error(
            'SAFE_MOUNT: regexp del layer contiene URL (posible ruta inválida)',
            {
              mountPath: normalizedMountPath,
              originalPath,
              layerIndex: i,
              regexp: re,
            },
          );
          return false;
        }
      }
    }
  } catch (e) {
    console.error(
      'SAFE_MOUNT: Error inspeccionando router.stack antes de montar',
      {
        mountPath: normalizedMountPath,
        originalPath,
        error: e && e.stack ? e.stack : e,
      },
    );
    return false;
  }

  // montar
  try {
    if (typeof normalizedMountPath === 'string') {
      appInstance.use(normalizedMountPath, r);
      console.log('Mounted', normalizedMountPath, 'from', originalPath);
    } else {
      appInstance.use(r);
      console.log(
        'Mounted router (direct) from',
        originalPath || normalizedMountPath,
      );
    }
    return true;
  } catch (err) {
    console.error('SAFE_MOUNT: ERROR al montar (capturado):', {
      mountPath: normalizedMountPath,
      originalPath,
    });
    console.error('Error stack:', err && err.stack ? err.stack : err);
    return false;
  }
}

/* ---------------------------
   Cargar rutas (intento seguro)
   --------------------------- */

// Intentamos cargar con safeRequire; si devuelve null, intentamos require directo para que el error sea visible
function loadRoute(p) {
  const r = safeRequire(p);
  if (r) return r;
  try {
    const direct = require(p);
    console.log('Direct require OK:', p);
    return direct;
  } catch (err) {
    console.error(
      'Direct require ERROR:',
      p,
      err && err.stack ? err.stack : err,
    );
    return null;
  }
}

const authRoutes = loadRoute('./routes/auth.routes');
const usuarioRoutes = loadRoute('./routes/usuario.routes');
const tropaRoutes = loadRoute('./routes/tropa.routes');
const faenaRoutes = loadRoute('./routes/faena.routes');
const plantaRoutes = loadRoute('./routes/planta.routes');
const especieRoutes = loadRoute('./routes/especie.routes');
const categoriaEspecieRoutes = loadRoute('./routes/categoriaEspecie.routes');
const provinciaRoutes = loadRoute('./routes/provincia.routes');
const departamentoRoutes = loadRoute('./routes/departamento.routes');
const titularFaenaRoutes = loadRoute('./routes/titularFaena.routes');
const productorRoutes = loadRoute('./routes/productor.routes');
const decomisoRoutes = loadRoute('./routes/decomisos.routes');
const afeccionRoutes = loadRoute('./routes/afeccion.routes');
const veterinarioRoutes = loadRoute('./routes/veterinario.routes');
const tipoParteDecoRoutes = loadRoute('./routes/tipoParteDeco.routes');
const partesDecomisadasRoutes = loadRoute('./routes/partesDecomisadas.routes');
const decomisoDetalleRoutes = loadRoute('./routes/decomisoDetalle.routes');
const tropaDetalleRoutes = loadRoute('./routes/tropaDetalle.routes');

/* ---------------------------
   App y CORS manual
   --------------------------- */

const app = express();

// Parsear FRONTEND_ORIGINS de forma segura: separar por comas, trim y filtrar entradas vacías
const envOriginsRaw = (
  process.env.FRONTEND_ORIGINS ||
  process.env.FRONTEND_ORIGIN ||
  ''
).trim();
const envOrigins = envOriginsRaw
  ? envOriginsRaw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  : [];

// Añadir dominio del frontend en Vercel si no está presente
if (!envOrigins.includes('https://sistema-faena2-0.vercel.app')) {
  envOrigins.push('https://sistema-faena2-0.vercel.app');
}

// Sanitizar entradas: convertir a origin (scheme + host + port) y eliminar path si existe
const allowedOrigins = envOrigins
  .map((o) => {
    try {
      const u = new URL(o);
      return u.origin;
    } catch (e) {
      return o;
    }
  })
  .filter(Boolean);

// Asegurar localhost por defecto (dev)
if (!allowedOrigins.includes('http://localhost:5173')) {
  allowedOrigins.unshift('http://localhost:5173');
}

console.log('DEBUG_ALLOWED_ORIGINS (sanitized):', allowedOrigins);

// Middleware CORS manual y seguro
app.use((req, res, next) => {
  try {
    const origin = req.headers.origin;
    // permitir requests sin origin (herramientas como curl o same-origin)
    if (!origin) return next();

    if (allowedOrigins.includes(origin)) {
      // Origen permitido: setear headers CORS
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true'); // si usas cookies / credentials
      res.setHeader(
        'Access-Control-Allow-Methods',
        'GET,POST,PUT,PATCH,DELETE,OPTIONS',
      );
      res.setHeader(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, X-Requested-With',
      );
      if (req.method === 'OPTIONS') return res.sendStatus(204);
      return next();
    } else {
      // Origen no permitido: registrar y continuar (no lanzar)
      console.warn('CORS blocked origin:', origin);
      return next();
    }
  } catch (err) {
    console.error(
      'CORS manual middleware error:',
      err && err.stack ? err.stack : err,
    );
    return next();
  }
});

/* ---------------------------
   Middlewares y rutas
   --------------------------- */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json({
    message: 'Sistema de Faenas API, ESTA FUNCIONANDO CORRECTAMENTE',
  });
});

/* Montar rutas con paths explícitos (usamos /api como prefijo) */
safeMount(app, '/api/auth', authRoutes, './routes/auth.routes');
safeMount(app, '/api/usuarios', usuarioRoutes, './routes/usuario.routes');
safeMount(app, '/api/tropas', tropaRoutes, './routes/tropa.routes');
safeMount(app, '/api/faena', faenaRoutes, './routes/faena.routes');
safeMount(app, '/api/provincias', provinciaRoutes, './routes/provincia.routes');
safeMount(
  app,
  '/api/departamentos',
  departamentoRoutes,
  './routes/departamento.routes',
);
safeMount(app, '/api/plantas', plantaRoutes, './routes/planta.routes');
safeMount(
  app,
  '/api/titulares-faena',
  titularFaenaRoutes,
  './routes/titularFaena.routes',
);
safeMount(app, '/api/especies', especieRoutes, './routes/especie.routes');
safeMount(
  app,
  '/api/categorias-especie',
  categoriaEspecieRoutes,
  './routes/categoriaEspecie.routes',
);
safeMount(
  app,
  '/api/productores',
  productorRoutes,
  './routes/productor.routes',
);
safeMount(app, '/api/afecciones', afeccionRoutes, './routes/afeccion.routes');
safeMount(
  app,
  '/api/veterinarios',
  veterinarioRoutes,
  './routes/veterinario.routes',
);
safeMount(
  app,
  '/api/tipos-parte-deco',
  tipoParteDecoRoutes,
  './routes/tipoParteDeco.routes',
);
safeMount(
  app,
  '/api/partes-decomisadas',
  partesDecomisadasRoutes,
  './routes/partesDecomisadas.routes',
);
safeMount(
  app,
  '/api/decomiso-detalle',
  decomisoDetalleRoutes,
  './routes/decomisoDetalle.routes',
);
safeMount(app, '/api/decomisos', decomisoRoutes, './routes/decomisos.routes');
// Montar tropaDetalleRoutes bajo el mismo prefijo de tropas
safeMount(
  app,
  '/api/tropas',
  tropaDetalleRoutes,
  './routes/tropaDetalle.routes',
);

/* ---------------------------
   Endpoint de diagnóstico: listar rutas registradas
   (se deja aquí, después de montar routers)
   --------------------------- */
app.get('/__routes', (req, res) => {
  const routes = [];
  if (!app._router) return res.json(routes);
  app._router.stack.forEach((m) => {
    if (m.route && m.route.path) {
      routes.push({
        path: m.route.path,
        methods: Object.keys(m.route.methods),
      });
    } else if (m.name === 'router' && m.handle && m.handle.stack) {
      m.handle.stack.forEach((r) => {
        if (r.route) {
          routes.push({
            path: r.route.path,
            methods: Object.keys(r.route.methods),
          });
        }
      });
    }
  });
  res.json(routes);
});

/* ---------------------------
   Servir frontend estático (si existe)
   Asegurate que la ruta apunte a la carpeta correcta del build del cliente.
   --------------------------- */
const clientDist = path.join(__dirname, '..', 'client', 'dist'); // ajustar si tu build está en otro lugar
try {
  // solo servir si la carpeta existe
  const fs = require('fs');
  if (fs.existsSync(clientDist)) {
    app.use(express.static(clientDist));
    // SPA fallback: servir index.html para rutas no API
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) return next();
      res.sendFile(path.join(clientDist, 'index.html'));
    });
    console.log('Static client served from', clientDist);
  } else {
    console.log(
      'No se encontró client dist en',
      clientDist,
      '- no se sirve frontend estático',
    );
  }
} catch (e) {
  console.error('Error comprobando client dist:', e && e.stack ? e.stack : e);
}

/* ---------------------------
   Manejo de errores y 404 (al final)
   --------------------------- */
app.use((req, res, next) => {
  // Si la ruta empieza con /api devolvemos JSON 404
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  // Para otras rutas, dejar que el static o SPA fallback las maneje; si no, 404 simple
  res.status(404).send('Not Found');
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err && err.stack ? err.stack : err);
  res.status(500).json({ error: 'Internal server error' });
});

/* ---------------------------
   Arranque
   --------------------------- */

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});

module.exports = app;
