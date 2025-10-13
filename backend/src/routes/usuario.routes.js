// src/routes/usuario.routes.js
const express = require('express');
const router = express.Router();
const {
  obtenerUsuarios,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
  getPerfil,
  updatePerfil,
} = require('../controllers/usuario.controller');

const { verificarToken } = require('../middleware/auth');

// Rutas generales
router.get('/', obtenerUsuarios);
router.post('/', crearUsuario);
router.put('/:id', actualizarUsuario);
router.delete('/:id', eliminarUsuario);

// Rutas de perfil del usuario logueado
router.get('/perfil', verificarToken, getPerfil);
router.put('/perfil', verificarToken, updatePerfil);

module.exports = router;
