const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middleware/auth');
const { permitirRoles } = require('../middleware/roles');
const { obtenerCombinaciones } = require('../controllers/decomisos.controller');

router.get(
  '/combinaciones',
  verificarToken,
  permitirRoles(1),
  obtenerCombinaciones,
);

module.exports = router;
