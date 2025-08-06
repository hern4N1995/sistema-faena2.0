const express = require('express');
const router = express.Router();
const {
  obtenerFaenas,
  crearFaena,
} = require('../controllers/faena.controller');


// Ruta para obtener todas las faenas
router.get('/', obtenerFaenas);

// Ruta para crear una nueva faena
router.post('/', crearFaena);


module.exports = router;
