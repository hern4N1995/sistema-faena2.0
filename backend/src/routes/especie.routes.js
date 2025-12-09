const express = require('express');
const router = express.Router();
const {
  getEspecies,
  registrarEspecie,
  actualizarEspecie,
  eliminarEspecie,
  getCategoriasPorEspecie,
} = require('../controllers/especie.controller');

const { verificarToken } = require('../middleware/auth');
const { permitirRoles } = require('../middleware/roles');

// Listado general (solo especies activas)
router.get('/', verificarToken, getEspecies);

// Obtener categorías de una especie específica
router.get('/:id/categorias', verificarToken, getCategoriasPorEspecie);

// Administración (solo roles 1 y 2)
router.post('/', verificarToken, permitirRoles(1, 2), registrarEspecie);
router.put('/:id', verificarToken, permitirRoles(1, 2), actualizarEspecie);
router.delete('/:id', verificarToken, permitirRoles(1, 2), eliminarEspecie);

module.exports = router;
