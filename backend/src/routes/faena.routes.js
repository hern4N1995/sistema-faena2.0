const express = require('express');
const router = express.Router();

const {
  obtenerFaenas,
  crearFaena,
  obtenerRemanentePorTropa,
  getFaenasRealizadas, // ✅ para vista Decomisos
  obtenerFaenaPorId, // ✅ agregado correctamente
} = require('../controllers/faena.controller');

const { verificarToken } = require('../middleware/auth');
const { permitirRoles } = require('../middleware/roles');
const { registrarFaena } = require('../controllers/registrarFaena.controller');

// Rutas protegidas
router.get('/', verificarToken, permitirRoles(1, 2), obtenerFaenas);
router.post('/', verificarToken, permitirRoles(2), crearFaena);
router.post('/faena', verificarToken, permitirRoles(1, 2, 3), registrarFaena);

router.get('/tropas', obtenerFaenas);
router.get(
  '/remanente',
  verificarToken,
  permitirRoles(1, 2),
  obtenerRemanentePorTropa,
);

// ✅ Faenas realizadas (para vista Decomisos)
router.get(
  '/realizadas',
  verificarToken,
  permitirRoles(1, 2, 3),
  getFaenasRealizadas,
);

// ✅ Faena individual por ID
router.get('/:id', verificarToken, permitirRoles(1, 2, 3), obtenerFaenaPorId);

module.exports = router;
