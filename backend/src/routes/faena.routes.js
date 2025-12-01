// routes/faena.routes.js
const express = require('express');
const router = express.Router();

const {
  obtenerFaenas,
  crearFaena,
  obtenerRemanentePorTropa,
  obtenerFaenasSinDecomiso,
  obtenerFaenasRealizadas,
  obtenerDatosParaDecomiso,
} = require('../controllers/faena.controller');

const { verificarToken } = require('../middleware/auth');
const { permitirRoles } = require('../middleware/roles');
const { registrarFaena } = require('../controllers/registrarFaena.controller');

/*
  Nota:
  - Este router se monta en App.js en '/api/faena'.
  - Las rutas definidas aquí deben ser relativas al punto de montaje.
  - Evitamos repetir el segmento 'faena' dentro de las rutas para no generar
    endpoints como '/api/faena/faena/...'.
*/

/* Rutas específicas (deben ir antes de la ruta genérica '/') */
router.get('/:id_faena/decomiso-datos', obtenerDatosParaDecomiso);

router.get(
  '/faenas-realizadas',
  verificarToken,
  permitirRoles(1, 2),
  obtenerFaenasRealizadas,
);

router.get(
  '/faenas-sin-decomiso',
  verificarToken,
  permitirRoles(1, 2, 3),
  obtenerFaenasSinDecomiso,
);

/* Endpoint para obtener tropas relacionadas (si corresponde) */
router.get('/tropas', obtenerFaenas);

/* Remanente por tropa (protegido) */
router.get(
  '/remanente',
  verificarToken,
  permitirRoles(1, 2),
  obtenerRemanentePorTropa,
);

/* Operaciones CRUD / listados generales */
router.get('/', verificarToken, permitirRoles(1, 2), obtenerFaenas);
router.post('/', verificarToken, permitirRoles(2), crearFaena);

/* Registrar faena (acción distinta a crearFaena) */
router.post(
  '/registrar',
  verificarToken,
  permitirRoles(1, 2, 3),
  registrarFaena,
);

module.exports = router;
