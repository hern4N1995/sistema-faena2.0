const express = require('express');
const router = express.Router();
const {
  getCategoriasPorEspecie,
} = require('../controllers/categoriaEspecie.controller');

router.get('/especie/:id/categorias', getCategoriasPorEspecie);

module.exports = router;
