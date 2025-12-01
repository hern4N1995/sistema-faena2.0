// routes/productor.routes.js
const express = require('express');
const router = express.Router();
const {
  obtenerProductores,
  crearProductor,
  editarProductor,
  eliminarProductor,
} = require('../controllers/productor.controller');

// Rutas relativas al mount point en App.js (App.js monta este router en /api/productores)
router.get('/', obtenerProductores);
router.post('/', crearProductor);
router.put('/:id', editarProductor);
router.delete('/:id', eliminarProductor);

module.exports = router;
