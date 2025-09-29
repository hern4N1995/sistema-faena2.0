const express = require('express');
const router = express.Router();
const {
  getEspecies,
  registrarEspecie,
  actualizarEspecie,
  eliminarEspecie,
} = require('../controllers/especie.controller');

const { verificarToken } = require('../middleware/auth');
const { permitirRoles } = require('../middleware/roles');

// Listado general (solo especies activas)
router.get('/especies', verificarToken, getEspecies);

// Administración (solo roles 1 y 2)
router.post('/especies', verificarToken, permitirRoles(1, 2), registrarEspecie);
router.put(
  '/especies/:id',
  verificarToken,
  permitirRoles(1, 2),
  actualizarEspecie,
);
router.delete(
  '/especies/:id',
  verificarToken,
  permitirRoles(1, 2),
  eliminarEspecie,
);

module.exports = router;
