const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middleware/auth');
const { permitirRoles } = require('../middleware/roles');
const { obtenerCombinaciones } = require('../controllers/decomisos.controller');
const {
  obtenerInfoFaenaPorDecomiso,
} = require('../controllers/decomisos.controller');

router.get(
  '/combinaciones',
  verificarToken,
  permitirRoles(1),
  obtenerCombinaciones,
);
router.get(
  '/decomiso/:id_decomiso/info-faena',
  verificarToken,
  permitirRoles(1),
  obtenerInfoFaenaPorDecomiso,
);

module.exports = router;
