const express = require('express');
const router = express.Router();
const {
  getEspecies,
  getCategoriasPorEspecie,
} = require('../controllers/especie.controller');

router.get('/especies', getEspecies);
router.get('/especie/:id/categorias', getCategoriasPorEspecie);

module.exports = router;
