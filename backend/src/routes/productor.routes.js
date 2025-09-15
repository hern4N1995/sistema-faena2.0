const express = require('express');
const router = express.Router();
const {
  obtenerProductores,
  crearProductor,
  editarProductor,
  eliminarProductor,
} = require('../controllers/productor.controller');

router.get('/productores', obtenerProductores);
router.post('/productores', crearProductor);
router.put('/productores/:id', editarProductor);
router.delete('/productores/:id', eliminarProductor);

module.exports = router;
