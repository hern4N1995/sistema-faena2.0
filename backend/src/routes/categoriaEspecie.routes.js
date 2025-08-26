const express = require('express');
const router = express.Router();
const {
  getCategoriasEspecie,
} = require('../controllers/categoriaEspecie.controller');

router.get('/categoria-especie', getCategoriasEspecie);

module.exports = router;
