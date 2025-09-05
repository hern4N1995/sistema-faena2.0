const express = require('express');
const router = express.Router();
const tropaController = require('../controllers/tropa.controller');

// 📦 Recursos auxiliares
router.get('/departamentos', tropaController.getDepartamentos);
router.get('/plantas', tropaController.getPlantas);
router.get('/productores', tropaController.getProductores);
router.get('/titulares', tropaController.getTitulares);

// 🧩 Detalles de tropa (ubicados antes que /:id para evitar colisión)
router.get('/detalle-todas', tropaController.getTodosLosDetalles);
router.get('/:id/detalle', tropaController.getDetalle);
router.post('/:id/detalle', tropaController.saveDetalle);

// 📋 Tropas
router.get('/', tropaController.getAll);
router.post('/', tropaController.createTropa);
router.get('/:id', tropaController.getById); // ⬅️ esta debe ir al final

module.exports = router;
