const express = require('express');
const router = express.Router();
const {
  obtenerPlantas,
  crearPlanta,
  modificarPlanta,
  eliminarPlanta,
} = require('../controllers/planta.controller');

router.get('/plantas', obtenerPlantas);
router.post('/plantas', crearPlanta);
router.put('/plantas/:id', modificarPlanta);
router.delete('/plantas/:id', eliminarPlanta);

module.exports = router;
