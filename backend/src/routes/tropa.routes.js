const express = require('express');
const router = express.Router();
const tropaController = require('../controllers/tropa.controller');

// 📦 Recursos auxiliares
router.get('/departamentos', tropaController.getDepartamentos);
router.get('/plantas', tropaController.getPlantas);
router.get('/productores', tropaController.getProductores);
router.get('/titulares', tropaController.getTitulares);

// 📋 Tropas
router.get('/', tropaController.getAll);
router.get('/:id', tropaController.getById);
router.post('/', tropaController.createTropa);

// 🧩 Detalles de tropa
router.get('/detalle-todas', tropaController.getTodosLosDetalles);
router.get('/:id/detalle', tropaController.getDetalle);
router.post('/:id/detalle', tropaController.saveDetalle); // 🔄 renombrado para consistencia

module.exports = router;
