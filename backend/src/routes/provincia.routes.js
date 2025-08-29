const express = require('express');
const router = express.Router();
const {
  obtenerProvincias,
  agregarProvincia,
  editarProvincia,
  eliminarProvincia,
} = require('../controllers/provincia.controller');

router.get('/provincias', obtenerProvincias);
router.post('/provincias', agregarProvincia);
router.put('/provincias/:id', editarProvincia);
router.delete('/provincias/:id', eliminarProvincia);

module.exports = router;
