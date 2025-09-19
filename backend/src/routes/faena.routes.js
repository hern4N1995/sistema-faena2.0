const express = require('express');
const router = express.Router();

const {
  obtenerFaenas,
  crearFaena,
  obtenerRemanentePorTropa,
} = require('../controllers/faena.controller');

const { verificarToken } = require('../middleware/auth');
const { permitirRoles } = require('../middleware/roles');
const { registrarFaena } = require('../controllers/registrarFaena.controller');
const {
  obtenerFaenasRealizadas,
  // otros controladores...
} = require('../controllers/faena.controller');
const { obtenerDatosParaDecomiso } = require('../controllers/faena.controller');

// Rutas protegidas
router.get('/faena/:id_faena/decomiso-datos', obtenerDatosParaDecomiso);
router.get('/faenas-realizadas', obtenerFaenasRealizadas);
router.get('/', verificarToken, permitirRoles(1, 2), obtenerFaenas);
router.post('/', verificarToken, permitirRoles(2), crearFaena);
router.post('/faena', verificarToken, permitirRoles(1, 2, 3), registrarFaena);

router.get('/faena/tropas', obtenerFaenas);
router.get(
  '/remanente',
  verificarToken,
  permitirRoles(1, 2),
  obtenerRemanentePorTropa,
);

module.exports = router;
