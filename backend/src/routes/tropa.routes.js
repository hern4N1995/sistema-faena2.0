// routes/tropa.routes.js
const express = require('express');
const router = express.Router();
const tropaController = require('../controllers/tropa.controller');
const { verificarToken } = require('../middleware/auth');

// Recursos auxiliares
router.get('/departamentos', tropaController.getDepartamentos);
router.get('/plantas', tropaController.getPlantas);
router.get('/productores', tropaController.getProductores);
router.get('/titulares', tropaController.getTitulares);

// Detalles de tropa (antes que /:tropaId para evitar colisión)
router.get('/detalle-todas', tropaController.getTodosLosDetalles);
router.get('/:tropaId/detalle-agrupado', tropaController.getDetalleAgrupado);
router.get('/:tropaId/detalle', tropaController.getDetalle);
router.post('/:tropaId/detalle', tropaController.saveDetalle);

// Tropas de la planta del usuario (protegida)
router.get('/por-planta', verificarToken, tropaController.getByUsuarioPlanta);

// Tropas
router.get('/', tropaController.getAll);
router.post('/', tropaController.createTropa);
router.get('/:tropaId', tropaController.getById);

module.exports = router;
