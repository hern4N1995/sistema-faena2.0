const express = require('express');
const router = express.Router();
const tropaController = require('../controllers/tropa.controller');

// 🔍 Rutas específicas primero
router.get('/departamentos', tropaController.getDepartamentos);
router.get('/plantas', tropaController.getPlantas);
router.get('/productores', tropaController.getProductores);
router.get('/titulares', tropaController.getTitulares); // ✅ debe ir antes que /:id

router.get('/detalle-todas', tropaController.getTodosLosDetalles);
router.get('/:id/detalle', tropaController.getDetalle);
router.post('/:id/detalle', tropaController.saveDetalle);
router.post('/', tropaController.createTropa);

// 📋 Rutas generales después
router.get('/', tropaController.getAll);
router.get('/:id', tropaController.getById);

module.exports = router;
