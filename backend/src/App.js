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
  if (
    (typeof moduleExport === 'object' || typeof moduleExport === 'function') &&
    typeof moduleExport.use === 'function'
  ) {
    return moduleExport;
  }
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
   Cargar rutas
   --------------------------- */

const authRoutes = safeRequire('./routes/auth.routes');
const usuarioRoutes = safeRequire('./routes/usuario.routes');
const tropaRoutes = safeRequire('./routes/tropa.routes');
const faenaRoutes = safeRequire('./routes/faena.routes');
const plantaRoutes = safeRequire('./routes/planta.routes');
const especieRoutes = safeRequire('./routes/especie.routes');
const categoriaEspecieRoutes = safeRequire('./routes/categoriaEspecie.routes');
const provinciaRoutes = safeRequire('./routes/provincia.routes');
const departamentoRoutes = safeRequire('./routes/departamento.routes');
const titularFaenaRoutes = safeRequire('./routes/titularFaena.routes');
const productorRoutes = safeRequire('./routes/productor.routes');
const decomisoRoutes = safeRequire('./routes/decomisos.routes');
const afeccionRoutes = safeRequire('./routes/afeccion.routes');
const veterinarioRoutes = safeRequire('./routes/veterinario.routes');
const tipoParteDecoRoutes = safeRequire('./routes/tipoParteDeco.routes');
const partesDecomisadasRoutes = safeRequire(
  './routes/partesDecomisadas.routes',
);
const decomisoDetalleRoutes = safeRequire('./routes/decomisoDetalle.routes');
const tropaDetalleRoutes = safeRequire('./routes/tropaDetalle.routes');

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

// Si tu frontend en Vercel usa este dominio, asegúrate de incluirlo en FRONTEND_ORIGINS o lo añadimos aquí
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

// Asegurar localhost por defecto
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

app.get('/', (req, res) => {
  res.json({
    message: 'Sistema de Faenas API, ESTA FUNCIONANDO CORRECTAMENTE',
  });
});

/* Montar rutas con paths explícitos */
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
   Arranque
   --------------------------- */

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});

module.exports = app;
