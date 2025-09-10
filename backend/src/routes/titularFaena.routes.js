const express = require('express');
const router = express.Router();
const {
  obtenerTitulares,
  crearTitular,
  modificarTitular,
  eliminarTitular,
} = require('../controllers/titularFaena.controller');

router.get('/titulares-faena', obtenerTitulares);
router.post('/titulares-faena', crearTitular);
router.put('/titulares-faena/:id', modificarTitular);
router.delete('/titulares-faena/:id', eliminarTitular);

module.exports = router;
