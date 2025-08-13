const express = require('express');
const router = express.Router();
const tropaController = require('../controllers/tropa.controller');

// 🔍 Rutas específicas primero
router.get('/detalle-todas', tropaController.getTodosLosDetalles);
router.get('/:id/detalle', tropaController.getDetalle);
router.post('/:id/detalle', tropaController.saveDetalle);

// 📋 Rutas generales después
router.get('/', tropaController.getAll);
router.get('/:id', tropaController.getById);

module.exports = router;
