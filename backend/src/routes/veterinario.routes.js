const express = require('express');
const router = express.Router();
const {
  obtenerVeterinarios,
  obtenerVeterinarioPorId,
  crearVeterinario,
  actualizarVeterinario,
  eliminarVeterinario,
} = require('../controllers/veterinario.controller');

router.get('/', obtenerVeterinarios);
router.post('/', crearVeterinario);
router.get('/:id', obtenerVeterinarioPorId);
router.put('/:id', actualizarVeterinario);
router.delete('/:id', eliminarVeterinario);

module.exports = router;
