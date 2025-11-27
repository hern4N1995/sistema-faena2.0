// routes/tropaDetalle.routes.js
const express = require('express');
const router = express.Router({ mergeParams: true }); // mergeParams por si se usa /tropas/:tropaId/...
const {
  updateDetalle,
  patchDetalle,
  deleteDetalle,
} = require('../controllers/tropaDetalle.controller');
const { verificarToken } = require('../middleware/auth');

// Rutas relativas: se espera que este router se monte en /api/tropas
// PUT  /:tropaId/detalle/:detalleId
// PATCH /:tropaId/detalle/:detalleId
// DELETE /:tropaId/detalle/:detalleId

router.put('/:tropaId/detalle/:detalleId', verificarToken, updateDetalle);
router.patch('/:tropaId/detalle/:detalleId', verificarToken, patchDetalle);
router.delete('/:tropaId/detalle/:detalleId', verificarToken, deleteDetalle);

// Rutas alternativas planas (montadas en /api/tropas/tropa-detalle/:detalleId)
router.put('/tropa-detalle/:detalleId', verificarToken, updateDetalle);
router.patch('/tropa-detalle/:detalleId', verificarToken, patchDetalle);
router.delete('/tropa-detalle/:detalleId', verificarToken, deleteDetalle);

module.exports = router;
