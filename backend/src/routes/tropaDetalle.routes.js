// routes/tropaDetalle.routes.js
const express = require('express');
const router = express.Router({ mergeParams: true }); // mergeParams por si se usa /tropas/:tropaId/...
const {
  updateDetalle,
  patchDetalle,
  deleteDetalle,
} = require('../controllers/tropaDetalle.controller');
const { verificarToken } = require('../middleware/auth');

// Rutas:
// PUT  /tropas/:tropaId/detalle/:detalleId
// PATCH /tropas/:tropaId/detalle/:detalleId
// DELETE /tropas/:tropaId/detalle/:detalleId

router.put(
  '/tropas/:tropaId/detalle/:detalleId',
  verificarToken,
  updateDetalle,
);
router.patch(
  '/tropas/:tropaId/detalle/:detalleId',
  verificarToken,
  patchDetalle,
);
router.delete(
  '/tropas/:tropaId/detalle/:detalleId',
  verificarToken,
  deleteDetalle,
);

router.put('/tropa-detalle/:detalleId', verificarToken, updateDetalle);
router.patch('/tropa-detalle/:detalleId', verificarToken, patchDetalle);
router.delete('/tropa-detalle/:detalleId', verificarToken, deleteDetalle);

module.exports = router;
