/* const express = require('express');
const router = express.Router();
const {
  obtenerFaenas,
  crearFaena,
} = require('../controllers/faena.controller');

const { verificarToken } = require('../middleware/auth');
const { permitirRoles } = require('../middleware/roles');

// Solo usuarios con rol 1 (admin) o 2 (superadmin) pueden ver faenas
router.get('/', verificarToken, permitirRoles(1, 2), obtenerFaenas);

// Solo superadmin puede crear faenas
router.post('/', verificarToken, permitirRoles(2), crearFaena);

/* Ruta para obtener todas las faenas
router.get('/', obtenerFaenas);

 Ruta para crear una nueva faena
router.post('/', crearFaena);

module.exports = router;
 */
const express = require('express');
const router = express.Router();

const {
  obtenerFaenas,
  crearFaena,
  obtenerRemanentePorTropa,
} = require('../controllers/faena.controller');

const { verificarToken } = require('../middleware/auth');
const { permitirRoles } = require('../middleware/roles');

// Rutas protegidas
router.get('/', verificarToken, permitirRoles(1, 2), obtenerFaenas);
router.post('/', verificarToken, permitirRoles(2), crearFaena);
router.get('/tropas', obtenerFaenas); // ← si renombraste getTropas
router.get(
  '/remanente',
  verificarToken,
  permitirRoles(1, 2),
  obtenerRemanentePorTropa,
);

module.exports = router;
