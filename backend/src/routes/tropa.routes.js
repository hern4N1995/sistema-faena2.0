const express = require('express');
const router = express.Router();
const tropaController = require('../controllers/tropa.controller');
const { verificarToken } = require('../middleware/auth');

// 📦 Recursos auxiliares
router.get('/departamentos', tropaController.getDepartamentos);
router.get('/plantas', tropaController.getPlantas);
router.get('/productores', tropaController.getProductores);
router.get('/titulares', tropaController.getTitulares);

// 🧩 Detalles de tropa (ubicados antes que /:id para evitar colisión)
router.get('/detalle-todas', tropaController.getTodosLosDetalles);
router.get('/:id/detalle-agrupado', tropaController.getDetalleAgrupado);
router.get('/:id/detalle', tropaController.getDetalle); // ← esta es la versión plana
router.post('/:id/detalle', tropaController.saveDetalle);

// 🔒 Tropas de la planta del usuario (ruta protegida) — debe ir antes de /:id
router.get('/por-planta', verificarToken, tropaController.getByUsuarioPlanta);

// 📋 Tropas
router.get('/', tropaController.getAll);
router.post('/', tropaController.createTropa);
router.get('/:id', tropaController.getById);

module.exports = router;
